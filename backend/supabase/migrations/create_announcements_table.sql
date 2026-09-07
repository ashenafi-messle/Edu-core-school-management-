-- Create announcements table for managing school announcements
CREATE TABLE IF NOT EXISTS public.announcements (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL,
  title character varying NOT NULL,
  content text NOT NULL,
  type character varying NOT NULL DEFAULT 'general' CHECK (type::text = ANY (ARRAY['general'::character varying, 'urgent'::character varying, 'event'::character varying, 'academic'::character varying, 'administrative'::character varying]::text[])),
  priority character varying DEFAULT 'normal' CHECK (priority::text = ANY (ARRAY['low'::character varying, 'normal'::character varying, 'high'::character varying, 'urgent'::character varying]::text[])),
  status character varying NOT NULL DEFAULT 'draft' CHECK (status::text = ANY (ARRAY['draft'::character varying, 'published'::character varying, 'archived'::character varying]::text[])),
  target_audience character varying NOT NULL DEFAULT 'all' CHECK (target_audience::text = ANY (ARRAY['all'::character varying, 'teachers'::character varying, 'parents'::character varying, 'students'::character varying, 'specific_grade'::character varying]::text[])),
  target_grade_id uuid,
  published_by uuid,
  published_at timestamp with time zone,
  expires_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT announcements_pkey PRIMARY KEY (id),
  CONSTRAINT announcements_school_id_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id),
  CONSTRAINT announcements_published_by_fkey FOREIGN KEY (published_by) REFERENCES public.users(id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_announcements_school_id ON public.announcements(school_id);
CREATE INDEX IF NOT EXISTS idx_announcements_status ON public.announcements(status);
CREATE INDEX IF NOT EXISTS idx_announcements_type ON public.announcements(type);
CREATE INDEX IF NOT EXISTS idx_announcements_priority ON public.announcements(priority);
CREATE INDEX IF NOT EXISTS idx_announcements_target_audience ON public.announcements(target_audience);
CREATE INDEX IF NOT EXISTS idx_announcements_published_at ON public.announcements(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_announcements_expires_at ON public.announcements(expires_at);

-- Add RLS policies for announcements
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- Policy: Schools can only see their own announcements
CREATE POLICY "Schools can view own announcements" ON public.announcements
  FOR SELECT USING (school_id = auth.uid());

-- Policy: Schools can insert their own announcements
CREATE POLICY "Schools can insert own announcements" ON public.announcements
  FOR INSERT WITH CHECK (school_id = auth.uid());

-- Policy: Schools can update their own announcements
CREATE POLICY "Schools can update own announcements" ON public.announcements
  FOR UPDATE USING (school_id = auth.uid());

-- Policy: Schools can delete their own announcements
CREATE POLICY "Schools can delete own announcements" ON public.announcements
  FOR DELETE USING (school_id = auth.uid());

-- Add comment to table
COMMENT ON TABLE public.announcements IS 'Table for managing school announcements, events, and communications';
