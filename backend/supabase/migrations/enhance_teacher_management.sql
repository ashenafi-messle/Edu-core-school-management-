-- Migration: Enhance teacher management tables
-- This script adds missing columns to teachers table and creates supporting tables for full teacher management functionality

-- ==============================================
-- STEP 1: Add missing columns to teachers table
-- ==============================================

-- Add basic contact and profile columns
ALTER TABLE teachers 
ADD COLUMN IF NOT EXISTS photo TEXT,
ADD COLUMN IF NOT EXISTS phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS email VARCHAR(255),
ADD COLUMN IF NOT EXISTS employment_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'Active' CHECK (status IN ('Active', 'Deactivated')),
ADD COLUMN IF NOT EXISTS weekly_load VARCHAR(20) DEFAULT '0 hrs/wk';

-- Add assignment arrays
ALTER TABLE teachers 
ADD COLUMN IF NOT EXISTS assigned_grades TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS assigned_sections TEXT[] DEFAULT '{}';

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_teachers_status ON teachers(status);
CREATE INDEX IF NOT EXISTS idx_teachers_department ON teachers(department);
CREATE INDEX IF NOT EXISTS idx_teachers_school_status ON teachers(school_id, status);

-- ==============================================
-- STEP 2: Create teacher_performance_metrics table
-- ==============================================

CREATE TABLE IF NOT EXISTS teacher_performance_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    academic_year VARCHAR(20) NOT NULL,
    semester VARCHAR(20) DEFAULT 'Semester 1',
    
    -- Rating metrics (0-100 scale)
    student_rating DECIMAL(5,2) DEFAULT 0,
    parent_rating DECIMAL(5,2) DEFAULT 0,
    director_evaluation DECIMAL(5,2) DEFAULT 0,
    
    -- Attendance metrics
    attendance_present INTEGER DEFAULT 0,
    attendance_absent INTEGER DEFAULT 0,
    attendance_late INTEGER DEFAULT 0,
    attendance_leave INTEGER DEFAULT 0,
    
    -- Performance metrics
    assignment_completion_rate DECIMAL(5,2) DEFAULT 0,
    syllabus_completion_rate DECIMAL(5,2) DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE (teacher_id, academic_year, semester)
);

-- Create indexes for performance metrics
CREATE INDEX IF NOT EXISTS idx_teacher_performance_teacher ON teacher_performance_metrics(teacher_id);
CREATE INDEX IF NOT EXISTS idx_teacher_performance_school_year ON teacher_performance_metrics(school_id, academic_year);

-- ==============================================
-- STEP 3: Create teacher_evaluations table
-- ==============================================

CREATE TABLE IF NOT EXISTS teacher_evaluations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    evaluator_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    evaluation_type VARCHAR(50) NOT NULL CHECK (evaluation_type IN ('Strength', 'Area for Improvement')),
    category VARCHAR(50) NOT NULL, -- e.g., 'Teaching', 'Communication', 'Leadership', etc.
    description TEXT NOT NULL,
    
    evaluation_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    academic_year VARCHAR(20) NOT NULL,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for evaluations
CREATE INDEX IF NOT EXISTS idx_teacher_evaluations_teacher ON teacher_evaluations(teacher_id);
CREATE INDEX IF NOT EXISTS idx_teacher_evaluations_type ON teacher_evaluations(evaluation_type);
CREATE INDEX IF NOT EXISTS idx_teacher_evaluations_school_year ON teacher_evaluations(school_id, academic_year);

-- ==============================================
-- STEP 4: Create teacher_class_assignments table
-- ==============================================

