import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, checkDatabaseConnection } from '@/lib/supabase';
import { requireSchoolId } from '@/lib/tenant-context';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ audience: string }> }
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
    const { audience } = await params;
    const { searchParams } = new URL(request.url);
    const gradeId = searchParams.get('gradeId');

    // Validate audience
    const validAudiences = ['all', 'teachers', 'parents', 'students', 'specific_grade'];
    if (!validAudiences.includes(audience)) {
      return NextResponse.json(
        { error: 'Invalid audience value' },
        { status: 400 }
      );
    }

    // Build query
    let query = supabaseAdmin
      .from('announcements')
      .select('*')
      .eq('school_id', schoolId)
      .eq('status', 'published')
      .or(`target_audience.eq.all,target_audience.eq.${audience}`);

    // Filter out expired announcements
    query = query.or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`);

    // If specific grade, also include announcements targeted to that grade
    if (gradeId) {
      query = query.or(`target_grade_id.is.null,target_grade_id.eq.${gradeId}`);
    }

    const { data: announcements, error } = await query.order('published_at', { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch published announcements' },
        { status: 500 }
      );
    }

    return NextResponse.json(announcements);
  } catch (error) {
    console.error('Error in published announcements API:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
