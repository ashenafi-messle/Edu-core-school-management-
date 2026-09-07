import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, checkDatabaseConnection } from '@/lib/supabase';
import { requireSchoolId } from '@/lib/tenant-context';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    checkDatabaseConnection();

    const body = await request.json();
    const schoolId = requireSchoolId(request);
    const { id } = await params;

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Database connection not configured' },
        { status: 500 }
      );
    }

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

    const { data: announcement, error } = await supabaseAdmin
      .from('announcements')
      .update({
        status: 'published',
        published_by: body.published_by,
        published_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('school_id', schoolId)
      .select()
      .single();

    if (error) {
      console.error('Error publishing announcement:', error);
      return NextResponse.json(
        { error: 'Failed to publish announcement', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(announcement);
  } catch (error) {
    console.error('Error in announcement publish API:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
