-- Create roles and permissions tables
-- Run this in your Supabase SQL Editor

-- Create roles table
CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,
    description TEXT,
    permissions JSONB NOT NULL DEFAULT '{}',
    is_system_role BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (school_id, name)
);

-- Create indexes for roles
CREATE INDEX IF NOT EXISTS idx_roles_school_id ON roles(school_id);
CREATE INDEX IF NOT EXISTS idx_roles_name ON roles(name);

-- Enable Row Level Security
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for roles
CREATE POLICY school_isolation_roles_policy ON roles 
    FOR ALL USING (school_id = get_current_school_id());

-- Insert default system roles
INSERT INTO roles (school_id, name, description, permissions, is_system_role) 
SELECT 
    id,
    'admin',
    'Full system access with all permissions',
    '{
        "users": {"view": true, "create": true, "edit": true, "delete": true},
        "students": {"view": true, "create": true, "edit": true, "delete": true},
        "teachers": {"view": true, "create": true, "edit": true, "delete": true},
        "parents": {"view": true, "create": true, "edit": true, "delete": true},
        "grades": {"view": true, "create": true, "edit": true, "delete": true},
        "sections": {"view": true, "create": true, "edit": true, "delete": true},
        "attendance": {"view": true, "create": true, "edit": true, "delete": true},
        "payments": {"view": true, "create": true, "edit": true, "delete": true},
        "reports": {"view": true, "create": true, "edit": true, "delete": true},
        "settings": {"view": true, "create": true, "edit": true, "delete": true}
    }'::jsonb,
    TRUE
FROM schools
ON CONFLICT (school_id, name) DO NOTHING;

INSERT INTO roles (school_id, name, description, permissions, is_system_role) 
SELECT 
    id,
    'director',
    'School director with limited administrative access',
    '{
        "users": {"view": true, "create": false, "edit": false, "delete": false},
        "students": {"view": true, "create": true, "edit": true, "delete": false},
        "teachers": {"view": true, "create": true, "edit": true, "delete": false},
        "parents": {"view": true, "create": true, "edit": true, "delete": false},
        "grades": {"view": true, "create": true, "edit": true, "delete": false},
        "sections": {"view": true, "create": true, "edit": true, "delete": false},
        "attendance": {"view": true, "create": true, "edit": true, "delete": false},
        "payments": {"view": true, "create": false, "edit": false, "delete": false},
        "reports": {"view": true, "create": true, "edit": true, "delete": false},
        "settings": {"view": true, "create": false, "edit": true, "delete": false}
    }'::jsonb,
    TRUE
FROM schools
ON CONFLICT (school_id, name) DO NOTHING;

INSERT INTO roles (school_id, name, description, permissions, is_system_role) 
SELECT 
    id,
    'teacher',
    'Teacher with access to assigned classes and student data',
    '{
        "users": {"view": false, "create": false, "edit": false, "delete": false},
        "students": {"view": true, "create": false, "edit": true, "delete": false},
        "teachers": {"view": false, "create": false, "edit": false, "delete": false},
        "parents": {"view": true, "create": false, "edit": false, "delete": false},
        "grades": {"view": true, "create": true, "edit": true, "delete": false},
        "sections": {"view": true, "create": false, "edit": false, "delete": false},
        "attendance": {"view": true, "create": true, "edit": true, "delete": false},
        "payments": {"view": false, "create": false, "edit": false, "delete": false},
        "reports": {"view": true, "create": false, "edit": false, "delete": false},
        "settings": {"view": false, "create": false, "edit": false, "delete": false}
    }'::jsonb,
    TRUE
FROM schools
ON CONFLICT (school_id, name) DO NOTHING;

INSERT INTO roles (school_id, name, description, permissions, is_system_role) 
SELECT 
    id,
    'parent',
    'Parent with access to their children data only',
    '{
        "users": {"view": false, "create": false, "edit": false, "delete": false},
        "students": {"view": true, "create": false, "edit": false, "delete": false},
        "teachers": {"view": true, "create": false, "edit": false, "delete": false},
        "parents": {"view": false, "create": false, "edit": false, "delete": false},
        "grades": {"view": true, "create": false, "edit": false, "delete": false},
        "sections": {"view": true, "create": false, "edit": false, "delete": false},
        "attendance": {"view": true, "create": false, "edit": false, "delete": false},
        "payments": {"view": true, "create": false, "edit": false, "delete": false},
        "reports": {"view": true, "create": false, "edit": false, "delete": false},
        "settings": {"view": false, "create": false, "edit": false, "delete": false}
    }'::jsonb,
    TRUE
FROM schools
ON CONFLICT (school_id, name) DO NOTHING;

INSERT INTO roles (school_id, name, description, permissions, is_system_role) 
SELECT 
    id,
    'student',
    'Student with access to their own data only',
    '{
        "users": {"view": false, "create": false, "edit": false, "delete": false},
        "students": {"view": true, "create": false, "edit": false, "delete": false},
        "teachers": {"view": true, "create": false, "edit": false, "delete": false},
        "parents": {"view": false, "create": false, "edit": false, "delete": false},
        "grades": {"view": true, "create": false, "edit": false, "delete": false},
        "sections": {"view": true, "create": false, "edit": false, "delete": false},
        "attendance": {"view": true, "create": false, "edit": false, "delete": false},
        "payments": {"view": true, "create": false, "edit": false, "delete": false},
        "reports": {"view": true, "create": false, "edit": false, "delete": false},
        "settings": {"view": false, "create": false, "edit": false, "delete": false}
    }'::jsonb,
    TRUE
FROM schools
ON CONFLICT (school_id, name) DO NOTHING;

-- Add trigger for updated_at (safe version)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_roles_modtime') THEN
        CREATE TRIGGER update_roles_modtime 
            BEFORE UPDATE ON roles 
            FOR EACH ROW EXECUTE FUNCTION update_modified_column();
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        -- If trigger creation fails, it's not critical for basic functionality
        RAISE NOTICE 'Could not create trigger: %', SQLERRM;
END $$;
