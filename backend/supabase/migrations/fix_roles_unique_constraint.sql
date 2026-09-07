-- Fix the roles table unique constraint issue
-- Run this in your Supabase SQL Editor to fix the existing table

-- First, drop the conflicting unique constraint on the name column
ALTER TABLE roles DROP CONSTRAINT IF EXISTS roles_name_key;

-- Update existing roles to include 'enabled' field in permissions
UPDATE roles SET permissions = jsonb_set(
    permissions, 
    '{users, enabled}', 
    COALESCE((permissions->'users'->>'enabled')::boolean, (permissions->'users'->>'view')::boolean)
) WHERE permissions->'users' IS NOT NULL;

UPDATE roles SET permissions = jsonb_set(
    permissions, 
    '{students, enabled}', 
    COALESCE((permissions->'students'->>'enabled')::boolean, (permissions->'students'->>'view')::boolean)
) WHERE permissions->'students' IS NOT NULL;

UPDATE roles SET permissions = jsonb_set(
    permissions, 
    '{teachers, enabled}', 
    COALESCE((permissions->'teachers'->>'enabled')::boolean, (permissions->'teachers'->>'view')::boolean)
) WHERE permissions->'teachers' IS NOT NULL;

UPDATE roles SET permissions = jsonb_set(
    permissions, 
    '{parents, enabled}', 
    COALESCE((permissions->'parents'->>'enabled')::boolean, (permissions->'parents'->>'view')::boolean)
) WHERE permissions->'parents' IS NOT NULL;

UPDATE roles SET permissions = jsonb_set(
    permissions, 
    '{grades, enabled}', 
    COALESCE((permissions->'grades'->>'enabled')::boolean, (permissions->'grades'->>'view')::boolean)
) WHERE permissions->'grades' IS NOT NULL;

UPDATE roles SET permissions = jsonb_set(
    permissions, 
    '{sections, enabled}', 
    COALESCE((permissions->'sections'->>'enabled')::boolean, (permissions->'sections'->>'view')::boolean)
) WHERE permissions->'sections' IS NOT NULL;

UPDATE roles SET permissions = jsonb_set(
    permissions, 
    '{attendance, enabled}', 
    COALESCE((permissions->'attendance'->>'enabled')::boolean, (permissions->'attendance'->>'view')::boolean)
) WHERE permissions->'attendance' IS NOT NULL;

UPDATE roles SET permissions = jsonb_set(
    permissions, 
    '{payments, enabled}', 
    COALESCE((permissions->'payments'->>'enabled')::boolean, (permissions->'payments'->>'view')::boolean)
) WHERE permissions->'payments' IS NOT NULL;

UPDATE roles SET permissions = jsonb_set(
    permissions, 
    '{reports, enabled}', 
    COALESCE((permissions->'reports'->>'enabled')::boolean, (permissions->'reports'->>'view')::boolean)
) WHERE permissions->'reports' IS NOT NULL;

UPDATE roles SET permissions = jsonb_set(
    permissions, 
    '{settings, enabled}', 
    COALESCE((permissions->'settings'->>'enabled')::boolean, (permissions->'settings'->>'view')::boolean)
) WHERE permissions->'settings' IS NOT NULL;

