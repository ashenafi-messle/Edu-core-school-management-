import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, checkDatabaseConnection } from '@/lib/supabase';
import { requireSchoolId } from '@/lib/tenant-context';

// GET /api/academic-years/[id] - Get single academic year details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    checkDatabaseConnection();
    if (!supabaseAdmin) {
      throw new Error('Database connection not configured');
    }
    
    const schoolId = requireSchoolId(request);
    const { id } = await params;

    const { data, error } = await supabaseAdmin
      .from('academic_years')
      .select('*')
      .eq('id', id)
      .eq('school_id', schoolId)
      .maybeSingle();

    if (error) {
      return NextResponse.json(
        { error: `Failed to retrieve academic year: ${error.message}` },
        { status: 400 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: `Academic year with ID '${id}' does not exist in your school.` },
        { status: 404 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/academic-years/[id] - Update academic year
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    checkDatabaseConnection();
    if (!supabaseAdmin) {
      throw new Error('Database connection not configured');
    }
    
    const schoolId = requireSchoolId(request);
    const { id } = await params;
    const body = await request.json();

    // If setting as active, deactivate all other academic years for this school
    if (body.is_active) {
      await supabaseAdmin
        .from('academic_years')
        .update({ is_active: false })
        .eq('school_id', schoolId);
    }

    const { data, error } = await supabaseAdmin
      .from('academic_years')
      .update({
        ...(body.year_name && { year_name: body.year_name }),
        ...(body.academic_year_start && { academic_year_start: body.academic_year_start }),
        ...(body.academic_year_end && { academic_year_end: body.academic_year_end }),
        ...(body.current_semester && { current_semester: body.current_semester }),
        ...(body.semester_start_date !== undefined && { semester_start_date: body.semester_start_date }),
        ...(body.semester_end_date !== undefined && { semester_end_date: body.semester_end_date }),
        ...(body.is_active !== undefined && { is_active: body.is_active }),
        ...(body.notes !== undefined && { notes: body.notes })
      })
      .eq('id', id)
      .eq('school_id', schoolId)
      .select()
      .maybeSingle();

    if (error) {
      return NextResponse.json(
        { error: `Failed to update academic year: ${error.message}` },
        { status: 400 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: `Academic year with ID '${id}' does not exist in your school.` },
        { status: 404 }
      );
    }

    // Update school's current academic year if this is set as active
    if (body.is_active) {
      await supabaseAdmin
        .from('schools')
        .update({ 
          current_academic_year_id: data.id,
          current_semester: data.current_semester
        })
        .eq('id', schoolId);
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/academic-years/[id] - Delete academic year
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    checkDatabaseConnection();
    if (!supabaseAdmin) {
      throw new Error('Database connection not configured');
    }
    
    const schoolId = requireSchoolId(request);
    const { id } = await params;

    // Check if this is the current active academic year
    const { data: schoolData } = await supabaseAdmin
      .from('schools')
      .select('current_academic_year_id')
      .eq('id', schoolId)
      .maybeSingle();

    if (schoolData && schoolData.current_academic_year_id === id) {
      return NextResponse.json(
        { error: 'Cannot delete the currently active academic year. Please activate a different academic year first.' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('academic_years')
      .delete()
      .eq('id', id)
      .eq('school_id', schoolId)
      .select()
      .maybeSingle();

    if (error) {
      return NextResponse.json(
        { error: `Failed to delete academic year: ${error.message}` },
        { status: 400 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: `Academic year with ID '${id}' does not exist in your school.` },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Academic year deleted successfully' });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


