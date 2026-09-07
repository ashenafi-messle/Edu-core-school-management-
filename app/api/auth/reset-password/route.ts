/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const brevoApiKey = process.env.BREVO_API_KEY!;
const brevoSenderEmail = process.env.BREVO_SENDER_EMAIL!;
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Generate a secure random token
function generateResetToken(): string {
  const token = Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  return token;
}

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
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Find user by email in our users table
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase())
      .single();

    if (userError || !user) {
      // Don't reveal if user exists for security
      await logAuthEvent(null, 'PASSWORD_RESET_REQUEST', `Password reset requested for non-existent email: ${email}`, {
        email,
      });
      
      return NextResponse.json({
        success: true,
        message: 'If a user with this email exists, a reset link will be sent.'
      });
    }

    // Check if user is active
    if (user.status !== 'active') {
      await logAuthEvent(user.id, 'PASSWORD_RESET_BLOCKED', `Password reset blocked for inactive user`, {
        email: user.email,
        status: user.status,
      });
      
      return NextResponse.json(
        { error: 'Account is not active. Please contact administrator.' },
        { status: 403 }
      );
    }

    // Generate reset token
    const resetToken = generateResetToken();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

    // Store reset token in database
    const { error: tokenError } = await supabase
      .from('password_reset_tokens')
      .insert({
        user_id: user.id,
        token: resetToken,
        expires_at: expiresAt.toISOString(),
      });

    if (tokenError) {
      console.error('Error storing reset token:', tokenError);
      return NextResponse.json(
        { error: 'Failed to generate reset token. Please try again.' },
        { status: 500 }
      );
    }

    // Log the password reset request
    await logAuthEvent(user.id, 'PASSWORD_RESET_REQUEST', `Password reset requested`, {
      email: user.email,
      expires_at: expiresAt.toISOString(),
    });

    // Send email via Brevo with custom reset link
    try {
      await sendResetEmailViaBrevo(email, resetToken, user.full_name);
    } catch (emailError) {
      console.error('Brevo email error:', emailError);
      // Don't fail the request if Brevo fails
    }

    return NextResponse.json({
      success: true,
      message: 'Password reset link has been sent to your email.'
    });

  } catch (error) {
    console.error('Error in password reset request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function sendResetEmailViaBrevo(email: string, token: string, userName: string) {
  // Use hash-based routing to match the application's routing structure
  const resetLink = `${frontendUrl}/#/reset-password?token=${token}`;

  const emailData = {
    sender: { email: brevoSenderEmail, name: 'EduCore School Management' },
    to: [{ email }],
    subject: 'Reset Your EduCore Password',
    htmlContent: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #2563EB 0%, #4F46E5 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🎓 EduCore</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0;">School Management System</p>
          </div>
          
          <div style="background: #f9fafb; padding: 40px; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb;">
            <h2 style="color: #1f2937; margin-top: 0;">Password Reset Request</h2>
            <p style="color: #4b5563;">Hello ${userName || 'User'},</p>
            <p style="color: #4b5563;">We received a request to reset your password for your EduCore account. Click the button below to set a new password:</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetLink}" style="display: inline-block; background: linear-gradient(135deg, #2563EB 0%, #4F46E5 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                Reset Password
              </a>
            </div>
            
            <p style="color: #4b5563; font-size: 14px;">Or copy and paste this link into your browser:</p>
            <p style="color: #2563EB; font-size: 12px; word-break: break-all; background: #eef2ff; padding: 10px; border-radius: 5px;">${resetLink}</p>
            
            <p style="color: #6b7280; font-size: 12px; margin-top: 30px;">This link will expire in 1 hour. If you didn't request this password reset, please ignore this email.</p>
          </div>
          
          <div style="text-align: center; margin-top: 20px; color: #9ca3af; font-size: 12px;">
            <p>&copy; 2026 EduCore School Management System. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': brevoApiKey,
    },
    body: JSON.stringify(emailData),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Brevo API error:', errorText);
    throw new Error('Failed to send email via Brevo');
  }

  return await response.json();
}
