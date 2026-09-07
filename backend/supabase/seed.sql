-- ==========================================
-- SEED DATA FOR EDUCORE MULTI-TENANT SYSTEM
-- ==========================================
-- Execute this script in your Supabase SQL Editor to populate the database with a default school
-- and sample users for all five workspace roles: Admin, Director, Teacher, Parent, and Student.
-- Use the password 'demo123' to log in as any of these users on the login page.

-- 1. Create a Default School (Tenant)
INSERT INTO schools (id, name, subdomain, domain, status)
VALUES (
    'a7b3c29d-4e8f-4d91-bd30-4e123456789a', 
    'Oakridge International Academy', 
    'oakridge', 
    'oakridge.educore.edu', 
    'active'
)
ON CONFLICT (id) DO NOTHING;

-- 2. Insert Users for Each Workspace Role
-- Note: 'demo123' is the password for all users
INSERT INTO users (id, school_id, email, password_hash, full_name, role, phone, status)
VALUES 
    -- Admin User
    (
        'e1b9b1d3-3b10-44dc-9d41-ee4490807060',
        'a7b3c29d-4e8f-4d91-bd30-4e123456789a',
        'admin@demo.com',
        'demo123',
        'Jonathan Archer',
        'admin',
        '+1 (555) 019-2834',
        'active'
    ),
    -- Director User
    (
        'd2c8c2e4-4c20-45dd-ae52-ff5501918171',
        'a7b3c29d-4e8f-4d91-bd30-4e123456789a',
        'director@demo.com',
        'demo123',
        'Dr. Eleanor Vance',
        'director',
        '+1 (555) 014-9988',
        'active'
    ),
    -- Teacher User
    (
        'c3d7d3f5-5d30-46ee-bf63-006612029282',
        'a7b3c29d-4e8f-4d91-bd30-4e123456789a',
        'teacher@demo.com',
        'demo123',
        'Sarah Jenkins',
        'teacher',
        '+1 (555) 018-7744',
        'active'
    ),
    -- Parent User
    (
        'b4e6e4a6-6e40-47ff-c074-117723130393',
        'a7b3c29d-4e8f-4d91-bd30-4e123456789a',
        'parent@demo.com',
        'demo123',
        'Robert Mercer',
        'parent',
        '+1 (555) 012-3322',
        'active'
    ),
    -- Student User
    (
        'a5f5f5b7-7f50-48aa-d185-228834241404',
        'a7b3c29d-4e8f-4d91-bd30-4e123456789a',
        'student@demo.com',
        'demo123',
        'Lily Mercer',
        'student',
        '+1 (555) 015-6611',
        'active'
    )
ON CONFLICT (id) DO NOTHING;

-- 3. Insert Profile Data into Corresponding Table Profiles

-- Teacher Profile
INSERT INTO teachers (id, school_id, user_id, employee_id, full_name, department, subjects)
VALUES (
    'f1e2d3c4-b5a6-9f8e-7d6c-5b4a3f2e1d0c',
    'a7b3c29d-4e8f-4d91-bd30-4e123456789a',
    'c3d7d3f5-5d30-46ee-bf63-006612029282',
    'EMP-2026-042',
    'Sarah Jenkins',
    'Mathematics',
    ARRAY['Algebra I', 'Geometry', 'Calculus AB']
)
ON CONFLICT (id) DO NOTHING;

-- Parent Profile
INSERT INTO parents (id, school_id, user_id, full_name, relationship, emergency_contact)
VALUES (
    '8c7b6a5d-4e3f-2d1c-0b9a-8f7e6d5c4b3a',
    'a7b3c29d-4e8f-4d91-bd30-4e123456789a',
    'b4e6e4a6-6e40-47ff-c074-117723130393',
    'Robert Mercer',
    'Father',
    '+1 (555) 012-3322'
)
ON CONFLICT (id) DO NOTHING;

-- Student Profile (linked to parent)
INSERT INTO students (id, school_id, user_id, parent_id, admission_number, full_name, grade_level, section)
VALUES (
    '1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d',
    'a7b3c29d-4e8f-4d91-bd30-4e123456789a',
    'a5f5f5b7-7f50-48aa-d185-228834241404',
    '8c7b6a5d-4e3f-2d1c-0b9a-8f7e6d5c4b3a',
    'ADM-2026-9081',
    'Lily Mercer',
    'Grade 10',
    'Section A'
)
ON CONFLICT (id) DO NOTHING;
