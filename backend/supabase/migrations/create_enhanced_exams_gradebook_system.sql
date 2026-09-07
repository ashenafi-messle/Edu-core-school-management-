-- Migration: Create Enhanced Exams and Gradebook System
-- This creates comprehensive tables for exam management, publishing, and gradebook functionality

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- ENHANCED EXAMS TABLE
-- ==========================================
-- Enhanced version of exams table with more detailed exam management
CREATE TABLE IF NOT EXISTS enhanced_exams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    teacher_id UUID REFERENCES teachers(id) ON DELETE SET NULL,
    subject_id UUID REFERENCES subjects(id) ON DELETE SET NULL,
    
    -- Exam identification
    title VARCHAR(255) NOT NULL,
    exam_code VARCHAR(50) UNIQUE,
    description TEXT,
    
    -- Exam categorization
    exam_type VARCHAR(50) NOT NULL CHECK (exam_type IN ('quiz', 'midterm', 'final', 'assignment', 'project', 'practical', 'oral')),
    exam_category VARCHAR(50), -- e.g., 'formative', 'summative', 'diagnostic'
    term VARCHAR(50), -- e.g., 'Term 1', 'Term 2', 'Term 3'
    academic_year_id UUID REFERENCES academic_years(id) ON DELETE SET NULL,
    
    -- Academic context
    grade_level VARCHAR(50) NOT NULL,
    section_name VARCHAR(50),
    
    -- Grading and scheduling
    max_score NUMERIC(5, 2) NOT NULL DEFAULT 100.00,
    passing_score NUMERIC(5, 2) DEFAULT 40.00,
    duration_minutes INTEGER, -- Exam duration in minutes
    exam_date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    
    -- Exam venue and logistics
    venue VARCHAR(100),
    instructions TEXT,
    
    -- Status and workflow
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'scheduled', 'in_progress', 'completed', 'cancelled')),
    is_published BOOLEAN DEFAULT FALSE,
    published_at TIMESTAMP WITH TIME ZONE,
    published_by UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Attachments and resources
    question_paper_url VARCHAR(500),
    attachments JSONB DEFAULT '[]'::jsonb, -- Array of file metadata
    
    -- Grading settings
    grading_scale JSONB, -- Custom grading scale if needed
    allow_grading BOOLEAN DEFAULT TRUE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Ensure exam title is unique per teacher per academic context
    CONSTRAINT enhanced_exams_unique UNIQUE (teacher_id, title, academic_year_id, grade_level, section_name)
);

-- Indexes for enhanced exams
CREATE INDEX IF NOT EXISTS idx_enhanced_exams_school ON enhanced_exams(school_id);
CREATE INDEX IF NOT EXISTS idx_enhanced_exams_teacher ON enhanced_exams(teacher_id);
CREATE INDEX IF NOT EXISTS idx_enhanced_exams_subject ON enhanced_exams(subject_id);
CREATE INDEX IF NOT EXISTS idx_enhanced_exams_academic_year ON enhanced_exams(academic_year_id);
CREATE INDEX IF NOT EXISTS idx_enhanced_exams_grade_section ON enhanced_exams(grade_level, section_name);
CREATE INDEX IF NOT EXISTS idx_enhanced_exams_status ON enhanced_exams(school_id, status);
CREATE INDEX IF NOT EXISTS idx_enhanced_exams_exam_date ON enhanced_exams(exam_date);
CREATE INDEX IF NOT EXISTS idx_enhanced_exams_type ON enhanced_exams(exam_type);
CREATE INDEX IF NOT EXISTS idx_enhanced_exams_term ON enhanced_exams(school_id, term);
CREATE INDEX IF NOT EXISTS idx_enhanced_exams_published ON enhanced_exams(is_published);

