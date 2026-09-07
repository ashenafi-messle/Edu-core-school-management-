import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, checkDatabaseConnection } from '@/lib/supabase';
import { getSchoolId } from '@/lib/tenant-context';

// GET /api/courses - Get all courses for the school
export async function GET(request: NextRequest) {
  try {
    checkDatabaseConnection();
    

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Database connection not configured' },
        { status: 500 }
      );
    }
    
    // Get school ID from header, or use a default for development
    let schoolId = getSchoolId(request);
    
    // For development: if no school ID provided, get the first school from database
    if (!schoolId) {
      const { data: school } = await supabaseAdmin
        .from('schools')
        .select('id')
        .limit(1)
        .single();
      
      if (school) {
        schoolId = school.id;
      } else {
        // If no schools exist, return empty array
        return NextResponse.json([]);
      }
    }
    
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'active';
    const academicYear = searchParams.get('academic_year');

    let query = supabaseAdmin
      .from('courses')
      .select('*')
      .eq('school_id', schoolId)
      .eq('status', status);

    if (academicYear) {
      query = query.eq('academic_year', academicYear);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      // Only show migration error if it's actually a table existence error
      const errorMessage = error.message.toLowerCase();
      if (errorMessage.includes('relation "public.courses" does not exist') || 
          errorMessage.includes('table "courses" does not exist')) {
        console.log('Courses table does not exist yet, returning empty array');
        return NextResponse.json([]);
      }
      return NextResponse.json(
        { error: `Failed to fetch courses: ${error.message}` },
        { status: 400 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in GET /api/courses:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/courses - Create a new course
export async function POST(request: NextRequest) {
  try {
    checkDatabaseConnection();
    

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Database connection not configured' },
        { status: 500 }
      );
    }
    
    // Get school ID from header, or use a default for development
    let schoolId = getSchoolId(request);
    
    // For development: if no school ID provided, get the first school from database
    if (!schoolId) {
      const { data: school } = await supabaseAdmin
        .from('schools')
        .select('id')
        .limit(1)
        .single();
      
      if (school) {
        schoolId = school.id;
      } else {
        return NextResponse.json(
          { error: 'No school found. Please create a school first.' },
          { status: 400 }
        );
      }
    }
    
    const body = await request.json();
    
    const {
      course_code,
      course_name,
      description,
      subject_area,
      credits,
      teacher_id,
      academic_year,
      semester,
      max_capacity,
      schedule
    } = body;

    // Validate required fields
    if (!course_code || !course_name || !academic_year) {
      return NextResponse.json(
        { error: 'Missing required fields: course_code, course_name, academic_year' },
        { status: 400 }
      );
    }

    // Check for duplicate course (same school, course_code, and academic_year)
    const { data: existingCourse } = await supabaseAdmin
      .from('courses')
      .select('id, course_code, course_name, academic_year')
      .eq('school_id', schoolId)
      .eq('course_code', course_code)
      .eq('academic_year', academic_year)
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

    const { data, error } = await supabaseAdmin
      .from('courses')
      .insert({
        school_id: schoolId,
        course_code,
        course_name,
        description,
        subject_area,
        credits: credits || 1,
        teacher_id,
        academic_year,
        semester,
        max_capacity: max_capacity || 30,
        current_enrollment: 0,
        schedule,
        status: 'active'
      })
      .select()
      .single();

    if (error) {
      // Check if it's a duplicate key constraint violation
      if (error.message.includes('duplicate key') || error.message.includes('unique constraint')) {
        return NextResponse.json(
          { 
            error: `A course with code "${course_code}" already exists for academic year "${academic_year}". Please use a different course code or academic year.`,
            constraint: 'courses_school_code_year_unique'
          },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { error: `Failed to create course: ${error.message}` },
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