-- Now run the INSERT statements to create the default system roles
INSERT INTO roles (school_id, name, description, permissions, is_system_role) 
SELECT 
    id,
    'admin',
    'Full system access with all permissions',
    '{
        "users": {"enabled": true, "view": true, "create": true, "edit": true, "delete": true},
        "students": {"enabled": true, "view": true, "create": true, "edit": true, "delete": true},
        "teachers": {"enabled": true, "view": true, "create": true, "edit": true, "delete": true},
        "parents": {"enabled": true, "view": true, "create": true, "edit": true, "delete": true},
        "grades": {"enabled": true, "view": true, "create": true, "edit": true, "delete": true},
        "sections": {"enabled": true, "view": true, "create": true, "edit": true, "delete": true},
        "attendance": {"enabled": true, "view": true, "create": true, "edit": true, "delete": true},
        "payments": {"enabled": true, "view": true, "create": true, "edit": true, "delete": true},
        "reports": {"enabled": true, "view": true, "create": true, "edit": true, "delete": true},
        "settings": {"enabled": true, "view": true, "create": true, "edit": true, "delete": true}
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
        "users": {"enabled": true, "view": true, "create": false, "edit": false, "delete": false},
        "students": {"enabled": true, "view": true, "create": true, "edit": true, "delete": false},
        "teachers": {"enabled": true, "view": true, "create": true, "edit": true, "delete": false},
        "parents": {"enabled": true, "view": true, "create": true, "edit": true, "delete": false},
        "grades": {"enabled": true, "view": true, "create": true, "edit": true, "delete": false},
        "sections": {"enabled": true, "view": true, "create": true, "edit": true, "delete": false},
        "attendance": {"enabled": true, "view": true, "create": true, "edit": true, "delete": false},
        "payments": {"enabled": true, "view": true, "create": false, "edit": false, "delete": false},
        "reports": {"enabled": true, "view": true, "create": true, "edit": true, "delete": false},
        "settings": {"enabled": true, "view": true, "create": false, "edit": true, "delete": false}
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
        "users": {"enabled": false, "view": false, "create": false, "edit": false, "delete": false},
        "students": {"enabled": true, "view": true, "create": false, "edit": true, "delete": false},
        "teachers": {"enabled": false, "view": false, "create": false, "edit": false, "delete": false},
        "parents": {"enabled": true, "view": true, "create": false, "edit": false, "delete": false},
        "grades": {"enabled": true, "view": true, "create": true, "edit": true, "delete": false},
        "sections": {"enabled": true, "view": true, "create": false, "edit": false, "delete": false},
        "attendance": {"enabled": true, "view": true, "create": true, "edit": true, "delete": false},
        "payments": {"enabled": false, "view": false, "create": false, "edit": false, "delete": false},
        "reports": {"enabled": true, "view": true, "create": false, "edit": false, "delete": false},
        "settings": {"enabled": false, "view": false, "create": false, "edit": false, "delete": false}
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
        "users": {"enabled": false, "view": false, "create": false, "edit": false, "delete": false},
        "students": {"enabled": true, "view": true, "create": false, "edit": false, "delete": false},
        "teachers": {"enabled": true, "view": true, "create": false, "edit": false, "delete": false},
        "parents": {"enabled": false, "view": false, "create": false, "edit": false, "delete": false},
        "grades": {"enabled": true, "view": true, "create": false, "edit": false, "delete": false},
        "sections": {"enabled": true, "view": true, "create": false, "edit": false, "delete": false},
        "attendance": {"enabled": true, "view": true, "create": false, "edit": false, "delete": false},
        "payments": {"enabled": true, "view": true, "create": false, "edit": false, "delete": false},
        "reports": {"enabled": true, "view": true, "create": false, "edit": false, "delete": false},
        "settings": {"enabled": false, "view": false, "create": false, "edit": false, "delete": false}
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
        "users": {"enabled": false, "view": false, "create": false, "edit": false, "delete": false},
        "students": {"enabled": true, "view": true, "create": false, "edit": false, "delete": false},
        "teachers": {"enabled": true, "view": true, "create": false, "edit": false, "delete": false},
        "parents": {"enabled": false, "view": false, "create": false, "edit": false, "delete": false},
        "grades": {"enabled": true, "view": true, "create": false, "edit": false, "delete": false},
        "sections": {"enabled": true, "view": true, "create": false, "edit": false, "delete": false},
        "attendance": {"enabled": true, "view": true, "create": false, "edit": false, "delete": false},
        "payments": {"enabled": true, "view": true, "create": false, "edit": false, "delete": false},
        "reports": {"enabled": true, "view": true, "create": false, "edit": false, "delete": false},
        "settings": {"enabled": false, "view": false, "create": false, "edit": false, "delete": false}
    }'::jsonb,
    TRUE
FROM schools
ON CONFLICT (school_id, name) DO NOTHING;
