import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, checkDatabaseConnection } from '@/lib/supabase';
import { requireSchoolId } from '@/lib/tenant-context';

// GET /api/assignments/pending-grading - Get all submissions pending grading for a teacher
export async function GET(request: NextRequest) {
  try {
    checkDatabaseConnection();
    

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Database connection not configured' },
        { status: 500 }
      );
    }
    
    const schoolId = requireSchoolId(request);
    const { searchParams } = new URL(request.url);
    
    const teacherId = searchParams.get('teacher_id');
    const subjectId = searchParams.get('subject_id');
    const gradeLevel = searchParams.get('grade_level');
    const sectionName = searchParams.get('section_name');

    if (!teacherId) {
      return NextResponse.json(
        { error: 'Teacher ID is required.' },
        { status: 400 }
      );
    }

    // Build query to get submissions that need grading
    let query = supabaseAdmin
      .from('assignment_submissions')
      .select(`
        *,
        students(full_name, admission_number, grade_level, section),
        assignments(id, title, assignment_type, max_marks, due_date, subject_id, grade_level, section_name),
        assignment_grades(id, score, letter_grade, teacher_feedback)
      `)
      .eq('school_id', schoolId)
      .in('submission_status', ['submitted', 'late']); // Only submissions that need grading

    // Filter by teacher's assignments
    query = query.eq('assignments.teacher_id', teacherId);

    // Apply additional filters
    if (subjectId) query = query.eq('assignments.subject_id', subjectId);
    if (gradeLevel) query = query.eq('assignments.grade_level', gradeLevel);
    if (sectionName) query = query.eq('assignments.section_name', sectionName);

    // Order by submission date (most recent first)
    query = query.order('submitted_date', { ascending: false });

    const { data, error } = await query;

    if (error) {
      return NextResponse.json(
        { error: `Failed to retrieve pending submissions: ${error.message}` },
        { status: 400 }
      );
    }

    // Process data to include grading status
    const processedData = data.map((submission: any) => ({
      ...submission,
      grading_status: submission.assignment_grades && submission.assignment_grades.length > 0 ? 'graded' : 'pending',
      grade: submission.assignment_grades && submission.assignment_grades.length > 0 ? submission.assignment_grades[0] : null
    }));

    return NextResponse.json(processedData);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}