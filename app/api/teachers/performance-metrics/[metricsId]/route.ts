import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, checkDatabaseConnection } from '@/lib/supabase';
import { getSchoolId } from '@/lib/tenant-context';

// PUT /api/teachers/performance-metrics/[metricsId] - Update performance metrics
export async function PUT(
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
    const { metricsId } = await params;
    const body = await request.json();

    if (!schoolId) {
      return NextResponse.json(
        { error: 'School ID is required. Please ensure you are logged in with a valid school account.' },
        { status: 400 }
      );
    }

    const {
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

    const updateData: any = {};
    if (student_rating !== undefined) updateData.student_rating = student_rating;
    if (parent_rating !== undefined) updateData.parent_rating = parent_rating;
    if (director_evaluation !== undefined) updateData.director_evaluation = director_evaluation;
    if (attendance_present !== undefined) updateData.attendance_present = attendance_present;
    if (attendance_absent !== undefined) updateData.attendance_absent = attendance_absent;
    if (attendance_late !== undefined) updateData.attendance_late = attendance_late;
    if (attendance_leave !== undefined) updateData.attendance_leave = attendance_leave;
    if (assignment_completion_rate !== undefined) updateData.assignment_completion_rate = assignment_completion_rate;
    if (syllabus_completion_rate !== undefined) updateData.syllabus_completion_rate = syllabus_completion_rate;

    const { data, error } = await supabaseAdmin
      .from('teacher_performance_metrics')
      .update(updateData)
      .eq('id', metricsId)
      .eq('school_id', schoolId)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: `Failed to update performance metrics: ${error.message}` },
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
