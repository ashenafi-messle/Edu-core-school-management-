-- Create enhanced attendance recording schema for teacher workspace
-- This extends the existing attendance system to support teacher-specific attendance recording

-- First, let's check if attendance table exists and add teacher-specific fields if needed
-- This migration assumes an attendance table already exists (from the existing API)

-- Add teacher-specific fields to attendance table if they don't exist
DO $$
BEGIN
    -- Check if the attendance table exists
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'attendance') THEN
        -- Add teacher_id column if it doesn't exist
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'attendance' AND column_name = 'teacher_id'
        ) THEN
            ALTER TABLE attendance ADD COLUMN teacher_id uuid;
            ALTER TABLE attendance ADD CONSTRAINT attendance_teacher_id_fkey 
                FOREIGN KEY (teacher_id) REFERENCES teachers(id);
        END IF;

        -- Add subject_id column if it doesn't exist
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'attendance' AND column_name = 'subject_id'
        ) THEN
            ALTER TABLE attendance ADD COLUMN subject_id uuid;
            ALTER TABLE attendance ADD CONSTRAINT attendance_subject_id_fkey 
                FOREIGN KEY (subject_id) REFERENCES subjects(id);
        END IF;

        -- Add grade_level column if it doesn't exist
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'attendance' AND column_name = 'grade_level'
        ) THEN
            ALTER TABLE attendance ADD COLUMN grade_level varchar(50);
        END IF;

        -- Add section_name column if it doesn't exist
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'attendance' AND column_name = 'section_name'
        ) THEN
            ALTER TABLE attendance ADD COLUMN section_name varchar(50);
        END IF;

        -- Add notes column if it doesn't exist
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'attendance' AND column_name = 'notes'
        ) THEN
            ALTER TABLE attendance ADD COLUMN notes text;
        END IF;

        -- Add recorded_by column if it doesn't exist
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'attendance' AND column_name = 'recorded_by'
        ) THEN
            ALTER TABLE attendance ADD COLUMN recorded_by uuid;
            ALTER TABLE attendance ADD CONSTRAINT attendance_recorded_by_fkey 
                FOREIGN KEY (recorded_by) REFERENCES users(id);
        END IF;

        -- Add recording_method column if it doesn't exist
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'attendance' AND column_name = 'recording_method'
        ) THEN
            ALTER TABLE attendance ADD COLUMN recording_method varchar(20) DEFAULT 'manual';
        END IF;
    END IF;
END $$;

-- Create attendance summary table for quick statistics
CREATE TABLE IF NOT EXISTS attendance_summary (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    school_id uuid NOT NULL,
    teacher_id uuid NOT NULL,
    subject_id uuid NOT NULL,
    grade_level varchar(50) NOT NULL,
    section_name varchar(50) NOT NULL,
    class_date date NOT NULL,
    total_students integer NOT NULL DEFAULT 0,
    present_count integer NOT NULL DEFAULT 0,
    absent_count integer NOT NULL DEFAULT 0,
    late_count integer NOT NULL DEFAULT 0,
    excused_count integer NOT NULL DEFAULT 0,
    attendance_percentage decimal(5,2) DEFAULT 0,
    recorded_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    recorded_by uuid,
    academic_year_id uuid,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT attendance_summary_pkey PRIMARY KEY (id),
    CONSTRAINT attendance_summary_school_id_fkey FOREIGN KEY (school_id) REFERENCES schools(id),
    CONSTRAINT attendance_summary_teacher_id_fkey FOREIGN KEY (teacher_id) REFERENCES teachers(id),
    CONSTRAINT attendance_summary_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES subjects(id),
    CONSTRAINT attendance_summary_recorded_by_fkey FOREIGN KEY (recorded_by) REFERENCES users(id),
    CONSTRAINT attendance_summary_academic_year_id_fkey FOREIGN KEY (academic_year_id) REFERENCES academic_years(id),
    CONSTRAINT attendance_summary_unique_date UNIQUE (teacher_id, subject_id, grade_level, section_name, class_date)
);

-- Create attendance exceptions table for handling special cases
CREATE TABLE IF NOT EXISTS attendance_exceptions (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    school_id uuid NOT NULL,
    student_id uuid NOT NULL,
    teacher_id uuid NOT NULL,
    subject_id uuid NOT NULL,
    class_date date NOT NULL,
    exception_type varchar(50) NOT NULL, -- 'medical', 'family_emergency', 'school_activity', 'excused_absence', etc.
    reason text,
    approved_by uuid,
    approved_at timestamp with time zone,
    status varchar(20) DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    notes text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT attendance_exceptions_pkey PRIMARY KEY (id),
    CONSTRAINT attendance_exceptions_school_id_fkey FOREIGN KEY (school_id) REFERENCES schools(id),
    CONSTRAINT attendance_exceptions_student_id_fkey FOREIGN KEY (student_id) REFERENCES students(id),
    CONSTRAINT attendance_exceptions_teacher_id_fkey FOREIGN KEY (teacher_id) REFERENCES teachers(id),
    CONSTRAINT attendance_exceptions_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES subjects(id),
    CONSTRAINT attendance_exceptions_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES users(id),
    CONSTRAINT attendance_exceptions_unique_date UNIQUE (student_id, subject_id, class_date)
);

-- Create attendance patterns table for tracking recurring attendance issues
CREATE TABLE IF NOT EXISTS attendance_patterns (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    school_id uuid NOT NULL,
    student_id uuid NOT NULL,
    teacher_id uuid NOT NULL,
    subject_id uuid NOT NULL,
    pattern_type varchar(50) NOT NULL, -- 'chronic_absenteeism', 'frequent_late', 'declining_attendance', etc.
    start_date date NOT NULL,
    end_date date,
    severity varchar(20) DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
    total_incidents integer DEFAULT 0,
    resolved boolean DEFAULT false,
    resolved_at timestamp with time zone,
    resolved_by uuid,
    notes text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT attendance_patterns_pkey PRIMARY KEY (id),
    CONSTRAINT attendance_patterns_school_id_fkey FOREIGN KEY (school_id) REFERENCES schools(id),
    CONSTRAINT attendance_patterns_student_id_fkey FOREIGN KEY (student_id) REFERENCES students(id),
    CONSTRAINT attendance_patterns_teacher_id_fkey FOREIGN KEY (teacher_id) REFERENCES teachers(id),
    CONSTRAINT attendance_patterns_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES subjects(id),
    CONSTRAINT attendance_patterns_resolved_by_fkey FOREIGN KEY (resolved_by) REFERENCES users(id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_attendance_teacher_subject ON attendance(teacher_id, subject_id);
CREATE INDEX IF NOT EXISTS idx_attendance_class_date ON attendance(class_date);
CREATE INDEX IF NOT EXISTS idx_attendance_student_subject ON attendance(student_id, subject_id);
CREATE INDEX IF NOT EXISTS idx_attendance_summary_teacher_date ON attendance_summary(teacher_id, class_date);
CREATE INDEX IF NOT EXISTS idx_attendance_exceptions_student ON attendance_exceptions(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_patterns_student ON attendance_patterns(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_patterns_active ON attendance_patterns(resolved) WHERE resolved = false;

-- Add comments for documentation
COMMENT ON TABLE attendance_summary IS 'Summary table for daily attendance statistics by teacher, subject, and class';
COMMENT ON TABLE attendance_exceptions IS 'Table for handling special attendance exceptions and approvals';
COMMENT ON TABLE attendance_patterns IS 'Table for tracking and analyzing attendance patterns and trends';
