import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, checkDatabaseConnection } from '@/lib/supabase';
import { requireSchoolId } from '@/lib/tenant-context';

// POST /api/exams - Schedule a new exam/assessment
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

    const schoolId = requireSchoolId(request);

    if (!body.title || !body.exam_type || !body.grade_level || !body.max_score || !body.exam_date) {
      return NextResponse.json(
        { error: 'Title, exam type, grade level, max score, and exam date are required.' },
        { status: 400 }
      );
    }

    const { questions: _questions, ...examBody } = body;
    let assignment: any = null;
    if (examBody.teacher_id) {
      let assignmentQuery = supabaseAdmin
        .from('subject_assignments')
        .select('id, subject_id, academic_year_id, semester')
        .eq('teacher_id', examBody.teacher_id)
        .eq('school_id', schoolId)
        .eq('grade_level', examBody.grade_level)
        .eq('section_name', examBody.section_name)
        .eq('status', 'Active');
      if (examBody.subject_id) assignmentQuery = assignmentQuery.eq('subject_id', examBody.subject_id);
      const { data: assignedSubject } = await assignmentQuery
        .order('assignment_date', { ascending: false })
        .limit(1)
        .maybeSingle();
      assignment = assignedSubject;
      if (!assignment) return NextResponse.json({ error: 'This teacher is not assigned to the selected class and division.' }, { status: 403 });
    }

    if (!assignment?.subject_id && !examBody.subject_id) {
      return NextResponse.json({ error: 'A subject assigned to this teacher is required.' }, { status: 400 });
    }

    const examCode = examBody.exam_code || `EX-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
    const durationMinutes = Number(examBody.duration_minutes) || 60;
    const startTime = examBody.start_time || '09:00';
    const endTime = examBody.end_time || `${String(9 + Math.floor(durationMinutes / 60)).padStart(2, '0')}:${String(durationMinutes % 60).padStart(2, '0')}`;
    let academicYearId = examBody.academic_year_id || assignment?.academic_year_id;
    if (!academicYearId) {
      const { data: currentYear } = await supabaseAdmin
        .from('academic_years')
        .select('id')
        .eq('school_id', schoolId)
        .eq('is_active', true)
        .limit(1)
        .maybeSingle();
      academicYearId = currentYear?.id;
    }
    if (!academicYearId) return NextResponse.json({ error: 'No active academic year is configured for this school.' }, { status: 400 });

    const normalizedExamBody = {
      ...examBody,
      exam_code: examCode,
      subject_id: assignment?.subject_id || examBody.subject_id,
      academic_year_id: academicYearId,
      exam_category: examBody.exam_category || 'formative',
      term: examBody.term || assignment?.semester || 'Term 1',
      duration_minutes: durationMinutes,
      start_time: startTime,
      end_time: endTime,
      question_paper_url: examBody.question_paper_url || `generated://exam/${examCode}/question-paper`,
      grading_scale: examBody.grading_scale || { A: 90, B: 80, C: 70, D: 60, F: 0 },
      attachments: examBody.attachments || [],
      status: examBody.status || 'draft',
      is_published: examBody.is_published ?? false,
    };
    const { data, error } = await supabaseAdmin
      .from('enhanced_exams')
      .insert([{ ...normalizedExamBody, school_id: schoolId }])
      .select();

    if (error) {
      return NextResponse.json(
        { error: `Failed to schedule exam: ${error.message}` },
        { status: 400 }
      );
    }

    const createdExam = data[0];
    let studentsQuery = supabaseAdmin
      .from('students')
      .select('id')
      .eq('school_id', schoolId)
      .eq('grade_level', examBody.grade_level);
    if (examBody.section_name) studentsQuery = studentsQuery.eq('section', examBody.section_name);

    const { data: students } = await studentsQuery;
    if (students && students.length > 0) {
      await supabaseAdmin
        .from('exam_registrations')
        .upsert(
          students.map((student) => ({
            school_id: schoolId,
            exam_id: createdExam.id,
            student_id: student.id,
            registration_status: 'registered',
          })),
          { onConflict: 'exam_id,student_id', ignoreDuplicates: true }
        );
    }

    return NextResponse.json(createdExam, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/exams - List exams (tenant scoped)
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
    let query = supabaseAdmin
      .from('enhanced_exams')
      .select('*')
      .eq('school_id', schoolId);

    const gradeLevel = searchParams.get('grade_level');
    const sectionName = searchParams.get('section_name');
    const teacherId = searchParams.get('teacher_id');
    if (gradeLevel) query = query.eq('grade_level', gradeLevel);
    if (sectionName) query = query.eq('section_name', sectionName);
    if (teacherId) query = query.eq('teacher_id', teacherId);
    const { data, error } = await query.order('exam_date', { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: `Failed to retrieve exams list: ${error.message}` },
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
