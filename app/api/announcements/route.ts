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
    const requiredFields = ['title', 'content'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Validate type if provided
    if (body.type) {
      const validTypes = ['general', 'urgent', 'event', 'academic', 'administrative'];
      if (!validTypes.includes(body.type)) {
        return NextResponse.json(
          { error: 'Invalid type value' },
          { status: 400 }
        );
      }
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

    // Validate status if provided
    if (body.status) {
      const validStatuses = ['draft', 'published', 'archived'];
      if (!validStatuses.includes(body.status)) {
        return NextResponse.json(
          { error: 'Invalid status value' },
          { status: 400 }
        );
      }
    }

    // Validate target_audience if provided
    if (body.target_audience) {
      const validAudiences = ['all', 'teachers', 'parents', 'students', 'specific_grade'];
      if (!validAudiences.includes(body.target_audience)) {
        return NextResponse.json(
          { error: 'Invalid target_audience value' },
          { status: 400 }
        );
      }
    }

    // If target_grade_id provided and target_audience is specific_grade, verify it exists
    if (body.target_grade_id && body.target_audience === 'specific_grade') {
      const { data: grade } = await supabaseAdmin
        .from('grade_levels')
        .select('id')
        .eq('id', body.target_grade_id)
        .maybeSingle();

      if (!grade) {
        return NextResponse.json(
          { error: `Grade level with ID '${body.target_grade_id}' not found.` },
          { status: 400 }
        );
      }
    }

    const { data: announcement, error } = await supabaseAdmin
      .from('announcements')
      .insert({
        ...body,
        school_id: schoolId,
        type: body.type || 'general',
        priority: body.priority || 'normal',
        status: body.status || 'draft',
        target_audience: body.target_audience || 'all'
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating announcement:', error);
      return NextResponse.json(
        { error: 'Failed to create announcement', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(announcement, { status: 201 });
  } catch (error) {
    console.error('Error in announcements API:', error);
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
    const targetAudience = searchParams.get('target_audience');
    const targetGradeId = searchParams.get('target_grade_id');
    const publishedBy = searchParams.get('published_by');
    const limit = searchParams.get('limit');
    const offset = searchParams.get('offset');

    // Build query with filters
    let query = supabaseAdmin
      .from('announcements')
      .select('*')
      .eq('school_id', schoolId);

    // Apply search filter
    if (search) {
      query = query.or(
        `title.ilike.%${search}%,content.ilike.%${search}%`
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

    // Apply target_audience filter
    if (targetAudience) {
      query = query.eq('target_audience', targetAudience);
    }

    // Apply target_grade_id filter
    if (targetGradeId) {
      query = query.eq('target_grade_id', targetGradeId);
    }

    // Apply published_by filter
    if (publishedBy) {
      query = query.eq('published_by', publishedBy);
    }

    // Apply pagination
    if (limit) {
      query = query.limit(parseInt(limit));
    }
    if (offset) {
      const limitNum = parseInt(limit || '10');
      query = query.range(parseInt(offset), parseInt(offset) + limitNum - 1);
    }

    const { data: announcements, error } = await query.order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch announcements' },
        { status: 500 }
      );
    }

    return NextResponse.json(announcements);
  } catch (error) {
    console.error('Error in announcements API:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