-- ==========================================
-- EXAM REGISTRATIONS TABLE
-- ==========================================
-- Tracks which students are registered/eligible for specific exams
CREATE TABLE IF NOT EXISTS exam_registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    exam_id UUID NOT NULL REFERENCES enhanced_exams(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    
    -- Registration details
    registration_status VARCHAR(50) DEFAULT 'registered' CHECK (registration_status IN ('registered', 'absent', 'exempted', 'cancelled')),
    registration_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Attendance tracking
    attendance_status VARCHAR(50) CHECK (attendance_status IN ('present', 'absent', 'late', 'excused')),
    attendance_marked_by UUID REFERENCES users(id) ON DELETE SET NULL,
    attendance_marked_at TIMESTAMP WITH TIME ZONE,
    
    -- Exam room/seat assignment
    room_number VARCHAR(50),
    seat_number VARCHAR(20),
    
    -- Special accommodations
    special_accommodations TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Ensure one registration per student per exam
    CONSTRAINT exam_registrations_unique UNIQUE (exam_id, student_id)
);

-- Indexes for exam registrations
CREATE INDEX IF NOT EXISTS idx_exam_registrations_school ON exam_registrations(school_id);
CREATE INDEX IF NOT EXISTS idx_exam_registrations_exam ON exam_registrations(exam_id);
CREATE INDEX IF NOT EXISTS idx_exam_registrations_student ON exam_registrations(student_id);
CREATE INDEX IF NOT EXISTS idx_exam_registrations_status ON exam_registrations(registration_status);
CREATE INDEX IF NOT EXISTS idx_exam_registrations_attendance ON exam_registrations(attendance_status);

-- ==========================================
-- ENHANCED EXAM GRADES TABLE
-- ==========================================
-- Enhanced version of exam grades with detailed grading information
CREATE TABLE IF NOT EXISTS enhanced_exam_grades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    exam_id UUID NOT NULL REFERENCES enhanced_exams(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    registration_id UUID REFERENCES exam_registrations(id) ON DELETE SET NULL,
    
    -- Score details
    score NUMERIC(5, 2) NOT NULL CHECK (score >= 0),
    max_score NUMERIC(5, 2) NOT NULL,
    percentage NUMERIC(5, 2) GENERATED ALWAYS AS ((score / max_score) * 100) STORED,
    letter_grade VARCHAR(10),
    grade_point NUMERIC(3, 2), -- For GPA calculation
    
    -- Performance categorization
    performance_level VARCHAR(50) CHECK (performance_level IN ('excellent', 'good', 'satisfactory', 'needs_improvement', 'fail')),
    
    -- Feedback and assessment
    teacher_feedback TEXT,
    detailed_feedback JSONB, -- Structured feedback by criteria
    strengths TEXT,
    areas_for_improvement TEXT,
    
    -- Grading workflow
    graded_by UUID REFERENCES users(id) ON DELETE SET NULL,
    graded_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_verified BOOLEAN DEFAULT FALSE,
    verified_by UUID REFERENCES users(id) ON DELETE SET NULL,
    verified_at TIMESTAMP WITH TIME ZONE,
    
    -- Moderation and review
    is_moderated BOOLEAN DEFAULT FALSE,
    moderated_by UUID REFERENCES users(id) ON DELETE SET NULL,
    moderated_at TIMESTAMP WITH TIME ZONE,
    moderation_notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Ensure one grade per student per exam
    CONSTRAINT enhanced_exam_grades_unique UNIQUE (exam_id, student_id)
);

-- Indexes for enhanced exam grades
CREATE INDEX IF NOT EXISTS idx_enhanced_exam_grades_school ON enhanced_exam_grades(school_id);
CREATE INDEX IF NOT EXISTS idx_enhanced_exam_grades_exam ON enhanced_exam_grades(exam_id);
CREATE INDEX IF NOT EXISTS idx_enhanced_exam_grades_student ON enhanced_exam_grades(student_id);
CREATE INDEX IF NOT EXISTS idx_enhanced_exam_grades_graded_by ON enhanced_exam_grades(graded_by);
CREATE INDEX IF NOT EXISTS idx_enhanced_exam_grades_letter_grade ON enhanced_exam_grades(letter_grade);
CREATE INDEX IF NOT EXISTS idx_enhanced_exam_grades_performance ON enhanced_exam_grades(performance_level);
CREATE INDEX IF NOT EXISTS idx_enhanced_exam_grades_percentage ON enhanced_exam_grades(percentage);

