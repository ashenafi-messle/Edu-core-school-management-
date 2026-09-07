/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, checkDatabaseConnection } from '@/lib/supabase';
import { requireSchoolId } from '@/lib/tenant-context';

// GET /api/admin/registrations - List all registrations with filtering and pagination
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
    
    // Parse query parameters
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy') || 'submitted_at';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    
    // Build query
    let query = supabaseAdmin!
      .from('registrations')
      .select('*', { count: 'exact' })
      .eq('school_id', schoolId);
    
    // Apply status filter
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }
    
    // Apply search filter (search by name, reference_id, or email)
    if (search) {
      query = query.or(
        `student_first_name.ilike.%${search}%,student_last_name.ilike.%${search}%,reference_id.ilike.%${search}%,student_email.ilike.%${search}%,parent_email.ilike.%${search}%`
      );
    }
    
    // Calculate pagination
    const offset = (page - 1) * limit;
    
    // Apply sorting and pagination
    query = query
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range(offset, offset + limit - 1);
    
    const { data: registrations, error, count } = await query;
    
    if (error) {
      console.error('Error fetching registrations:', error);
      return NextResponse.json(
        { error: 'Failed to fetch registrations', details: error.message },
        { status: 500 }
      );
    }
    
    // Return paginated response
    return NextResponse.json({
      registrations: registrations || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });
    
  } catch (error) {
    console.error('Error in admin registrations API:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}