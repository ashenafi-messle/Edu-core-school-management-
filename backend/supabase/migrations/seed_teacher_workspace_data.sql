-- Seed data for testing teacher workspace classes and divisions page
-- This creates sample subjects, subject assignments, and timetable data for the teacher

-- First, let's create some sample subjects for the school
INSERT INTO subjects (id, school_id, subject_code, subject_name, description, category, weekly_hours, status)
VALUES 
    ('subj-001', 'a7b3c29d-4e8f-4d91-bd30-4e123456789a', 'MATH101', 'Algebra I', 'Fundamental algebra concepts and equations', 'Core', 5, 'Active'),
    ('subj-002', 'a7b3c29d-4e8f-4d91-bd30-4e123456789a', 'MATH201', 'Geometry', 'Plane and solid geometry', 'Core', 4, 'Active'),
    ('subj-003', 'a7b3c29d-4e8f-4d91-bd30-4e123456789a', 'MATH301', 'Calculus AB', 'Differential and integral calculus', 'Core', 6, 'Active'),
    ('subj-004', 'a7b3c29d-4e8f-4d91-bd30-4e123456789a', 'SCI101', 'Physics', 'Introduction to physics principles', 'Core', 4, 'Active'),
    ('subj-005', 'a7b3c29d-4e8f-4d91-bd30-4e123456789a', 'ENG101', 'English Literature', 'Classic and modern literature', 'Core', 4, 'Active')
ON CONFLICT (school_id, subject_code) DO NOTHING;

-- Create section configurations for different grades and sections
INSERT INTO section_configurations (id, school_id, grade_level, section_name, max_capacity, current_count, academic_year, is_active)
VALUES 
    ('sec-config-001', 'a7b3c29d-4e8f-4d91-bd30-4e123456789a', 'Grade 9', 'Section A', 30, 25, '2024-2025', true),
    ('sec-config-002', 'a7b3c29d-4e8f-4d91-bd30-4e123456789a', 'Grade 9', 'Section B', 30, 28, '2024-2025', true),
    ('sec-config-003', 'a7b3c29d-4e8f-4d91-bd30-4e123456789a', 'Grade 10', 'Section A', 30, 22, '2024-2025', true),
    ('sec-config-004', 'a7b3c29d-4e8f-4d91-bd30-4e123456789a', 'Grade 10', 'Section B', 30, 26, '2024-2025', true),
    ('sec-config-005', 'a7b3c29d-4e8f-4d91-bd30-4e123456789a', 'Grade 11', 'Section A', 25, 20, '2024-2025', true)
ON CONFLICT (school_id, grade_level, section_name, academic_year) DO NOTHING;

-- Update section_configurations with academic_year_id reference
UPDATE section_configurations 
SET academic_year_id = (
    SELECT id FROM academic_years 
    WHERE school_id = 'a7b3c29d-4e8f-4d91-bd30-4e123456789a' 
    AND year_name = '2024-2025'
    LIMIT 1
)
WHERE school_id = 'a7b3c29d-4e8f-4d91-bd30-4e123456789a';

