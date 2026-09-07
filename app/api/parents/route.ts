import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, checkDatabaseConnection } from '@/lib/supabase';
import { requireSchoolId } from '@/lib/tenant-context';

// POST /api/parents - Register parent
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
    const { user_id, full_name, relationship, emergency_contact, phone, email, profile_picture_url } = body;

    const schoolId = requireSchoolId(request);

    if (!full_name) {
      return NextResponse.json(
        { error: 'Full name is required.' },
        { status: 400 }
      );
    }

    // If user_id is provided, verify the user exists and has parent role
    if (user_id) {
      const { data: user, error: userError } = await supabaseAdmin
        .from('users')
        .select('id, role, school_id')
        .eq('id', user_id)
        .eq('school_id', schoolId)
        .maybeSingle();

      if (userError || !user) {
        return NextResponse.json(
          { error: `User with ID '${user_id}' not found in your school.` },
          { status: 400 }
        );
      }

      if (user.role !== 'parent') {
        return NextResponse.json(
          { error: `User must have 'parent' role to be associated with parent record.` },
          { status: 400 }
        );
      }
    }

    const { data, error } = await supabaseAdmin
      .from('parents')
      .insert([{ user_id, full_name, relationship, emergency_contact, phone, email, profile_picture_url, school_id: schoolId }])
      .select();

    if (error) {
      return NextResponse.json(
        { error: `Failed to register parent: ${error.message}` },
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

// GET /api/parents - List school parents (tenant scoped) with filtering
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
    
    const search = searchParams.get('search');
    const status = searchParams.get('status');
    const relationship = searchParams.get('relationship');
    const limit = searchParams.get('limit');
    const offset = searchParams.get('offset');

    let query = supabaseAdmin
      .from('parents')
      .select('*')
      .eq('school_id', schoolId);

    // Apply search filter
    if (search) {
      query = query.ilike('full_name', `%${search}%`);
    }

    // Apply status filter
    if (status) {
      query = query.eq('status', status);
    }

    // Apply relationship filter
    if (relationship) {
      query = query.eq('relationship', relationship);
    }

    // Apply pagination
    if (limit) {
      query = query.limit(parseInt(limit));
    }
    if (offset) {
      const limitNum = parseInt(limit || '10');
      query = query.range(parseInt(offset), parseInt(offset) + limitNum - 1);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: `Failed to retrieve parents: ${error.message}` },
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
