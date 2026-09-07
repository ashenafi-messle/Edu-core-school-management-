import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, checkDatabaseConnection } from '@/lib/supabase';
import { getSchoolId } from '@/lib/tenant-context';

// PUT /api/teachers/[id]/deactivate - Deactivate teacher
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
    const { id } = await params;

    if (!schoolId) {
      return NextResponse.json(
        { error: 'School ID is required. Please ensure you are logged in with a valid school account.' },
        { status: 400 }
      );
    }

    // Try to find teacher by UUID first, then by employee_id
    let teacherQuery = supabaseAdmin
      .from('teachers')
      .select('*')
      .eq('school_id', schoolId);

    // Check if id looks like a UUID or employee_id
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    
    if (isUUID) {
      teacherQuery = teacherQuery.eq('id', id);
    } else {
      teacherQuery = teacherQuery.eq('employee_id', id);
    }

    const { data: existingTeacher, error: findError } = await teacherQuery.maybeSingle();

    if (findError) {
      return NextResponse.json(
        { error: `Failed to find teacher: ${findError.message}` },
        { status: 400 }
      );
    }

    if (!existingTeacher) {
      return NextResponse.json(
        { error: `Teacher with ID '${id}' does not exist inside your school.` },
        { status: 404 }
      );
    }

    // Update the teacher status
    const { data, error } = await supabaseAdmin
      .from('teachers')
      .update({ status: 'Deactivated' })
      .eq('id', existingTeacher.id)
      .eq('school_id', schoolId)
      .select()
      .maybeSingle();

    if (error) {
      return NextResponse.json(
        { error: `Failed to deactivate teacher: ${error.message}` },
        { status: 400 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: `Failed to deactivate teacher` },
        { status: 404 }
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
