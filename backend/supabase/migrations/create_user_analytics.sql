-- User Analytics and Monitoring System Schema
-- Run this in your Supabase SQL Editor

-- Create user_activity_logs table for tracking user sessions and activity
CREATE TABLE IF NOT EXISTS user_activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user_role VARCHAR(20) NOT NULL, -- 'admin', 'director', 'teacher', 'student', 'parent'
    activity_type VARCHAR(50) NOT NULL, -- 'login', 'logout', 'page_view', 'action'
    page_name VARCHAR(100), -- The page/feature they accessed
    session_id UUID,
    ip_address INET,
    user_agent TEXT,
    metadata JSONB DEFAULT '{}', -- Additional context about the activity
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for user_activity_logs
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_school_id ON user_activity_logs(school_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_user_id ON user_activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_created_at ON user_activity_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_role ON user_activity_logs(school_id, user_role);
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_date_range ON user_activity_logs(school_id, created_at);

-- Enable Row Level Security
ALTER TABLE user_activity_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_activity_logs
CREATE POLICY school_isolation_user_activity_logs_policy ON user_activity_logs 
    FOR ALL USING (school_id = get_current_school_id());

-- Create user_statistics table for aggregated daily/weekly/monthly stats
CREATE TABLE IF NOT EXISTS user_statistics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    period_type VARCHAR(20) NOT NULL, -- 'daily', 'weekly', 'monthly'
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    total_users INTEGER DEFAULT 0,
    active_users INTEGER DEFAULT 0, -- Users who logged in during the period
    new_users INTEGER DEFAULT 0, -- Users created during the period
    role_counts JSONB DEFAULT '{}', -- Count of users by role: {"admin": 5, "teacher": 20, ...}
    session_count INTEGER DEFAULT 0, -- Total sessions during the period
    page_views INTEGER DEFAULT 0, -- Total page views during the period
    avg_session_duration INTERVAL, -- Average session duration
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (school_id, period_type, period_start)
);

-- Create indexes for user_statistics
CREATE INDEX IF NOT EXISTS idx_user_statistics_school_id ON user_statistics(school_id);
CREATE INDEX IF NOT EXISTS idx_user_statistics_period ON user_statistics(school_id, period_type, period_start);
CREATE INDEX IF NOT EXISTS idx_user_statistics_date_range ON user_statistics(school_id, period_start, period_end);

-- Enable Row Level Security
ALTER TABLE user_statistics ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_statistics
CREATE POLICY school_isolation_user_statistics_policy ON user_statistics 
    FOR ALL USING (school_id = get_current_school_id());

-- Add trigger for updated_at
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_user_activity_logs_modtime') THEN
        CREATE TRIGGER update_user_activity_logs_modtime 
            BEFORE UPDATE ON user_activity_logs 
            FOR EACH ROW EXECUTE FUNCTION update_modified_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_user_statistics_modtime') THEN
        CREATE TRIGGER update_user_statistics_modtime 
            BEFORE UPDATE ON user_statistics 
            FOR EACH ROW EXECUTE FUNCTION update_modified_column();
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Could not create triggers: %', SQLERRM;
END $$;

-- Create function to calculate daily statistics
CREATE OR REPLACE FUNCTION calculate_daily_statistics(school_uuid UUID, date_to_calculate DATE DEFAULT CURRENT_DATE)
RETURNS VOID AS $$
BEGIN
    INSERT INTO user_statistics (
        school_id, period_type, period_start, period_end,
        total_users, active_users, new_users, role_counts, session_count, page_views
    )
    SELECT 
        school_uuid,
        'daily',
        date_to_calculate,
        date_to_calculate,
        (SELECT COUNT(*) FROM users WHERE school_id = school_uuid),
        (SELECT COUNT(DISTINCT user_id) FROM user_activity_logs 
         WHERE school_id = school_uuid 
         AND DATE(created_at) = date_to_calculate 
         AND activity_type = 'login'),
        (SELECT COUNT(*) FROM users 
         WHERE school_id = school_uuid 
         AND DATE(created_at) = date_to_calculate),
        (
            SELECT jsonb_object_agg(role, count)
            FROM (
                SELECT role, COUNT(*) as count
                FROM users
                WHERE school_id = school_uuid
                GROUP BY role
            ) t
        ),
        (SELECT COUNT(*) FROM user_activity_logs 
         WHERE school_id = school_uuid 
         AND DATE(created_at) = date_to_calculate 
         AND activity_type = 'login'),
        (SELECT COUNT(*) FROM user_activity_logs 
         WHERE school_id = school_uuid 
         AND DATE(created_at) = date_to_calculate 
         AND activity_type = 'page_view')
    ON CONFLICT (school_id, period_type, period_start) 
    DO UPDATE SET
        total_users = EXCLUDED.total_users,
        active_users = EXCLUDED.active_users,
        new_users = EXCLUDED.new_users,
        role_counts = EXCLUDED.role_counts,
        session_count = EXCLUDED.session_count,
        page_views = EXCLUDED.page_views,
        updated_at = CURRENT_TIMESTAMP;
