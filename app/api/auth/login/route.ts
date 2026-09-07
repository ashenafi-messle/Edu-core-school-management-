/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { AuthUser, User, UserRole } from '@/src/types';
import crypto from 'crypto';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const SUPABASE_REQUEST_TIMEOUT_MS = 15_000;

// A stalled database connection previously left the login button waiting for
// the browser/server default timeout (often close to a minute). Every
// Supabase request made by this route now has a bounded deadline instead.
async function fetchWithTimeout(input: RequestInfo | URL, init?: RequestInit) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), SUPABASE_REQUEST_TIMEOUT_MS);

  try {
    return await fetch(input, { ...init, signal: init?.signal ?? controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

// Create clients
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  global: { fetch: fetchWithTimeout },
});
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  global: { fetch: fetchWithTimeout },
});

// Simple password hashing function (for demo purposes - use bcrypt in production)
function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// Helper function to log authentication events
async function logAuthEvent(userId: string | null, action: string, description: string, metadata: Record<string, any> = {}) {
  try {
    await supabaseAdmin.from('auth_logs').insert({
      user_id: userId,
      action,
      description,
      metadata,
    });
  } catch (error) {
    console.error('Failed to log auth event:', error);
    // Don't fail the request if logging fails
  }
}

// Helper function to create Supabase Auth user for custom users
async function createSupabaseAuthUser(email: string, password: string, userId: string) {
  try {
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email since we're using Brevo
      user_metadata: {
        custom_user_id: userId,
      },
    });

    if (error) {
      console.error('Error creating Supabase Auth user:', error);
      return null;
    }

    // Update custom user with auth_user_id
    await supabaseAdmin
      .from('users')
      .update({ auth_user_id: data.user.id })
      .eq('id', userId);

    return data.user;
  } catch (error) {
    console.error('Error in createSupabaseAuthUser:', error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    if (!rawBody.trim()) {
      return NextResponse.json(
        { error: 'Request body is required. Send email and password as JSON.' },
        { status: 400 }
      );
    }

    let body: { email?: unknown; password?: unknown };
    try {
      body = JSON.parse(rawBody);
    } catch {
      return NextResponse.json(
        { error: 'Request body must be valid JSON.' },
        { status: 400 }
      );
    }

    const { email, password } = body;

    if (typeof email !== 'string' || typeof password !== 'string' || !email.trim() || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Step 1: Check if user exists in custom users table first
    const { data: customUser, error: customUserError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase())
      .single();

    if (customUserError || !customUser) {
      // User doesn't exist in custom table
      // Non-blocking auth log
      logAuthEvent(null, 'LOGIN_FAILED', `Failed login attempt for non-existent email: ${email}`, {
        email,
        ip: request.headers.get('x-forwarded-for') || 'unknown',
      }).catch(console.error);
      
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Step 2: Check user status
    if (customUser.status !== 'active') {
      logAuthEvent(customUser.id, 'LOGIN_BLOCKED', `Inactive user login attempt`, {
        email: customUser.email,
        status: customUser.status,
      }).catch(console.error);
      
      return NextResponse.json(
        { error: `Account is ${customUser.status}. Please contact administrator.` },
        { status: 403 }
      );
    }

    // Step 3: Check if user has Supabase Auth account
    let authUserId = customUser.auth_user_id;
    let needsAuthCreation = false;
    let session: any = null;

    if (!authUserId) {
      needsAuthCreation = true;
    } else {
      // Try to authenticate with existing Supabase Auth account
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        // Supabase Auth login failed - password might be wrong
        logAuthEvent(customUser.id, 'LOGIN_FAILED', `Failed login attempt with wrong password`, {
          email: customUser.email,
          ip: request.headers.get('x-forwarded-for') || 'unknown',
        }).catch(console.error);
        
        return NextResponse.json(
          { error: 'Invalid email or password' },
          { status: 401 }
        );
      }

      authUserId = authData.user.id;
      session = authData.session;
    }

    // Step 4: If user doesn't have Supabase Auth account, create one
    if (needsAuthCreation) {
      // Create Supabase Auth user
      const supabaseAuthUser = await createSupabaseAuthUser(email, password, customUser.id);
      
      if (!supabaseAuthUser) {
        return NextResponse.json(
          { error: 'Failed to create authentication account. Please contact administrator.' },
          { status: 500 }
        );
      }

      // Now authenticate with the newly created Supabase Auth account
      const { data: newAuthData, error: newAuthError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (newAuthError || !newAuthData) {
        return NextResponse.json(
          { error: 'Failed to authenticate. Please try again.' },
          { status: 500 }
        );
      }

      authUserId = newAuthData.user.id;
      session = newAuthData.session;
      
      // Reload custom user to get updated auth_user_id
      const { data: updatedUser } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('id', customUser.id)
        .single();
      
      if (updatedUser) {
        customUser.auth_user_id = updatedUser.auth_user_id;
      }
    }

    // Step 5: Get school information and role-specific data in parallel
    const [schoolResult, roleDataResult] = await Promise.allSettled([
      supabaseAdmin
        .from('schools')
        .select('*')
        .eq('id', customUser.school_id)
        .single(),
      
      // Get role-specific data based on user role
      customUser.role === 'student' 
        ? supabaseAdmin.from('students').select('*').eq('user_id', customUser.id).single()
        : customUser.role === 'parent'
        ? supabaseAdmin.from('parents').select('*').eq('user_id', customUser.id).single()
        : customUser.role === 'teacher'
        ? supabaseAdmin.from('teachers').select('*').eq('user_id', customUser.id).single()
        : Promise.resolve({ data: null, error: null })
    ]);

    const school = schoolResult.status === 'fulfilled' ? schoolResult.value.data : null;
    const schoolError = schoolResult.status === 'fulfilled' ? schoolResult.value.error : null;
    const roleData = roleDataResult.status === 'fulfilled' ? roleDataResult.value.data : null;

    if (schoolError || !school) {
      console.error('School not found:', schoolError);
      await supabase.auth.signOut();
      return NextResponse.json(
        { error: 'School not found. Please contact administrator.' },
        { status: 404 }
      );
    }

    // Non-blocking auth log
    logAuthEvent(customUser.id, 'LOGIN_SUCCESS', `User logged in successfully`, {
      email: customUser.email,
      role: customUser.role,
      school_id: customUser.school_id,
      ip: request.headers.get('x-forwarded-for') || 'unknown',
    }).catch(console.error);

    // Step 6: Return complete auth data
    const authUser: AuthUser = {
      user: customUser,
      parent: customUser.role === 'parent' ? roleData : undefined,
      student: customUser.role === 'student' ? roleData : undefined,
      teacher: customUser.role === 'teacher' ? roleData : undefined,
      school,
    };

    return NextResponse.json({
      success: true,
      user: authUser,
      session: session ? {
        access_token: session.access_token,
        refresh_token: session.refresh_token,
        expires_at: session.expires_at,
      } : null,
    });

  } catch (error) {
    console.error('Error in login API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
