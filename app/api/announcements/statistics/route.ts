import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, checkDatabaseConnection } from '@/lib/supabase';
import { requireSchoolId } from '@/lib/tenant-context';

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

    const { data: announcements, error } = await supabaseAdmin
      .from('announcements')
      .select('*')
      .eq('school_id', schoolId);

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch statistics' },
        { status: 500 }
      );
    }

    const stats = {
      total: announcements.length,
      draft: 0,
      published: 0,
      archived: 0,
      by_type: {
        general: 0,
        urgent: 0,
        event: 0,
        academic: 0,
        administrative: 0,
      },
      by_priority: {
        low: 0,
        normal: 0,
        high: 0,
        urgent: 0,
      },
      by_audience: {
        all: 0,
        teachers: 0,
        parents: 0,
        students: 0,
        specific_grade: 0,
      },
    };

    announcements.forEach((announcement) => {
      // Count by status
      if (announcement.status === 'draft') stats.draft++;
      else if (announcement.status === 'published') stats.published++;
      else if (announcement.status === 'archived') stats.archived++;

      // Count by type
      if (stats.by_type.hasOwnProperty(announcement.type)) {
        stats.by_type[announcement.type as keyof typeof stats.by_type]++;
      }

      // Count by priority
      if (stats.by_priority.hasOwnProperty(announcement.priority)) {
        stats.by_priority[announcement.priority as keyof typeof stats.by_priority]++;
      }

      // Count by audience
      if (stats.by_audience.hasOwnProperty(announcement.target_audience)) {
        stats.by_audience[announcement.target_audience as keyof typeof stats.by_audience]++;
      }
    });

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error in announcements statistics API:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