END;
$$ LANGUAGE plpgsql;

-- Create function to calculate weekly statistics
CREATE OR REPLACE FUNCTION calculate_weekly_statistics(school_uuid UUID, week_start DATE DEFAULT CURRENT_DATE - INTERVAL '7 days')
RETURNS VOID AS $$
BEGIN
    INSERT INTO user_statistics (
        school_id, period_type, period_start, period_end,
        total_users, active_users, new_users, role_counts, session_count, page_views
    )
    SELECT 
        school_uuid,
        'weekly',
        week_start,
        week_start + INTERVAL '6 days',
        (SELECT COUNT(*) FROM users WHERE school_id = school_uuid),
        (SELECT COUNT(DISTINCT user_id) FROM user_activity_logs 
         WHERE school_id = school_uuid 
         AND created_at >= week_start 
         AND created_at < week_start + INTERVAL '7 days'
         AND activity_type = 'login'),
        (SELECT COUNT(*) FROM users 
         WHERE school_id = school_uuid 
         AND created_at >= week_start 
         AND created_at < week_start + INTERVAL '7 days'),
        (
            SELECT jsonb_object_agg(role, count)
            FROM (
                SELECT role, COUNT(*) as count
                FROM users
                WHERE school_id = school_uuid
                GROUP BY role
            ) t
        ),
        (SELECT COUNT(*) FROM user_activity_logs 
         WHERE school_id = school_uuid 
         AND created_at >= week_start 
         AND created_at < week_start + INTERVAL '7 days'
         AND activity_type = 'login'),
        (SELECT COUNT(*) FROM user_activity_logs 
         WHERE school_id = school_uuid 
         AND created_at >= week_start 
         AND created_at < week_start + INTERVAL '7 days'
         AND activity_type = 'page_view')
    ON CONFLICT (school_id, period_type, period_start) 
    DO UPDATE SET
        total_users = EXCLUDED.total_users,
        active_users = EXCLUDED.active_users,
        new_users = EXCLUDED.new_users,
        role_counts = EXCLUDED.role_counts,
        session_count = EXCLUDED.session_count,
        page_views = EXCLUDED.page_views,
        updated_at = CURRENT_TIMESTAMP;
END;
$$ LANGUAGE plpgsql;

-- Create function to calculate monthly statistics
CREATE OR REPLACE FUNCTION calculate_monthly_statistics(school_uuid UUID, month_start DATE DEFAULT DATE_TRUNC('month', CURRENT_DATE))
RETURNS VOID AS $$
BEGIN
    INSERT INTO user_statistics (
        school_id, period_type, period_start, period_end,
        total_users, active_users, new_users, role_counts, session_count, page_views
    )
    SELECT 
        school_uuid,
        'monthly',
        month_start,
        (DATE_TRUNC('month', month_start + INTERVAL '1 month') - INTERVAL '1 day')::DATE,
        (SELECT COUNT(*) FROM users WHERE school_id = school_uuid),
        (SELECT COUNT(DISTINCT user_id) FROM user_activity_logs 
         WHERE school_id = school_uuid 
         AND created_at >= month_start 
         AND created_at < DATE_TRUNC('month', month_start + INTERVAL '1 month')
         AND activity_type = 'login'),
        (SELECT COUNT(*) FROM users 
         WHERE school_id = school_uuid 
         AND created_at >= month_start 
         AND created_at < DATE_TRUNC('month', month_start + INTERVAL '1 month')),
        (
            SELECT jsonb_object_agg(role, count)
            FROM (
                SELECT role, COUNT(*) as count
                FROM users
                WHERE school_id = school_uuid
                GROUP BY role
            ) t
        ),
        (SELECT COUNT(*) FROM user_activity_logs 
         WHERE school_id = school_uuid 
         AND created_at >= month_start 
         AND created_at < DATE_TRUNC('month', month_start + INTERVAL '1 month')
         AND activity_type = 'login'),
        (SELECT COUNT(*) FROM user_activity_logs 
         WHERE school_id = school_uuid 
         AND created_at >= month_start 
         AND created_at < DATE_TRUNC('month', month_start + INTERVAL '1 month')
         AND activity_type = 'page_view')
    ON CONFLICT (school_id, period_type, period_start) 
    DO UPDATE SET
        total_users = EXCLUDED.total_users,
        active_users = EXCLUDED.active_users,
        new_users = EXCLUDED.new_users,
        role_counts = EXCLUDED.role_counts,
        session_count = EXCLUDED.session_count,
        page_views = EXCLUDED.page_views,
        updated_at = CURRENT_TIMESTAMP;
END;
$$ LANGUAGE plpgsql;