-- Create subject assignments for the teacher (Sarah Jenkins - ID: f1e2d3c4-b5a6-9f8e-7d6c-5b4a3f2e1d0c)
INSERT INTO subject_assignments (id, school_id, teacher_id, subject_id, academic_year_id, semester, grade_level, section_name, role, sections_assigned, weekly_hours, assignment_date, status)
VALUES 
    -- Grade 9 assignments
    ('sa-001', 'a7b3c29d-4e8f-4d91-bd30-4e123456789a', 'f1e2d3c4-b5a6-9f8e-7d6c-5b4a3f2e1d0c', 'subj-001', 
     (SELECT id FROM academic_years WHERE school_id = 'a7b3c29d-4e8f-4d91-bd30-4e123456789a' AND year_name = '2024-2025' LIMIT 1), 
     'Fall', 'Grade 9', 'Section A', 'Primary Teacher', 1, 5, CURRENT_DATE, 'Active'),
    
    ('sa-002', 'a7b3c29d-4e8f-4d91-bd30-4e123456789a', 'f1e2d3c4-b5a6-9f8e-7d6c-5b4a3f2e1d0c', 'subj-001', 
     (SELECT id FROM academic_years WHERE school_id = 'a7b3c29d-4e8f-4d91-bd30-4e123456789a' AND year_name = '2024-2025' LIMIT 1), 
     'Fall', 'Grade 9', 'Section B', 'Primary Teacher', 1, 5, CURRENT_DATE, 'Active'),
    
    ('sa-003', 'a7b3c29d-4e8f-4d91-bd30-4e123456789a', 'f1e2d3c4-b5a6-9f8e-7d6c-5b4a3f2e1d0c', 'subj-002', 
     (SELECT id FROM academic_years WHERE school_id = 'a7b3c29d-4e8f-4d91-bd30-4e123456789a' AND year_name = '2024-2025' LIMIT 1), 
     'Fall', 'Grade 9', 'Section A', 'Primary Teacher', 1, 4, CURRENT_DATE, 'Active'),
    
    -- Grade 10 assignments
    ('sa-004', 'a7b3c29d-4e8f-4d91-bd30-4e123456789a', 'f1e2d3c4-b5a6-9f8e-7d6c-5b4a3f2e1d0c', 'subj-002', 
     (SELECT id FROM academic_years WHERE school_id = 'a7b3c29d-4e8f-4d91-bd30-4e123456789a' AND year_name = '2024-2025' LIMIT 1), 
     'Fall', 'Grade 10', 'Section A', 'Primary Teacher', 1, 4, CURRENT_DATE, 'Active'),
    
    ('sa-005', 'a7b3c29d-4e8f-4d91-bd30-4e123456789a', 'f1e2d3c4-b5a6-9f8e-7d6c-5b4a3f2e1d0c', 'subj-003', 
     (SELECT id FROM academic_years WHERE school_id = 'a7b3c29d-4e8f-4d91-bd30-4e123456789a' AND year_name = '2024-2025' LIMIT 1), 
     'Fall', 'Grade 10', 'Section A', 'Primary Teacher', 1, 6, CURRENT_DATE, 'Active'),
    
    ('sa-006', 'a7b3c29d-4e8f-4d91-bd30-4e123456789a', 'f1e2d3c4-b5a6-9f8e-7d6c-5b4a3f2e1d0c', 'subj-003', 
     (SELECT id FROM academic_years WHERE school_id = 'a7b3c29d-4e8f-4d91-bd30-4e123456789a' AND year_name = '2024-2025' LIMIT 1), 
     'Fall', 'Grade 10', 'Section B', 'Primary Teacher', 1, 6, CURRENT_DATE, 'Active'),
    
    -- Grade 11 assignments
    ('sa-007', 'a7b3c29d-4e8f-4d91-bd30-4e123456789a', 'f1e2d3c4-b5a6-9f8e-7d6c-5b4a3f2e1d0c', 'subj-003', 
     (SELECT id FROM academic_years WHERE school_id = 'a7b3c29d-4e8f-4d91-bd30-4e123456789a' AND year_name = '2024-2025' LIMIT 1), 
     'Fall', 'Grade 11', 'Section A', 'Primary Teacher', 1, 6, CURRENT_DATE, 'Active')
ON CONFLICT (teacher_id, subject_id, academic_year_id, semester, grade_level, section_name) DO NOTHING;

-- Create weekly timetable entries for the teacher
-- First, we need to get the time slot IDs
-- Assuming the default time slots from the migration exist

