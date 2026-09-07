import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, checkDatabaseConnection } from '@/lib/supabase';
import { getSchoolId } from '@/lib/tenant-context';

// Helper function to get school ID with fallback
async function getSchoolIdWithFallback(request: NextRequest): Promise<string | null> {
  let schoolId = getSchoolId(request);

  if (!schoolId) {
    if (!supabaseAdmin) {
      return null;
    }

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

// GET /api/attendance - List school attendance registers with filters
export async function GET(request: NextRequest) {
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
    
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('student_id');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const status = searchParams.get('status');
    const gradeLevel = searchParams.get('grade_level');

    let query = supabaseAdmin
      .from('attendance')
      .select(`
        *,
        students:student_id (
          id,
          full_name,
          admission_number,
          grade_level,
          section
        )
      `)
      .eq('school_id', schoolId);

    if (studentId) {
      query = query.eq('student_id', studentId);
    }

    if (startDate) {
      query = query.gte('class_date', startDate);
    }

    if (endDate) {
      query = query.lte('class_date', endDate);
    }

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query.order('class_date', { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: `Failed to retrieve attendance log: ${error.message}` },
        { status: 400 }
      );
    }

    // Filter by grade level if specified (client-side filter since it's in nested relation)
    let filteredData = data;
    if (gradeLevel && data) {
      filteredData = data.filter(record => 
        record.students?.grade_level === gradeLevel
      );
    }

    return NextResponse.json(filteredData);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/attendance - Log student attendance (single or bulk)
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
    const { attendance_data } = body; // Array of attendance records for bulk upload

    if (!attendance_data || !Array.isArray(attendance_data)) {
      return NextResponse.json(
        { error: 'Attendance data array is required.' },
        { status: 400 }
      );
    }

    // Validate each record
    for (const record of attendance_data) {
      if (!record.student_id || !record.class_date || !record.status) {
        return NextResponse.json(
          { error: 'Each record must have student_id, class_date, and status.' },
          { status: 400 }
        );
      }
    }

    // Check for duplicates and prepare insert data
    const recordsToInsert = [];
    const duplicates = [];

    for (const record of attendance_data) {
      const { data: existing } = await supabaseAdmin
        .from('attendance')
        .select('id')
        .eq('student_id', record.student_id)
        .eq('class_date', record.class_date)
        .maybeSingle();

      if (existing) {
        duplicates.push({
          student_id: record.student_id,
          class_date: record.class_date,
          reason: 'Already exists'
        });
      } else {
        recordsToInsert.push({
          ...record,
          school_id: schoolId
        });
      }
    }

    // Insert valid records
    let insertedRecords = [];
    if (recordsToInsert.length > 0) {
      const { data, error } = await supabaseAdmin
        .from('attendance')
        .insert(recordsToInsert)
        .select();

      if (error) {
        return NextResponse.json(
          { error: `Failed to log attendance: ${error.message}` },
          { status: 400 }
        );
      }
      insertedRecords = data;
    }

    return NextResponse.json({
      inserted: insertedRecords,
      duplicates: duplicates,
      summary: {
        total: attendance_data.length,
        successful: insertedRecords.length,
        skipped: duplicates.length
      }
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
