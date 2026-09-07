import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, checkDatabaseConnection } from '@/lib/supabase';
import { requireSchoolId } from '@/lib/tenant-context';

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
    const gradeLevel = searchParams.get('grade_level');
    const sectionName = searchParams.get('section_name');
    const teacherId = searchParams.get('teacher_id');

    if (!gradeLevel) return NextResponse.json({ error: 'grade_level is required.' }, { status: 400 });
    if (!teacherId) return NextResponse.json({ error: 'teacher_id is required.' }, { status: 400 });

    const { data: assignment } = await supabaseAdmin
      .from('subject_assignments')
      .select('id')
      .eq('teacher_id', teacherId)
      .eq('school_id', schoolId)
      .eq('grade_level', gradeLevel)
      .eq('section_name', sectionName)
      .eq('status', 'Active')
      .limit(1)
      .maybeSingle();
    if (!assignment) return NextResponse.json({ error: 'Teacher is not assigned to this class and division.' }, { status: 403 });

    let query = supabaseAdmin
      .from('gradebook_entries')
      .select('*, students(full_name, admission_number)')
      .eq('school_id', schoolId)
      .eq('grade_level', gradeLevel);

    if (sectionName) query = query.eq('section_name', sectionName);
    for (const key of ['subject_id', 'term', 'academic_year_id']) {
      const value = searchParams.get(key);
      if (value) query = query.eq(key, value);
    }

    const { data, error } = await query.order('assessment_date', { ascending: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    return NextResponse.json((data || []).map((entry: any) => ({
      ...entry,
      student_name: entry.students?.full_name || 'Unknown student',
    })));
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
