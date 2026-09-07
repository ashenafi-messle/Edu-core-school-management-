import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, checkDatabaseConnection } from '@/lib/supabase';
import { requireSchoolId } from '@/lib/tenant-context';

// POST /api/analytics/activity - Log user activity
export async function POST(request: NextRequest) {
  try {
    checkDatabaseConnection();
    
    const schoolId = requireSchoolId(request);
    const body = await request.json();
    const { user_id, user_role, activity_type, page_name, session_id, metadata } = body;

    if (!user_id || !user_role || !activity_type) {
      return NextResponse.json(
        { error: 'user_id, user_role, and activity_type are required.' },
        { status: 400 }
      );
    }

    const ip_address = request.headers.get('x-forwarded-for') ||
                      request.headers.get('x-real-ip') ||
                      null;
    const user_agent = request.headers.get('user-agent') || null;

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Database connection not configured' },
        { status: 500 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('user_activity_logs')
      .insert([{
        school_id: schoolId,
        user_id,
        user_role,
        activity_type,
        page_name: page_name || null,
        session_id: session_id || null,
        ip_address: ip_address || null,
        user_agent: user_agent || null,
        metadata: metadata || {}
      }])
      .select()
      .maybeSingle();

    if (error) {
      return NextResponse.json(
        { error: `Failed to log activity: ${error.message}` },
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
