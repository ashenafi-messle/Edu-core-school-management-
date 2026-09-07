import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, checkDatabaseConnection } from '@/lib/supabase';

// POST /api/users/login - Authenticate a user
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
    const { email, password_hash } = body;

    if (!email || !password_hash) {
      return NextResponse.json(
        { error: 'Email and password are required.' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', email.trim().toLowerCase())
      .eq('password_hash', password_hash)
      .maybeSingle();

    if (error) {
      return NextResponse.json(
        { error: `Login failed: ${error.message}` },
        { status: 400 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Invalid email or password. Verify the credentials and try again.' },
        { status: 404 }
      );
    }

    if (data.status !== 'active') {
      return NextResponse.json(
        { error: 'This account is inactive. Please contact your administrator.' },
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
