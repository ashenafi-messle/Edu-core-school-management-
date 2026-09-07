-- Migration: Create Weekly Timetable System
-- This creates the database schema for managing weekly school timetables

-- Create time_slots table for predefined school time slots
CREATE TABLE IF NOT EXISTS public.time_slots (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    school_id uuid NOT NULL,
    slot_name character varying NOT NULL, -- e.g., "Period 1", "Morning Session"
    start_time time NOT NULL, -- e.g., "09:00:00"
    end_time time NOT NULL, -- e.g., "10:00:00"
    break_time boolean DEFAULT false,
    is_active boolean DEFAULT true,
    order_index integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT time_slots_pkey PRIMARY KEY (id),
    CONSTRAINT time_slots_school_id_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id) ON DELETE CASCADE,
    CONSTRAINT time_slots_school_order_unique UNIQUE (school_id, order_index)
);

-- Create weekly_timetables table for storing timetable entries
CREATE TABLE IF NOT EXISTS public.weekly_timetables (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    school_id uuid NOT NULL,
    academic_year_id uuid NOT NULL,
    section_configuration_id uuid NOT NULL, -- Links to specific grade/section
    day_of_week character varying NOT NULL, -- Monday, Tuesday, etc.
    time_slot_id uuid NOT NULL,
    subject_id uuid NOT NULL,
    teacher_id uuid NOT NULL,
    room_number character varying,
    is_active boolean DEFAULT true,
    notes text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT weekly_timetables_pkey PRIMARY KEY (id),
    CONSTRAINT weekly_timetables_school_id_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id) ON DELETE CASCADE,
    CONSTRAINT weekly_timetables_academic_year_id_fkey FOREIGN KEY (academic_year_id) REFERENCES public.academic_years(id) ON DELETE CASCADE,
    CONSTRAINT weekly_timetables_section_config_id_fkey FOREIGN KEY (section_configuration_id) REFERENCES public.section_configurations(id) ON DELETE CASCADE,
    CONSTRAINT weekly_timetables_time_slot_id_fkey FOREIGN KEY (time_slot_id) REFERENCES public.time_slots(id) ON DELETE CASCADE,
    CONSTRAINT weekly_timetables_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects(id) ON DELETE CASCADE,
    CONSTRAINT weekly_timetables_teacher_id_fkey FOREIGN KEY (teacher_id) REFERENCES public.teachers(id) ON DELETE CASCADE,
    CONSTRAINT weekly_timetables_unique UNIQUE (section_configuration_id, day_of_week, time_slot_id)
);

-- Create timetable_templates table for reusable timetable patterns
CREATE TABLE IF NOT EXISTS public.timetable_templates (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    school_id uuid NOT NULL,
    template_name character varying NOT NULL,
    description text,
    template_data jsonb NOT NULL, -- Stores the timetable structure as JSON
    is_default boolean DEFAULT false,
    created_by uuid REFERENCES public.users(id) ON DELETE SET NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT timetable_templates_pkey PRIMARY KEY (id),
    CONSTRAINT timetable_templates_school_id_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id) ON DELETE CASCADE,
    CONSTRAINT timetable_templates_school_name_unique UNIQUE (school_id, template_name)
);

-- Create indexes for time_slots
CREATE INDEX IF NOT EXISTS idx_time_slots_school ON public.time_slots(school_id);
CREATE INDEX IF NOT EXISTS idx_time_slots_active ON public.time_slots(school_id, is_active);
CREATE INDEX IF NOT EXISTS idx_time_slots_order ON public.time_slots(school_id, order_index);

-- Create indexes for weekly_timetables
CREATE INDEX IF NOT EXISTS idx_weekly_timetables_school ON public.weekly_timetables(school_id);
CREATE INDEX IF NOT EXISTS idx_weekly_timetables_academic_year ON public.weekly_timetables(school_id, academic_year_id);
CREATE INDEX IF NOT EXISTS idx_weekly_timetables_section ON public.weekly_timetables(school_id, section_configuration_id);
CREATE INDEX IF NOT EXISTS idx_weekly_timetables_day ON public.weekly_timetables(school_id, day_of_week);
CREATE INDEX IF NOT EXISTS idx_weekly_timetables_teacher ON public.weekly_timetables(school_id, teacher_id);
CREATE INDEX IF NOT EXISTS idx_weekly_timetables_subject ON public.weekly_timetables(school_id, subject_id);
CREATE INDEX IF NOT EXISTS idx_weekly_timetables_active ON public.weekly_timetables(school_id, is_active);

