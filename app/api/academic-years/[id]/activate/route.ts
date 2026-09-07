import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, checkDatabaseConnection } from '@/lib/supabase';
import { requireSchoolId } from '@/lib/tenant-context';

// POST /api/academic-years/[id]/activate - Activate an academic year
export async function POST(
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

    // Deactivate all academic years for this school
    await supabaseAdmin
      .from('academic_years')
      .update({ is_active: false })
      .eq('school_id', schoolId);

    // Activate the requested academic year
    const { data, error } = await supabaseAdmin
      .from('academic_years')
      .update({ 
        is_active: true,
        is_archived: false,
        archived_at: null
      })
      .eq('id', id)
      .eq('school_id', schoolId)
      .select()
      .maybeSingle();

    if (error) {
      return NextResponse.json(
        { error: `Failed to activate academic year: ${error.message}` },
        { status: 400 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: `Academic year with ID '${id}' does not exist in your school.` },
        { status: 404 }
      );
    }

    // Update school's current academic year
    await supabaseAdmin
      .from('schools')
      .update({ 
        current_academic_year_id: data.id,
        current_semester: data.current_semester
      })
      .eq('id', schoolId);

    return NextResponse.json({ message: 'Academic year activated successfully', data });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
