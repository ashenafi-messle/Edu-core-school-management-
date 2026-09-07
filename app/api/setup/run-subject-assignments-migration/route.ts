import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, checkDatabaseConnection } from '@/lib/supabase';

// POST /api/setup/run-subject-assignments-migration - Run the subject assignments table migration
export async function POST(request: NextRequest) {
  try {
    checkDatabaseConnection();


    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Database connection not configured' },
        { status: 500 }
      );
    }

    // Read the migration SQL
    const migrationSQL = `
-- 1. Update subject_assignments table with grade_level and section_name
-- Add grade_level and section_name columns if they don't exist (for existing tables)
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

-- Create indexes for subject_assignments
CREATE INDEX IF NOT EXISTS idx_subject_assignments_school ON public.subject_assignments(school_id);
CREATE INDEX IF NOT EXISTS idx_subject_assignments_teacher ON public.subject_assignments(teacher_id);
CREATE INDEX IF NOT EXISTS idx_subject_assignments_subject ON public.subject_assignments(subject_id);
CREATE INDEX IF NOT EXISTS idx_subject_assignments_academic_year ON public.subject_assignments(academic_year_id);
CREATE INDEX IF NOT EXISTS idx_subject_assignments_grade ON public.subject_assignments(grade_level);
CREATE INDEX IF NOT EXISTS idx_subject_assignments_section ON public.subject_assignments(section_name);
CREATE INDEX IF NOT EXISTS idx_subject_assignments_status ON public.subject_assignments(school_id, status);

-- Enable Row Level Security
ALTER TABLE public.subject_assignments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for subject_assignments
DROP POLICY IF EXISTS school_isolation_subject_assignments_policy ON public.subject_assignments;
CREATE POLICY school_isolation_subject_assignments_policy ON public.subject_assignments 
    FOR ALL USING (school_id = get_current_school_id());

-- Add comments for documentation
COMMENT ON TABLE public.subject_assignments IS 'Teacher-subject assignments with academic year, semester, grade, and section context';
COMMENT ON COLUMN public.subject_assignments.role IS 'Teacher role: Primary Teacher, Assistant Teacher, Lab Instructor';
COMMENT ON COLUMN public.subject_assignments.sections_assigned IS 'Number of class sections assigned';
COMMENT ON COLUMN public.subject_assignments.weekly_hours IS 'Weekly teaching hours for this assignment';
COMMENT ON COLUMN public.subject_assignments.status IS 'Assignment status: Active, Inactive, Completed';
COMMENT ON COLUMN public.subject_assignments.grade_level IS 'Grade level for this subject assignment (e.g., Grade 9, Grade 10)';
COMMENT ON COLUMN public.subject_assignments.section_name IS 'Section name for this subject assignment (e.g., Section A, Section B)';

-- 2. Remove grade_level from courses table
-- Remove the grade_level column from courses table
ALTER TABLE public.courses 
DROP COLUMN IF EXISTS grade_level;

-- Remove the grade index since it's no longer needed
DROP INDEX IF EXISTS idx_courses_grade;

-- Update the comment to reflect the new purpose
COMMENT ON TABLE public.courses IS 'Academic courses/subjects offered by the school (course catalog without grade context)';
    `;

    // Execute the migration using Supabase's RPC or direct SQL execution
    // Note: This might not work directly with Supabase client, so we'll provide the SQL for manual execution
    const { error } = await supabaseAdmin.rpc('exec_sql', { sql: migrationSQL });

    if (error) {
      // If RPC doesn't work, return the SQL for manual execution
      return NextResponse.json({
        success: false,
        message: 'Could not execute migration automatically. Please run the SQL manually in Supabase SQL Editor.',
        sql: migrationSQL,
        error: error.message
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'Subject assignments table migration completed successfully'
    });

  } catch (error) {
    console.error('Error running subject assignments migration:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
