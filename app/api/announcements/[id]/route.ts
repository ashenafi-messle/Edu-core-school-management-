import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, checkDatabaseConnection } from '@/lib/supabase';
import { requireSchoolId } from '@/lib/tenant-context';

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
    const { id } = await params;

    const { data: announcement, error } = await supabaseAdmin
      .from('announcements')
      .select('*')
      .eq('id', id)
      .eq('school_id', schoolId)
      .single();

    if (error || !announcement) {
      return NextResponse.json(
        { error: 'Announcement not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(announcement);
  } catch (error) {
    console.error('Error in announcement API:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
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

    const body = await request.json();
    const schoolId = requireSchoolId(request);
    const { id } = await params;

    // Check if announcement exists
    const { data: existing } = await supabaseAdmin
      .from('announcements')
      .select('id')
      .eq('id', id)
      .eq('school_id', schoolId)
      .maybeSingle();

    if (!existing) {
      return NextResponse.json(
        { error: 'Announcement not found' },
        { status: 404 }
      );
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

    const { data: announcement, error } = await supabaseAdmin
      .from('announcements')
      .update({
        ...body,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('school_id', schoolId)
      .select()
      .single();

    if (error) {
      console.error('Error updating announcement:', error);
      return NextResponse.json(
        { error: 'Failed to update announcement', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(announcement);
  } catch (error) {
    console.error('Error in announcement API:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
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
    const { id } = await params;

    // Check if announcement exists
    const { data: existing } = await supabaseAdmin
      .from('announcements')
      .select('id')
      .eq('id', id)
      .eq('school_id', schoolId)
      .maybeSingle();

    if (!existing) {
      return NextResponse.json(
        { error: 'Announcement not found' },
        { status: 404 }
      );
    }

    const { error } = await supabaseAdmin
      .from('announcements')
      .delete()
      .eq('id', id)
      .eq('school_id', schoolId);

    if (error) {
      console.error('Error deleting announcement:', error);
      return NextResponse.json(
        { error: 'Failed to delete announcement', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in announcement API:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
