import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, checkDatabaseConnection } from '@/lib/supabase';
import { requireSchoolId } from '@/lib/tenant-context';

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
    const requiredFields = ['parent_name', 'student_name', 'type', 'message'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Validate type
    const validTypes = ['complaint', 'suggestion', 'enquiry', 'compliment'];
    if (!validTypes.includes(body.type)) {
      return NextResponse.json(
        { error: 'Invalid type value' },
        { status: 400 }
      );
    }

    // Validate priority if provided
    if (body.priority) {
      const validPriorities = ['low', 'normal', 'high', 'urgent'];
      if (!validPriorities.includes(body.priority)) {
        return NextResponse.json(
          { error: 'Invalid priority value' },
          { status: 400 }
        );
      }
    }

    // If parent_id provided, verify it exists
    if (body.parent_id) {
      const { data: parent } = await supabaseAdmin
        .from('parents')
        .select('id')
        .eq('id', body.parent_id)
        .eq('school_id', schoolId)
        .maybeSingle();

      if (!parent) {
        return NextResponse.json(
          { error: `Parent with ID '${body.parent_id}' not found in your school.` },
          { status: 400 }
        );
      }
    }

    // If student_id provided, verify it exists
    if (body.student_id) {
      const { data: student } = await supabaseAdmin
        .from('students')
        .select('id')
        .eq('id', body.student_id)
        .eq('school_id', schoolId)
        .maybeSingle();

      if (!student) {
        return NextResponse.json(
          { error: `Student with ID '${body.student_id}' not found in your school.` },
          { status: 400 }
        );
      }
    }

    const { data: feedback, error } = await supabaseAdmin
      .from('parent_feedback')
      .insert({
        ...body,
        school_id: schoolId,
        status: 'pending',
        priority: body.priority || 'normal'
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating feedback:', error);
      return NextResponse.json(
        { error: 'Failed to create feedback', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(feedback, { status: 201 });
  } catch (error) {
    console.error('Error in feedback API:', error);
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
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const parentId = searchParams.get('parent_id');
    const studentId = searchParams.get('student_id');
    const limit = searchParams.get('limit');
    const offset = searchParams.get('offset');

    // Build query with filters
    let query = supabaseAdmin
      .from('parent_feedback')
      .select('*')
      .eq('school_id', schoolId);

    // Apply search filter
    if (search) {
      query = query.or(
        `parent_name.ilike.%${search}%,student_name.ilike.%${search}%,subject.ilike.%${search}%,message.ilike.%${search}%`
      );
    }

    // Apply type filter
    if (type) {
      query = query.eq('type', type);
    }

    // Apply status filter
    if (status) {
      query = query.eq('status', status);
    }

    // Apply priority filter
    if (priority) {
      query = query.eq('priority', priority);
    }

    // Apply parent filter
    if (parentId) {
      query = query.eq('parent_id', parentId);
    }

    // Apply student filter
    if (studentId) {
      query = query.eq('student_id', studentId);
    }

    // Apply pagination
    if (limit) {
      query = query.limit(parseInt(limit));
    }
    if (offset) {
      const limitNum = parseInt(limit || '10');
      query = query.range(parseInt(offset), parseInt(offset) + limitNum - 1);
    }

    const { data: feedback, error } = await query.order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch feedback' },
        { status: 500 }
      );
    }

    return NextResponse.json(feedback);
  } catch (error) {
    console.error('Error in feedback API:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}