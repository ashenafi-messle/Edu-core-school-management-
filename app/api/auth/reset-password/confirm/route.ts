/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Helper function to log auth events
async function logAuthEvent(userId: string | null, action: string, description: string, metadata: Record<string, any> = {}) {
  try {
    await supabase.from('auth_logs').insert({
      user_id: userId,
      action,
      description,
      metadata,
    });
  } catch (error) {
    console.error('Failed to log auth event:', error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { token, newPassword } = await request.json();

    if (!token || !newPassword) {
      return NextResponse.json(
        { error: 'Token and new password are required' },
        { status: 400 }
      );
    }

    // Validate password strength
    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    // Find the reset token
    const { data: resetToken, error: tokenError } = await supabase
      .from('password_reset_tokens')
      .select('*')
      .eq('token', token)
      .single();

    if (tokenError || !resetToken) {
      await logAuthEvent(null, 'PASSWORD_RESET_INVALID_TOKEN', `Invalid password reset token attempted`, {
        token: token.substring(0, 10) + '...', // Log partial token for security
      });
      
      return NextResponse.json(
        { error: 'Invalid or expired reset token. Please request a new password reset.' },
        { status: 400 }
      );
    }

    // Check if token is expired
    const now = new Date();
    const expiresAt = new Date(resetToken.expires_at);
    if (now > expiresAt) {
      await logAuthEvent(resetToken.user_id, 'PASSWORD_RESET_EXPIRED', 'Expired password reset token attempted', {
        token_id: resetToken.id,
      });
      
      return NextResponse.json(
        { error: 'Reset token has expired. Please request a new password reset.' },
        { status: 400 }
      );
    }

    // Check if token has already been used
    if (resetToken.used_at) {
      await logAuthEvent(resetToken.user_id, 'PASSWORD_RESET_ALREADY_USED', 'Already used password reset token attempted', {
        token_id: resetToken.id,
        used_at: resetToken.used_at,
      });
      
      return NextResponse.json(
        { error: 'This reset link has already been used. Please request a new password reset.' },
        { status: 400 }
      );
    }

    // Get user information
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', resetToken.user_id)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if user is active
    if (user.status !== 'active') {
      return NextResponse.json(
        { error: 'Account is not active. Please contact administrator.' },
        { status: 403 }
      );
    }

    // Get Supabase auth user from auth_user_id
    if (!user.auth_user_id) {
      return NextResponse.json(
        { error: 'User has no associated Supabase auth account' },
        { status: 400 }
      );
    }

    // Update password using Supabase Admin SDK
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      user.auth_user_id,
      { password: newPassword }
    );

    if (updateError) {
      console.error('Password update error:', updateError);
      await logAuthEvent(user.id, 'PASSWORD_RESET_FAILED', 'Failed to update password in Supabase Auth', {
        error: updateError.message,
      });
      
      return NextResponse.json(
        { error: 'Failed to reset password. Please try again.' },
        { status: 500 }
      );
    }

    // Mark token as used
    await supabase
      .from('password_reset_tokens')
      .update({ used_at: new Date().toISOString() })
      .eq('id', resetToken.id);

    // Log successful password reset
    await logAuthEvent(user.id, 'PASSWORD_RESET_SUCCESS', 'Password reset successfully completed', {
      token_id: resetToken.id,
    });

    return NextResponse.json({
      success: true,
      message: 'Password has been reset successfully.'
    });

  } catch (error) {
    console.error('Error in password reset confirmation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}