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
      .select('student_id, subject_id, subject_name, score, max_score, percentage, letter_grade')
      .eq('school_id', schoolId)
      .eq('grade_level', gradeLevel);
    if (sectionName) query = query.eq('section_name', sectionName);
    const term = searchParams.get('term');
    if (term) query = query.eq('term', term);

    const { data, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    const entries = data || [];
    const percentages = entries.map((entry: any) => Number(entry.percentage || 0));
    const average = percentages.length ? percentages.reduce((sum, value) => sum + value, 0) / percentages.length : 0;
    const studentIds = new Set(entries.map((entry: any) => entry.student_id));

    return NextResponse.json({
      grade_level: gradeLevel,
      section_name: sectionName || undefined,
      total_students: studentIds.size,
      overall_average: average,
      overall_gpa: average / 25,
      subject_performance: [],
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
