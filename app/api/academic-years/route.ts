import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, checkDatabaseConnection } from '@/lib/supabase';
import { requireSchoolId } from '@/lib/tenant-context';

// GET /api/academic-years - List all academic years for the school
export async function GET(request: NextRequest) {
  try {
    checkDatabaseConnection();
    if (!supabaseAdmin) {
      throw new Error('Database connection not configured');
    }
    
    const schoolId = requireSchoolId(request);
    const { searchParams } = new URL(request.url);
    const includeArchived = searchParams.get('include_archived') === 'true';

    let query = supabaseAdmin
      .from('academic_years')
      .select('*')
      .eq('school_id', schoolId)
      .order('academic_year_start', { ascending: false });

    if (!includeArchived) {
      query = query.eq('is_archived', false);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json(
        { error: `Failed to retrieve academic years: ${error.message}` },
        { status: 400 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/academic-years - Create a new academic year
export async function POST(request: NextRequest) {
  try {
    checkDatabaseConnection();
    if (!supabaseAdmin) {
      throw new Error('Database connection not configured');
    }
    
    const body = await request.json();
    const { year_name, academic_year_start, academic_year_end, current_semester, semester_start_date, semester_end_date, notes } = body;

    const schoolId = requireSchoolId(request);

    if (!year_name || !academic_year_start || !academic_year_end) {
      return NextResponse.json(
        { error: 'Year name, start date, and end date are required.' },
        { status: 400 }
      );
    }

    // If this is set as active, deactivate all other academic years for this school
    if (body.is_active) {
      await supabaseAdmin
        .from('academic_years')
        .update({ is_active: false })
        .eq('school_id', schoolId);
    }

    const { data, error } = await supabaseAdmin
      .from('academic_years')
      .insert([{
        school_id: schoolId,
        year_name,
        academic_year_start,
        academic_year_end,
        current_semester: current_semester || 'Fall',
        semester_start_date,
        semester_end_date,
        notes,
        is_active: body.is_active || false
      }])
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: `Failed to create academic year: ${error.message}` },
        { status: 400 }
      );
    }

    // Update school's current academic year if this is set as active
    if (body.is_active) {
      await supabaseAdmin
        .from('schools')
        .update({ 
          current_academic_year_id: data.id,
          current_semester: current_semester || 'Fall'
        })
        .eq('id', schoolId);
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
