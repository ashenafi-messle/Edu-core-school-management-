import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, checkDatabaseConnection } from '@/lib/supabase';
import { getSchoolId } from '@/lib/tenant-context';

// GET /api/academic-years/current - Get the current active academic year for a school
export async function GET(request: NextRequest) {
  try {
    checkDatabaseConnection();
    if (!supabaseAdmin) {
      throw new Error('Database connection not configured');
    }
    
    const schoolId = getSchoolId(request);

    if (!schoolId) {
      return NextResponse.json(
        { error: 'School ID is required. Please ensure you are logged in with a valid school account.' },
        { status: 400 }
      );
    }

    // Fetch the active academic year for this school
    const { data, error } = await supabaseAdmin
      .from('academic_years')
      .select('*')
      .eq('school_id', schoolId)
      .eq('is_active', true)
      .eq('is_archived', false)
      .maybeSingle();

    if (error) {
      console.error('Error fetching current academic year:', error);
      return NextResponse.json(
        { error: `Failed to retrieve current academic year: ${error.message}` },
        { status: 400 }
      );
    }

    // If no active academic year found, return the most recent one
    if (!data) {
      const { data: recentYear, error: recentError } = await supabaseAdmin
        .from('academic_years')
        .select('*')
        .eq('school_id', schoolId)
        .eq('is_archived', false)
        .order('academic_year_start', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (recentError) {
        return NextResponse.json(
          { error: `Failed to retrieve recent academic year: ${recentError.message}` },
          { status: 400 }
        );
      }

      if (recentYear) {
        return NextResponse.json(recentYear);
      }

      // No academic years found at all
      return NextResponse.json(
        { error: 'No academic years configured for this school' },
        { status: 404 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Server error in academic years:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}