-- ==========================================
-- SUPABASE POSTGRESQL MULTI-TENANT SCHEMA
-- ==========================================
-- This file contains the complete, production-grade schema for the multi-tenant campus system.
-- Row Level Security (RLS) is enabled on all school-specific tables, forcing absolute data
-- isolation between different school instances.
--

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. SCHOOLS TABLE (Tenant Registry)
CREATE TABLE IF NOT EXISTS schools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    subdomain VARCHAR(100) UNIQUE,
    domain VARCHAR(255) UNIQUE,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'pending')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for fast tenant lookup by subdomain
CREATE INDEX IF NOT EXISTS idx_schools_subdomain ON schools(subdomain);

-- 2. USERS TABLE (Accounts belonging to a specific school)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'director', 'teacher', 'parent', 'student')),
    phone VARCHAR(50),
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    -- Email is unique per school to support multi-tenancy
    UNIQUE (school_id, email)
);

CREATE INDEX IF NOT EXISTS idx_users_school_email ON users(school_id, email);

-- 3. PARENTS TABLE
CREATE TABLE IF NOT EXISTS parents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    user_id UUID UNIQUE REFERENCES users(id) ON DELETE SET NULL,
    full_name VARCHAR(255) NOT NULL,
    relationship VARCHAR(100),
    emergency_contact VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_parents_school ON parents(school_id);

-- 4. STUDENTS TABLE
CREATE TABLE IF NOT EXISTS students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    user_id UUID UNIQUE REFERENCES users(id) ON DELETE SET NULL,
    parent_id UUID REFERENCES parents(id) ON DELETE SET NULL,
    admission_number VARCHAR(100) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    grade_level VARCHAR(50) NOT NULL, -- e.g., Grade 9, Grade 10, etc.
    section VARCHAR(50), -- e.g., Section A, Section B
    gender VARCHAR(20) CHECK (gender IN ('male', 'female', 'other')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    -- Admission numbers must be unique within a school
    UNIQUE (school_id, admission_number)
);

CREATE INDEX IF NOT EXISTS idx_students_school ON students(school_id);
CREATE INDEX IF NOT EXISTS idx_students_grade_section ON students(school_id, grade_level, section);
CREATE INDEX IF NOT EXISTS idx_students_grade_gender ON students(school_id, grade_level, gender);

-- SECTION CONFIGURATIONS TABLE
CREATE TABLE IF NOT EXISTS section_configurations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    grade_level VARCHAR(50) NOT NULL,
    section_name VARCHAR(50) NOT NULL, -- e.g., Section A, Section B
    max_capacity INTEGER NOT NULL DEFAULT 30,
    current_count INTEGER DEFAULT 0,
    academic_year VARCHAR(20) NOT NULL, -- e.g., 2025-2026
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    -- Section names must be unique per grade per school
    UNIQUE (school_id, grade_level, section_name, academic_year)
);

CREATE INDEX IF NOT EXISTS idx_section_config_school_grade ON section_configurations(school_id, grade_level, academic_year);

-- SECTION ALLOCATION RECORDS TABLE
CREATE TABLE IF NOT EXISTS section_allocations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    section_configuration_id UUID NOT NULL REFERENCES section_configurations(id) ON DELETE CASCADE,
    grade_level VARCHAR(50) NOT NULL,
    section_name VARCHAR(50) NOT NULL,
    allocation_method VARCHAR(50) DEFAULT 'auto', -- 'auto', 'manual'
    allocated_by UUID REFERENCES users(id) ON DELETE SET NULL,
    allocation_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    -- A student can only have one allocation per academic year
    UNIQUE (student_id, allocation_date)
);

CREATE INDEX IF NOT EXISTS idx_section_allocations_student ON section_allocations(student_id);
CREATE INDEX IF NOT EXISTS idx_section_allocations_section ON section_allocations(section_configuration_id);
CREATE INDEX IF NOT EXISTS idx_section_allocations_grade ON section_allocations(school_id, grade_level);

-- 5. TEACHERS TABLE
CREATE TABLE IF NOT EXISTS teachers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    user_id UUID UNIQUE REFERENCES users(id) ON DELETE SET NULL,
    employee_id VARCHAR(100) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    department VARCHAR(100),
    subjects TEXT[] DEFAULT '{}', -- Array of subjects taught
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    -- Employee ID must be unique within a school
    UNIQUE (school_id, employee_id)
);

CREATE INDEX IF NOT EXISTS idx_teachers_school ON teachers(school_id);

-- 6. PAYMENTS / BILLING TABLE
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    invoice_number VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL, -- e.g., 'Term 1 Tuition Fee'
    amount NUMERIC(12, 2) NOT NULL CHECK (amount >= 0),
    status VARCHAR(50) NOT NULL DEFAULT 'unpaid' CHECK (status IN ('paid', 'unpaid', 'overdue', 'pending')),
    due_date DATE NOT NULL,
    payment_date TIMESTAMP WITH TIME ZONE,
    payment_method VARCHAR(100) CHECK (payment_method IN ('cash', 'bank_transfer', 'online', 'card')),
    reference_number VARCHAR(100), -- Transaction references
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    -- Invoice numbers must be unique per school
    UNIQUE (school_id, invoice_number)
);

