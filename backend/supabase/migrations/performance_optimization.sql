-- Performance Optimization Migration
-- Run this in your Supabase SQL Editor to improve query performance

-- Add composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_users_email_school ON users(email, school_id);
CREATE INDEX IF NOT EXISTS idx_users_status_school ON users(status, school_id);
CREATE INDEX IF NOT EXISTS idx_users_role_school ON users(role, school_id);

-- Add indexes for role-specific tables
CREATE INDEX IF NOT EXISTS idx_students_user_school ON students(user_id, school_id);
CREATE INDEX IF NOT EXISTS idx_teachers_user_school ON teachers(user_id, school_id);
CREATE INDEX IF NOT EXISTS idx_parents_user_school ON parents(user_id, school_id);

-- Add indexes for search operations
CREATE INDEX IF NOT EXISTS idx_users_name_search ON users USING gin(to_tsvector('english', full_name));
CREATE INDEX IF NOT EXISTS idx_users_email_search ON users USING gin(to_tsvector('english', email));

-- Add partial indexes for active users (most common queries)
CREATE INDEX IF NOT EXISTS idx_users_active_school ON users(school_id) WHERE status = 'active';

-- Add indexes for schools table
CREATE INDEX IF NOT EXISTS idx_schools_status ON schools(status);
CREATE INDEX IF NOT EXISTS idx_schools_subdomain ON schools(subdomain);

-- Optimize auth_logs table for performance
CREATE INDEX IF NOT EXISTS idx_auth_logs_user_created ON auth_logs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_auth_logs_action_created ON auth_logs(action, created_at DESC);

-- Add connection pooling settings (if you have superuser access)
-- These settings help with high-concurrency scenarios
-- ALTER DATABASE your_database_name SET shared_buffers = '256MB';
-- ALTER DATABASE your_database_name SET effective_cache_size = '1GB';
-- ALTER DATABASE your_database_name SET maintenance_work_mem = '64MB';
-- ALTER DATABASE your_database_name SET checkpoint_completion_target = 0.9;
-- ALTER DATABASE your_database_name SET wal_buffers = '16MB';
-- ALTER DATABASE your_database_name SET default_statistics_target = 100;

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for tables that have updated_at columns
CREATE TRIGGER update_user_statistics_updated_at BEFORE UPDATE ON user_statistics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Analyze tables to update statistics for the query planner
ANALYZE users;
ANALYZE students;
ANALYZE teachers;
ANALYZE parents;
ANALYZE schools;
ANALYZE auth_logs;
ANALYZE user_activity_logs;
ANALYZE user_statistics;
