import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, checkDatabaseConnection } from '@/lib/supabase';
import { requireSchoolId } from '@/lib/tenant-context';

// POST /api/assignments/[id]/submissions/[submissionId]/grade - Grade a submission
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; submissionId: string }> }
) {
  try {
    checkDatabaseConnection();
    

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Database connection not configured' },
        { status: 500 }
      );
    }
    
    const body = await request.json();
    const { score, teacher_feedback, graded_by } = body;

    const schoolId = requireSchoolId(request);
    const { id: assignmentId, submissionId } = await params;

    if (!score) {
      return NextResponse.json(
        { error: 'Score is required.' },
        { status: 400 }
      );
    }

    // Get assignment details for max_score
    const { data: assignment, error: assignmentError } = await supabaseAdmin
      .from('assignments')
      .select('max_marks')
      .eq('id', assignmentId)
      .eq('school_id', schoolId)
      .single();

    if (assignmentError || !assignment) {
      return NextResponse.json(
        { error: 'Assignment not found.' },
        { status: 404 }
      );
    }

    // Validate score
    if (score < 0 || score > assignment.max_marks) {
      return NextResponse.json(
        { error: `Score must be between 0 and ${assignment.max_marks}.` },
        { status: 400 }
      );
    }

    // Get submission details
    const { data: submission, error: submissionError } = await supabaseAdmin
      .from('assignment_submissions')
      .select('student_id')
      .eq('id', submissionId)
      .eq('assignment_id', assignmentId)
      .eq('school_id', schoolId)
      .single();

    if (submissionError || !submission) {
      return NextResponse.json(
        { error: 'Submission not found.' },
        { status: 404 }
      );
    }

    // Check if grade already exists
    const { data: existingGrade } = await supabaseAdmin
      .from('assignment_grades')
      .select('id')
      .eq('submission_id', submissionId)
      .maybeSingle();

    let gradeData;

    if (existingGrade) {
      // Update existing grade
      const { data, error } = await supabaseAdmin
        .from('assignment_grades')
        .update({
          score,
          max_score: assignment.max_marks,
          teacher_feedback: teacher_feedback || null,
          graded_by: graded_by || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingGrade.id)
        .select()
        .single();

      if (error) {
        return NextResponse.json(
          { error: `Failed to update grade: ${error.message}` },
          { status: 400 }
        );
      }

      gradeData = data;
    } else {
      // Create new grade
      const { data, error } = await supabaseAdmin
        .from('assignment_grades')
        .insert([{
          submission_id: submissionId,
          assignment_id: assignmentId,
          student_id: submission.student_id,
          score,
          max_score: assignment.max_marks,
          teacher_feedback: teacher_feedback || null,
          graded_by: graded_by || null,
          school_id: schoolId
        }])
        .select()
        .single();

      if (error) {
        return NextResponse.json(
          { error: `Failed to create grade: ${error.message}` },
          { status: 400 }
        );
      }

      gradeData = data;
    }

    // Update submission status to graded
    await supabaseAdmin
      .from('assignment_submissions')
      .update({ submission_status: 'graded' })
      .eq('id', submissionId);

    return NextResponse.json(gradeData);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/assignments/[id]/submissions/[submissionId]/grade - Get grade for a submission
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; submissionId: string }> }
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
    const { id: assignmentId, submissionId } = await params;

    const { data, error } = await supabaseAdmin
      .from('assignment_grades')
      .select('*, users(full_name)')
      .eq('submission_id', submissionId)
      .eq('assignment_id', assignmentId)
      .eq('school_id', schoolId)
      .single();

    if (error) {
      return NextResponse.json(
        { error: `Failed to retrieve grade: ${error.message}` },
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