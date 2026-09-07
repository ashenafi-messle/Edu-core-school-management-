import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, checkDatabaseConnection } from '@/lib/supabase';
import { getSchoolId } from '@/lib/tenant-context';

// PUT /api/teachers/class-assignments/[assignmentId] - Update class assignment
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ [key: string]: string }> }
) {
  try {
    checkDatabaseConnection();

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Database connection not configured' },
        { status: 500 }
      );
    }
    
    const schoolId = getSchoolId(request);
    const { assignmentId } = await params;
    const body = await request.json();

    if (!schoolId) {
      return NextResponse.json(
        { error: 'School ID is required. Please ensure you are logged in with a valid school account.' },
        { status: 400 }
      );
    }

    const { grade_level, section_name, subject, role, is_active } = body;

    const updateData: any = {};
    if (grade_level !== undefined) updateData.grade_level = grade_level;
    if (section_name !== undefined) updateData.section_name = section_name;
    if (subject !== undefined) updateData.subject = subject;
    if (role !== undefined) updateData.role = role;
    if (is_active !== undefined) updateData.is_active = is_active;

    const { data, error } = await supabaseAdmin
      .from('teacher_class_assignments')
      .update(updateData)
      .eq('id', assignmentId)
      .eq('school_id', schoolId)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: `Failed to update class assignment: ${error.message}` },
        { status: 400 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/teachers/class-assignments/[assignmentId] - Delete class assignment
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ assignmentId: string }> }
) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Database connection not configured' },
        { status: 500 }
      );
    }

    const schoolId = getSchoolId(request);
    const { assignmentId } = await params;

    if (!schoolId) {
      return NextResponse.json(
        { error: 'School ID is required. Please ensure you are logged in with a valid school account.' },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from('teacher_class_assignments')
      .delete()
      .eq('id', assignmentId)
      .eq('school_id', schoolId);

    if (error) {
      return NextResponse.json(
        { error: `Failed to delete class assignment: ${error.message}` },
        { status: 400 }
      );
    }

    return NextResponse.json({ message: 'Class assignment deleted successfully' });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
