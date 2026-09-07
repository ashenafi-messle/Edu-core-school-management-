-- Migration: Create student management tables
-- This script creates additional tables for comprehensive student management

-- Add gender field to students table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'students' AND column_name = 'gender'
    ) THEN
        ALTER TABLE public.students ADD COLUMN gender character varying CHECK (gender::text = ANY (ARRAY['male'::character varying, 'female'::character varying, 'other'::character varying]::text[]));
    END IF;
END $$;

-- Add date_of_birth field to students table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'students' AND column_name = 'date_of_birth'
    ) THEN
        ALTER TABLE public.students ADD COLUMN date_of_birth date;
    END IF;
END $$;

-- Student documents table
CREATE TABLE IF NOT EXISTS public.student_documents (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    school_id uuid NOT NULL,
    student_id uuid NOT NULL,
    document_type character varying NOT NULL, -- e.g., 'Birth Certificate', 'Immunization Record', 'Transcript'
    document_name character varying NOT NULL,
    file_url character varying NOT NULL,
    upload_date timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    uploaded_by uuid,
    status character varying DEFAULT 'pending' CHECK (status::text = ANY (ARRAY['pending'::character varying, 'approved'::character varying, 'rejected'::character varying]::text[])),
    expiry_date date,
    notes text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT student_documents_pkey PRIMARY KEY (id),
    CONSTRAINT student_documents_school_id_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id),
    CONSTRAINT student_documents_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id),
    CONSTRAINT student_documents_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES public.users(id)
);

-- Create indexes for student documents
CREATE INDEX IF NOT EXISTS idx_student_documents_school ON public.student_documents(school_id);
CREATE INDEX IF NOT EXISTS idx_student_documents_student ON public.student_documents(student_id);
CREATE INDEX IF NOT EXISTS idx_student_documents_type ON public.student_documents(school_id, document_type);
CREATE INDEX IF NOT EXISTS idx_student_documents_status ON public.student_documents(school_id, status);

-- Student academic records table
CREATE TABLE IF NOT EXISTS public.student_academic_records (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    school_id uuid NOT NULL,
    student_id uuid NOT NULL,
    academic_year character varying NOT NULL,
    semester character varying,
    grade_level character varying NOT NULL,
    section character varying,
    gpa numeric(3,2),
    class_rank integer,
    total_students integer,
    attendance_percentage numeric(5,2),
    behavior_grade character varying,
    principal_comments text,
    promotion_status character varying DEFAULT 'promoted' CHECK (promotion_status::text = ANY (ARRAY['promoted'::character varying, 'retained'::character varying, 'conditional'::character varying]::text[])),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT student_academic_records_pkey PRIMARY KEY (id),
    CONSTRAINT student_academic_records_school_id_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id),
    CONSTRAINT student_academic_records_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id),
    CONSTRAINT student_academic_records_student_year_semester_unique UNIQUE (student_id, academic_year, semester)
);

-- Create indexes for student academic records
CREATE INDEX IF NOT EXISTS idx_student_academic_school ON public.student_academic_records(school_id);
CREATE INDEX IF NOT EXISTS idx_student_academic_student ON public.student_academic_records(student_id);
CREATE INDEX IF NOT EXISTS idx_student_academic_year ON public.student_academic_records(school_id, academic_year);
CREATE INDEX IF NOT EXISTS idx_student_academic_grade ON public.student_academic_records(school_id, grade_level);

-- Student disciplinary records table
CREATE TABLE IF NOT EXISTS public.student_disciplinary_records (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    school_id uuid NOT NULL,
    student_id uuid NOT NULL,
    incident_date date NOT NULL,
    incident_type character varying NOT NULL, -- e.g., 'Late', 'Absent', 'Misbehavior', 'Dress Code'
    severity character varying DEFAULT 'minor' CHECK (severity::text = ANY (ARRAY['minor'::character varying, 'moderate'::character varying, 'major'::character varying, 'severe'::character varying]::text[])),
    description text,
    action_taken character varying, -- e.g., 'Warning', 'Detention', 'Suspension', 'Parent Meeting'
    reported_by uuid,
    resolved_by uuid,
    resolution_date date,
    status character varying DEFAULT 'open' CHECK (status::text = ANY (ARRAY['open'::character varying, 'resolved'::character varying, 'escalated'::character varying]::text[])),
    notes text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT student_disciplinary_records_pkey PRIMARY KEY (id),
    CONSTRAINT student_disciplinary_records_school_id_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id),
    CONSTRAINT student_disciplinary_records_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id),
    CONSTRAINT student_disciplinary_records_reported_by_fkey FOREIGN KEY (reported_by) REFERENCES public.users(id),
    CONSTRAINT student_disciplinary_records_resolved_by_fkey FOREIGN KEY (resolved_by) REFERENCES public.users(id)
);

-- Create indexes for student disciplinary records
CREATE INDEX IF NOT EXISTS idx_student_disciplinary_school ON public.student_disciplinary_records(school_id);
CREATE INDEX IF NOT EXISTS idx_student_disciplinary_student ON public.student_disciplinary_records(student_id);
CREATE INDEX IF NOT EXISTS idx_student_disciplinary_date ON public.student_disciplinary_records(school_id, incident_date);
CREATE INDEX IF NOT EXISTS idx_student_disciplinary_status ON public.student_disciplinary_records(school_id, status);

