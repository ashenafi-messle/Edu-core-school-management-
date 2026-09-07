import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, checkDatabaseConnection } from '@/lib/supabase';
import { requireSchoolId } from '@/lib/tenant-context';

// POST /api/users - Create a user for the school
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
    const { email, password_hash, full_name, role, phone } = body;

    const schoolId = requireSchoolId(request);

    if (!email || !password_hash || !full_name || !role) {
      return NextResponse.json(
        { error: 'Email, password, full name, and role are required.' },
        { status: 400 }
      );
    }

    // Enforce email uniqueness per school
    const { data: existing } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('school_id', schoolId)
      .eq('email', email)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: `User with email '${email}' already exists inside this school.` },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('users')
      .insert([{ email, password_hash, full_name, role, phone, school_id: schoolId }])
      .select();

    if (error) {
      return NextResponse.json(
        { error: `Failed to create user: ${error.message}` },
        { status: 400 }
      );
    }

    return NextResponse.json(data[0], { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/users - List all users (tenant scoped)
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
      .from('users')
      .select('*')
      .eq('school_id', schoolId)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: `Failed to retrieve school users: ${error.message}` },
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