-- Create indexes for timetable_templates
CREATE INDEX IF NOT EXISTS idx_timetable_templates_school ON public.timetable_templates(school_id);
CREATE INDEX IF NOT EXISTS idx_timetable_templates_default ON public.timetable_templates(school_id, is_default);

-- Enable Row Level Security
ALTER TABLE public.time_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_timetables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timetable_templates ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for time_slots
CREATE POLICY school_isolation_time_slots_policy ON public.time_slots 
    FOR ALL USING (school_id = get_current_school_id());

-- Create RLS policies for weekly_timetables
CREATE POLICY school_isolation_weekly_timetables_policy ON public.weekly_timetables 
    FOR ALL USING (school_id = get_current_school_id());

-- Create RLS policies for timetable_templates
CREATE POLICY school_isolation_timetable_templates_policy ON public.timetable_templates 
    FOR ALL USING (school_id = get_current_school_id());

-- Add automatic timestamp triggers
CREATE TRIGGER update_time_slots_modtime BEFORE UPDATE ON public.time_slots 
    FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_weekly_timetables_modtime BEFORE UPDATE ON public.weekly_timetables 
    FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_timetable_templates_modtime BEFORE UPDATE ON public.timetable_templates 
    FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- Add comments for documentation
COMMENT ON TABLE public.time_slots IS 'Predefined time slots for the school day (periods, breaks, etc.)';
COMMENT ON COLUMN public.time_slots.break_time IS 'Indicates if this is a break/recess period';
COMMENT ON COLUMN public.time_slots.order_index IS 'Order for displaying time slots chronologically';

COMMENT ON TABLE public.weekly_timetables IS 'Weekly timetable entries mapping teachers, subjects, and rooms to time slots';
COMMENT ON COLUMN public.weekly_timetables.day_of_week IS 'Day of the week: Monday, Tuesday, Wednesday, Thursday, Friday';
COMMENT ON COLUMN public.weekly_timetables.room_number IS 'Physical classroom or room assignment';

COMMENT ON TABLE public.timetable_templates IS 'Reusable timetable patterns/templates for quick timetable setup';
COMMENT ON COLUMN public.timetable_templates.template_data IS 'JSON structure containing the timetable pattern';
COMMENT ON COLUMN public.timetable_templates.is_default IS 'Indicates if this is the default template for the school';

-- Insert default time slots for new schools
INSERT INTO public.time_slots (school_id, slot_name, start_time, end_time, break_time, order_index)
SELECT 
    id,
    'Period 1',
    '09:00:00',
    '10:00:00',
    false,
    1
FROM schools
ON CONFLICT (school_id, order_index) DO NOTHING;

INSERT INTO public.time_slots (school_id, slot_name, start_time, end_time, break_time, order_index)
SELECT 
    id,
    'Period 2',
    '10:15:00',
    '11:15:00',
    false,
    2
FROM schools
ON CONFLICT (school_id, order_index) DO NOTHING;

INSERT INTO public.time_slots (school_id, slot_name, start_time, end_time, break_time, order_index)
SELECT 
    id,
    'Break',
    '11:15:00',
    '11:30:00',
    true,
    3
FROM schools
ON CONFLICT (school_id, order_index) DO NOTHING;

INSERT INTO public.time_slots (school_id, slot_name, start_time, end_time, break_time, order_index)
SELECT 
    id,
    'Period 3',
    '11:30:00',
    '12:30:00',
    false,
    4
FROM schools
ON CONFLICT (school_id, order_index) DO NOTHING;

INSERT INTO public.time_slots (school_id, slot_name, start_time, end_time, break_time, order_index)
SELECT 
    id,
    'Lunch Break',
    '12:30:00',
    '13:30:00',
    true,
    5
FROM schools
ON CONFLICT (school_id, order_index) DO NOTHING;

INSERT INTO public.time_slots (school_id, slot_name, start_time, end_time, break_time, order_index)
SELECT 
    id,
    'Period 4',
    '13:30:00',
    '14:30:00',
    false,
    6
FROM schools
ON CONFLICT (school_id, order_index) DO NOTHING;

INSERT INTO public.time_slots (school_id, slot_name, start_time, end_time, break_time, order_index)
SELECT 
    id,
    'Period 5',
    '14:45:00',
    '15:45:00',
    false,
    7
FROM schools
ON CONFLICT (school_id, order_index) DO NOTHING;
