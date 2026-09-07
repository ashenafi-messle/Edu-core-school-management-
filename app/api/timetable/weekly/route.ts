import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, checkDatabaseConnection } from '@/lib/supabase';
import { getSchoolId } from '@/lib/tenant-context';

// GET /api/timetable/weekly - Get weekly timetable entries
export async function GET(request: NextRequest) {
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
        return NextResponse.json([]);
      }
    }
    
    const { searchParams } = new URL(request.url);
    const academicYearId = searchParams.get('academic_year_id');
    const sectionConfigurationId = searchParams.get('section_configuration_id');
    const dayOfWeek = searchParams.get('day_of_week');
    const teacherId = searchParams.get('teacher_id');

    let query = supabaseAdmin
      .from('weekly_timetables')
      .select(`
        *,
        time_slot:time_slots(id, slot_name, start_time, end_time, break_time, order_index),
        subject:subjects(id, subject_code, subject_name, category),
        teacher:teachers(id, full_name, email, department),
        section_configuration:section_configurations(id, grade_level, section_name)
      `)
      .eq('school_id', schoolId)
      .eq('is_active', true);

    if (academicYearId) {
      query = query.eq('academic_year_id', academicYearId);
    }

    if (sectionConfigurationId) {
      query = query.eq('section_configuration_id', sectionConfigurationId);
    }

    if (dayOfWeek) {
      query = query.eq('day_of_week', dayOfWeek);
    }

    if (teacherId) {
      query = query.eq('teacher_id', teacherId);
    }

    const { data, error } = await query.order('day_of_week').order('time_slot_id', { ascending: true });

    if (error) {
      if (error.message.includes('relation') || error.message.includes('does not exist')) {
        console.log('Weekly timetables table does not exist yet, returning empty array');
        return NextResponse.json([]);
      }
      return NextResponse.json(
        { error: `Failed to fetch weekly timetables: ${error.message}` },
        { status: 400 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in GET /api/timetable/weekly:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/timetable/weekly - Create a weekly timetable entry
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
      academic_year_id,
      section_configuration_id,
      day_of_week,
      time_slot_id,
      subject_id,
      teacher_id,
      room_number,
      notes
    } = body;

    if (!academic_year_id || !section_configuration_id || !day_of_week || !subject_id || !teacher_id) {
      return NextResponse.json(
        { error: 'Missing required fields: academic_year_id, section_configuration_id, day_of_week, subject_id, teacher_id' },
        { status: 400 }
      );
    }

    let resolvedTimeSlotId = time_slot_id;
    if (!resolvedTimeSlotId) {
      const { data: existingSlot, error: slotLookupError } = await supabaseAdmin
        .from('time_slots')
        .select('id')
        .eq('school_id', schoolId)
        .eq('is_active', true)
        .order('order_index', { ascending: true })
        .limit(1)
        .maybeSingle();
      if (slotLookupError && !slotLookupError.message.includes('does not exist')) {
        return NextResponse.json({ error: `Failed to resolve school time slot: ${slotLookupError.message}` }, { status: 400 });
      }
      resolvedTimeSlotId = existingSlot?.id;
      if (!resolvedTimeSlotId) {
        const { data: createdSlot, error: slotCreateError } = await supabaseAdmin
          .from('time_slots')
          .insert({ school_id: schoolId, slot_name: 'Period 1', start_time: '09:00:00', end_time: '10:00:00', break_time: false, order_index: 0, is_active: true })
          .select('id')
          .single();
        if (slotCreateError) return NextResponse.json({ error: `Failed to create default school time slot: ${slotCreateError.message}` }, { status: 400 });
        resolvedTimeSlotId = createdSlot.id;
      }
    }

    const { data: assignment } = await supabaseAdmin
      .from('subject_assignments')
      .select('id')
      .eq('teacher_id', teacher_id)
      .eq('school_id', schoolId)
      .eq('subject_id', subject_id)
      .eq('status', 'Active')
      .limit(1)
      .maybeSingle();
    if (!assignment) {
      return NextResponse.json({ error: 'Teacher is not allocated to this subject.' }, { status: 403 });
    }

    const { data: section } = await supabaseAdmin
      .from('section_configurations')
      .select('id, grade_level, section_name')
      .eq('id', section_configuration_id)
      .eq('school_id', schoolId)
      .maybeSingle();
    if (!section) return NextResponse.json({ error: 'Class division was not found.' }, { status: 400 });

    const { data: classAssignment } = await supabaseAdmin
      .from('subject_assignments')
      .select('id')
      .eq('teacher_id', teacher_id)
      .eq('school_id', schoolId)
      .eq('subject_id', subject_id)
      .eq('grade_level', section.grade_level)
      .eq('section_name', section.section_name)
      .eq('status', 'Active')
      .maybeSingle();
    if (!classAssignment) return NextResponse.json({ error: 'Teacher is not allocated to this class division.' }, { status: 403 });

    // Check for duplicate entry
    const { data: existing } = await supabaseAdmin
      .from('weekly_timetables')
      .select('id')
      .eq('section_configuration_id', section_configuration_id)
      .eq('day_of_week', day_of_week)
      .eq('time_slot_id', resolvedTimeSlotId)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: 'A timetable entry already exists for this section, day, and time slot' },
        { status: 409 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('weekly_timetables')
      .insert({
        school_id: schoolId,
        academic_year_id,
        section_configuration_id,
        day_of_week,
        time_slot_id: resolvedTimeSlotId,
        subject_id,
        teacher_id,
        room_number,
        notes,
        is_active: true
      })
      .select(`
        *,
        time_slot:time_slots(id, slot_name, start_time, end_time, break_time, order_index),
        subject:subjects(id, subject_code, subject_name, category),
        teacher:teachers(id, full_name, email, department),
        section_configuration:section_configurations(id, grade_level, section_name)
      `)
      .single();

    if (error) {
      if (error.message.includes('relation') || error.message.includes('does not exist')) {
        return NextResponse.json(
          { 
            error: 'Weekly timetables table does not exist in database. Please run the migration to create it.',
            requiresMigration: true
          },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: `Failed to create weekly timetable entry: ${error.message}` },
        { status: 400 }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
