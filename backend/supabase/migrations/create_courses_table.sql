-- Migration: Create courses table and related structures
-- This script creates the courses table for managing academic courses/subjects

-- Create courses table
CREATE TABLE IF NOT EXISTS public.courses (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    school_id uuid NOT NULL,
    course_code character varying NOT NULL,
    course_name character varying NOT NULL,
    description text,
    subject_area character varying,
    credits integer DEFAULT 1,
    teacher_id uuid,
    academic_year character varying NOT NULL,
    semester character varying,
    status character varying DEFAULT 'active',
    max_capacity integer DEFAULT 30,
    current_enrollment integer DEFAULT 0,
    schedule jsonb,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT courses_pkey PRIMARY KEY (id),
    CONSTRAINT courses_school_id_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id),
    CONSTRAINT courses_teacher_id_fkey FOREIGN KEY (teacher_id) REFERENCES public.teachers(id),
    CONSTRAINT courses_school_code_year_unique UNIQUE (school_id, course_code, academic_year)
);

-- Create indexes for courses
CREATE INDEX IF NOT EXISTS idx_courses_school ON public.courses(school_id);
CREATE INDEX IF NOT EXISTS idx_courses_teacher ON public.courses(teacher_id);
CREATE INDEX IF NOT EXISTS idx_courses_status ON public.courses(school_id, status);
CREATE INDEX IF NOT EXISTS idx_courses_academic_year ON public.courses(school_id, academic_year);

-- Create course_enrollments table to track student-course relationships
CREATE TABLE IF NOT EXISTS public.course_enrollments (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    school_id uuid NOT NULL,
    course_id uuid NOT NULL,
    student_id uuid NOT NULL,
    enrollment_date timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    status character varying DEFAULT 'enrolled',
    grade character varying,
    mid_term_score numeric(5,2),
    final_score numeric(5,2),
    assignment_score numeric(5,2),
    attendance_percentage numeric(5,2),
    remarks text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT course_enrollments_pkey PRIMARY KEY (id),
    CONSTRAINT course_enrollments_school_id_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id),
    CONSTRAINT course_enrollments_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id),
    CONSTRAINT course_enrollments_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id),
    CONSTRAINT course_enrollments_course_student_unique UNIQUE (course_id, student_id)
);

-- Create indexes for course enrollments
CREATE INDEX IF NOT EXISTS idx_course_enrollments_school ON public.course_enrollments(school_id);
CREATE INDEX IF NOT EXISTS idx_course_enrollments_course ON public.course_enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_course_enrollments_student ON public.course_enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_course_enrollments_status ON public.course_enrollments(school_id, status);

-- Enable Row Level Security
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_enrollments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for courses
CREATE POLICY school_isolation_courses_policy ON public.courses 
    FOR ALL USING (school_id = get_current_school_id());

-- Create RLS policies for course_enrollments
CREATE POLICY school_isolation_course_enrollments_policy ON public.course_enrollments 
    FOR ALL USING (school_id = get_current_school_id());

-- Add automatic timestamp triggers
CREATE TRIGGER update_courses_modtime BEFORE UPDATE ON public.courses 
    FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_course_enrollments_modtime BEFORE UPDATE ON public.course_enrollments 
    FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- Add comments for documentation
COMMENT ON TABLE public.courses IS 'Academic courses/subjects offered by the school';
COMMENT ON TABLE public.course_enrollments IS 'Student enrollments in courses with grades and performance tracking';
COMMENT ON COLUMN public.courses.schedule IS 'JSON object containing schedule details (days, times, room assignments)';
COMMENT ON COLUMN public.course_enrollments.grade IS 'Final grade assigned to student for this course';