-- ==========================================
-- GRADEBOOK ENTRIES TABLE
-- ==========================================
-- Central gradebook table that aggregates all assessments for gradebook views
CREATE TABLE IF NOT EXISTS gradebook_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    
    -- Assessment reference (can be exam or assignment)
    assessment_type VARCHAR(50) NOT NULL CHECK (assessment_type IN ('exam', 'assignment', 'quiz', 'project')),
    assessment_id UUID NOT NULL,
    assessment_title VARCHAR(255) NOT NULL,
    
    -- Subject and academic context
    subject_id UUID REFERENCES subjects(id) ON DELETE SET NULL,
    subject_name VARCHAR(100),
    grade_level VARCHAR(50) NOT NULL,
    section_name VARCHAR(50),
    term VARCHAR(50),
    academic_year_id UUID REFERENCES academic_years(id) ON DELETE SET NULL,
    
    -- Score information
    score NUMERIC(5, 2) NOT NULL,
    max_score NUMERIC(5, 2) NOT NULL,
    percentage NUMERIC(5, 2) GENERATED ALWAYS AS ((score / max_score) * 100) STORED,
    letter_grade VARCHAR(10),
    weight NUMERIC(3, 2) DEFAULT 1.00, -- Weight for GPA calculation
    
    -- Categorization
    category VARCHAR(50), -- e.g., 'formative', 'summative'
    
    -- Timestamps
    assessment_date DATE NOT NULL,
    graded_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for gradebook entries
CREATE INDEX IF NOT EXISTS idx_gradebook_entries_school ON gradebook_entries(school_id);
CREATE INDEX IF NOT EXISTS idx_gradebook_entries_student ON gradebook_entries(student_id);
CREATE INDEX IF NOT EXISTS idx_gradebook_entries_subject ON gradebook_entries(subject_id);
CREATE INDEX IF NOT EXISTS idx_gradebook_entries_academic_year ON gradebook_entries(academic_year_id);
CREATE INDEX IF NOT EXISTS idx_gradebook_entries_grade_section ON gradebook_entries(grade_level, section_name);
CREATE INDEX IF NOT EXISTS idx_gradebook_entries_term ON gradebook_entries(school_id, term);
CREATE INDEX IF NOT EXISTS idx_gradebook_entries_assessment ON gradebook_entries(assessment_type, assessment_id);
CREATE INDEX IF NOT EXISTS idx_gradebook_entries_date ON gradebook_entries(assessment_date);

-- ==========================================
-- CLASS PERFORMANCE SUMMARY TABLE
-- ==========================================
-- Stores aggregated class performance data for quick analytics
CREATE TABLE IF NOT EXISTS class_performance_summary (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    exam_id UUID REFERENCES enhanced_exams(id) ON DELETE SET NULL,
    subject_id UUID REFERENCES subjects(id) ON DELETE SET NULL,
    
    -- Class identification
    grade_level VARCHAR(50) NOT NULL,
    section_name VARCHAR(50),
    term VARCHAR(50),
    academic_year_id UUID REFERENCES academic_years(id) ON DELETE SET NULL,
    
    -- Performance statistics
    total_students INTEGER DEFAULT 0,
    students_attempted INTEGER DEFAULT 0,
    students_absent INTEGER DEFAULT 0,
    
    -- Score statistics
    average_score NUMERIC(5, 2),
    highest_score NUMERIC(5, 2),
    lowest_score NUMERIC(5, 2),
    median_score NUMERIC(5, 2),
    standard_deviation NUMERIC(5, 2),
    
    -- Grade distribution
    grade_a_count INTEGER DEFAULT 0,
    grade_b_count INTEGER DEFAULT 0,
    grade_c_count INTEGER DEFAULT 0,
    grade_d_count INTEGER DEFAULT 0,
    grade_f_count INTEGER DEFAULT 0,
    
    -- Performance levels
    excellent_count INTEGER DEFAULT 0,
    good_count INTEGER DEFAULT 0,
    satisfactory_count INTEGER DEFAULT 0,
    needs_improvement_count INTEGER DEFAULT 0,
    fail_count INTEGER DEFAULT 0,
    
    -- Pass rate
    pass_rate NUMERIC(5, 2),
    
    -- Timestamps
    last_calculated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Ensure one summary per exam per class
    CONSTRAINT class_performance_summary_unique UNIQUE (exam_id, grade_level, section_name, academic_year_id)
);

