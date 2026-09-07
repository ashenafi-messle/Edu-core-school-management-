-- Migration: Create assignments system for teacher workspace
-- This creates tables for managing assignments, submissions, and grading

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- ASSIGNMENTS TABLE
-- ==========================================
-- Stores published assignments and homework tasks created by teachers
CREATE TABLE IF NOT EXISTS assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    teacher_id UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
    subject_id UUID REFERENCES subjects(id) ON DELETE SET NULL,
    
    -- Assignment details
    title VARCHAR(255) NOT NULL,
    description TEXT,
    assignment_type VARCHAR(50) NOT NULL CHECK (assignment_type IN ('homework', 'assignment', 'project')),
    instructions TEXT,
    
    -- Academic context
    academic_year_id UUID REFERENCES academic_years(id) ON DELETE SET NULL,
    grade_level VARCHAR(50),
    section_name VARCHAR(50),
    
    -- Grading and scheduling
    max_marks NUMERIC(5, 2) NOT NULL DEFAULT 100.00,
    due_date TIMESTAMP WITH TIME ZONE NOT NULL,
    assigned_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Status tracking
    status VARCHAR(50) DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
    
    -- Attachments (stored as JSON array of file metadata)
    attachments JSONB DEFAULT '[]'::jsonb,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Ensure assignment title is unique per teacher per academic context
    CONSTRAINT assignments_unique UNIQUE (teacher_id, title, academic_year_id, grade_level, section_name)
);

-- Indexes for assignments
CREATE INDEX IF NOT EXISTS idx_assignments_school ON assignments(school_id);
CREATE INDEX IF NOT EXISTS idx_assignments_teacher ON assignments(teacher_id);
CREATE INDEX IF NOT EXISTS idx_assignments_subject ON assignments(subject_id);
CREATE INDEX IF NOT EXISTS idx_assignments_academic_year ON assignments(academic_year_id);
CREATE INDEX IF NOT EXISTS idx_assignments_grade_section ON assignments(grade_level, section_name);
CREATE INDEX IF NOT EXISTS idx_assignments_status ON assignments(school_id, status);
CREATE INDEX IF NOT EXISTS idx_assignments_due_date ON assignments(due_date);
CREATE INDEX IF NOT EXISTS idx_assignments_type ON assignments(assignment_type);

-- ==========================================
-- ASSIGNMENT SUBMISSIONS TABLE
-- ==========================================
-- Stores student submissions for assignments
CREATE TABLE IF NOT EXISTS assignment_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    assignment_id UUID NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    
    -- Submission details
    submission_status VARCHAR(50) DEFAULT 'draft' CHECK (submission_status IN ('draft', 'submitted', 'late', 'graded')),
    submitted_date TIMESTAMP WITH TIME ZONE,
    
    -- Student response
    student_answer TEXT,
    student_comments TEXT,
    
    -- File attachments
    file_attachments JSONB DEFAULT '[]'::jsonb,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Ensure one submission per student per assignment
    CONSTRAINT assignment_submissions_unique UNIQUE (assignment_id, student_id)
);

-- Indexes for assignment submissions
CREATE INDEX IF NOT EXISTS idx_assignment_submissions_school ON assignment_submissions(school_id);
CREATE INDEX IF NOT EXISTS idx_assignment_submissions_assignment ON assignment_submissions(assignment_id);
CREATE INDEX IF NOT EXISTS idx_assignment_submissions_student ON assignment_submissions(student_id);
CREATE INDEX IF NOT EXISTS idx_assignment_submissions_status ON assignment_submissions(submission_status);
CREATE INDEX IF NOT EXISTS idx_assignment_submissions_submitted_date ON assignment_submissions(submitted_date);

-- ==========================================
-- ASSIGNMENT GRADES TABLE
-- ==========================================
-- Stores grading information for assignment submissions
CREATE TABLE IF NOT EXISTS assignment_grades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    submission_id UUID NOT NULL REFERENCES assignment_submissions(id) ON DELETE CASCADE,
    assignment_id UUID NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    
    -- Grading details
    score NUMERIC(5, 2) NOT NULL CHECK (score >= 0),
    max_score NUMERIC(5, 2) NOT NULL,
    letter_grade VARCHAR(10),
    
    -- Feedback
    teacher_feedback TEXT,
    graded_by UUID REFERENCES users(id) ON DELETE SET NULL,
    graded_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Ensure one grade per submission
    CONSTRAINT assignment_grades_unique UNIQUE (submission_id)
);

