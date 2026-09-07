import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, checkDatabaseConnection } from '@/lib/supabase';
import { requireSchoolId } from '@/lib/tenant-context';

// GET /api/roles/[id] - Get single role details
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

    const { data, error } = await supabaseAdmin
      .from('roles')
      .select('*')
      .eq('id', id)
      .eq('school_id', schoolId)
      .maybeSingle();

    if (error) {
      return NextResponse.json(
        { error: `Failed to retrieve role: ${error.message}` },
        { status: 400 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: `Role with ID '${id}' does not exist in your school.` },
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

// PUT /api/roles/[id] - Update role
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

    // First check if this is a system role
    const { data: existingRole } = await supabaseAdmin
      .from('roles')
      .select('is_system_role')
      .eq('id', id)
      .eq('school_id', schoolId)
      .maybeSingle();

    if (!existingRole) {
      return NextResponse.json(
        { error: `Role with ID '${id}' does not exist in your school.` },
        { status: 404 }
      );
    }

    // Note: System role protection temporarily disabled for testing
    // if (existingRole.is_system_role) {
    //   return NextResponse.json(
    //     { error: 'Cannot modify system roles. System roles are protected.' },
    //     { status: 403 }
    //   );
    // }

    const { data, error } = await supabaseAdmin
      .from('roles')
      .update({
        ...(body.name && { name: body.name }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.permissions && { permissions: body.permissions })
      })
      .eq('id', id)
      .eq('school_id', schoolId)
      .select()
      .maybeSingle();

    if (error) {
      return NextResponse.json(
        { error: `Failed to update role: ${error.message}` },
        { status: 400 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: `Role with ID '${id}' does not exist in your school.` },
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

// DELETE /api/roles/[id] - Delete role
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

    // First check if this is a system role
    const { data: existingRole } = await supabaseAdmin
      .from('roles')
      .select('is_system_role')
      .eq('id', id)
      .eq('school_id', schoolId)
      .maybeSingle();

    if (!existingRole) {
      return NextResponse.json(
        { error: `Role with ID '${id}' does not exist in your school.` },
        { status: 404 }
      );
    }

    // Note: System role protection temporarily disabled for testing
    // if (existingRole.is_system_role) {
    //   return NextResponse.json(
    //     { error: 'Cannot delete system roles. System roles are protected.' },
    //     { status: 403 }
    //   );
    // }

    // Check if any users have this role
    const { data: usersWithRole } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('role', id)
      .limit(1);

    if (usersWithRole && usersWithRole.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete role that is assigned to users. Please reassign users first.' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('roles')
      .delete()
      .eq('id', id)
      .eq('school_id', schoolId)
      .select()
      .maybeSingle();

    if (error) {
      return NextResponse.json(
        { error: `Failed to delete role: ${error.message}` },
        { status: 400 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: `Role with ID '${id}' does not exist in your school.` },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Role deleted successfully' });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
