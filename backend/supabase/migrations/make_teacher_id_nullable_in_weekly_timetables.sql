-- Migration: Make teacher_id nullable in weekly_timetables
-- This allows scheduling subjects before assigning teachers

-- First, drop the foreign key constraint
ALTER TABLE public.weekly_timetables 
DROP CONSTRAINT IF EXISTS weekly_timetables_teacher_id_fkey;

-- Make the column nullable
ALTER TABLE public.weekly_timetables 
ALTER COLUMN teacher_id DROP NOT NULL;

-- Re-add the foreign key constraint (now allowing null values)
ALTER TABLE public.weekly_timetables 
ADD CONSTRAINT weekly_timetables_teacher_id_fkey 
FOREIGN KEY (teacher_id) REFERENCES public.teachers(id) ON DELETE SET NULL;

-- Add comment explaining the change
COMMENT ON COLUMN public.weekly_timetables.teacher_id IS 'Teacher assigned to this subject (nullable - allows scheduling before teacher assignment)';
