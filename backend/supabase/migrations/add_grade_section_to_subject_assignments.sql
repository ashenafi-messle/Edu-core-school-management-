-- Migration: Add grade_level and section_name columns to subject_assignments table
-- This adds the missing columns to properly track which grade and section a teacher is assigned to

-- Add grade_level column
ALTER TABLE public.subject_assignments 
ADD COLUMN IF NOT EXISTS grade_level character varying NOT NULL DEFAULT 'Grade 9';

-- Add section_name column  
ALTER TABLE public.subject_assignments 
ADD COLUMN IF NOT EXISTS section_name character varying NOT NULL DEFAULT 'Section A';

-- Drop the old unique constraint
ALTER TABLE public.subject_assignments 
DROP CONSTRAINT IF EXISTS subject_assignments_unique;

-- Add the new unique constraint that includes grade_level and section_name
ALTER TABLE public.subject_assignments 
ADD CONSTRAINT subject_assignments_unique 
UNIQUE (teacher_id, subject_id, academic_year_id, semester, grade_level, section_name);

-- Add comments for the new columns
COMMENT ON COLUMN public.subject_assignments.grade_level IS 'Grade level for this subject assignment (e.g., Grade 9, Grade 10)';
COMMENT ON COLUMN public.subject_assignments.section_name IS 'Section name for this subject assignment (e.g., Section A, Section B)';
