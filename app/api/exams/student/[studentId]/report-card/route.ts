import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, checkDatabaseConnection } from '@/lib/supabase';
import { requireSchoolId } from '@/lib/tenant-context';

// GET /api/exams/student/[studentId]/report-card - Retrieve a student's full report card profile (tenant scoped)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ studentId: string }> }
) {
  try {
    checkDatabaseConnection();

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Database connection not configured' },
        { status: 500 }
      );
    }

    const schoolId = requireSchoolId(request);
    const { studentId } = await params;

    const { data, error } = await supabaseAdmin
      .from('exam_grades')
      .select('*, exams(title, subject, max_score, exam_date)')
      .eq('student_id', studentId)
      .eq('school_id', schoolId);

    if (error) {
      return NextResponse.json(
        { error: `Failed to load student report cards: ${error.message}` },
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
