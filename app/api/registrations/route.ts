/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, checkDatabaseConnection } from '@/lib/supabase';
import { requireSchoolId } from '@/lib/tenant-context';

// Generate a unique reference ID
function generateReferenceId(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `EDC-${timestamp}-${random}`;
}

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
    const schoolId = requireSchoolId(request);

    // Validate required fields
    const requiredFields = [
      'student_first_name',
      'student_last_name',
      'student_date_of_birth',
      'student_gender',
      'student_grade_level',
      'student_address',
      'student_city',
      'student_phone',
      'parent_first_name',
      'parent_last_name',
      'parent_relationship',
      'parent_phone',
      'parent_email'
    ];

    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Validate gender
    const validGenders = ['male', 'female', 'other'];
    if (!validGenders.includes(body.student_gender)) {
      return NextResponse.json(
        { error: 'Invalid gender value' },
        { status: 400 }
      );
    }

    // Validate parent relationship
    const validRelationships = ['father', 'mother', 'guardian', 'other'];
    if (!validRelationships.includes(body.parent_relationship)) {
      return NextResponse.json(
        { error: 'Invalid parent relationship value' },
        { status: 400 }
      );
    }

    // Generate unique reference ID
    let referenceId = generateReferenceId();

    // Check if reference ID already exists
    const { data: existing } = await supabaseAdmin
      .from('registrations')
      .select('reference_id')
      .eq('school_id', schoolId)
      .eq('reference_id', referenceId)
      .maybeSingle();

    if (existing) {
      referenceId = generateReferenceId();
    }

    // Insert registration
    const { data: registration, error } = await supabaseAdmin
      .from('registrations')
      .insert({
        ...body,
        school_id: schoolId,
        reference_id: referenceId,
        status: 'pending',
        submitted_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating registration:', error);
      return NextResponse.json(
        { error: 'Failed to create registration', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      registration,
      reference_id: referenceId
    }, { status: 201 });

  } catch (error) {
    console.error('Error in registration API:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

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
    
    const search = searchParams.get('search');
    const status = searchParams.get('status');
    const gradeLevel = searchParams.get('grade_level');
    const relationship = searchParams.get('relationship');
    const referenceId = searchParams.get('reference_id');
    const limit = searchParams.get('limit');
    const offset = searchParams.get('offset');

    // If reference ID provided, get specific registration
    if (referenceId) {
      const { data: registration, error } = await supabaseAdmin
        .from('registrations')
        .select('*')
        .eq('reference_id', referenceId)
        .eq('school_id', schoolId)
        .maybeSingle();

      if (error || !registration) {
        return NextResponse.json(
          { error: 'Registration not found' },
          { status: 404 }
        );
      }

      return NextResponse.json(registration);
    }

    // Build query with filters
    let query = supabaseAdmin
      .from('registrations')
      .select('*')
      .eq('school_id', schoolId);

    // Apply search filter
    if (search) {
      query = query.or(
        `student_first_name.ilike.%${search}%,student_last_name.ilike.%${search}%,parent_first_name.ilike.%${search}%,parent_last_name.ilike.%${search}%,reference_id.ilike.%${search}%`
      );
    }

    // Apply status filter
    if (status) {
      query = query.eq('status', status);
    }

    // Apply grade level filter
    if (gradeLevel) {
      query = query.eq('student_grade_level', gradeLevel);
    }

    // Apply relationship filter
    if (relationship) {
      query = query.eq('parent_relationship', relationship);
    }

    // Apply pagination
    if (limit) {
      query = query.limit(parseInt(limit));
    }
    if (offset) {
      const limitNum = parseInt(limit || '10');
      query = query.range(parseInt(offset), parseInt(offset) + limitNum - 1);
    }

    const { data: registrations, error } = await query.order('submitted_at', { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch registrations' },
        { status: 500 }
      );
    }

    return NextResponse.json(registrations);
  } catch (error) {
    console.error('Error in registrations API:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
