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

// GET /api/students/[id]/academic-records - Get academic records for a student
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
    const academicYear = searchParams.get('academic_year');

    let query = supabaseAdmin
      .from('student_academic_records')
      .select('*')
      .eq('student_id', studentId)
      .eq('school_id', schoolId);

    if (academicYear) {
      query = query.eq('academic_year', academicYear);
    }

    const { data, error } = await query.order('academic_year', { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: `Failed to fetch academic records: ${error.message}` },
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

// POST /api/students/[id]/academic-records - Create academic record for a student
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
      academic_year,
      semester,
      grade_level,
      section,
      gpa,
      class_rank,
      total_students,
      attendance_percentage,
      behavior_grade,
      principal_comments,
      promotion_status
    } = body;

    if (!academic_year || !grade_level) {
      return NextResponse.json(
        { error: 'Academic year and grade level are required.' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('student_academic_records')
      .insert({
        school_id: schoolId,
        student_id: studentId,
        academic_year,
        semester,
        grade_level,
        section,
        gpa,
        class_rank,
        total_students,
        attendance_percentage,
        behavior_grade,
        principal_comments,
        promotion_status
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: `Failed to create academic record: ${error.message}` },
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