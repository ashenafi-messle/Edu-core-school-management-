-- Create parent_feedback table for managing parent feedback and resolutions
CREATE TABLE IF NOT EXISTS public.parent_feedback (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL,
  parent_id uuid,
  student_id uuid,
  parent_name character varying NOT NULL,
  student_name character varying NOT NULL,
  type character varying NOT NULL CHECK (type::text = ANY (ARRAY['complaint'::character varying, 'suggestion'::character varying, 'enquiry'::character varying, 'compliment'::character varying]::text[])),
  subject character varying,
  message text NOT NULL,
  priority character varying DEFAULT 'normal' CHECK (priority::text = ANY (ARRAY['low'::character varying, 'normal'::character varying, 'high'::character varying, 'urgent'::character varying]::text[])),
  status character varying NOT NULL DEFAULT 'pending' CHECK (status::text = ANY (ARRAY['pending'::character varying, 'in_progress'::character varying, 'resolved'::character varying, 'closed'::character varying]::text[])),
  response text,
  resolved_by uuid,
  resolved_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT parent_feedback_pkey PRIMARY KEY (id),
  CONSTRAINT parent_feedback_school_id_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id),
  CONSTRAINT parent_feedback_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.parents(id),
  CONSTRAINT parent_feedback_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id),
  CONSTRAINT parent_feedback_resolved_by_fkey FOREIGN KEY (resolved_by) REFERENCES public.users(id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_parent_feedback_school_id ON public.parent_feedback(school_id);
CREATE INDEX IF NOT EXISTS idx_parent_feedback_parent_id ON public.parent_feedback(parent_id);
CREATE INDEX IF NOT EXISTS idx_parent_feedback_student_id ON public.parent_feedback(student_id);
CREATE INDEX IF NOT EXISTS idx_parent_feedback_status ON public.parent_feedback(status);
CREATE INDEX IF NOT EXISTS idx_parent_feedback_type ON public.parent_feedback(type);
CREATE INDEX IF NOT EXISTS idx_parent_feedback_created_at ON public.parent_feedback(created_at DESC);

-- Add RLS policies for parent_feedback
ALTER TABLE public.parent_feedback ENABLE ROW LEVEL SECURITY;

-- Policy: Schools can only see their own feedback
CREATE POLICY "Schools can view own feedback" ON public.parent_feedback
  FOR SELECT USING (school_id = auth.uid());

-- Policy: Schools can insert their own feedback
CREATE POLICY "Schools can insert own feedback" ON public.parent_feedback
  FOR INSERT WITH CHECK (school_id = auth.uid());

-- Policy: Schools can update their own feedback
CREATE POLICY "Schools can update own feedback" ON public.parent_feedback
  FOR UPDATE USING (school_id = auth.uid());

-- Policy: Schools can delete their own feedback
CREATE POLICY "Schools can delete own feedback" ON public.parent_feedback
  FOR DELETE USING (school_id = auth.uid());

-- Add comment to table
COMMENT ON TABLE public.parent_feedback IS 'Table for managing parent feedback, complaints, suggestions, and their resolutions';