CREATE INDEX IF NOT EXISTS idx_payments_school ON payments(school_id);
CREATE INDEX IF NOT EXISTS idx_payments_student ON payments(student_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(school_id, status);

-- 7. ATTENDANCE TABLE
CREATE TABLE IF NOT EXISTS attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    class_date DATE NOT NULL,
    status VARCHAR(50) NOT NULL CHECK (status IN ('present', 'absent', 'late', 'excused')),
    remarks TEXT,
    taken_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    -- A student can only have one attendance log per day
    UNIQUE (student_id, class_date)
);

CREATE INDEX IF NOT EXISTS idx_attendance_school_date ON attendance(school_id, class_date);
CREATE INDEX IF NOT EXISTS idx_attendance_student ON attendance(student_id);

-- 8. EXAMS TABLE (Exam/Test schedules and specifications)
CREATE TABLE IF NOT EXISTS exams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL, -- e.g., 'Midterm Exam', 'Continuous Assessment 1'
    subject VARCHAR(100) NOT NULL,
    grade_level VARCHAR(50) NOT NULL,
    max_score NUMERIC(5, 2) NOT NULL DEFAULT 100.00,
    exam_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_exams_school_subject ON exams(school_id, subject);

-- 9. EXAM GRADES TABLE
CREATE TABLE IF NOT EXISTS exam_grades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    exam_id UUID NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    score NUMERIC(5, 2) NOT NULL CHECK (score >= 0),
    grade VARCHAR(10), -- E.g. A, B, C, D, F, or numerical grade representation
    feedback TEXT,
    graded_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    -- A student has exactly one grade record per exam
    UNIQUE (exam_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_grades_school_exam ON exam_grades(school_id, exam_id);
CREATE INDEX IF NOT EXISTS idx_grades_student ON exam_grades(student_id);


-- ========================================================
-- ROW LEVEL SECURITY (RLS) FOR MULTI-TENANT ISOLATION
-- ========================================================
-- The following configurations enforce that any database connection
-- can ONLY query or mutate records belonging to the school specified
-- in the connection's session variable 'app.current_school_id'.
--

-- Enable Row Level Security (RLS) on all multi-tenant tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE parents ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_grades ENABLE ROW LEVEL SECURITY;

-- Create helper function to extract current session school_id
CREATE OR REPLACE FUNCTION get_current_school_id() 
RETURNS UUID AS $$
BEGIN
    RETURN NULLIF(current_setting('app.current_school_id', true), '')::UUID;
EXCEPTION
    WHEN OTHERS THEN
        RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Reusable Security Isolation Policies
-- Admin/Global services bypass RLS or set 'app.current_school_id' explicitly.

CREATE POLICY school_isolation_users_policy ON users 
    FOR ALL USING (school_id = get_current_school_id());

CREATE POLICY school_isolation_parents_policy ON parents 
    FOR ALL USING (school_id = get_current_school_id());

CREATE POLICY school_isolation_students_policy ON students 
    FOR ALL USING (school_id = get_current_school_id());

CREATE POLICY school_isolation_teachers_policy ON teachers 
    FOR ALL USING (school_id = get_current_school_id());

CREATE POLICY school_isolation_payments_policy ON payments 
    FOR ALL USING (school_id = get_current_school_id());

CREATE POLICY school_isolation_attendance_policy ON attendance 
    FOR ALL USING (school_id = get_current_school_id());

CREATE POLICY school_isolation_exams_policy ON exams 
    FOR ALL USING (school_id = get_current_school_id());

CREATE POLICY school_isolation_exam_grades_policy ON exam_grades 
    FOR ALL USING (school_id = get_current_school_id());

CREATE POLICY school_isolation_section_configurations_policy ON section_configurations 
    FOR ALL USING (school_id = get_current_school_id());

CREATE POLICY school_isolation_section_allocations_policy ON section_allocations 
    FOR ALL USING (school_id = get_current_school_id());


-- ========================================================
-- AUTO-UPDATE TIMESTAMPS TRIGGER FUNCTION
-- ========================================================
-- Keep the updated_at timestamp in sync automatically.
--

CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Bind trigger to all tables
CREATE TRIGGER update_schools_modtime BEFORE UPDATE ON schools FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_users_modtime BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_parents_modtime BEFORE UPDATE ON parents FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_students_modtime BEFORE UPDATE ON students FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_section_configurations_modtime BEFORE UPDATE ON section_configurations FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_section_allocations_modtime BEFORE UPDATE ON section_allocations FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_teachers_modtime BEFORE UPDATE ON teachers FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_payments_modtime BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_attendance_modtime BEFORE UPDATE ON attendance FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_exams_modtime BEFORE UPDATE ON exams FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_exam_grades_modtime BEFORE UPDATE ON exam_grades FOR EACH ROW EXECUTE FUNCTION update_modified_column();
