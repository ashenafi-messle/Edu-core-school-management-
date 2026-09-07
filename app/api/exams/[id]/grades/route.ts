import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, checkDatabaseConnection } from '@/lib/supabase';
import { requireSchoolId } from '@/lib/tenant-context';

// POST /api/exams/[id]/grades - Post grades for an exam
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    checkDatabaseConnection();

    const body = await request.json();
    const { student_id, score, grade, feedback, graded_by } = body;

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Database connection not configured' },
        { status: 500 }
      );
    }

    const schoolId = requireSchoolId(request);
    const { id: examId } = await params;

    if (!student_id || !score) {
      return NextResponse.json(
        { error: 'Student ID and score are required.' },
        { status: 400 }
      );
    }

    // Verify student hasn't already been graded for this exam
    const { data: existing } = await supabaseAdmin
      .from('exam_grades')
      .select('id')
      .eq('exam_id', examId)
      .eq('student_id', student_id)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: 'Student has already been graded for this exam. Update the existing grade instead.' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('exam_grades')
      .insert([{ student_id, score, grade, feedback, graded_by, exam_id: examId, school_id: schoolId }])
      .select();

    if (error) {
      return NextResponse.json(
        { error: `Failed to create grade: ${error.message}` },
        { status: 400 }
      );
    }

    return NextResponse.json(data[0], { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/exams/[id]/grades - List grades for an exam (tenant scoped)
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

    const schoolId = requireSchoolId(request);
    const { id: examId } = await params;

    const { data, error } = await supabaseAdmin
      .from('exam_grades')
      .select('*, students(full_name, admission_number)')
      .eq('exam_id', examId)
      .eq('school_id', schoolId);

    if (error) {
      return NextResponse.json(
        { error: `Failed to retrieve exam grades: ${error.message}` },
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