-- Indexes for class performance summary
CREATE INDEX IF NOT EXISTS idx_class_performance_school ON class_performance_summary(school_id);
CREATE INDEX IF NOT EXISTS idx_class_performance_exam ON class_performance_summary(exam_id);
CREATE INDEX IF NOT EXISTS idx_class_performance_subject ON class_performance_summary(subject_id);
CREATE INDEX IF NOT EXISTS idx_class_performance_grade_section ON class_performance_summary(grade_level, section_name);
CREATE INDEX IF NOT EXISTS idx_class_performance_academic_year ON class_performance_summary(academic_year_id);
CREATE INDEX IF NOT EXISTS idx_class_performance_term ON class_performance_summary(school_id, term);

-- ==========================================
-- STUDENT GRADE SUMMARY TABLE
-- ==========================================
-- Stores aggregated student performance for report cards
CREATE TABLE IF NOT EXISTS student_grade_summary (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    
    -- Academic context
    academic_year_id UUID REFERENCES academic_years(id) ON DELETE SET NULL,
    term VARCHAR(50),
    grade_level VARCHAR(50) NOT NULL,
    section_name VARCHAR(50),
    
    -- Overall performance
    total_assessments INTEGER DEFAULT 0,
    assessments_completed INTEGER DEFAULT 0,
    overall_average NUMERIC(5, 2),
    overall_gpa NUMERIC(3, 2),
    class_rank INTEGER,
    total_students_in_class INTEGER,
    
    -- Subject-wise performance (JSONB for flexibility)
    subject_performance JSONB DEFAULT '{}'::jsonb, -- {subject_id: {average, grade, rank}}
    
    -- Grade distribution
    total_a INTEGER DEFAULT 0,
    total_b INTEGER DEFAULT 0,
    total_c INTEGER DEFAULT 0,
    total_d INTEGER DEFAULT 0,
    total_f INTEGER DEFAULT 0,
    
    -- Attendance impact
    attendance_percentage NUMERIC(5, 2),
    
    -- Remarks
    class_teacher_remarks TEXT,
    principal_remarks TEXT,
    
    -- Timestamps
    last_calculated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Ensure one summary per student per term
    CONSTRAINT student_grade_summary_unique UNIQUE (student_id, academic_year_id, term)
);

-- Indexes for student grade summary
CREATE INDEX IF NOT EXISTS idx_student_grade_summary_school ON student_grade_summary(school_id);
CREATE INDEX IF NOT EXISTS idx_student_grade_summary_student ON student_grade_summary(student_id);
CREATE INDEX IF NOT EXISTS idx_student_grade_summary_academic_year ON student_grade_summary(academic_year_id);
CREATE INDEX IF NOT EXISTS idx_student_grade_summary_term ON student_grade_summary(school_id, term);
CREATE INDEX IF NOT EXISTS idx_student_grade_summary_grade_section ON student_grade_summary(grade_level, section_name);
CREATE INDEX IF NOT EXISTS idx_student_grade_summary_rank ON student_grade_summary(class_rank);

-- ==========================================
-- ROW LEVEL SECURITY (RLS)
-- ==========================================

-- Enable RLS on all enhanced exam tables
ALTER TABLE enhanced_exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE enhanced_exam_grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE gradebook_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_performance_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_grade_summary ENABLE ROW LEVEL SECURITY;

-- RLS Policies for enhanced exams
DROP POLICY IF EXISTS school_isolation_enhanced_exams_policy ON enhanced_exams;
CREATE POLICY school_isolation_enhanced_exams_policy ON enhanced_exams 
    FOR ALL USING (school_id = get_current_school_id());

-- RLS Policies for exam registrations
DROP POLICY IF EXISTS school_isolation_exam_registrations_policy ON exam_registrations;
CREATE POLICY school_isolation_exam_registrations_policy ON exam_registrations 
    FOR ALL USING (school_id = get_current_school_id());

