import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, checkDatabaseConnection } from '@/lib/supabase';
import { getSchoolId } from '@/lib/tenant-context';

// GET /api/teachers/[id]/curriculum/lesson-plans - Get lesson plans for a teacher
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
    
    const { id: teacherId } = await params;
    const schoolId = getSchoolId(request);
    const { searchParams } = new URL(request.url);
    
    const subjectId = searchParams.get('subject_id');
    const academicYearId = searchParams.get('academic_year_id');
    const gradeLevel = searchParams.get('grade_level');
    const sectionName = searchParams.get('section_name');
    const status = searchParams.get('status');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const weekNumber = searchParams.get('week_number');

    if (!schoolId) {
      return NextResponse.json(
        { error: 'No school found. Please create a school first.' },
        { status: 400 }
      );
    }

    // Verify teacher exists and belongs to the school
    const { data: teacher, error: teacherError } = await supabaseAdmin
      .from('teachers')
      .select('*')
      .eq('id', teacherId)
      .eq('school_id', schoolId)
      .single();

    if (teacherError || !teacher) {
      return NextResponse.json(
        { error: 'Teacher not found' },
        { status: 404 }
      );
    }

    // Build query for lesson plans
    let query = supabaseAdmin
      .from('lesson_plans')
      .select(`
        *,
        subjects:subject_id (id, subject_code, subject_name, category),
        academic_years:academic_year_id (id, year_name, is_active),
        creator:created_by (id, full_name, email),
        updater:updated_by (id, full_name, email)
      `)
      .eq('school_id', schoolId)
      .eq('teacher_id', teacherId);

    if (subjectId) query = query.eq('subject_id', subjectId);
    if (academicYearId) query = query.eq('academic_year_id', academicYearId);
    if (gradeLevel) query = query.eq('grade_level', gradeLevel);
    if (sectionName) query = query.eq('section_name', sectionName);
    if (status) query = query.eq('status', status);
    if (weekNumber) query = query.eq('week_number', parseInt(weekNumber));

    if (startDate) query = query.gte('lesson_date', startDate);
    if (endDate) query = query.lte('lesson_date', endDate);

    const { data: lessonPlans, error: lessonPlansError } = await query
      .order('lesson_date', { ascending: true });

    if (lessonPlansError) {
      return NextResponse.json(
        { error: `Failed to retrieve lesson plans: ${lessonPlansError.message}` },
        { status: 400 }
      );
    }

    return NextResponse.json({
      teacher: {
        id: teacher.id,
        full_name: teacher.full_name,
        employee_id: teacher.employee_id,
        department: teacher.department
      },
      lesson_plans: lessonPlans || [],
      total_plans: lessonPlans?.length || 0
    });

  } catch (error) {
    console.error('Error in GET /api/teachers/[id]/curriculum/lesson-plans:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/teachers/[id]/curriculum/lesson-plans - Create a new lesson plan
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
    
    const { id: teacherId } = await params;
    const schoolId = getSchoolId(request);
    const body = await request.json();

    if (!schoolId) {
      return NextResponse.json(
        { error: 'School ID is required' },
        { status: 400 }
      );
    }

    const { 
      subject_id,
      academic_year_id,
      grade_level,
      section_name,
      title,
      description,
      lesson_date,
      week_number,
      day_of_week,
      duration_minutes,
      learning_objectives,
      topics_covered,
      teaching_methods,
      materials_needed,
      activities,
      assessment_methods,
      homework_assignment,
      notes,
      file_attachments,
      status
    } = body;

    // Validate required fields
    if (!subject_id || !grade_level || !section_name || !title || !lesson_date) {
      return NextResponse.json(
        { error: 'Missing required fields: subject_id, grade_level, section_name, title, lesson_date' },
        { status: 400 }
      );
    }

    // Verify teacher exists and belongs to the school
    const { data: teacher, error: teacherError } = await supabaseAdmin
      .from('teachers')
      .select('*')
      .eq('id', teacherId)
      .eq('school_id', schoolId)
      .single();

    if (teacherError || !teacher) {
      return NextResponse.json(
        { error: 'Teacher not found' },
        { status: 404 }
      );
    }

    // Verify subject exists and belongs to the school
    const { data: subject, error: subjectError } = await supabaseAdmin
      .from('subjects')
      .select('id')
      .eq('id', subject_id)
      .eq('school_id', schoolId)
      .single();

    if (subjectError || !subject) {
      return NextResponse.json(
        { error: 'Subject not found' },
        { status: 404 }
      );
    }

    // Verify teacher is assigned to this subject/grade/section
    const { data: assignment, error: assignmentError } = await supabaseAdmin
      .from('subject_assignments')
      .select('*')
      .eq('teacher_id', teacherId)
      .eq('subject_id', subject_id)
      .eq('grade_level', grade_level)
      .eq('section_name', section_name)
      .eq('status', 'Active')
      .single();

    if (assignmentError || !assignment) {
      return NextResponse.json(
        { error: 'Teacher is not assigned to this subject/grade/section' },
        { status: 403 }
      );
    }

    // Create lesson plan
    const { data: lessonPlan, error: lessonPlanError } = await supabaseAdmin
      .from('lesson_plans')
      .insert({
        id: crypto.randomUUID(),
        school_id: schoolId,
        teacher_id: teacherId,
        subject_id,
        academic_year_id: academic_year_id || assignment.academic_year_id,
        grade_level,
        section_name,
        title,
        description: description || null,
        lesson_date,
        week_number: week_number || null,
        day_of_week: day_of_week || null,
        duration_minutes: duration_minutes || 45,
        learning_objectives: learning_objectives || [],
        topics_covered: topics_covered || [],
        teaching_methods: teaching_methods || [],
        materials_needed: materials_needed || [],
        activities: activities || [],
        assessment_methods: assessment_methods || [],
        homework_assignment: homework_assignment || null,
        notes: notes || null,
        file_attachments: file_attachments || [],
        status: status || 'draft',
        created_by: teacher.user_id,
        updated_by: teacher.user_id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (lessonPlanError) {
      return NextResponse.json(
        { error: `Failed to create lesson plan: ${lessonPlanError.message}` },
        { status: 400 }
      );
    }

    // Log activity
    await supabaseAdmin
      .from('curriculum_activity_log')
      .insert({
        id: crypto.randomUUID(),
        school_id: schoolId,
        lesson_plan_id: lessonPlan.id,
        user_id: teacher.user_id,
        action: 'created',
        metadata: {
          title: lessonPlan.title,
          lesson_date: lessonPlan.lesson_date,
          subject_id: lessonPlan.subject_id
        },
        created_at: new Date().toISOString()
      });

    return NextResponse.json({
      success: true,
      message: 'Lesson plan created successfully',
      lesson_plan: lessonPlan
    }, { status: 201 });

  } catch (error) {
    console.error('Error in POST /api/teachers/[id]/curriculum/lesson-plans:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
