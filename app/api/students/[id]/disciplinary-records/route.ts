import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, checkDatabaseConnection } from '@/lib/supabase';
import { getSchoolId } from '@/lib/tenant-context';

// Helper function to get school ID with fallback
async function getSchoolIdWithFallback(request: NextRequest): Promise<string | null> {
  let schoolId = getSchoolId(request);
  
  if (!schoolId && supabaseAdmin) {
    const { data: school } = await supabaseAdmin
      .from('schools')
      .select('id')
      .limit(1)
      .single();
    
    if (school) {
      schoolId = school.id;
    }
  }
  
  return schoolId;
}

// GET /api/students/[id]/disciplinary-records - Get disciplinary records for a student
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    checkDatabaseConnection();
    

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Database connection not configured' },
        { status: 500 }
      );
    }
    
    const schoolId = await getSchoolIdWithFallback(request);
    if (!schoolId) {
      return NextResponse.json(
        { error: 'No school found. Please create a school first.' },
        { status: 400 }
      );
    }
    
    const { id: studentId } = await params;
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    let query = supabaseAdmin
      .from('student_disciplinary_records')
      .select('*')
      .eq('student_id', studentId)
      .eq('school_id', schoolId);

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query.order('incident_date', { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: `Failed to fetch disciplinary records: ${error.message}` },
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

// POST /api/students/[id]/disciplinary-records - Create disciplinary record for a student
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    checkDatabaseConnection();
    

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Database connection not configured' },
        { status: 500 }
      );
    }
    
    const schoolId = await getSchoolIdWithFallback(request);
    if (!schoolId) {
      return NextResponse.json(
        { error: 'No school found. Please create a school first.' },
        { status: 400 }
      );
    }
    
    const { id: studentId } = await params;
    const body = await request.json();
    
    const {
      incident_date,
      incident_type,
      severity,
      description,
      action_taken,
      reported_by,
      notes
    } = body;

    if (!incident_date || !incident_type) {
      return NextResponse.json(
        { error: 'Incident date and type are required.' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('student_disciplinary_records')
      .insert({
        school_id: schoolId,
        student_id: studentId,
        incident_date,
        incident_type,
        severity: severity || 'minor',
        description,
        action_taken,
        reported_by,
        status: 'open',
        notes
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: `Failed to create disciplinary record: ${error.message}` },
        { status: 400 }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}