-- RLS Policies for enhanced exam grades
DROP POLICY IF EXISTS school_isolation_enhanced_exam_grades_policy ON enhanced_exam_grades;
CREATE POLICY school_isolation_enhanced_exam_grades_policy ON enhanced_exam_grades 
    FOR ALL USING (school_id = get_current_school_id());

-- RLS Policies for gradebook entries
DROP POLICY IF EXISTS school_isolation_gradebook_entries_policy ON gradebook_entries;
CREATE POLICY school_isolation_gradebook_entries_policy ON gradebook_entries 
    FOR ALL USING (school_id = get_current_school_id());

-- RLS Policies for class performance summary
DROP POLICY IF EXISTS school_isolation_class_performance_summary_policy ON class_performance_summary;
CREATE POLICY school_isolation_class_performance_summary_policy ON class_performance_summary 
    FOR ALL USING (school_id = get_current_school_id());

-- RLS Policies for student grade summary
DROP POLICY IF EXISTS school_isolation_student_grade_summary_policy ON student_grade_summary;
CREATE POLICY school_isolation_student_grade_summary_policy ON student_grade_summary 
    FOR ALL USING (school_id = get_current_school_id());

-- ==========================================
-- AUTO-UPDATE TIMESTAMPS TRIGGER
-- ==========================================

-- Bind trigger to enhanced exam tables
DROP TRIGGER IF EXISTS update_enhanced_exams_modtime ON enhanced_exams;
CREATE TRIGGER update_enhanced_exams_modtime BEFORE UPDATE ON enhanced_exams FOR EACH ROW EXECUTE FUNCTION update_modified_column();
DROP TRIGGER IF EXISTS update_exam_registrations_modtime ON exam_registrations;
CREATE TRIGGER update_exam_registrations_modtime BEFORE UPDATE ON exam_registrations FOR EACH ROW EXECUTE FUNCTION update_modified_column();
DROP TRIGGER IF EXISTS update_enhanced_exam_grades_modtime ON enhanced_exam_grades;
CREATE TRIGGER update_enhanced_exam_grades_modtime BEFORE UPDATE ON enhanced_exam_grades FOR EACH ROW EXECUTE FUNCTION update_modified_column();
DROP TRIGGER IF EXISTS update_gradebook_entries_modtime ON gradebook_entries;
CREATE TRIGGER update_gradebook_entries_modtime BEFORE UPDATE ON gradebook_entries FOR EACH ROW EXECUTE FUNCTION update_modified_column();
DROP TRIGGER IF EXISTS update_class_performance_summary_modtime ON class_performance_summary;
CREATE TRIGGER update_class_performance_summary_modtime BEFORE UPDATE ON class_performance_summary FOR EACH ROW EXECUTE FUNCTION update_modified_column();
DROP TRIGGER IF EXISTS update_student_grade_summary_modtime ON student_grade_summary;
CREATE TRIGGER update_student_grade_summary_modtime BEFORE UPDATE ON student_grade_summary FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- ==========================================
-- HELPER FUNCTIONS
-- ==========================================

-- Function to calculate letter grade based on percentage
CREATE OR REPLACE FUNCTION calculate_enhanced_letter_grade(percentage NUMERIC)
RETURNS VARCHAR(10) AS $$
BEGIN
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

-- Function to calculate grade point (4.0 scale)
CREATE OR REPLACE FUNCTION calculate_grade_point(letter_grade VARCHAR)
RETURNS NUMERIC(3, 2) AS $$
BEGIN
    CASE letter_grade
        WHEN 'A' THEN RETURN 4.0;
        WHEN 'B' THEN RETURN 3.0;
        WHEN 'C' THEN RETURN 2.0;
        WHEN 'D' THEN RETURN 1.0;
        WHEN 'F' THEN RETURN 0.0;
        ELSE RETURN 0.0;
    END CASE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to determine performance level
CREATE OR REPLACE FUNCTION determine_performance_level(percentage NUMERIC)
RETURNS VARCHAR(50) AS $$
BEGIN
    IF percentage >= 90 THEN
        RETURN 'excellent';
    ELSIF percentage >= 75 THEN
        RETURN 'good';
    ELSIF percentage >= 60 THEN
        RETURN 'satisfactory';
    ELSIF percentage >= 40 THEN
        RETURN 'needs_improvement';
    ELSE
        RETURN 'fail';
    END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Trigger to automatically calculate letter grade and performance level
