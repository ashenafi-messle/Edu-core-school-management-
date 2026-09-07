import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, checkDatabaseConnection } from '@/lib/supabase';
import { getSchoolId } from '@/lib/tenant-context';

// Helper function to get school ID with fallback
async function getSchoolIdWithFallback(request: NextRequest): Promise<string | null> {
  let schoolId = getSchoolId(request);

  // For development: if no school ID provided, get the first school from database
  if (!schoolId) {
    if (!supabaseAdmin) {
      return null;
    }

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

// GET /api/courses/[id] - Get a specific course
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
    
    const { id: courseId } = await params;

    const { data, error } = await supabaseAdmin
      .from('courses')
      .select('*')
      .eq('id', courseId)
      .eq('school_id', schoolId)
      .single();

    if (error) {
      // Only show migration error if it's actually a table existence error
      const errorMessage = error.message.toLowerCase();
      if (errorMessage.includes('relation "public.courses" does not exist') || 
          errorMessage.includes('table "courses" does not exist')) {
        return NextResponse.json(
          { error: 'Courses table does not exist yet' },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: `Failed to fetch course: ${error.message}` },
        { status: 404 }
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

// PUT /api/courses/[id] - Update a course
export async function PUT(
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
    
    const { id: courseId } = await params;
    const body = await request.json();
    
    // Get current course data to check for duplicates
    const { data: currentCourse } = await supabaseAdmin
      .from('courses')
      .select('course_code, academic_year')
      .eq('id', courseId)
      .eq('school_id', schoolId)
      .single();

    if (!currentCourse) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }
    
    const {
      course_code,
      course_name,
      description,
      subject_area,
      credits,
      teacher_id,
      academic_year,
      semester,
      status,
      max_capacity,
      schedule
    } = body;

    // Check for duplicate course if course_code or academic_year is being changed
    if (course_code && academic_year) {
      const { data: existingCourse } = await supabaseAdmin
        .from('courses')
        .select('id, course_code, course_name, academic_year')
        .eq('school_id', schoolId)
        .eq('course_code', course_code)
        .eq('academic_year', academic_year)
        .neq('id', courseId) // Exclude the current course being updated
        .maybeSingle();

      if (existingCourse) {
        return NextResponse.json(
          { 
            error: `A course with code "${course_code}" already exists for academic year "${academic_year}". Please use a different course code or academic year.`,
            existingCourse: {
              id: existingCourse.id,
              course_code: existingCourse.course_code,
              course_name: existingCourse.course_name,
              academic_year: existingCourse.academic_year
            }
          },
          { status: 409 }
        );
      }
    }

    const { data, error } = await supabaseAdmin
      .from('courses')
      .update({
        course_code,
        course_name,
        description,
        subject_area,
        credits,
        teacher_id,
        academic_year,
        semester,
        status,
        max_capacity,
        schedule,
        updated_at: new Date().toISOString()
      })
      .eq('id', courseId)
      .eq('school_id', schoolId)
      .select()
      .single();

    if (error) {
      // Check if it's a duplicate key constraint violation
      if (error.message.includes('duplicate key') || error.message.includes('unique constraint')) {
        const dupCode = course_code || currentCourse.course_code;
        const dupYear = academic_year || currentCourse.academic_year;
        return NextResponse.json(
          { 
            error: `A course with code "${dupCode}" already exists for academic year "${dupYear}". Please use a different course code or academic year.`,
            constraint: 'courses_school_code_year_unique'
          },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { error: `Failed to update course: ${error.message}` },
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

// DELETE /api/courses/[id] - Delete a course
export async function DELETE(
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
    
    const { id: courseId } = await params;

    const { error } = await supabaseAdmin
      .from('courses')
      .delete()
      .eq('id', courseId)
      .eq('school_id', schoolId);

    if (error) {
      return NextResponse.json(
        { error: `Failed to delete course: ${error.message}` },
        { status: 400 }
      );
    }

    return NextResponse.json({ message: 'Course deleted successfully' });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
