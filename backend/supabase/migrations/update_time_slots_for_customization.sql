-- Migration: Update time_slots for period duration customization
-- This adds duration and auto-generation support to time slots

-- Add duration_minutes column to time_slots
ALTER TABLE public.time_slots 
ADD COLUMN IF NOT EXISTS duration_minutes integer DEFAULT 60;

-- Add source column to track if slot is auto-generated or manual
ALTER TABLE public.time_slots 
ADD COLUMN IF NOT EXISTS source character varying DEFAULT 'manual'; -- 'auto' or 'manual'

-- Add school_schedule_settings_id to link to settings
ALTER TABLE public.time_slots 
ADD COLUMN IF NOT EXISTS school_schedule_settings_id uuid REFERENCES public.school_schedule_settings(id) ON DELETE CASCADE;

-- Update comments
COMMENT ON COLUMN public.time_slots.duration_minutes IS 'Duration of this time slot in minutes';
COMMENT ON COLUMN public.time_slots.source IS 'Whether this slot was auto-generated from school settings or manually created';
COMMENT ON COLUMN public.time_slots.school_schedule_settings_id IS 'Reference to school schedule settings if auto-generated';

-- Create index for school_schedule_settings_id
CREATE INDEX IF NOT EXISTS idx_time_slots_schedule_settings ON public.time_slots(school_schedule_settings_id);
