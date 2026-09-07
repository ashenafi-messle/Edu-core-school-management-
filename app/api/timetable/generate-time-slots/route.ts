import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, checkDatabaseConnection } from '@/lib/supabase';
import { getSchoolId } from '@/lib/tenant-context';

// Helper function to get school ID with fallback
async function getSchoolIdWithFallback(request: NextRequest): Promise<string | null> {
  let schoolId = getSchoolId(request);

  if (!supabaseAdmin) {
    return null;
  }
  
  if (!schoolId) {
    const { data: school } = await supabaseAdmin
      .from('schools')
      .select('id')
      .limit(1)
      .single();
    
    if (school) {
      schoolId = school.id;
    }
  }
  
  return schoolId;
}

// POST /api/timetable/generate-time-slots - Auto-generate time slots based on school settings
export async function POST(request: NextRequest) {
  try {
    checkDatabaseConnection();
    

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Database connection not configured' },
        { status: 500 }
      );
    }
    
    const schoolId = await getSchoolIdWithFallback(request);
    if (!schoolId) {
      return NextResponse.json(
        { error: 'No school found. Please create a school first.' },
        { status: 400 }
      );
    }
    
    const body = await request.json();
    const { academic_year_id } = body;

    if (!academic_year_id) {
      return NextResponse.json(
        { error: 'Missing required field: academic_year_id' },
        { status: 400 }
      );
    }

    // Fetch school schedule settings
    const { data: settings, error: settingsError } = await supabaseAdmin
      .from('school_schedule_settings')
      .select('*')
      .eq('school_id', schoolId)
      .eq('academic_year_id', academic_year_id)
      .single();

    if (settingsError || !settings) {
      return NextResponse.json(
        { error: 'School schedule settings not found. Please configure schedule settings first.' },
        { status: 400 }
      );
    }

    // Delete existing auto-generated time slots for this school
    await supabaseAdmin
      .from('time_slots')
      .delete()
      .eq('school_id', schoolId)
      .eq('source', 'auto');

    // Generate time slots
    const generatedSlots = [];
    let currentTime = parseTime(settings.school_start_time);
    const periodDuration = settings.period_duration_minutes;

    for (let i = 1; i <= settings.number_of_periods_per_day; i++) {
      const slotName = `Period ${i}`;
      const startTime = formatTime(currentTime);
      
      // Add period duration
      currentTime = addMinutes(currentTime, periodDuration);
      const endTime = formatTime(currentTime);

      generatedSlots.push({
        school_id: schoolId,
        slot_name: slotName,
        start_time: startTime,
        end_time: endTime,
        break_time: false,
        duration_minutes: periodDuration,
        order_index: i,
        source: 'auto',
        school_schedule_settings_id: settings.id,
        is_active: true
      });

      // Check if we need to add lunch break after this period
      if (settings.lunch_break_enabled && i === settings.lunch_break_after_period) {
        const lunchStart = formatTime(currentTime);
        currentTime = addMinutes(currentTime, settings.lunch_break_duration_minutes);
        const lunchEnd = formatTime(currentTime);

        generatedSlots.push({
          school_id: schoolId,
          slot_name: 'Lunch Break',
          start_time: lunchStart,
          end_time: lunchEnd,
          break_time: true,
          duration_minutes: settings.lunch_break_duration_minutes,
          order_index: i + 0.5, // Between periods
          source: 'auto',
          school_schedule_settings_id: settings.id,
          is_active: true
        });
      }

      // Add additional breaks
      if (settings.additional_breaks && Array.isArray(settings.additional_breaks)) {
        for (const breakConfig of settings.additional_breaks) {
          if (breakConfig.after_period === i) {
            const breakStart = formatTime(currentTime);
            currentTime = addMinutes(currentTime, breakConfig.duration);
            const breakEnd = formatTime(currentTime);

            generatedSlots.push({
              school_id: schoolId,
              slot_name: breakConfig.name,
              start_time: breakStart,
              end_time: breakEnd,
              break_time: true,
              duration_minutes: breakConfig.duration,
              order_index: i + 0.3, // Between periods
              source: 'auto',
              school_schedule_settings_id: settings.id,
              is_active: true
            });
          }
        }
      }
    }

    // Insert generated slots
    const { data: insertedSlots, error: insertError } = await supabaseAdmin
      .from('time_slots')
      .insert(generatedSlots)
      .select()
      .order('order_index', { ascending: true });

    if (insertError) {
      return NextResponse.json(
        { error: `Failed to generate time slots: ${insertError.message}` },
        { status: 400 }
      );
    }

    return NextResponse.json({
      message: `Successfully generated ${insertedSlots.length} time slots`,
      timeSlots: insertedSlots
    });
  } catch (error) {
    console.error('Error in POST /api/timetable/generate-time-slots:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper functions for time manipulation
function parseTime(timeStr: string): Date {
  const [hours, minutes, seconds] = timeStr.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, minutes, seconds || 0, 0);
  return date;
}

function formatTime(date: Date): string {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
}

function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60000);
}
