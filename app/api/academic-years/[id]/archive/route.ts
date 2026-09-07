import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, checkDatabaseConnection } from '@/lib/supabase';
import { requireSchoolId } from '@/lib/tenant-context';

// POST /api/academic-years/[id]/archive - Archive an academic year
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

    // Check if this is the current active academic year
    const { data: schoolData } = await supabaseAdmin
      .from('schools')
      .select('current_academic_year_id')
      .eq('id', schoolId)
      .maybeSingle();

    if (schoolData && schoolData.current_academic_year_id === id) {
      return NextResponse.json(
        { error: 'Cannot archive the currently active academic year. Please activate a different academic year first.' },
        { status: 400 }
      );
    }

    // Archive the academic year
    const { data, error } = await supabaseAdmin
      .from('academic_years')
      .update({
        is_active: false,
        is_archived: true,
        archived_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('school_id', schoolId)
      .select()
      .maybeSingle();

    if (error) {
      return NextResponse.json(
        { error: `Failed to archive academic year: ${error.message}` },
        { status: 400 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: `Academic year with ID '${id}' does not exist in your school.` },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Academic year archived successfully', data });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
