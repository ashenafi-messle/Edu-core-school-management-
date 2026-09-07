import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, checkDatabaseConnection } from '@/lib/supabase';
import { getSchoolId } from '@/lib/tenant-context';

// GET /api/sections/configurations - Get section configurations for a school
export async function GET(request: NextRequest) {
  try {
    checkDatabaseConnection();
    

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Database connection not configured' },
        { status: 500 }
      );
    }
    
    const schoolId = getSchoolId(request);
    const { searchParams } = new URL(request.url);
    const academicYear = searchParams.get('academicYear');
    const gradeLevel = searchParams.get('gradeLevel');

    if (!schoolId) {
      return NextResponse.json(
        { error: 'School ID is required. Please ensure you are logged in with a valid school account.' },
        { status: 400 }
      );
    }

    // Build query
    let query = supabaseAdmin
      .from('section_configurations')
      .select('*')
      .eq('school_id', schoolId);

    // Only filter by academic year if provided
    if (academicYear) {
      query = query.eq('academic_year', academicYear);
    }

    // Only filter by is_active if the column exists (for backward compatibility)
    try {
      query = query.eq('is_active', true);
    } catch (e) {
      // Column might not exist, continue without this filter
      console.log('is_active column might not exist, skipping filter');
    }

    if (gradeLevel) {
      query = query.eq('grade_level', gradeLevel);
    }

    const { data, error } = await query.order('grade_level', { ascending: true });

    if (error) {
      console.error('Error fetching section configurations:', error);
      return NextResponse.json(
        { error: `Failed to retrieve section configurations: ${error.message}` },
        { status: 400 }
      );
    }

    // Log for debugging
    console.log('Section configurations query:', { schoolId, academicYear, gradeLevel, count: data?.length || 0 });

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Server error in section configurations:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}