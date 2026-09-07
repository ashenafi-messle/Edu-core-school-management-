-- Seed data for assignments system
-- This creates sample assignments, submissions, and grades for testing

-- First, let's get some existing data to reference
-- We'll use the teacher ID from the seed_teacher_workspace_data.sql migration

-- Sample assignments for the teacher
INSERT INTO assignments (id, school_id, teacher_id, subject_id, title, description, assignment_type, instructions, academic_year_id, grade_level, section_name, max_marks, due_date, status, attachments) VALUES
  (
    gen_random_uuid(),
    (SELECT id FROM schools LIMIT 1),
    (SELECT id FROM teachers WHERE employee_id = 'EMP-TEACH-820' LIMIT 1),
    (SELECT id FROM subjects WHERE subject_code = 'CHEM101' LIMIT 1),
    'Acid-Base Titration Lab Report',
    'Complete the lab report for the acid-base titration experiment conducted in class.',
    'assignment',
    'Include data tables, calculations, error analysis, and conclusions. Follow the standard lab report format as discussed in class.',
    (SELECT id FROM academic_years WHERE is_active = true LIMIT 1),
    'Grade 10',
    'Section A',
    25.00,
    CURRENT_DATE + INTERVAL '7 days',
    'published',
    '[{"name": "lab_report_template.pdf", "size": "245 KB", "type": "application/pdf", "url": "/templates/lab_report_template.pdf"}]'::jsonb
  ),
  (
    gen_random_uuid(),
    (SELECT id FROM schools LIMIT 1),
    (SELECT id FROM teachers WHERE employee_id = 'EMP-TEACH-820' LIMIT 1),
    (SELECT id FROM subjects WHERE subject_code = 'MATH201' LIMIT 1),
    'Integration by Parts Practice Problems',
    'Complete the integration by parts drill problems from Chapter 12.',
    'homework',
    'Solve problems 5-15 from the textbook. Show all work and intermediate steps.',
    (SELECT id FROM academic_years WHERE is_active = true LIMIT 1),
    'Grade 11',
    'Section B',
    20.00,
    CURRENT_DATE + INTERVAL '3 days',
    'published',
    '[]'::jsonb
  ),
  (
    gen_random_uuid(),
    (SELECT id FROM schools LIMIT 1),
    (SELECT id FROM teachers WHERE employee_id = 'EMP-TEACH-820' LIMIT 1),
    (SELECT id FROM subjects WHERE subject_code = 'HIST101' LIMIT 1),
    'Cold War Proxy Conflicts Research Essay',
    'Research and write about Cold War proxy conflicts.',
    'project',
    'Choose 3 major proxy conflicts from the Cold War era and analyze their geopolitical impact. Essay should be 1500-2000 words with proper citations.',
    (SELECT id FROM academic_years WHERE is_active = true LIMIT 1),
    'Grade 12',
    'Section A',
    50.00,
    CURRENT_DATE + INTERVAL '14 days',
    'published',
    '[{"name": "essay_guidelines.pdf", "size": "180 KB", "type": "application/pdf", "url": "/guidelines/essay_guidelines.pdf"}, {"name": "citation_style_guide.docx", "size": "120 KB", "type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "url": "/guidelines/citation_style_guide.docx"}]'::jsonb
  );

-- Sample student submissions
-- Get the assignment IDs we just created
DO $$
DECLARE
    v_chem_assignment_id UUID;
    v_math_assignment_id UUID;
    v_hist_assignment_id UUID;
    v_student_1_id UUID;
    v_student_2_id UUID;
    v_student_3_id UUID;
