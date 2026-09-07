/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, checkDatabaseConnection } from '@/lib/supabase';
import { requireSchoolId } from '@/lib/tenant-context';

// GET /api/admin/registrations/:id - Get registration details by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    checkDatabaseConnection();
    

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Database connection not configured' },
        { status: 500 }
      );
    }
    
    const schoolId = requireSchoolId(request);
    const { id: registrationId } = await params;
    
    // Fetch registration with school_id validation
    const { data: registration, error } = await supabaseAdmin!
      .from('registrations')
      .select('*')
      .eq('id', registrationId)
      .eq('school_id', schoolId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Registration not found' },
          { status: 404 }
        );
      }
      console.error('Error fetching registration:', error);
      return NextResponse.json(
        { error: 'Failed to fetch registration', details: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json(registration);
    
  } catch (error) {
    console.error('Error in admin registration detail API:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}