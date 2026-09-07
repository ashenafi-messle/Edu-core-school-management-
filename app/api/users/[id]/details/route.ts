import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, checkDatabaseConnection } from '@/lib/supabase';
import { requireSchoolId } from '@/lib/tenant-context';

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
    
    const schoolId = await requireSchoolId(request);
    if (!schoolId) {
      return NextResponse.json({ error: 'School ID required' }, { status: 401 });
    }

    const { id: userId } = await params;

    // Get base user information
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', userId)
      .eq('school_id', schoolId)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Initialize combined data with user info
    const combinedData: any = {
      ...user,
      parent: null,
      student: null,
      teacher: null
    };

    // Fetch role-specific data based on user role - execute immediately if needed
    let roleDataPromise;
    if (user.role === 'parent') {
      roleDataPromise = supabaseAdmin
        .from('parents')
        .select('*')
        .eq('user_id', userId)
        .eq('school_id', schoolId)
        .maybeSingle();
    } else if (user.role === 'student') {
      roleDataPromise = supabaseAdmin
        .from('students')
        .select('*, parent:parents(full_name, relationship, emergency_contact)')
        .eq('user_id', userId)
        .eq('school_id', schoolId)
        .maybeSingle();
    } else if (user.role === 'teacher') {
      roleDataPromise = supabaseAdmin
        .from('teachers')
        .select('*')
        .eq('user_id', userId)
        .eq('school_id', schoolId)
        .maybeSingle();
    }

    // Execute role-specific query if needed
    if (roleDataPromise) {
      const { data: roleData } = await roleDataPromise;
      if (roleData) {
        if (user.role === 'parent') combinedData.parent = roleData;
        else if (user.role === 'student') combinedData.student = roleData;
        else if (user.role === 'teacher') combinedData.teacher = roleData;
      }
    }

    // Cache response for 5 minutes
    const response = NextResponse.json({ user: combinedData }, { status: 200 });
    response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
    return response;
  } catch (error) {
    console.error('User details endpoint error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
