/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, checkDatabaseConnection } from '@/lib/supabase';

// GET /api/registrations/search - Search registrations by email or phone
export async function GET(request: NextRequest) {
  try {
    checkDatabaseConnection();
    

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Database connection not configured' },
        { status: 500 }
      );
    }
    
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const phone = searchParams.get('phone');
    
    if (!email && !phone) {
      return NextResponse.json(
        { error: 'Email or phone number is required' },
        { status: 400 }
      );
    }
    
    // Build query to search by email or phone
    let query = supabaseAdmin!
      .from('registrations')
      .select('*');
    
    if (email) {
      query = query.or(`student_email.ilike.%${email}%,parent_email.ilike.%${email}%`);
    }
    
    if (phone) {
      const phoneQuery = query.or(`student_phone.ilike.%${phone}%,parent_phone.ilike.%${phone}%,emergency_phone.ilike.%${phone}%`);
      query = phoneQuery;
    }
    
    const { data: registrations, error } = await query
      .order('submitted_at', { ascending: false })
      .limit(1); // Return only the most recent registration
    
    if (error) {
      console.error('Error searching registrations:', error);
      return NextResponse.json(
        { error: 'Failed to search registrations', details: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      registrations: registrations || [],
      count: registrations?.length || 0
    });
    
  } catch (error) {
    console.error('Error in registration search API:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}