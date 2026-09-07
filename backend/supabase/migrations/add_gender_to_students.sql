-- Migration: Add gender field to students table for section allocation
-- This script adds the gender field to support gender-based section allocation

-- Add gender column to students table
ALTER TABLE students 
ADD COLUMN IF NOT EXISTS gender VARCHAR(20) CHECK (gender IN ('male', 'female', 'other'));

-- Add index for grade and gender queries (for allocation performance)
CREATE INDEX IF NOT EXISTS idx_students_grade_gender ON students(school_id, grade_level, gender);

-- Update existing students to have 'other' as default gender if null
UPDATE students 
SET gender = 'other' 
WHERE gender IS NULL;

-- Add comment for documentation
COMMENT ON COLUMN students.gender IS 'Student gender for gender-balanced section allocation';
