-- Migration: Create subjects table for curriculum management
-- This script creates the subjects table for managing the curriculum catalog

-- Create subjects table
CREATE TABLE IF NOT EXISTS public.subjects (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    school_id uuid NOT NULL,
    subject_code character varying NOT NULL,
    subject_name character varying NOT NULL,
    description text,
    category character varying DEFAULT 'Core',
    weekly_hours integer DEFAULT 4,
    status character varying DEFAULT 'Active',
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT subjects_pkey PRIMARY KEY (id),
    CONSTRAINT subjects_school_id_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id),
    CONSTRAINT subjects_school_code_unique UNIQUE (school_id, subject_code)
);

-- Create indexes for subjects
CREATE INDEX IF NOT EXISTS idx_subjects_school ON public.subjects(school_id);
CREATE INDEX IF NOT EXISTS idx_subjects_category ON public.subjects(school_id, category);
CREATE INDEX IF NOT EXISTS idx_subjects_status ON public.subjects(school_id, status);

-- Enable Row Level Security
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for subjects
CREATE POLICY school_isolation_subjects_policy ON public.subjects 
    FOR ALL USING (school_id = get_current_school_id());

-- Add automatic timestamp trigger
CREATE TRIGGER update_subjects_modtime BEFORE UPDATE ON public.subjects 
    FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- Add comments for documentation
COMMENT ON TABLE public.subjects IS 'Curriculum subjects catalog for defining available courses';
COMMENT ON COLUMN public.subjects.category IS 'Subject category: Core, Elective, or Extra-curricular';
COMMENT ON COLUMN public.subjects.weekly_hours IS 'Recommended weekly instructional hours for this subject';