-- Create section allocations for students in Grade 12, Section A
-- These students should appear in dr one's student roster since he teaches Grade 12, Section A

-- First, get the section configuration ID for Grade 12, Section A
-- This assumes there's a section configuration for this combo

-- Create section allocations for Grade 12, Section A students
INSERT INTO public.section_allocations (
  id,
  school_id,
  student_id,
  section_configuration_id,
  grade_level,
  section_name,
  allocation_method,
  allocation_date,
  academic_year_id,
  created_at,
  updated_at
) VALUES
  -- yabsira jej - Grade 12, Section A
  (
    gen_random_uuid(),
    'a7b3c29d-4e8f-4d91-bd30-4e123456789a',
    'f582cdf8-b0ca-4328-9e87-8b8ab3a2a4bc',
    '78e0855c-809d-4888-b04c-0500e8f27d80', -- Section configuration ID for Grade 12, Section A
    'Grade 12',
    'Section A',
    'auto',
    CURRENT_TIMESTAMP,
    'd58c7141-7302-4b44-834f-7575902ba792', -- Current academic year ID
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ),
  -- hermela  dejene - Grade 12, Section A
  (
    gen_random_uuid(),
    'a7b3c29d-4e8f-4d91-bd30-4e123456789a',
    '06dc97cf-9738-403b-af60-34be656bbf88',
    '78e0855c-809d-4888-b04c-0500e8f27d80',
    'Grade 12',
    'Section A',
    'auto',
    CURRENT_TIMESTAMP,
    'd58c7141-7302-4b44-834f-7575902ba792',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ),
  -- Ashenafi mesele (ADM-721511) - Grade 12, Section A
  (
    gen_random_uuid(),
    'a7b3c29d-4e8f-4d91-bd30-4e123456789a',
    'fba806e5-f2d9-4ff1-a58f-141c55adde1f',
    '78e0855c-809d-4888-b04c-0500e8f27d80',
    'Grade 12',
    'Section A',
    'auto',
    CURRENT_TIMESTAMP,
    'd58c7141-7302-4b44-834f-7575902ba792',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ),
  -- amen - Grade 12, Section A
  (
    gen_random_uuid(),
    'a7b3c29d-4e8f-4d91-bd30-4e123456789a',
    'e812f9ea-8c1e-4583-9530-9859e1973ba2',
    '78e0855c-809d-4888-b04c-0500e8f27d80',
    'Grade 12',
    'Section A',
    'auto',
    CURRENT_TIMESTAMP,
    'd58c7141-7302-4b44-834f-7575902ba792',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  )
ON CONFLICT DO NOTHING;