CREATE OR REPLACE FUNCTION auto_calculate_enhanced_grade_metrics()
RETURNS TRIGGER AS $$
BEGIN
    NEW.letter_grade := calculate_enhanced_letter_grade(NEW.percentage);
    NEW.performance_level := determine_performance_level(NEW.percentage);
    NEW.grade_point := calculate_grade_point(NEW.letter_grade);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_auto_enhanced_grade_metrics ON enhanced_exam_grades;
CREATE TRIGGER trigger_auto_enhanced_grade_metrics BEFORE INSERT OR UPDATE ON enhanced_exam_grades
    FOR EACH ROW EXECUTE FUNCTION auto_calculate_enhanced_grade_metrics();

-- Function to register students for an exam based on grade/section
CREATE OR REPLACE FUNCTION register_students_for_exam(exam_id UUID, grade_level VARCHAR, section_name VARCHAR DEFAULT NULL)
RETURNS INTEGER AS $$
DECLARE
    registered_count INTEGER;
BEGIN
    INSERT INTO exam_registrations (school_id, exam_id, student_id, registration_status)
    SELECT 
        s.school_id,
        exam_id,
        s.id,
        'registered'
    FROM students s
    WHERE s.grade_level = grade_level
    AND (section_name IS NULL OR s.section = section_name)
    AND NOT EXISTS (
        SELECT 1 FROM exam_registrations er 
        WHERE er.exam_id = exam_id AND er.student_id = s.id
    );
    
    GET DIAGNOSTICS registered_count = ROW_COUNT;
    RETURN registered_count;
END;
$$ LANGUAGE plpgsql;

-- Function to update class performance summary
CREATE OR REPLACE FUNCTION update_class_performance_summary(exam_id_param UUID)
RETURNS VOID AS $$
DECLARE
    exam_record RECORD;
    stats RECORD;
BEGIN
    -- Get exam details
    SELECT * INTO exam_record FROM enhanced_exams WHERE id = exam_id_param;
    
    IF NOT FOUND THEN
        RETURN;
    END IF;
    
    -- Calculate statistics
    SELECT 
        COUNT(*) as total_students,
        COUNT(CASE WHEN eg.score IS NOT NULL THEN 1 END) as students_attempted,
        COUNT(CASE WHEN eg.score IS NULL THEN 1 END) as students_absent,
        AVG(eg.percentage) as average_score,
        MAX(eg.percentage) as highest_score,
        MIN(eg.percentage) as lowest_score,
        PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY eg.percentage) as median_score,
        STDDEV(eg.percentage) as standard_deviation,
        COUNT(CASE WHEN eg.letter_grade = 'A' THEN 1 END) as grade_a_count,
        COUNT(CASE WHEN eg.letter_grade = 'B' THEN 1 END) as grade_b_count,
        COUNT(CASE WHEN eg.letter_grade = 'C' THEN 1 END) as grade_c_count,
        COUNT(CASE WHEN eg.letter_grade = 'D' THEN 1 END) as grade_d_count,
        COUNT(CASE WHEN eg.letter_grade = 'F' THEN 1 END) as grade_f_count,
        COUNT(CASE WHEN eg.performance_level = 'excellent' THEN 1 END) as excellent_count,
        COUNT(CASE WHEN eg.performance_level = 'good' THEN 1 END) as good_count,
        COUNT(CASE WHEN eg.performance_level = 'satisfactory' THEN 1 END) as satisfactory_count,
        COUNT(CASE WHEN eg.performance_level = 'needs_improvement' THEN 1 END) as needs_improvement_count,
        COUNT(CASE WHEN eg.performance_level = 'fail' THEN 1 END) as fail_count,
        (COUNT(CASE WHEN eg.letter_grade IN ('A', 'B', 'C', 'D') THEN 1 END) * 100.0 / NULLIF(COUNT(*), 0)) as pass_rate
    INTO stats
    FROM enhanced_exam_grades eg
    JOIN exam_registrations er ON eg.registration_id = er.id
    WHERE eg.exam_id = exam_id_param;
    
    -- Update or insert summary
    INSERT INTO class_performance_summary (
        school_id, exam_id, subject_id, grade_level, section_name, term, academic_year_id,
        total_students, students_attempted, students_absent,
        average_score, highest_score, lowest_score, median_score, standard_deviation,
        grade_a_count, grade_b_count, grade_c_count, grade_d_count, grade_f_count,
        excellent_count, good_count, satisfactory_count, needs_improvement_count, fail_count,
        pass_rate, last_calculated_at
    ) VALUES (
        exam_record.school_id, exam_id_param, exam_record.subject_id, exam_record.grade_level, 
        exam_record.section_name, exam_record.term, exam_record.academic_year_id,
        stats.total_students, stats.students_attempted, stats.students_absent,
        stats.average_score, stats.highest_score, stats.lowest_score, stats.median_score, stats.standard_deviation,
        stats.grade_a_count, stats.grade_b_count, stats.grade_c_count, stats.grade_d_count, stats.grade_f_count,
        stats.excellent_count, stats.good_count, stats.satisfactory_count, stats.needs_improvement_count, stats.fail_count,
        stats.pass_rate, CURRENT_TIMESTAMP
    )
    ON CONFLICT (exam_id, grade_level, section_name, academic_year_id)
    DO UPDATE SET
        total_students = stats.total_students,
        students_attempted = stats.students_attempted,
        students_absent = stats.students_absent,
        average_score = stats.average_score,
        highest_score = stats.highest_score,
        lowest_score = stats.lowest_score,
        median_score = stats.median_score,
        standard_deviation = stats.standard_deviation,
        grade_a_count = stats.grade_a_count,
        grade_b_count = stats.grade_b_count,
        grade_c_count = stats.grade_c_count,
        grade_d_count = stats.grade_d_count,
        grade_f_count = stats.grade_f_count,
        excellent_count = stats.excellent_count,
        good_count = stats.good_count,
        satisfactory_count = stats.satisfactory_count,
        needs_improvement_count = stats.needs_improvement_count,
        fail_count = stats.fail_count,
        pass_rate = stats.pass_rate,
        last_calculated_at = CURRENT_TIMESTAMP;