-- Indexes for assignment grades
CREATE INDEX IF NOT EXISTS idx_assignment_grades_school ON assignment_grades(school_id);
CREATE INDEX IF NOT EXISTS idx_assignment_grades_submission ON assignment_grades(submission_id);
CREATE INDEX IF NOT EXISTS idx_assignment_grades_assignment ON assignment_grades(assignment_id);
CREATE INDEX IF NOT EXISTS idx_assignment_grades_student ON assignment_grades(student_id);
CREATE INDEX IF NOT EXISTS idx_assignment_grades_graded_by ON assignment_grades(graded_by);

-- ==========================================
-- ROW LEVEL SECURITY (RLS)
-- ==========================================

-- Enable RLS on all assignment tables
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignment_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignment_grades ENABLE ROW LEVEL SECURITY;

-- RLS Policies for assignments
CREATE POLICY school_isolation_assignments_policy ON assignments 
    FOR ALL USING (school_id = get_current_school_id());

-- RLS Policies for assignment submissions
CREATE POLICY school_isolation_assignment_submissions_policy ON assignment_submissions 
    FOR ALL USING (school_id = get_current_school_id());

-- RLS Policies for assignment grades
CREATE POLICY school_isolation_assignment_grades_policy ON assignment_grades 
    FOR ALL USING (school_id = get_current_school_id());

-- ==========================================
-- AUTO-UPDATE TIMESTAMPS TRIGGER
-- ==========================================

-- Bind trigger to assignment tables
CREATE TRIGGER update_assignments_modtime BEFORE UPDATE ON assignments FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_assignment_submissions_modtime BEFORE UPDATE ON assignment_submissions FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_assignment_grades_modtime BEFORE UPDATE ON assignment_grades FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- ==========================================
-- COMMENTS AND DOCUMENTATION
-- ==========================================

COMMENT ON TABLE assignments IS 'Published assignments and homework tasks created by teachers';
COMMENT ON COLUMN assignments.assignment_type IS 'Type: homework (no upload required), assignment (requires submission), project';
COMMENT ON COLUMN assignments.attachments IS 'JSON array of file metadata: [{name, size, type, url}]';
COMMENT ON COLUMN assignments.status IS 'Draft: not yet visible to students, Published: visible and active, Archived: closed for submissions';

COMMENT ON TABLE assignment_submissions IS 'Student submissions for assignments with answers and file attachments';
COMMENT ON COLUMN assignment_submissions.submission_status IS 'Draft: saved by student, Submitted: finalized, Late: submitted after due date, Graded: has been evaluated';
COMMENT ON COLUMN assignment_submissions.file_attachments IS 'JSON array of submitted files: [{name, size, type, url}]';

COMMENT ON TABLE assignment_grades IS 'Grading records for assignment submissions with scores and feedback';
COMMENT ON COLUMN assignment_grades.letter_grade IS 'Calculated letter grade (A, B, C, D, F) based on score percentage';
COMMENT ON COLUMN assignment_grades.teacher_feedback IS 'Detailed feedback and comments from the teacher';

-- ==========================================
-- HELPER FUNCTIONS
-- ==========================================

-- Function to calculate letter grade based on score percentage
CREATE OR REPLACE FUNCTION calculate_letter_grade(score NUMERIC, max_score NUMERIC)
RETURNS VARCHAR(10) AS $$
DECLARE
    percentage NUMERIC;
BEGIN
    IF max_score = 0 THEN
        RETURN 'F';
    END IF;
    
    percentage := (score / max_score) * 100;
    
    IF percentage >= 90 THEN
        RETURN 'A';
    ELSIF percentage >= 80 THEN
        RETURN 'B';
    ELSIF percentage >= 70 THEN
        RETURN 'C';
    ELSIF percentage >= 60 THEN
        RETURN 'D';
    ELSE
        RETURN 'F';
    END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Trigger to automatically calculate letter grade when grade is created/updated
CREATE OR REPLACE FUNCTION auto_calculate_letter_grade()
RETURNS TRIGGER AS $$
BEGIN
    NEW.letter_grade := calculate_letter_grade(NEW.score, NEW.max_score);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auto_letter_grade BEFORE INSERT OR UPDATE ON assignment_grades
    FOR EACH ROW EXECUTE FUNCTION auto_calculate_letter_grade();

-- Function to check if submission is late
CREATE OR REPLACE FUNCTION check_late_submission(assignment_id UUID, submitted_date TIMESTAMP WITH TIME ZONE)
RETURNS BOOLEAN AS $$
DECLARE
    due_date TIMESTAMP WITH TIME ZONE;
BEGIN
    SELECT due_date INTO due_date FROM assignments WHERE id = assignment_id;
    
    IF due_date IS NULL THEN
        RETURN FALSE;
    END IF;
    
    RETURN submitted_date > due_date;
END;
$$ LANGUAGE plpgsql STABLE;