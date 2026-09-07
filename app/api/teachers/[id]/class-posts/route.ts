import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, checkDatabaseConnection } from '@/lib/supabase';
import { requireSchoolId } from '@/lib/tenant-context';

async function verifyAllocation(teacherId: string, schoolId: string, subjectId: string, gradeLevel: string, sectionName: string) {
  if (!supabaseAdmin) return null;

  const { data } = await supabaseAdmin
    .from('subject_assignments')
    .select('id')
    .eq('teacher_id', teacherId)
    .eq('school_id', schoolId)
    .eq('subject_id', subjectId)
    .eq('grade_level', gradeLevel)
    .eq('section_name', sectionName)
    .eq('status', 'Active')
    .maybeSingle();
  return data;
}

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
    const { id: teacherId } = await params;
    const { data, error } = await supabaseAdmin
      .from('teacher_class_posts')
      .select('*, subjects(subject_name, subject_code)')
      .eq('school_id', schoolId)
      .eq('teacher_id', teacherId)
      .order('created_at', { ascending: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json(data || []);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    checkDatabaseConnection();

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Database connection not configured' },
        { status: 500 }
      );
    }
    const schoolId = requireSchoolId(request);
    const { id: teacherId } = await params;
    const body = await request.json();
    const required = ['subject_id', 'grade_level', 'section_name', 'title', 'content'];
    if (required.some((field) => !body[field])) return NextResponse.json({ error: 'Subject, allocated class, title, and content are required.' }, { status: 400 });
    if (!await verifyAllocation(teacherId, schoolId, body.subject_id, body.grade_level, body.section_name)) {
      return NextResponse.json({ error: 'Teacher is not allocated to this subject and class division.' }, { status: 403 });
    }
    const { data, error } = await supabaseAdmin.from('teacher_class_posts').insert({
      school_id: schoolId,
      teacher_id: teacherId,
      subject_id: body.subject_id,
      grade_level: body.grade_level,
      section_name: body.section_name,
      title: body.title,
      content: body.content,
      post_type: body.post_type || 'announcement',
      publish_at: body.publish_at || new Date().toISOString(),
    }).select('*, subjects(subject_name, subject_code)').single();
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
  }
}