BEGIN
    -- Get assignment IDs
    SELECT id INTO v_chem_assignment_id FROM assignments WHERE title = 'Acid-Base Titration Lab Report' LIMIT 1;
    SELECT id INTO v_math_assignment_id FROM assignments WHERE title = 'Integration by Parts Practice Problems' LIMIT 1;
    SELECT id INTO v_hist_assignment_id FROM assignments WHERE title = 'Cold War Proxy Conflicts Research Essay' LIMIT 1;
    
    -- Get student IDs (using existing students or creating sample ones)
    SELECT id INTO v_student_1_id FROM students WHERE admission_number LIKE '%0091%' LIMIT 1;
    SELECT id INTO v_student_2_id FROM students WHERE admission_number LIKE '%0092%' LIMIT 1;
    SELECT id INTO v_student_3_id FROM students WHERE admission_number LIKE '%0093%' LIMIT 1;
    
    -- Insert sample submissions for chemistry assignment
    INSERT INTO assignment_submissions (id, school_id, assignment_id, student_id, student_answer, student_comments, file_attachments, submission_status, submitted_date) VALUES
    (
        gen_random_uuid(),
        (SELECT id FROM schools LIMIT 1),
        v_chem_assignment_id,
        v_student_1_id,
        'Introduction:
We performed acid-base titration to find the precise molarity of an unknown HCl solution utilizing 0.1M standard NaOH reagent with Phenolphthalein indicator.

Data Table:
- Trial 1: Start 0.0mL, End 18.2mL (Volume = 18.2mL)
- Trial 2: Start 18.2mL, End 36.3mL (Volume = 18.1mL)
- Trial 3: Start 0.0mL, End 18.1mL (Volume = 18.1mL)
Average NaOH consumed = 18.13 mL.

Calculations:
M1V1 = M2V2 => M(HCl) * 20.0mL = 0.1M * 18.13mL
Molarity of HCl = 0.0906 M.

Error Analysis:
There was a minor overshoot in Trial 1 due to rapid droplet addition, but Trials 2 and 3 were conducted with precise droplet control near the light pink endpoint.',
        'I used ChemDraw for the molecular structures as suggested in class.',
        '[{"name": "acid_base_titration_vance.pdf", "size": "2.4 MB", "type": "application/pdf", "url": "/submissions/acid_base_titration_vance.pdf"}]'::jsonb,
        'submitted',
        CURRENT_TIMESTAMP - INTERVAL '2 days'
    ),
    (
        gen_random_uuid(),
        (SELECT id FROM schools LIMIT 1),
        v_chem_assignment_id,
        v_student_2_id,
        'Objective: To determine unknown acid concentration. Standard molar calculations yield exactly 0.091M HCl with standard deviation ±0.001.',
        null,
        '[{"name": "sterling_chemistry_report.pdf", "size": "2.1 MB", "type": "application/pdf", "url": "/submissions/sterling_chemistry_report.pdf"}]'::jsonb,
        'submitted',
        CURRENT_TIMESTAMP - INTERVAL '1 day'
    );
    
    -- Insert sample submission for math assignment
    INSERT INTO assignment_submissions (id, school_id, assignment_id, student_id, student_answer, student_comments, file_attachments, submission_status, submitted_date) VALUES
    (
        gen_random_uuid(),
        (SELECT id FROM schools LIMIT 1),
        v_math_assignment_id,
        v_student_3_id,
        'Problem 5:
Solve ∫ x^2 * e^x dx.
Let u = x^2, dv = e^x dx => du = 2x dx, v = e^x
∫ x^2 * e^x dx = x^2 * e^x - ∫ 2x * e^x dx
For ∫ 2x * e^x dx, let u = 2x, dv = e^x dx => du = 2 dx, v = e^x
∫ 2x * e^x dx = 2x * e^x - ∫ 2 * e^x dx = 2x * e^x - 2 * e^x
Putting it all together:
= x^2 * e^x - 2x * e^x + 2 * e^x + C
= (x^2 - 2x + 2)e^x + C.',
        'I used integration by parts twice as required.',
        '[]'::jsonb,
        'submitted',
        CURRENT_TIMESTAMP - INTERVAL '12 hours'
    );
    
    -- Insert sample submission for history assignment
    INSERT INTO assignment_submissions (id, school_id, assignment_id, student_id, student_answer, student_comments, file_attachments, submission_status, submitted_date) VALUES
    (
        gen_random_uuid(),
        (SELECT id FROM schools LIMIT 1),
        v_hist_assignment_id,
        v_student_1_id,
        'Overview of key proxy conflicts analyzed:
1. Greek Civil War (1946-1949) - Truman Doctrine declared.
2. Berlin Blockade (1948-1949) - Allied Airlift success.
3. Korean War (1950-1953) - Direct military conflict between UN forces and KPA/PVA.
4. Suez Crisis (1956) - Pivot point of Middle East proxies.
5. Berlin Crisis (1961) - Construction of the Berlin Wall.
6. Cuban Missile Crisis (1962) - Geopolitical brinkmanship resulting in the hot-line setup.',
        'Focused on the geopolitical impact rather than military details as requested.',
        '[{"name": "cold_war_proxies_essay.pdf", "size": "1.8 MB", "type": "application/pdf", "url": "/submissions/cold_war_proxies_essay.pdf"}]'::jsonb,
        'submitted',
        CURRENT_TIMESTAMP - INTERVAL '5 days'
    );
END $$;

-- Sample grades for some submissions
DO $$
DECLARE
    v_submission_id UUID;
    v_assignment_id UUID;
    v_student_id UUID;
    v_user_id UUID;
BEGIN
    -- Get a submission to grade
    SELECT id, assignment_id, student_id INTO v_submission_id, v_assignment_id, v_student_id 
    FROM assignment_submissions 
    WHERE student_answer LIKE '%standard molar calculations%' 
    LIMIT 1;
    
    -- Get a user ID for the grader (teacher)
    SELECT id INTO v_user_id FROM users WHERE role = 'teacher' LIMIT 1;
    
    -- Insert a grade
    INSERT INTO assignment_grades (id, school_id, submission_id, assignment_id, student_id, score, max_score, teacher_feedback, graded_by) VALUES
    (
        gen_random_uuid(),
        (SELECT id FROM schools LIMIT 1),
        v_submission_id,
        v_assignment_id,
        v_student_id,
        24.00,
        25.00,
        'Excellent scientific format. Your standard deviation analysis was highly accurate. Consider expanding the error analysis section in future reports.',
        v_user_id
    );
    
    -- Update the submission status to graded
    UPDATE assignment_submissions 
    SET submission_status = 'graded' 
    WHERE id = v_submission_id;
END $$;