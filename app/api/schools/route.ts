/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, checkDatabaseConnection } from '@/lib/supabase';
import { revalidateTag } from 'next/cache';
import { CACHE_TAGS } from '@/lib/cache';

// GET /api/schools - List all schools with caching
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
    const status = searchParams.get('status');

    let query = supabaseAdmin
      .from('schools')
      .select('*')
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching schools:', error);
      return NextResponse.json(
        { error: 'Failed to fetch schools' },
        { status: 500 }
      );
    }

    // Cache response for 5 minutes
    const response = NextResponse.json(data);
    response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
    response.headers.set('CDN-Cache-Control', 'public, s-maxage=600');
    return response;
  } catch (error) {
    console.error('Error in schools API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/schools - Create a new school
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
    const { name, subdomain, domain, status } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'School name is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('schools')
      .insert([{
        name,
        subdomain: subdomain || null,
        domain: domain || null,
        status: status || 'active'
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating school:', error);
      return NextResponse.json(
        { error: `Failed to create school: ${error.message}` },
        { status: 400 }
      );
    }

    // Revalidate cache for schools
    revalidateTag(CACHE_TAGS.SCHOOLS);

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error in schools API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
