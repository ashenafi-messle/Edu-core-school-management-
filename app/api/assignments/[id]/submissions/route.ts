import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, checkDatabaseConnection } from '@/lib/supabase';
import { requireSchoolId } from '@/lib/tenant-context';

// POST /api/assignments/[id]/submissions - Create/update a student submission
export async function POST(
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
    
    const body = await request.json();
    const { student_id, student_answer, student_comments, file_attachments, submission_status } = body;

    const schoolId = requireSchoolId(request);
    const { id: assignmentId } = await params;

    if (!student_id) {
      return NextResponse.json(
        { error: 'Student ID is required.' },
        { status: 400 }
      );
    }

    // Check if assignment exists and get due date
    const { data: assignment, error: assignmentError } = await supabaseAdmin
      .from('assignments')
      .select('due_date, max_marks')
      .eq('id', assignmentId)
      .eq('school_id', schoolId)
      .single();

    if (assignmentError || !assignment) {
      return NextResponse.json(
        { error: 'Assignment not found.' },
        { status: 404 }
      );
    }

    // Check if submission already exists
    const { data: existingSubmission } = await supabaseAdmin
      .from('assignment_submissions')
      .select('id, submitted_date')
      .eq('assignment_id', assignmentId)
      .eq('student_id', student_id)
      .maybeSingle();

    let submittedDate = new Date().toISOString();
    let finalStatus = submission_status || 'submitted';

    // Check if submission is late
    if (finalStatus === 'submitted' && new Date(submittedDate) > new Date(assignment.due_date)) {
      finalStatus = 'late';
    }

    if (existingSubmission) {
      // Update existing submission
      const { data, error } = await supabaseAdmin
        .from('assignment_submissions')
        .update({
          student_answer: student_answer || null,
          student_comments: student_comments || null,
          file_attachments: file_attachments || [],
          submission_status: finalStatus,
          submitted_date: finalStatus === 'submitted' || finalStatus === 'late' ? submittedDate : (existingSubmission?.submitted_date || null),
          updated_at: new Date().toISOString()
        })
        .eq('id', existingSubmission.id)
        .select()
        .single();

      if (error) {
        return NextResponse.json(
          { error: `Failed to update submission: ${error.message}` },
          { status: 400 }
        );
      }

      return NextResponse.json(data);
    } else {
      // Create new submission
      const { data, error } = await supabaseAdmin
        .from('assignment_submissions')
        .insert([{
          assignment_id: assignmentId,
          student_id,
          student_answer: student_answer || null,
          student_comments: student_comments || null,
          file_attachments: file_attachments || [],
          submission_status: finalStatus,
          submitted_date: finalStatus === 'submitted' || finalStatus === 'late' ? submittedDate : null,
          school_id: schoolId
        }])
        .select()
        .single();

      if (error) {
        return NextResponse.json(
          { error: `Failed to create submission: ${error.message}` },
          { status: 400 }
        );
      }

      return NextResponse.json(data, { status: 201 });
    }
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/assignments/[id]/submissions - List all submissions for an assignment
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
    const { id: assignmentId } = await params;
    const { searchParams } = new URL(request.url);
    
    const status = searchParams.get('status');

    let query = supabaseAdmin
      .from('assignment_submissions')
      .select('*, students(full_name, admission_number, grade_level, section)')
      .eq('assignment_id', assignmentId)
      .eq('school_id', schoolId);

    if (status) {
      query = query.eq('submission_status', status);
    }

    query = query.order('submitted_date', { ascending: false });

    const { data, error } = await query;

    if (error) {
      return NextResponse.json(
        { error: `Failed to retrieve submissions: ${error.message}` },
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