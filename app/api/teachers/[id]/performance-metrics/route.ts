import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, checkDatabaseConnection } from '@/lib/supabase';
import { getSchoolId } from '@/lib/tenant-context';

// POST /api/teachers/[id]/performance-metrics - Create performance metrics
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ [key: string]: string }> }
) {
  try {
    checkDatabaseConnection();

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Database connection not configured' },
        { status: 500 }
      );
    }
    
    const schoolId = getSchoolId(request);
    const { id } = await params;
    const body = await request.json();

    if (!schoolId) {
      return NextResponse.json(
        { error: 'School ID is required. Please ensure you are logged in with a valid school account.' },
        { status: 400 }
      );
    }

    const {
      academic_year,
      semester,
      student_rating,
      parent_rating,
      director_evaluation,
      attendance_present,
      attendance_absent,
      attendance_late,
      attendance_leave,
      assignment_completion_rate,
      syllabus_completion_rate
    } = body;

    if (!academic_year) {
      return NextResponse.json(
        { error: 'Academic year is required.' },
        { status: 400 }
      );
    }

    const metricsData = {
      teacher_id: id,
      school_id: schoolId,
      academic_year,
      semester: semester || 'Semester 1',
      student_rating: student_rating || 0,
      parent_rating: parent_rating || 0,
      director_evaluation: director_evaluation || 0,
      attendance_present: attendance_present || 0,
      attendance_absent: attendance_absent || 0,
      attendance_late: attendance_late || 0,
      attendance_leave: attendance_leave || 0,
      assignment_completion_rate: assignment_completion_rate || 0,
      syllabus_completion_rate: syllabus_completion_rate || 0
    };

    const { data, error } = await supabaseAdmin
      .from('teacher_performance_metrics')
      .insert([metricsData])
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: `Failed to create performance metrics: ${error.message}` },
        { status: 400 }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/teachers/[id]/performance-metrics - Get performance metrics
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Database connection not configured' },
        { status: 500 }
      );
    }

    const schoolId = getSchoolId(request);
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const academicYear = searchParams.get('academicYear');

    if (!schoolId) {
      return NextResponse.json(
        { error: 'School ID is required. Please ensure you are logged in with a valid school account.' },
        { status: 400 }
      );
    }

    let query = supabaseAdmin
      .from('teacher_performance_metrics')
      .select('*')
      .eq('teacher_id', id)
      .eq('school_id', schoolId);

    if (academicYear) {
      query = query.eq('academic_year', academicYear);
    }

    const { data, error } = await query.order('academic_year', { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: `Failed to retrieve performance metrics: ${error.message}` },
        { status: 400 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
