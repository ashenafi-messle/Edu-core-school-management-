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
    const { id: identifier } = await params;
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(identifier);

    let studentQuery = supabaseAdmin.from('students').select('id, user_id, school_id').eq('school_id', schoolId);
    studentQuery = isUuid
      ? studentQuery.or(`id.eq.${identifier},user_id.eq.${identifier}`)
      : studentQuery.eq('user_id', identifier);
    const { data: student, error: studentError } = await studentQuery.maybeSingle();
    if (studentError) return NextResponse.json({ error: studentError.message }, { status: 400 });
    if (!student) return NextResponse.json({ error: 'Student not found.' }, { status: 404 });

    const { data: records, error: attendanceError } = await supabaseAdmin
      .from('attendance')
      .select('id, class_date, status, remarks, taken_by, created_at, updated_at')
      .eq('school_id', schoolId)
      .eq('student_id', student.id)
      .order('class_date', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(1000);
    if (attendanceError) return NextResponse.json({ error: `Failed to fetch attendance: ${attendanceError.message}` }, { status: 400 });

    const recorderIds = [...new Set((records || []).map(record => record.taken_by).filter(Boolean))];
    let teachers: any[] = [];
    if (recorderIds.length) {
      const { data: teacherRows } = await supabaseAdmin
        .from('teachers')
        .select('id, user_id, full_name, employee_id, department')
        .eq('school_id', schoolId)
        .in('user_id', recorderIds);
      teachers = teacherRows || [];
    }

    const teacherByUserId = new Map(teachers.map(teacher => [teacher.user_id, teacher]));
    const normalizedRecords = (records || []).map(record => ({
      ...record,
      teacher: record.taken_by ? teacherByUserId.get(record.taken_by) || null : null
    }));
    const totals = normalizedRecords.reduce((summary, record) => {
      summary[record.status as keyof typeof summary] += 1;
      return summary;
    }, { present: 0, absent: 0, late: 0, excused: 0 });

    return NextResponse.json({
      student_id: student.id,
      records: normalizedRecords,
      totals,
      attendance_percentage: normalizedRecords.length
        ? Math.round(((totals.present + totals.late + totals.excused) / normalizedRecords.length) * 10000) / 100
        : 0
    }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
  }
}