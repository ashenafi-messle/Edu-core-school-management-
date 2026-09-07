-- Academic Year Management System Schema
-- Run this in your Supabase SQL Editor

-- Create academic_years table
CREATE TABLE IF NOT EXISTS academic_years (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    year_name VARCHAR(20) NOT NULL, -- e.g., "2024-2025"
    academic_year_start DATE NOT NULL,
    academic_year_end DATE NOT NULL,
    current_semester VARCHAR(20) DEFAULT 'Fall', -- Fall, Spring, Summer, Winter
    semester_start_date DATE,
    semester_end_date DATE,
    is_active BOOLEAN DEFAULT FALSE,
    is_archived BOOLEAN DEFAULT FALSE,
    archived_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (school_id, year_name)
);

-- Create indexes for academic_years
CREATE INDEX IF NOT EXISTS idx_academic_years_school_id ON academic_years(school_id);
CREATE INDEX IF NOT EXISTS idx_academic_years_active ON academic_years(school_id, is_active);
CREATE INDEX IF NOT EXISTS idx_academic_years_dates ON academic_years(academic_year_start, academic_year_end);

-- Enable Row Level Security
ALTER TABLE academic_years ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for academic_years
CREATE POLICY school_isolation_academic_years_policy ON academic_years 
    FOR ALL USING (school_id = get_current_school_id());

-- Add current academic year reference to schools table
ALTER TABLE schools ADD COLUMN IF NOT EXISTS current_academic_year_id UUID REFERENCES academic_years(id) ON DELETE SET NULL;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS current_semester VARCHAR(20) DEFAULT 'Fall';

-- Add academic year context to students table
ALTER TABLE students ADD COLUMN IF NOT EXISTS academic_year_id UUID REFERENCES academic_years(id) ON DELETE SET NULL;
ALTER TABLE students ADD COLUMN IF NOT EXISTS admission_year_id UUID REFERENCES academic_years(id) ON DELETE SET NULL;
ALTER TABLE students ADD COLUMN IF NOT EXISTS graduation_year_id UUID REFERENCES academic_years(id) ON DELETE SET NULL;

-- Add academic year context to grades table (if exists, otherwise this will be added when grades table is created)
-- ALTER TABLE grades ADD COLUMN IF NOT EXISTS academic_year_id UUID REFERENCES academic_years(id) ON DELETE SET NULL;

-- Add academic year context to attendance table (if exists)
-- ALTER TABLE attendance ADD COLUMN IF NOT EXISTS academic_year_id UUID REFERENCES academic_years(id) ON DELETE SET NULL;

-- Add academic year context to sections table
ALTER TABLE section_configurations ADD COLUMN IF NOT EXISTS academic_year_id UUID REFERENCES academic_years(id) ON DELETE SET NULL;

-- Add academic year context to section_allocations table
ALTER TABLE section_allocations ADD COLUMN IF NOT EXISTS academic_year_id UUID REFERENCES academic_years(id) ON DELETE SET NULL;

-- Create academic_year_snapshots table for archival purposes
CREATE TABLE IF NOT EXISTS academic_year_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    academic_year_id UUID NOT NULL REFERENCES academic_years(id) ON DELETE CASCADE,
    snapshot_type VARCHAR(50) NOT NULL, -- 'semester_end', 'year_end', 'manual'
    snapshot_data JSONB NOT NULL, -- Contains the complete state of data at snapshot time
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    notes TEXT
);

-- Create indexes for academic_year_snapshots
CREATE INDEX IF NOT EXISTS idx_academic_year_snapshots_school ON academic_year_snapshots(school_id);
CREATE INDEX IF NOT EXISTS idx_academic_year_snapshots_year ON academic_year_snapshots(academic_year_id);

-- Enable Row Level Security
ALTER TABLE academic_year_snapshots ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for academic_year_snapshots
CREATE POLICY school_isolation_academic_year_snapshots_policy ON academic_year_snapshots 
    FOR ALL USING (school_id = get_current_school_id());

-- Add trigger for updated_at
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_academic_years_modtime') THEN
        CREATE TRIGGER update_academic_years_modtime 
            BEFORE UPDATE ON academic_years 
            FOR EACH ROW EXECUTE FUNCTION update_modified_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_academic_year_snapshots_modtime') THEN
        CREATE TRIGGER update_academic_year_snapshots_modtime 
            BEFORE UPDATE ON academic_year_snapshots 
            FOR EACH ROW EXECUTE FUNCTION update_modified_column();
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Could not create triggers: %', SQLERRM;
END $$;

-- Insert a default academic year for existing schools
INSERT INTO academic_years (school_id, year_name, academic_year_start, academic_year_end, current_semester, is_active)
SELECT 
    id,
    '2024-2025',
    DATE_TRUNC('year', CURRENT_DATE),
    DATE_TRUNC('year', CURRENT_DATE) + INTERVAL '1 year' - INTERVAL '1 day',
    'Fall',
    TRUE
FROM schools
ON CONFLICT (school_id, year_name) DO NOTHING;

-- Update schools to reference the created academic year
UPDATE schools SET current_academic_year_id = (
    SELECT id FROM academic_years ay 
    WHERE ay.school_id = schools.id 
    AND ay.is_active = TRUE 
    LIMIT 1
) WHERE current_academic_year_id IS NULL;