END;
$$ LANGUAGE plpgsql;

-- ==========================================
-- COMMENTS AND DOCUMENTATION
-- ==========================================

COMMENT ON TABLE enhanced_exams IS 'Enhanced exam management with detailed scheduling, publishing workflow, and exam logistics';
COMMENT ON COLUMN enhanced_exams.exam_type IS 'Type of assessment: quiz, midterm, final, assignment, project, practical, oral';
COMMENT ON COLUMN enhanced_exams.status IS 'Draft: being prepared, Published: visible to students, Scheduled: date set, In_progress: exam ongoing, Completed: finished, Cancelled: cancelled';
COMMENT ON COLUMN enhanced_exams.is_published IS 'Whether exam has been published and visible to students';

COMMENT ON TABLE exam_registrations IS 'Student registrations for exams with attendance tracking and seat assignments';
COMMENT ON COLUMN exam_registrations.attendance_status IS 'Present, absent, late, or excused attendance status';

COMMENT ON TABLE enhanced_exam_grades IS 'Detailed student grades with feedback, verification, and moderation support';
COMMENT ON COLUMN enhanced_exam_grades.performance_level IS 'Overall performance: excellent, good, satisfactory, needs_improvement, fail';
COMMENT ON COLUMN enhanced_exam_grades.is_verified IS 'Whether grade has been verified by senior staff';

COMMENT ON TABLE gradebook_entries IS 'Central gradebook aggregating all assessments for comprehensive student performance tracking';
COMMENT ON COLUMN gradebook_entries.weight IS 'Weight factor for GPA and overall average calculations';

COMMENT ON TABLE class_performance_summary IS 'Aggregated class performance statistics for analytics and reporting';
COMMENT ON COLUMN class_performance_summary.pass_rate IS 'Percentage of students who passed the exam';

COMMENT ON TABLE student_grade_summary IS 'Student performance summaries for report cards and academic tracking';
COMMENT ON COLUMN student_grade_summary.subject_performance IS 'JSONB object containing subject-wise performance data';