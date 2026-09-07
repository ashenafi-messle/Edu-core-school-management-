import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, checkDatabaseConnection } from '@/lib/supabase';
import { getSchoolId } from '@/lib/tenant-context';

// POST /api/timetable/bulk - Create bulk timetable entries for a section
export async function POST(request: NextRequest) {
  try {
    checkDatabaseConnection();
    

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Database connection not configured' },
        { status: 500 }
      );
    }
    
    let schoolId = getSchoolId(request);
    
    if (!schoolId) {
      const { data: school } = await supabaseAdmin
        .from('schools')
        .select('id')
        .limit(1)
        .single();
      
      if (school) {
        schoolId = school.id;
      } else {
        return NextResponse.json(
          { error: 'No school found. Please create a school first.' },
          { status: 400 }
        );
      }
    }
    
    const body = await request.json();
    
    const {
      section_configuration_id,
      academic_year_id,
      week_configuration,
      entries
    } = body;

    if (!section_configuration_id || !academic_year_id || !week_configuration || !entries) {
      return NextResponse.json(
        { error: 'Missing required fields: section_configuration_id, academic_year_id, week_configuration, entries' },
        { status: 400 }
      );
    }

    // 1. Update school schedule settings
    const { data: existingSettings, error: settingsError } = await supabaseAdmin
      .from('school_schedule_settings')
      .select('*')
      .eq('school_id', schoolId)
      .eq('academic_year_id', academic_year_id)
      .maybeSingle();

    const settingsData = {
      period_duration_minutes: week_configuration.periodDuration,
      number_of_periods_per_day: week_configuration.periodsPerDay,
      school_start_time: week_configuration.schoolStartTime,
      school_end_time: week_configuration.schoolEndTime,
      lunch_break_enabled: week_configuration.lunchBreakEnabled,
      lunch_break_duration_minutes: week_configuration.lunchBreakDuration,
      lunch_break_after_period: week_configuration.lunchBreakAfterPeriod,
      days_of_operation: week_configuration.days
    };

    if (existingSettings) {
      // Update existing settings
      const { error: updateError } = await supabaseAdmin
        .from('school_schedule_settings')
        .update(settingsData)
        .eq('id', existingSettings.id);

      if (updateError) {
        console.error('Error updating schedule settings:', updateError);
        return NextResponse.json(
          { error: `Failed to update schedule settings: ${updateError.message}` },
          { status: 400 }
        );
      }
    } else {
      // Create new settings
      const { error: insertError } = await supabaseAdmin
        .from('school_schedule_settings')
        .insert({
          ...settingsData,
          academic_year_id: academic_year_id,
          school_id: schoolId
        });

      if (insertError) {
        console.error('Error creating schedule settings:', insertError);
        return NextResponse.json(
          { error: `Failed to create schedule settings: ${insertError.message}` },
          { status: 400 }
        );
      }
    }

    // 2. Generate time slots based on week configuration
    const {
      periodsPerDay,
      periodDuration,
      schoolStartTime,
      lunchBreakEnabled,
      lunchBreakAfterPeriod,
      lunchBreakDuration
    } = week_configuration;

    const [startHours, startMinutes] = schoolStartTime.split(':').map(Number);
    let currentMinutes = startHours * 60 + startMinutes;

    const timeSlots = [];

    for (let period = 1; period <= periodsPerDay; period++) {
      const periodStartMinutes = currentMinutes;
      const periodEndMinutes = currentMinutes + periodDuration;

      const formatTime = (totalMinutes: number) => {
        const h = Math.floor(totalMinutes / 60);
        const m = totalMinutes % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
      };

      const isBreak = lunchBreakEnabled && period === lunchBreakAfterPeriod;

      timeSlots.push({
        slot_name: isBreak ? 'Lunch Break' : `Period ${period}`,
        start_time: formatTime(periodStartMinutes),
        end_time: formatTime(periodEndMinutes),
        break_time: isBreak,
        order_index: period,
        school_id: schoolId
      });

      currentMinutes = periodEndMinutes;
      if (isBreak) {
        currentMinutes += lunchBreakDuration;
      }
    }

    // Keep existing slot IDs stable because timetable rows reference them with ON DELETE CASCADE.
    const { error: upsertTimeSlotsError } = await supabaseAdmin
      .from('time_slots')
      .upsert(timeSlots.map(slot => ({ ...slot, is_active: true })), { onConflict: 'school_id,order_index' });

    if (upsertTimeSlotsError) {
      console.error('Error generating time slots:', upsertTimeSlotsError);
      return NextResponse.json(
        { error: `Failed to generate time slots: ${upsertTimeSlotsError.message}` },
        { status: 400 }
      );
    }

    // Get the newly created time slots
    const { data: newTimeSlots, error: fetchTimeSlotsError } = await supabaseAdmin
      .from('time_slots')
      .select('*')
      .eq('school_id', schoolId)
      .order('order_index', { ascending: true });

    if (fetchTimeSlotsError) {
      console.error('Error fetching new time slots:', fetchTimeSlotsError);
      return NextResponse.json(
        { error: `Failed to fetch time slots: ${fetchTimeSlotsError.message}` },
        { status: 400 }
      );
    }

    // 3. Delete existing timetable entries for this section
    const { error: deleteEntriesError } = await supabaseAdmin
      .from('weekly_timetables')
      .delete()
      .eq('section_configuration_id', section_configuration_id)
      .eq('academic_year_id', academic_year_id);

    if (deleteEntriesError && deleteEntriesError.code !== 'PGRST116') {
      console.error('Error deleting existing timetable entries:', deleteEntriesError);
    }

    // 4. Create new timetable entries
    const timetableEntries = (entries as Array<{
      subject_id?: string;
      period: number;
      day_of_week: string;
      teacher_id?: string;
      room_number?: string;
    }>)
      .filter(entry => entry.subject_id && entry.subject_id !== '') // Only include entries with subjects
      .map(entry => {
        const timeSlot = newTimeSlots?.find(ts => ts.order_index === entry.period);
        if (!timeSlot) {
          throw new Error(`Time slot not found for period ${entry.period}`);
        }

        return {
          school_id: schoolId,
          section_configuration_id: section_configuration_id,
          academic_year_id: academic_year_id,
          day_of_week: entry.day_of_week,
          time_slot_id: timeSlot.id,
          teacher_id: entry.teacher_id && entry.teacher_id !== '' ? entry.teacher_id : null, // Handle empty teacher_id
          subject_id: entry.subject_id,
          room_number: entry.room_number || '',
          is_active: true,
          notes: ''
        };
      });

    const { data: createdEntries, error: insertEntriesError } = await supabaseAdmin
      .from('weekly_timetables')
      .insert(timetableEntries)
      .select(`
        *,
        time_slot:time_slots(id, slot_name, start_time, end_time, break_time, order_index),
        subject:subjects(id, subject_code, subject_name, category),
        teacher:teachers(id, full_name, email, department),
        section_configuration:section_configurations(id, grade_level, section_name)
      `);

    if (insertEntriesError) {
      console.error('Error creating timetable entries:', insertEntriesError);
      return NextResponse.json(
        { error: `Failed to create timetable entries: ${insertEntriesError.message}` },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Bulk timetable created successfully',
      entries: createdEntries,
      settings: week_configuration
    }, { status: 201 });

  } catch (error) {
    console.error('Error in POST /api/timetable/bulk:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