CREATE TABLE IF NOT EXISTS teacher_class_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    
    grade_level VARCHAR(50) NOT NULL,
    section_name VARCHAR(50) NOT NULL,
    subject VARCHAR(100) NOT NULL,
    
    role VARCHAR(50) DEFAULT 'Subject Teacher' CHECK (role IN ('Class Teacher', 'Subject Teacher', 'Homeroom Teacher')),
    
    academic_year VARCHAR(20) NOT NULL,
    semester VARCHAR(20) DEFAULT 'Semester 1',
    
    is_active BOOLEAN DEFAULT true,
    assigned_by UUID REFERENCES users(id) ON DELETE SET NULL,
    assigned_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE (teacher_id, grade_level, section_name, subject, academic_year, semester)
);

-- Create indexes for class assignments
CREATE INDEX IF NOT EXISTS idx_teacher_assignments_teacher ON teacher_class_assignments(teacher_id);
CREATE INDEX IF NOT EXISTS idx_teacher_assignments_grade_section ON teacher_class_assignments(grade_level, section_name);
CREATE INDEX IF NOT EXISTS idx_teacher_assignments_school_year ON teacher_class_assignments(school_id, academic_year);
CREATE INDEX IF NOT EXISTS idx_teacher_assignments_active ON teacher_class_assignments(is_active);

-- ==============================================
-- STEP 5: Enable Row Level Security
-- ==============================================

ALTER TABLE teacher_performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_class_assignments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for teacher_performance_metrics
CREATE POLICY school_isolation_teacher_performance_policy ON teacher_performance_metrics 
    FOR ALL USING (school_id = get_current_school_id());

-- Create RLS policies for teacher_evaluations
CREATE POLICY school_isolation_teacher_evaluations_policy ON teacher_evaluations 
    FOR ALL USING (school_id = get_current_school_id());

-- Create RLS policies for teacher_class_assignments
CREATE POLICY school_isolation_teacher_assignments_policy ON teacher_class_assignments 
    FOR ALL USING (school_id = get_current_school_id());

-- ==============================================
-- STEP 6: Add automatic timestamp triggers
-- ==============================================

CREATE TRIGGER update_teacher_performance_modtime BEFORE UPDATE ON teacher_performance_metrics 
    FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_teacher_evaluations_modtime BEFORE UPDATE ON teacher_evaluations 
    FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_teacher_assignments_modtime BEFORE UPDATE ON teacher_class_assignments 
    FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- ==============================================
-- STEP 7: Add comments for documentation
-- ==============================================

COMMENT ON COLUMN teachers.photo IS 'Profile photo URL for the teacher';
COMMENT ON COLUMN teachers.phone IS 'Primary contact phone number';
COMMENT ON COLUMN teachers.email IS 'Primary email address';
COMMENT ON COLUMN teachers.employment_date IS 'Date when teacher joined the school';
COMMENT ON COLUMN teachers.status IS 'Current employment status (Active/Deactivated)';
COMMENT ON COLUMN teachers.weekly_load IS 'Weekly teaching load (e.g., "16 hrs/wk")';
COMMENT ON COLUMN teachers.assigned_grades IS 'Array of grade levels assigned to teacher';
COMMENT ON COLUMN teachers.assigned_sections IS 'Array of sections assigned to teacher';

COMMENT ON TABLE teacher_performance_metrics IS 'Performance and attendance metrics for teachers per academic year';
COMMENT ON TABLE teacher_evaluations IS 'Record of teacher strengths and areas for improvement';
COMMENT ON TABLE teacher_class_assignments IS 'Detailed grade/section/subject assignments for teachers';

-- ==============================================
-- STEP 8: Update existing teachers with default values
-- ==============================================

-- Set default photo for existing teachers without one
UPDATE teachers 
SET photo = 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150'
WHERE photo IS NULL;

-- Set default phone for existing teachers without one
UPDATE teachers 
SET phone = '+1 (555) 000-0000'
WHERE phone IS NULL;

-- Set default email for existing teachers without one
UPDATE teachers 
SET email = LOWER(REPLACE(full_name, ' ', '')) || '@educore.edu'
WHERE email IS NULL;

-- Set default employment date for existing teachers without one
UPDATE teachers 
SET employment_date = created_at
WHERE employment_date IS NULL;
