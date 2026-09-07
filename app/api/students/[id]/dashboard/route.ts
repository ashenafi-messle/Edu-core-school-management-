import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, checkDatabaseConnection } from '@/lib/supabase';
import { requireSchoolId } from '@/lib/tenant-context';

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
    const { id } = await params;

    let studentQuery = supabaseAdmin
      .from('students')
      .select('id, user_id, school_id, admission_number, full_name, grade_level, section, gender, date_of_birth, phone, address, parent_id, users:user_id(email, phone, status), parents:parent_id(full_name, relationship, emergency_contact)')
      .eq('school_id', schoolId);

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
    studentQuery = isUuid ? studentQuery.or(`id.eq.${id},user_id.eq.${id}`) : studentQuery.eq('user_id', id);
    const { data: student, error: studentError } = await studentQuery.maybeSingle();
    if (studentError) return NextResponse.json({ error: studentError.message }, { status: 400 });
    if (!student) return NextResponse.json({ error: 'Student not found.' }, { status: 404 });

    const { data: section } = await supabaseAdmin
      .from('section_configurations')
      .select('id, grade_level, section_name')
      .eq('school_id', schoolId)
      .eq('grade_level', student.grade_level)
      .eq('section_name', student.section || '')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .maybeSingle();

    const studentEmail = (student.users as any)?.email;
    let registration: any = null;
    if (studentEmail || student.phone) {
      let registrationQuery = supabaseAdmin
        .from('registrations')
        .select('id, reference_id, parent_first_name, parent_last_name, parent_relationship, parent_phone, parent_email, emergency_contact_name, emergency_phone, submitted_at, status')
        .eq('school_id', schoolId);
      if (studentEmail) {
        registrationQuery = registrationQuery.eq('student_email', studentEmail);
      } else {
        registrationQuery = registrationQuery.eq('student_phone', student.phone);
      }
      const { data: registrationByContact } = await registrationQuery
        .order('submitted_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      registration = registrationByContact;
    }

    const [{ data: academicYear }, { data: timetable, error: timetableError }, { data: attendance }, { data: records }, { data: assignments }, { data: announcements }, { data: exams }, { data: grades }] = await Promise.all([
      supabaseAdmin.from('academic_years').select('id, year_name').eq('school_id', schoolId).eq('is_active', true).maybeSingle(),
      section ? supabaseAdmin.from('weekly_timetables').select('id, day_of_week, room_number, notes, academic_year_id, time_slot:time_slots(id, slot_name, start_time, end_time, break_time, order_index), subject:subjects(id, subject_code, subject_name), teacher:teachers(id, full_name), section_configuration:section_configurations(id, grade_level, section_name)').eq('school_id', schoolId).eq('section_configuration_id', section.id).eq('is_active', true) : Promise.resolve({ data: [], error: null }),
      supabaseAdmin.from('attendance').select('id, class_date, status, remarks, notes, teacher_id, subject_id, grade_level, section_name, teachers:teacher_id(id, full_name), subjects:subject_id(id, subject_name, subject_code)').eq('school_id', schoolId).eq('student_id', student.id).order('class_date', { ascending: false }).order('created_at', { ascending: false }).limit(1000),
      supabaseAdmin.from('student_academic_records').select('*').eq('school_id', schoolId).eq('student_id', student.id).order('created_at', { ascending: false }).limit(10),
      supabaseAdmin.from('assignments').select('id, title, description, instructions, assignment_type, max_marks, due_date, status, grade_level, section_name, subject:subjects(subject_name), teacher:teachers(full_name), assignment_submissions!left(id, submission_status, submitted_date, student_comments, file_attachments)').eq('school_id', schoolId).eq('grade_level', student.grade_level).eq('section_name', student.section || '').eq('status', 'published').order('due_date').limit(10),
      supabaseAdmin.from('announcements').select('*').eq('school_id', schoolId).eq('status', 'published').or('target_audience.eq.all,target_audience.eq.students').or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`).order('published_at', { ascending: false }).limit(10),
      supabaseAdmin.from('enhanced_exams').select('id, title, subject_id, grade_level, section_name, max_score, exam_date, start_time, end_time, duration_minutes, venue, status, is_published, subject:subjects(subject_name, subject_code), teacher:teachers(full_name)').eq('school_id', schoolId).eq('grade_level', student.grade_level).or(`section_name.eq.${student.section || ''},section_name.is.null`).eq('is_published', true).gte('exam_date', new Date().toISOString().slice(0, 10)).order('exam_date').limit(10),
      supabaseAdmin.from('exam_grades').select('id, exam_id, score, grade, feedback, student_id, exams(title, subject, max_score, exam_date)').eq('school_id', schoolId).eq('student_id', student.id).order('created_at', { ascending: false }).limit(50)
    ]);

    if (timetableError) return NextResponse.json({ error: `Failed to fetch timetable: ${timetableError.message}` }, { status: 400 });

    const attendanceCount = attendance?.length || 0;
    const presentCount = attendance?.filter((item) => ['present', 'late', 'excused'].includes(item.status)).length || 0;
    const latestRecord = records?.[0];
    const normalizedAssignments = (assignments || []).map((item: any) => {
      const submission = item.assignment_submissions?.[0];
      const status = submission?.submission_status === 'graded' ? 'Graded' : submission?.submission_status === 'submitted' || submission?.submission_status === 'late' ? 'Submitted' : 'Pending';
      return { ...item, attachments: item.attachments || [], subject: item.subject?.subject_name || 'Unassigned', teacher: item.teacher?.full_name || 'Unassigned', marks: item.max_marks, dueDate: item.due_date, status, submission };
    });
    const normalizedExams = (exams || []).map((item: any) => ({
      id: item.id,
      title: item.title,
      subject: item.subject?.subject_name || item.subject?.subject_code || 'Unassigned',
      teacher: item.teacher?.full_name || 'Unassigned',
      date: item.exam_date,
      durationMinutes: item.duration_minutes || 60,
      totalMarks: Number(item.max_score || 0),
      status: 'Upcoming',
      questions: [],
      venue: item.venue,
      startTime: item.start_time,
      endTime: item.end_time
    }));

    return NextResponse.json({
      profile: { ...student, id: student.id, admission_number: student.admission_number, email: (student.users as any)?.email || '', phone: (student.users as any)?.phone || '' },
      registration,
      academic_year: academicYear,
      timetable: timetable || [],
      attendance: attendance || [],
      attendance_percentage: attendanceCount ? Math.round((presentCount / attendanceCount) * 10000) / 100 : 0,
      academic_records: records || [],
      latest_record: latestRecord || null,
      assignments: normalizedAssignments,
      announcements: announcements || [],
      exams: normalizedExams,
      grades: grades || []
    }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
  }
}