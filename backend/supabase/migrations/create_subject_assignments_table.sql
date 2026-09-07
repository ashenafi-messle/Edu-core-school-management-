-- Migration: Create subject_assignments table for teacher-subject assignments
-- This script creates the subject_assignments table for managing teacher assignments to subjects

-- Create subject_assignments table
CREATE TABLE IF NOT EXISTS public.subject_assignments (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    school_id uuid NOT NULL,
    teacher_id uuid NOT NULL,
    subject_id uuid NOT NULL,
    academic_year_id uuid NOT NULL,
    semester character varying NOT NULL,
    grade_level character varying NOT NULL,
    section_name character varying NOT NULL,
    role character varying DEFAULT 'Primary Teacher', -- Primary Teacher, Assistant Teacher, Lab Instructor
    sections_assigned integer DEFAULT 1,
    weekly_hours integer DEFAULT 4,
    assignment_date date DEFAULT CURRENT_DATE,
    status character varying DEFAULT 'Active', -- Active, Inactive, Completed
    notes text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT subject_assignments_pkey PRIMARY KEY (id),
    CONSTRAINT subject_assignments_school_id_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id),
    CONSTRAINT subject_assignments_teacher_id_fkey FOREIGN KEY (teacher_id) REFERENCES public.teachers(id),
    CONSTRAINT subject_assignments_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects(id),
    CONSTRAINT subject_assignments_academic_year_id_fkey FOREIGN KEY (academic_year_id) REFERENCES public.academic_years(id),
    CONSTRAINT subject_assignments_unique UNIQUE (teacher_id, subject_id, academic_year_id, semester, grade_level, section_name)
);

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