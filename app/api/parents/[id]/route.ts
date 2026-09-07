import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, checkDatabaseConnection } from '@/lib/supabase';
import { requireSchoolId } from '@/lib/tenant-context';

// GET /api/parents/[id] - Get parent details with user information (tenant scoped)
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
    
    const schoolId = requireSchoolId(request);
    const { id } = await params;

    const { data: parent, error: parentError } = await supabaseAdmin
      .from('parents')
      .select('*')
      .eq('id', id)
      .eq('school_id', schoolId)
      .maybeSingle();

    if (parentError) {
      return NextResponse.json(
        { error: `Failed to retrieve parent: ${parentError.message}` },
        { status: 400 }
      );
    }

    if (!parent) {
      return NextResponse.json(
        { error: `Parent with ID '${id}' is not registered under your school.` },
        { status: 404 }
      );
    }

    // Get associated user if user_id exists
    let user = null;
    if (parent.user_id) {
      const { data: userData } = await supabaseAdmin
        .from('users')
        .select('id, email, phone, status, profile_picture_url')
        .eq('id', parent.user_id)
        .eq('school_id', schoolId)
        .maybeSingle();

      user = userData;
    }

    return NextResponse.json({
      ...parent,
      user: user || undefined
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/parents/[id] - Update parent profile (tenant scoped)
export async function PUT(
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
    const body = await request.json();

    // Clean school_id from payload to block tenant hijacking attempts
    delete body.school_id;

    // Verify parent exists
    const { data: existing } = await supabaseAdmin
      .from('parents')
      .select('id')
      .eq('id', id)
      .eq('school_id', schoolId)
      .maybeSingle();

    if (!existing) {
      return NextResponse.json(
        { error: `Parent with ID '${id}' not found.` },
        { status: 404 }
      );
    }

    // If updating user_id, verify the new user
    if (body.user_id !== undefined) {
      if (body.user_id) {
        const { data: user } = await supabaseAdmin
          .from('users')
          .select('id, role, school_id')
          .eq('id', body.user_id)
          .eq('school_id', schoolId)
          .maybeSingle();

        if (!user || user.role !== 'parent') {
          return NextResponse.json(
            { error: `Invalid user_id. User must exist and have 'parent' role.` },
            { status: 400 }
          );
        }
      }
    }

    // Remove fields that shouldn't be updated directly
    const { user_id, ...parentUpdateData } = body;

    // Update parent record
    const { data, error } = await supabaseAdmin
      .from('parents')
      .update(parentUpdateData)
      .eq('id', id)
      .eq('school_id', schoolId)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: `Failed to update parent: ${error.message}` },
        { status: 400 }
      );
    }

    // If user_id needs to be updated, do it separately
    if (user_id !== undefined) {
      await supabaseAdmin
        .from('parents')
        .update({ user_id: user_id || null })
        .eq('id', id)
        .eq('school_id', schoolId);
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/parents/[id] - Deregister parent (tenant scoped)
export async function DELETE(
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

    // Check if parent has associated students
    const { data: students } = await supabaseAdmin!
      .from('students')
      .select('id')
      .eq('parent_id', id)
      .eq('school_id', schoolId)
      .limit(1);

    if (students && students.length > 0) {
      return NextResponse.json(
        { error: `Cannot delete parent with associated students. Please reassign or remove students first.` },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin!
      .from('parents')
      .delete()
      .eq('id', id)
      .eq('school_id', schoolId)
      .select()
      .maybeSingle();

    if (error) {
      return NextResponse.json(
        { error: `Failed to delete parent: ${error.message}` },
        { status: 400 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: `Parent with ID '${id}' is not registered under your school.` },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Parent deleted successfully' });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
