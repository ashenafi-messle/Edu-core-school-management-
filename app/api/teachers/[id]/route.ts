import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, checkDatabaseConnection } from '@/lib/supabase';
import { getSchoolId } from '@/lib/tenant-context';

// GET /api/teachers/[id] - Get specific teacher details (tenant scoped)
export async function GET(
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

    const { data, error } = await supabaseAdmin
      .from('teachers')
      .select('*')
      .or(`id.eq.${id},user_id.eq.${id}`)
      .eq('school_id', schoolId)
      .maybeSingle();

    if (error) {
      return NextResponse.json(
        { error: `Failed to retrieve teacher record: ${error.message}` },
        { status: 400 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: `Teacher with ID '${id}' does not exist inside your school.` },
        { status: 404 }
      );
    }

    let userPhoto: string | null = null;
    if (data.user_id) {
      const { data: user } = await supabaseAdmin
        .from('users')
        .select('profile_picture_url')
        .eq('id', data.user_id)
        .eq('school_id', schoolId)
        .maybeSingle();
      userPhoto = user?.profile_picture_url || null;
    }

    return NextResponse.json({
      ...data,
      photo: userPhoto || data.photo,
      profile_picture_url: userPhoto,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/teachers/[id] - Update teacher record (tenant scoped)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Database connection not configured' },
        { status: 500 }
      );
    }

    const schoolId = getSchoolId(request);
    const { id } = await params;
    const body = await request.json();

    if (!schoolId) {
      return NextResponse.json(
        { error: 'School ID is required. Please ensure you are logged in with a valid school account.' },
        { status: 400 }
      );
    }

    // Clean school_id from payload to block tenant hijacking attempts
    delete body.school_id;

    const { data: teacher } = await supabaseAdmin.from('teachers').select('id, user_id').or(`id.eq.${id},user_id.eq.${id}`).eq('school_id', schoolId).maybeSingle();
    if (!teacher) return NextResponse.json({ error: `Teacher with ID '${id}' does not exist inside your school.` }, { status: 404 });

    const { data, error } = await supabaseAdmin
      .from('teachers')
      .update(body)
      .eq('id', teacher.id)
      .eq('school_id', schoolId)
      .select()
      .maybeSingle();

    if (error) {
      return NextResponse.json(
        { error: `Failed to update teacher: ${error.message}` },
        { status: 400 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: `Teacher with ID '${id}' does not exist inside your school.` },
        { status: 404 }
      );
    }

    if (body.photo && teacher.user_id) {
      await supabaseAdmin
        .from('users')
        .update({ profile_picture_url: body.photo })
        .eq('id', teacher.user_id)
        .eq('school_id', schoolId);
    }

    return NextResponse.json({
      ...data,
      photo: body.photo || data.photo,
      profile_picture_url: body.photo || null,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/teachers/[id] - Delete teacher from registry (tenant scoped)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
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

    const { data, error } = await supabaseAdmin
      .from('teachers')
      .delete()
      .eq('id', id)
      .eq('school_id', schoolId)
      .select()
      .maybeSingle();

    if (error) {
      return NextResponse.json(
        { error: `Failed to delete teacher: ${error.message}` },
        { status: 400 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: `Teacher with ID '${id}' does not exist inside your school.` },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Teacher deleted successfully' });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
