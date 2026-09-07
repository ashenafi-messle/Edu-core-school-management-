-- Migration: Create section_configurations and section_allocations tables
-- This script creates the tables needed for grade section allocation feature

-- Create section_configurations table
CREATE TABLE IF NOT EXISTS section_configurations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    grade_level VARCHAR(50) NOT NULL,
    section_name VARCHAR(50) NOT NULL,
    max_capacity INTEGER NOT NULL DEFAULT 30,
    current_count INTEGER DEFAULT 0,
    academic_year VARCHAR(20) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (school_id, grade_level, section_name, academic_year)
);

-- Create index for section configurations
CREATE INDEX IF NOT EXISTS idx_section_config_school_grade ON section_configurations(school_id, grade_level, academic_year);

-- Create section_allocations table
CREATE TABLE IF NOT EXISTS section_allocations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    section_configuration_id UUID NOT NULL REFERENCES section_configurations(id) ON DELETE CASCADE,
    grade_level VARCHAR(50) NOT NULL,
    section_name VARCHAR(50) NOT NULL,
    allocation_method VARCHAR(50) DEFAULT 'auto',
    allocated_by UUID REFERENCES users(id) ON DELETE SET NULL,
    allocation_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (student_id, allocation_date)
);

-- Create indexes for section allocations
CREATE INDEX IF NOT EXISTS idx_section_allocations_student ON section_allocations(student_id);
CREATE INDEX IF NOT EXISTS idx_section_allocations_section ON section_allocations(section_configuration_id);
CREATE INDEX IF NOT EXISTS idx_section_allocations_grade ON section_allocations(school_id, grade_level);

-- Enable Row Level Security
ALTER TABLE section_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE section_allocations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for section_configurations
CREATE POLICY school_isolation_section_configurations_policy ON section_configurations 
    FOR ALL USING (school_id = get_current_school_id());

-- Create RLS policies for section_allocations
CREATE POLICY school_isolation_section_allocations_policy ON section_allocations 
    FOR ALL USING (school_id = get_current_school_id());

-- Add automatic timestamp triggers
CREATE TRIGGER update_section_configurations_modtime BEFORE UPDATE ON section_configurations 
    FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_section_allocations_modtime BEFORE UPDATE ON section_allocations 
    FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- Add comments for documentation
COMMENT ON TABLE section_configurations IS 'Configuration for class sections per grade and academic year';
COMMENT ON TABLE section_allocations IS 'History of student section assignments with allocation method tracking';
