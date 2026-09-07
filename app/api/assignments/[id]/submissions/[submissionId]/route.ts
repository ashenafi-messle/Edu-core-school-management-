import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, checkDatabaseConnection } from '@/lib/supabase';
import { requireSchoolId } from '@/lib/tenant-context';

// GET /api/assignments/[id]/submissions/[submissionId] - Get a specific submission
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
      .from('assignment_submissions')
      .select('*, students(full_name, admission_number, grade_level, section), assignments(title, max_marks, due_date, assignment_type)')
      .eq('id', submissionId)
      .eq('assignment_id', assignmentId)
      .eq('school_id', schoolId)
      .single();

    if (error) {
      return NextResponse.json(
        { error: `Failed to retrieve submission: ${error.message}` },
        { status: 404 }
      );
    }

    // Get grade if exists
    const { data: grade } = await supabaseAdmin
      .from('assignment_grades')
      .select('*')
      .eq('submission_id', submissionId)
      .maybeSingle();

    return NextResponse.json({ ...data, grade });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}