import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, checkDatabaseConnection } from '@/lib/supabase';
import { requireSchoolId } from '@/lib/tenant-context';

// GET /api/roles - List all roles for the school
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

    const { data, error } = await supabaseAdmin
      .from('roles')
      .select('*')
      .eq('school_id', schoolId)
      .order('is_system_role', { ascending: false })
      .order('name', { ascending: true });

    if (error) {
      return NextResponse.json(
        { error: `Failed to retrieve roles: ${error.message}` },
        { status: 400 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/roles - Create a new role
export async function POST(request: NextRequest) {
  try {
    checkDatabaseConnection();
    

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Database connection not configured' },
        { status: 500 }
      );
    }
    
    const body = await request.json();
    const { name, description, permissions } = body;

    const schoolId = requireSchoolId(request);

    if (!name || !permissions) {
      return NextResponse.json(
        { error: 'Role name and permissions are required.' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('roles')
      .insert([{
        school_id: schoolId,
        name,
        description: description || '',
        permissions,
        is_system_role: false
      }])
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: `Failed to create role: ${error.message}` },
        { status: 400 }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
