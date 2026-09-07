-- Migration: Add missing student fields from registrations
-- This adds additional fields to students table to match registration data

-- Add phone field to students table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'students' AND column_name = 'phone'
    ) THEN
        ALTER TABLE public.students ADD COLUMN phone character varying;
    END IF;
END $$;

-- Add address field to students table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'students' AND column_name = 'address'
    ) THEN
        ALTER TABLE public.students ADD COLUMN address text;
    END IF;
END $$;

-- Add city field to students table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'students' AND column_name = 'city'
    ) THEN
        ALTER TABLE public.students ADD COLUMN city character varying;
    END IF;
END $$;

-- Add previous_school field to students table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'students' AND column_name = 'previous_school'
    ) THEN
        ALTER TABLE public.students ADD COLUMN previous_school character varying;
    END IF;
END $$;