-- Student fee status table (enhanced)
CREATE TABLE IF NOT EXISTS public.student_fee_status (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    school_id uuid NOT NULL,
    student_id uuid NOT NULL,
    fee_type character varying NOT NULL, -- e.g., 'Tuition', 'Lab Fee', 'Transportation'
    academic_year character varying NOT NULL,
    semester character varying,
    amount numeric(12,2) NOT NULL,
    amount_paid numeric(12,2) DEFAULT 0,
    amount_due numeric(12,2) GENERATED ALWAYS AS (amount - amount_paid) STORED,
    due_date date NOT NULL,
    payment_status character varying DEFAULT 'unpaid' CHECK (payment_status::text = ANY (ARRAY['unpaid'::character varying, 'partial'::character varying, 'paid'::character varying, 'overdue'::character varying]::text[])),
    last_payment_date date,
    discount_amount numeric(12,2) DEFAULT 0,
    discount_reason character varying,
    notes text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT student_fee_status_pkey PRIMARY KEY (id),
    CONSTRAINT student_fee_status_school_id_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id),
    CONSTRAINT student_fee_status_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id),
    CONSTRAINT student_fee_status_student_year_type_unique UNIQUE (student_id, academic_year, fee_type, semester)
);

-- Create indexes for student fee status
CREATE INDEX IF NOT EXISTS idx_student_fee_school ON public.student_fee_status(school_id);
CREATE INDEX IF NOT EXISTS idx_student_fee_student ON public.student_fee_status(student_id);
CREATE INDEX IF NOT EXISTS idx_student_fee_status ON public.student_fee_status(school_id, payment_status);
CREATE INDEX IF NOT EXISTS idx_student_fee_due_date ON public.student_fee_status(school_id, due_date);

-- Student extracurricular activities table
CREATE TABLE IF NOT EXISTS public.student_activities (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    school_id uuid NOT NULL,
    student_id uuid NOT NULL,
    activity_name character varying NOT NULL,
    activity_type character varying NOT NULL, -- e.g., 'Sports', 'Clubs', 'Music', 'Arts'
    role character varying, -- e.g., 'Captain', 'Member', 'President'
    start_date date,
    end_date date,
    achievement_level character varying, -- e.g., 'School', 'Regional', 'National'
    achievements text,
    supervisor_id uuid,
    status character varying DEFAULT 'active' CHECK (status::text = ANY (ARRAY['active'::character varying, 'completed'::character varying, 'inactive'::character varying]::text[])),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT student_activities_pkey PRIMARY KEY (id),
    CONSTRAINT student_activities_school_id_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id),
    CONSTRAINT student_activities_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id),
    CONSTRAINT student_activities_supervisor_id_fkey FOREIGN KEY (supervisor_id) REFERENCES public.users(id)
);

-- Create indexes for student activities
CREATE INDEX IF NOT EXISTS idx_student_activities_school ON public.student_activities(school_id);
CREATE INDEX IF NOT EXISTS idx_student_activities_student ON public.student_activities(student_id);
CREATE INDEX IF NOT EXISTS idx_student_activities_type ON public.student_activities(school_id, activity_type);
CREATE INDEX IF NOT EXISTS idx_student_activities_status ON public.student_activities(school_id, status);

-- Enable Row Level Security
ALTER TABLE public.student_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_academic_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_disciplinary_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_fee_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_activities ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY school_isolation_student_documents_policy ON public.student_documents 
    FOR ALL USING (school_id = get_current_school_id());

CREATE POLICY school_isolation_student_academic_records_policy ON public.student_academic_records 
    FOR ALL USING (school_id = get_current_school_id());

CREATE POLICY school_isolation_student_disciplinary_records_policy ON public.student_disciplinary_records 
    FOR ALL USING (school_id = get_current_school_id());

CREATE POLICY school_isolation_student_fee_status_policy ON public.student_fee_status 
    FOR ALL USING (school_id = get_current_school_id());

CREATE POLICY school_isolation_student_activities_policy ON public.student_activities 
    FOR ALL USING (school_id = get_current_school_id());

-- Add automatic timestamp triggers
CREATE TRIGGER update_student_documents_modtime BEFORE UPDATE ON public.student_documents 
    FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_student_academic_records_modtime BEFORE UPDATE ON public.student_academic_records 
    FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_student_disciplinary_records_modtime BEFORE UPDATE ON public.student_disciplinary_records 
    FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_student_fee_status_modtime BEFORE UPDATE ON public.student_fee_status 
    FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_student_activities_modtime BEFORE UPDATE ON public.student_activities 
    FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- Add comments for documentation
COMMENT ON TABLE public.student_documents IS 'Documents uploaded for students (birth certificates, medical records, etc.)';
COMMENT ON TABLE public.student_academic_records IS 'Academic performance records including GPA, rank, and promotion status';
COMMENT ON TABLE public.student_disciplinary_records IS 'Disciplinary incidents and resolutions for students';
COMMENT ON TABLE public.student_fee_status IS 'Fee payment tracking with calculated due amounts';
COMMENT ON TABLE public.student_activities IS 'Extracurricular activities and achievements';
