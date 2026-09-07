-- Migration: Remove grade_level column from courses table
-- This removes the grade_level column since grade/section context is now in subject_assignments

-- Remove the grade_level column from courses table
ALTER TABLE public.courses 
DROP COLUMN IF EXISTS grade_level;

-- Remove the grade index since it's no longer needed
DROP INDEX IF EXISTS idx_courses_grade;

-- Update the comment to reflect the new purpose
COMMENT ON TABLE public.courses IS 'Academic courses/subjects offered by the school (course catalog without grade context)';
