import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, checkDatabaseConnection } from '@/lib/supabase';
import { getSchoolId } from '@/lib/tenant-context';

// GET /api/subject-assignments - Get all subject assignments for the school
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
    const teacherId = searchParams.get('teacher_id');
    const subjectId = searchParams.get('subject_id');
    const academicYearId = searchParams.get('academic_year_id');
    const semester = searchParams.get('semester');
    const gradeLevel = searchParams.get('grade_level');
    const sectionName = searchParams.get('section_name');
    const status = searchParams.get('status') || 'Active';

    let query = supabaseAdmin
      .from('subject_assignments')
      .select(`
        *,
        teacher:teachers(id, full_name, email, department, subjects),
        subject:subjects(id, subject_code, subject_name, category),
        academic_year:academic_years(id, year_name, current_semester)
      `)
      .eq('school_id', schoolId)
      .eq('status', status);

    if (teacherId) {
      query = query.eq('teacher_id', teacherId);
    }

    if (subjectId) {
      query = query.eq('subject_id', subjectId);
    }

    if (academicYearId) {
      query = query.eq('academic_year_id', academicYearId);
    }

    if (semester) {
      query = query.eq('semester', semester);
    }

    if (gradeLevel) {
      query = query.eq('grade_level', gradeLevel);
    }

    if (sectionName) {
      query = query.eq('section_name', sectionName);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      // Only show migration error if it's actually a table existence error
      const errorMessage = error.message.toLowerCase();
      if (errorMessage.includes('relation "public.subject_assignments" does not exist') || 
          errorMessage.includes('table "subject_assignments" does not exist')) {
        console.log('Subject assignments table does not exist yet, returning empty array');
        return NextResponse.json([]);
      }
      return NextResponse.json(
        { error: `Failed to fetch subject assignments: ${error.message}` },
        { status: 400 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in GET /api/subject-assignments:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/subject-assignments - Create a new subject assignment
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
      teacher_id,
      subject_id,
      academic_year_id,
      semester,
      grade_level,
      section_name,
      role,
      sections_assigned,
      weekly_hours,
      assignment_date,
      notes
    } = body;

    // Validate required fields
    if (!teacher_id || !subject_id || !academic_year_id || !semester || !grade_level || !section_name) {
      return NextResponse.json(
        { error: 'Missing required fields: teacher_id, subject_id, academic_year_id, semester, grade_level, section_name' },
        { status: 400 }
      );
    }

    // Check for duplicate assignment
    const { data: existing } = await supabaseAdmin
      .from('subject_assignments')
      .select('id')
      .eq('teacher_id', teacher_id)
      .eq('subject_id', subject_id)
      .eq('academic_year_id', academic_year_id)
      .eq('semester', semester)
      .eq('grade_level', grade_level)
      .eq('section_name', section_name)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'This teacher is already assigned to this subject for the specified academic year, semester, grade, and section' },
        { status: 409 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('subject_assignments')
      .insert({
        school_id: schoolId,
        teacher_id,
        subject_id,
        academic_year_id,
        semester,
        grade_level,
        section_name,
        role: role || 'Primary Teacher',
        sections_assigned: sections_assigned || 1,
        weekly_hours: weekly_hours || 4,
        assignment_date: assignment_date || new Date().toISOString().split('T')[0],
        notes,
        status: 'Active'
      })
      .select(`
        *,
        teacher:teachers(id, full_name, email, department, subjects),
        subject:subjects(id, subject_code, subject_name, category),
        academic_year:academic_years(id, year_name, current_semester)
      `)
      .single();

    if (error) {
      // Only show migration error if it's actually a table existence error
      const errorMessage = error.message.toLowerCase();
      if (errorMessage.includes('relation "public.subject_assignments" does not exist') || 
          errorMessage.includes('table "subject_assignments" does not exist')) {
        return NextResponse.json(
          { 
            error: 'Subject assignments table does not exist in database. Please run the migration to create it.',
            requiresMigration: true,
            sql: `
-- Run this SQL in your Supabase SQL Editor to update the subject_assignments table:
-- Add grade_level and section_name columns if they don't exist
ALTER TABLE public.subject_assignments 
ADD COLUMN IF NOT EXISTS grade_level character varying NOT NULL DEFAULT 'Grade 9';

ALTER TABLE public.subject_assignments 
ADD COLUMN IF NOT EXISTS section_name character varying NOT NULL DEFAULT 'Section A';

-- Drop and recreate the unique constraint to include the new columns
ALTER TABLE public.subject_assignments 
DROP CONSTRAINT IF EXISTS subject_assignments_unique;

ALTER TABLE public.subject_assignments 
ADD CONSTRAINT subject_assignments_unique 
UNIQUE (teacher_id, subject_id, academic_year_id, semester, grade_level, section_name);

-- Create indexes for new columns
CREATE INDEX IF NOT EXISTS idx_subject_assignments_grade ON public.subject_assignments(grade_level);
CREATE INDEX IF NOT EXISTS idx_subject_assignments_section ON public.subject_assignments(section_name);

-- Also remove grade_level from courses table
ALTER TABLE public.courses 
DROP COLUMN IF EXISTS grade_level;

DROP INDEX IF EXISTS idx_courses_grade;
            `
          },
          { status: 400 }
        );
      }
      // For all other errors, show the actual error message
      return NextResponse.json(
        { error: `Failed to create subject assignment: ${error.message}` },
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