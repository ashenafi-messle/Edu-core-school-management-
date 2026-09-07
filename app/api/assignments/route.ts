import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, checkDatabaseConnection } from '@/lib/supabase';
import { requireSchoolId } from '@/lib/tenant-context';

// POST /api/assignments - Create a new assignment/homework
export async function POST(request: NextRequest) {
  try {
    checkDatabaseConnection();
    

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Database connection not configured' },
        { status: 500 }
      );
    }
    
    const body = await request.json();
    const { 
      teacher_id, 
      subject_id, 
      title, 
      description, 
      assignment_type, 
      instructions, 
      academic_year_id, 
      grade_level, 
      section_name, 
      max_marks, 
      due_date, 
      status,
      attachments 
    } = body;

    const schoolId = requireSchoolId(request);

    // Validation
    if (!teacher_id || !title || !assignment_type || !max_marks || !due_date) {
      return NextResponse.json(
        { error: 'Teacher ID, title, assignment type, max marks, and due date are required.' },
        { status: 400 }
      );
    }

    if (!['homework', 'assignment', 'project'].includes(assignment_type)) {
      return NextResponse.json(
        { error: 'Invalid assignment type. Must be homework, assignment, or project.' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('assignments')
      .insert([{
        teacher_id,
        subject_id: subject_id || null,
        title,
        description: description || null,
        assignment_type,
        instructions: instructions || null,
        academic_year_id: academic_year_id || null,
        grade_level: grade_level || null,
        section_name: section_name || null,
        max_marks,
        due_date,
        status: status || 'published',
        attachments: attachments || [],
        school_id: schoolId
      }])
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: `Failed to create assignment: ${error.message}` },
        { status: 400 }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/assignments - List assignments (tenant scoped)
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
    
    // Query parameters
    const teacherId = searchParams.get('teacher_id');
    const subjectId = searchParams.get('subject_id');
    const assignmentType = searchParams.get('assignment_type');
    const status = searchParams.get('status');
    const gradeLevel = searchParams.get('grade_level');
    const sectionName = searchParams.get('section_name');
    const academicYearId = searchParams.get('academic_year_id');

    let query = supabaseAdmin
      .from('assignments')
      .select('*, teachers(full_name, employee_id), subjects(subject_name, subject_code)')
      .eq('school_id', schoolId);

    // Apply filters
    if (teacherId) query = query.eq('teacher_id', teacherId);
    if (subjectId) query = query.eq('subject_id', subjectId);
    if (assignmentType) query = query.eq('assignment_type', assignmentType);
    if (status) query = query.eq('status', status);
    if (gradeLevel) query = query.eq('grade_level', gradeLevel);
    if (sectionName) query = query.eq('section_name', sectionName);
    if (academicYearId) query = query.eq('academic_year_id', academicYearId);

    // Order by due date (most recent first)
    query = query.order('due_date', { ascending: false });

    const { data, error } = await query;

    if (error) {
      return NextResponse.json(
        { error: `Failed to retrieve assignments: ${error.message}` },
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