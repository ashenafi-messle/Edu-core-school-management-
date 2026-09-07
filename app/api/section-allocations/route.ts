import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, checkDatabaseConnection } from '@/lib/supabase';
import { getSchoolId } from '@/lib/tenant-context';

// POST /api/section-allocations - Create a section allocation
export async function POST(request: NextRequest) {
  try {
    checkDatabaseConnection();
    

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Database connection not configured' },
        { status: 500 }
      );
    }
    
    const schoolId = getSchoolId(request);
    const body = await request.json();

    if (!schoolId) {
      return NextResponse.json(
        { error: 'School ID is required' },
        { status: 400 }
      );
    }

    const { student_id, section_configuration_id, grade_level, section_name, academic_year_id, allocation_method, allocation_date, notes } = body;

    if (!student_id || !section_configuration_id || !grade_level || !section_name) {
      return NextResponse.json(
        { error: 'Missing required fields: student_id, section_configuration_id, grade_level, section_name' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('section_allocations')
      .insert({
        id: crypto.randomUUID(),
        school_id: schoolId,
        student_id,
        section_configuration_id,
        grade_level,
        section_name,
        academic_year_id,
        allocation_method: allocation_method || 'auto',
        allocation_date: allocation_date || new Date().toISOString(),
        notes,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating section allocation:', error);
      return NextResponse.json(
        { error: `Failed to create section allocation: ${error.message}` },
        { status: 400 }
      );
    }

    return NextResponse.json(data, { status: 201 });

  } catch (error) {
    console.error('Error in POST /api/section-allocations:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/section-allocations - Get all section allocations for the school
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

    if (!schoolId) {
      return NextResponse.json(
        { error: 'School ID is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('section_allocations')
      .select('*')
      .eq('school_id', schoolId);

    if (error) {
      console.error('Error fetching section allocations:', error);
      return NextResponse.json(
        { error: `Failed to fetch section allocations: ${error.message}` },
        { status: 400 }
      );
    }

    return NextResponse.json(data || []);

  } catch (error) {
    console.error('Error in GET /api/section-allocations:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
