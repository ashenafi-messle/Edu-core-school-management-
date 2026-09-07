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

// GET /api/timetable/weekly/[id] - Get a specific timetable entry
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    
    const { id: timetableId } = await params;

    const { data, error } = await supabaseAdmin
      .from('weekly_timetables')
      .select(`
        *,
        time_slot:time_slots(id, slot_name, start_time, end_time, break_time, order_index),
        subject:subjects(id, subject_code, subject_name, category),
        teacher:teachers(id, full_name, email, department),
        section_configuration:section_configurations(id, grade_level, section_name)
      `)
      .eq('id', timetableId)
      .eq('school_id', schoolId)
      .single();

    if (error) {
      if (error.message.includes('relation') || error.message.includes('does not exist')) {
        return NextResponse.json(
          { error: 'Weekly timetables table does not exist yet' },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: `Failed to fetch timetable entry: ${error.message}` },
        { status: 404 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/timetable/weekly/[id] - Update a timetable entry
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    
    const { id: timetableId } = await params;
    const body = await request.json();
    
    const {
      day_of_week,
      time_slot_id,
      subject_id,
      teacher_id,
      room_number,
      notes,
      is_active
    } = body;

    const { data, error } = await supabaseAdmin
      .from('weekly_timetables')
      .update({
        day_of_week,
        time_slot_id,
        subject_id,
        teacher_id,
        room_number,
        notes,
        is_active,
        updated_at: new Date().toISOString()
      })
      .eq('id', timetableId)
      .eq('school_id', schoolId)
      .select(`
        *,
        time_slot:time_slots(id, slot_name, start_time, end_time, break_time, order_index),
        subject:subjects(id, subject_code, subject_name, category),
        teacher:teachers(id, full_name, email, department),
        section_configuration:section_configurations(id, grade_level, section_name)
      `)
      .single();

    if (error) {
      return NextResponse.json(
        { error: `Failed to update timetable entry: ${error.message}` },
        { status: 400 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/timetable/weekly/[id] - Delete a timetable entry
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    
    const { id: timetableId } = await params;

    const { error } = await supabaseAdmin
      .from('weekly_timetables')
      .delete()
      .eq('id', timetableId)
      .eq('school_id', schoolId);

    if (error) {
      return NextResponse.json(
        { error: `Failed to delete timetable entry: ${error.message}` },
        { status: 400 }
      );
    }

    return NextResponse.json({ message: 'Timetable entry deleted successfully' });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
