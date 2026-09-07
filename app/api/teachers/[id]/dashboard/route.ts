import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, checkDatabaseConnection } from '@/lib/supabase';
import { requireSchoolId } from '@/lib/tenant-context';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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
    const { data: teacher, error: teacherError } = await supabaseAdmin
      .from('teachers')
      .select('*')
      .or(`id.eq.${id},user_id.eq.${id}`)
      .eq('school_id', schoolId)
      .maybeSingle();
    if (teacherError) return NextResponse.json({ error: teacherError.message }, { status: 400 });
    if (!teacher) return NextResponse.json({ error: 'Teacher not found.' }, { status: 404 });

    const [{ data: assignments }, { data: timetable }, { data: posts }, { data: submissions }] = await Promise.all([
      supabaseAdmin.from('subject_assignments').select('id, grade_level, section_name, subject_id, subjects(subject_name, subject_code)').eq('school_id', schoolId).eq('teacher_id', teacher.id).eq('status', 'Active'),
      supabaseAdmin.from('weekly_timetables').select('id, day_of_week, room_number, notes, time_slot:time_slots(slot_name, start_time, end_time), subject:subjects(subject_name, subject_code), section_configuration:section_configurations(id, grade_level, section_name)').eq('school_id', schoolId).eq('teacher_id', teacher.id).eq('is_active', true).order('day_of_week').order('time_slot_id'),
      supabaseAdmin.from('teacher_class_posts').select('id, title, content, post_type, grade_level, section_name, created_at, subjects(subject_name)').eq('school_id', schoolId).eq('teacher_id', teacher.id).order('created_at', { ascending: false }).limit(5),
      supabaseAdmin.from('assignment_submissions').select('id, submission_status').eq('school_id', schoolId).eq('grading_status', 'pending').limit(100),
    ]);

    const uniqueStudents = new Set<string>();
    for (const assignment of assignments || []) {
      const { data: students } = await supabaseAdmin.from('students').select('id').eq('school_id', schoolId).eq('grade_level', assignment.grade_level).eq('section', assignment.section_name);
      (students || []).forEach((student) => uniqueStudents.add(student.id));
    }
    return NextResponse.json({
      teacher,
      assignments: assignments || [],
      timetable: timetable || [],
      posts: posts || [],
      stats: { subjects: new Set((assignments || []).map((item: any) => item.subject_id)).size, students: uniqueStudents.size, pending_submissions: (submissions || []).length },
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
  }
}