INSERT INTO weekly_timetables (id, school_id, academic_year_id, section_configuration_id, day_of_week, time_slot_id, subject_id, teacher_id, room_number, is_active)
VALUES 
    -- Monday schedule
    ('wt-001', 'a7b3c29d-4e8f-4d91-bd30-4e123456789a', 
     (SELECT id FROM academic_years WHERE school_id = 'a7b3c29d-4e8f-4d91-bd30-4e123456789a' AND year_name = '2024-2025' LIMIT 1),
     'sec-config-001', 'Monday', 
     (SELECT id FROM time_slots WHERE school_id = 'a7b3c29d-4e8f-4d91-bd30-4e123456789a' AND order_index = 1 LIMIT 1),
     'subj-001', 'f1e2d3c4-b5a6-9f8e-7d6c-5b4a3f2e1d0c', 'Room 101', true),
    
    ('wt-002', 'a7b3c29d-4e8f-4d91-bd30-4e123456789a', 
     (SELECT id FROM academic_years WHERE school_id = 'a7b3c29d-4e8f-4d91-bd30-4e123456789a' AND year_name = '2024-2025' LIMIT 1),
     'sec-config-003', 'Monday', 
     (SELECT id FROM time_slots WHERE school_id = 'a7b3c29d-4e8f-4d91-bd30-4e123456789a' AND order_index = 2 LIMIT 1),
     'subj-002', 'f1e2d3c4-b5a6-9f8e-7d6c-5b4a3f2e1d0c', 'Room 102', true),
    
    ('wt-003', 'a7b3c29d-4e8f-4d91-bd30-4e123456789a', 
     (SELECT id FROM academic_years WHERE school_id = 'a7b3c29d-4e8f-4d91-bd30-4e123456789a' AND year_name = '2024-2025' LIMIT 1),
     'sec-config-005', 'Monday', 
     (SELECT id FROM time_slots WHERE school_id = 'a7b3c29d-4e8f-4d91-bd30-4e123456789a' AND order_index = 4 LIMIT 1),
     'subj-003', 'f1e2d3c4-b5a6-9f8e-7d6c-5b4a3f2e1d0c', 'Room 201', true),
    
    -- Tuesday schedule
    ('wt-004', 'a7b3c29d-4e8f-4d91-bd30-4e123456789a', 
     (SELECT id FROM academic_years WHERE school_id = 'a7b3c29d-4e8f-4d91-bd30-4e123456789a' AND year_name = '2024-2025' LIMIT 1),
     'sec-config-002', 'Tuesday', 
     (SELECT id FROM time_slots WHERE school_id = 'a7b3c29d-4e8f-4d91-bd30-4e123456789a' AND order_index = 1 LIMIT 1),
     'subj-001', 'f1e2d3c4-b5a6-9f8e-7d6c-5b4a3f2e1d0c', 'Room 101', true),
    
    ('wt-005', 'a7b3c29d-4e8f-4d91-bd30-4e123456789a', 
     (SELECT id FROM academic_years WHERE school_id = 'a7b3c29d-4e8f-4d91-bd30-4e123456789a' AND year_name = '2024-2025' LIMIT 1),
     'sec-config-004', 'Tuesday', 
     (SELECT id FROM time_slots WHERE school_id = 'a7b3c29d-4e8f-4d91-bd30-4e123456789a' AND order_index = 2 LIMIT 1),
     'subj-003', 'f1e2d3c4-b5a6-9f8e-7d6c-5b4a3f2e1d0c', 'Room 202', true),
    
    -- Wednesday schedule
    ('wt-006', 'a7b3c29d-4e8f-4d91-bd30-4e123456789a', 
     (SELECT id FROM academic_years WHERE school_id = 'a7b3c29d-4e8f-4d91-bd30-4e123456789a' AND year_name = '2024-2025' LIMIT 1),
     'sec-config-001', 'Wednesday', 
     (SELECT id FROM time_slots WHERE school_id = 'a7b3c29d-4e8f-4d91-bd30-4e123456789a' AND order_index = 1 LIMIT 1),
     'subj-001', 'f1e2d3c4-b5a6-9f8e-7d6c-5b4a3f2e1d0c', 'Room 101', true),
    
    ('wt-007', 'a7b3c29d-4e8f-4d91-bd30-4e123456789a', 
     (SELECT id FROM academic_years WHERE school_id = 'a7b3c29d-4e8f-4d91-bd30-4e123456789a' AND year_name = '2024-2025' LIMIT 1),
     'sec-config-003', 'Wednesday', 
     (SELECT id FROM time_slots WHERE school_id = 'a7b3c29d-4e8f-4d91-bd30-4e123456789a' AND order_index = 3 LIMIT 1),
     'subj-002', 'f1e2d3c4-b5a6-9f8e-7d6c-5b4a3f2e1d0c', 'Room 102', true),
    
    -- Thursday schedule
    ('wt-008', 'a7b3c29d-4e8f-4d91-bd30-4e123456789a', 
     (SELECT id FROM academic_years WHERE school_id = 'a7b3c29d-4e8f-4d91-bd30-4e123456789a' AND year_name = '2024-2025' LIMIT 1),
     'sec-config-005', 'Thursday', 
     (SELECT id FROM time_slots WHERE school_id = 'a7b3c29d-4e8f-4d91-bd30-4e123456789a' AND order_index = 2 LIMIT 1),
     'subj-003', 'f1e2d3c4-b5a6-9f8e-7d6c-5b4a3f2e1d0c', 'Room 201', true),
    
    -- Friday schedule
    ('wt-009', 'a7b3c29d-4e8f-4d91-bd30-4e123456789a', 
     (SELECT id FROM academic_years WHERE school_id = 'a7b3c29d-4e8f-4d91-bd30-4e123456789a' AND year_name = '2024-2025' LIMIT 1),
     'sec-config-003', 'Friday', 
     (SELECT id FROM time_slots WHERE school_id = 'a7b3c29d-4e8f-4d91-bd30-4e123456789a' AND order_index = 1 LIMIT 1),
     'subj-002', 'f1e2d3c4-b5a6-9f8e-7d6c-5b4a3f2e1d0c', 'Room 102', true),
    
    ('wt-010', 'a7b3c29d-4e8f-4d91-bd30-4e123456789a', 
     (SELECT id FROM academic_years WHERE school_id = 'a7b3c29d-4e8f-4d91-bd30-4e123456789a' AND year_name = '2024-2025' LIMIT 1),
     'sec-config-004', 'Friday', 
     (SELECT id FROM time_slots WHERE school_id = 'a7b3c29d-4e8f-4d91-bd30-4e123456789a' AND order_index = 2 LIMIT 1),
     'subj-003', 'f1e2d3c4-b5a6-9f8e-7d6c-5b4a3f2e1d0c', 'Room 202', true)
ON CONFLICT (section_configuration_id, day_of_week, time_slot_id) DO NOTHING;

-- Update the teacher's assigned_grades and assigned_sections arrays
UPDATE teachers 
SET 
    assigned_grades = ARRAY['Grade 9', 'Grade 10', 'Grade 11'],
    assigned_sections = ARRAY['Section A', 'Section B'],
    weekly_load = '24 hrs/wk'
WHERE id = 'f1e2d3c4-b5a6-9f8e-7d6c-5b4a3f2e1d0c';
