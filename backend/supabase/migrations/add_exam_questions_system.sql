-- Migration: Add Exam Questions System
-- This adds support for exam questions with different types (choice vs workout)

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- EXAM QUESTIONS TABLE
-- ==========================================
-- Stores individual questions for exams with support for different question types
CREATE TABLE IF NOT EXISTS exam_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    exam_id UUID NOT NULL REFERENCES enhanced_exams(id) ON DELETE CASCADE,
    
    -- Question identification
    question_number INTEGER NOT NULL,
    question_text TEXT NOT NULL,
    question_type VARCHAR(50) NOT NULL CHECK (question_type IN ('choice', 'workout', 'true_false', 'fill_blank', 'essay')),
    
    -- Question metadata
    points NUMERIC(5, 2) NOT NULL DEFAULT 1.00,
    is_required BOOLEAN DEFAULT TRUE,
    explanation TEXT, -- Explanation for the correct answer
    
    -- Choice question specific fields
    choices JSONB DEFAULT '[]'::jsonb, -- Array of choice options for choice questions
    correct_answer JSONB, -- Correct answer(s) - can be single choice or multiple
    
    -- Workout question specific fields
    answer_places JSONB DEFAULT '[]'::jsonb, -- Array of answer place configurations for workout questions
    expected_answer TEXT, -- Expected answer for workout/essay questions
    
    -- Media attachments
    question_image_url VARCHAR(500),
    attachments JSONB DEFAULT '[]'::jsonb, -- Array of file metadata
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Ensure unique question numbers per exam
    CONSTRAINT exam_questions_unique UNIQUE (exam_id, question_number)
);

-- Indexes for exam questions
CREATE INDEX IF NOT EXISTS idx_exam_questions_school ON exam_questions(school_id);
CREATE INDEX IF NOT EXISTS idx_exam_questions_exam ON exam_questions(exam_id);
CREATE INDEX IF NOT EXISTS idx_exam_questions_type ON exam_questions(question_type);
CREATE INDEX IF NOT EXISTS idx_exam_questions_number ON exam_questions(exam_id, question_number);

-- ==========================================
-- STUDENT EXAM ANSWERS TABLE
-- ==========================================
-- Stores student answers for exam questions
CREATE TABLE IF NOT EXISTS student_exam_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    exam_id UUID NOT NULL REFERENCES enhanced_exams(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES exam_questions(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    registration_id UUID REFERENCES exam_registrations(id) ON DELETE SET NULL,
    
    -- Answer data
    answer_text TEXT, -- Text answer for workout/essay questions
    selected_choices JSONB DEFAULT '[]'::jsonb, -- Selected choices for choice questions
    answer_places_filled JSONB DEFAULT '{}'::jsonb, -- Filled answer places for workout questions
    
    -- Answer metadata
    is_correct BOOLEAN,
    points_earned NUMERIC(5, 2) DEFAULT 0.00,
    auto_graded BOOLEAN DEFAULT FALSE,
    
    -- Timestamps
    answered_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Ensure one answer per student per question
    CONSTRAINT student_exam_answers_unique UNIQUE (student_id, question_id)
);

-- Indexes for student exam answers
CREATE INDEX IF NOT EXISTS idx_student_exam_answers_school ON student_exam_answers(school_id);
CREATE INDEX IF NOT EXISTS idx_student_exam_answers_exam ON student_exam_answers(exam_id);
CREATE INDEX IF NOT EXISTS idx_student_exam_answers_question ON student_exam_answers(question_id);
CREATE INDEX IF NOT EXISTS idx_student_exam_answers_student ON student_exam_answers(student_id);
CREATE INDEX IF NOT EXISTS idx_student_exam_answers_registration ON student_exam_answers(registration_id);

-- ==========================================
-- ROW LEVEL SECURITY (RLS)
-- ==========================================

-- Enable RLS on exam questions tables
ALTER TABLE exam_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_exam_answers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for exam questions
CREATE POLICY school_isolation_exam_questions_policy ON exam_questions 
    FOR ALL USING (school_id = get_current_school_id());

-- RLS Policies for student exam answers
CREATE POLICY school_isolation_student_exam_answers_policy ON student_exam_answers 
    FOR ALL USING (school_id = get_current_school_id());

-- ==========================================
-- AUTO-UPDATE TIMESTAMPS TRIGGER
-- ==========================================

-- Bind trigger to exam questions tables
CREATE TRIGGER update_exam_questions_modtime BEFORE UPDATE ON exam_questions FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_student_exam_answers_modtime BEFORE UPDATE ON student_exam_answers FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- ==========================================
-- HELPER FUNCTIONS
-- ==========================================

-- Function to auto-grade choice questions
CREATE OR REPLACE FUNCTION auto_grade_choice_question(question_id UUID, student_answer JSONB)
RETURNS BOOLEAN AS $$
DECLARE
    question_record RECORD;
    correct_answer JSONB;
BEGIN
    -- Get question details
    SELECT correct_answer INTO correct_answer
    FROM exam_questions
    WHERE id = question_id;
    
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;
    
    -- Compare answers (handles both single and multiple choice)
    IF correct_answer::text = student_answer::text THEN
        RETURN TRUE;
    ELSE
        RETURN FALSE;
    END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to calculate total exam score for a student
CREATE OR REPLACE FUNCTION calculate_student_exam_score(exam_id_param UUID, student_id_param UUID)
RETURNS NUMERIC(5, 2) AS $$
DECLARE
    total_score NUMERIC(5, 2);
BEGIN
    SELECT COALESCE(SUM(points_earned), 0) INTO total_score
    FROM student_exam_answers
    WHERE exam_id = exam_id_param
    AND student_id = student_id_param;
    
    RETURN total_score;
END;
$$ LANGUAGE plpgsql;

-- ==========================================
-- COMMENTS AND DOCUMENTATION
-- ==========================================

COMMENT ON TABLE exam_questions IS 'Stores exam questions with support for different types: choice, workout, true_false, fill_blank, essay';
COMMENT ON COLUMN exam_questions.question_type IS 'Type of question: choice (multiple choice), workout (show your work), true_false, fill_blank, essay';
COMMENT ON COLUMN exam_questions.choices IS 'JSONB array of choice options for choice questions: [{id: "a", text: "Option A"}, ...]';
COMMENT ON COLUMN exam_questions.correct_answer IS 'JSONB correct answer: single choice ["a"] or multiple ["a", "c"]';
COMMENT ON COLUMN exam_questions.answer_places IS 'JSONB array of answer place configurations for workout questions: [{id: 1, type: "text", label: "Answer 1"}, ...]';
COMMENT ON COLUMN exam_questions.expected_answer IS 'Expected answer text for workout/essay questions (for manual grading)';

COMMENT ON TABLE student_exam_answers IS 'Stores student answers for exam questions with auto-grading support';
COMMENT ON COLUMN student_exam_answers.selected_choices IS 'JSONB array of selected choice IDs for choice questions';
COMMENT ON COLUMN student_exam_answers.answer_places_filled IS 'JSONB object mapping answer place IDs to student answers';
COMMENT ON COLUMN student_exam_answers.is_correct IS 'Whether the answer is correct (auto-graded for choice questions)';
COMMENT ON COLUMN student_exam_answers.points_earned IS 'Points earned for this answer (auto-calculated for correct answers)';
