-- Migration: Create School Schedule Settings
-- This allows schools to customize their period duration, break times, and schedule

-- Create school_schedule_settings table
CREATE TABLE IF NOT EXISTS public.school_schedule_settings (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    school_id uuid NOT NULL,
    academic_year_id uuid NOT NULL,
    
    -- Period Settings
    period_duration_minutes integer NOT NULL DEFAULT 60, -- Duration of each period in minutes
    number_of_periods_per_day integer NOT NULL DEFAULT 7, -- Total periods excluding breaks
    school_start_time time NOT NULL DEFAULT '09:00:00',
    school_end_time time NOT NULL DEFAULT '15:45:00',
    
    -- Break Settings
    lunch_break_enabled boolean DEFAULT true,
    lunch_break_duration_minutes integer DEFAULT 60,
    lunch_break_after_period integer DEFAULT 4, -- Lunch after which period
    lunch_break_start_time time DEFAULT '12:30:00',
    
    -- Additional Breaks (JSON array of break configurations)
    additional_breaks jsonb DEFAULT '[]', -- e.g., [{"name": "Morning Break", "duration": 15, "after_period": 2}]
    
    -- Week Settings
    days_of_operation character varying(9)[] DEFAULT ARRAY['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    
    -- Active Settings
    is_active boolean DEFAULT true,
    
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT school_schedule_settings_pkey PRIMARY KEY (id),
    CONSTRAINT school_schedule_settings_school_id_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id) ON DELETE CASCADE,
    CONSTRAINT school_schedule_settings_academic_year_id_fkey FOREIGN KEY (academic_year_id) REFERENCES public.academic_years(id) ON DELETE CASCADE,
    CONSTRAINT school_schedule_settings_school_year_unique UNIQUE (school_id, academic_year_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_school_schedule_settings_school ON public.school_schedule_settings(school_id);
CREATE INDEX IF NOT EXISTS idx_school_schedule_settings_academic_year ON public.school_schedule_settings(school_id, academic_year_id);
CREATE INDEX IF NOT EXISTS idx_school_schedule_settings_active ON public.school_schedule_settings(school_id, is_active);

-- Enable Row Level Security
ALTER TABLE public.school_schedule_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY school_isolation_schedule_settings_policy ON public.school_schedule_settings 
    FOR ALL USING (school_id = get_current_school_id());

-- Add trigger for updated_at
CREATE TRIGGER update_school_schedule_settings_modtime BEFORE UPDATE ON public.school_schedule_settings 
    FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- Add comments
COMMENT ON TABLE public.school_schedule_settings IS 'School-specific schedule settings for customizable periods and breaks';
COMMENT ON COLUMN public.school_schedule_settings.period_duration_minutes IS 'Duration of each period in minutes (e.g., 45, 50, 60)';
COMMENT ON COLUMN public.school_schedule_settings.number_of_periods_per_day IS 'Total number of teaching periods per day';
COMMENT ON COLUMN public.school_schedule_settings.additional_breaks IS 'JSON array of additional breaks: [{"name": "Morning Break", "duration": 15, "after_period": 2}]';

-- Insert default settings for existing schools
INSERT INTO public.school_schedule_settings (school_id, academic_year_id, period_duration_minutes, number_of_periods_per_day, school_start_time, school_end_time)
SELECT 
    s.id,
    ay.id,
    60, -- 60 minute periods
    7, -- 7 periods per day
    '09:00:00',
    '15:45:00'
FROM schools s
CROSS JOIN (SELECT id FROM academic_years WHERE is_active = true LIMIT 1) ay
ON CONFLICT (school_id, academic_year_id) DO NOTHING;
