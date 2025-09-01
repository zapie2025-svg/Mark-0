-- Mark.0 Database Optimization for 1000+ Users
-- Run this in your Supabase SQL Editor

-- 1. Advanced Indexing Strategy for Better Performance

-- Composite index for common post queries (user_id + status + created_at)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_posts_user_status_created 
ON posts(user_id, status, created_at DESC);

-- Partial index for scheduled posts (most critical for performance)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_posts_scheduled_status_time 
ON posts(status, schedule_time) 
WHERE status = 'scheduled';

-- Partial index for active users (posts from last 30 days)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_posts_active_users 
ON posts(user_id, created_at DESC) 
WHERE created_at > NOW() - INTERVAL '30 days';

-- Index for user streaks queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_streaks_user_activity 
ON user_streaks(user_id, last_activity_date DESC);

-- 2. Database Partitioning for Large Scale (Optional - for 10k+ users)

-- Create partitioned table structure (uncomment when needed)
/*
CREATE TABLE posts_partitioned (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  status TEXT CHECK (status IN ('draft', 'scheduled', 'published')) DEFAULT 'draft',
  schedule_time TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
) PARTITION BY RANGE (created_at);

-- Create monthly partitions
CREATE TABLE posts_2024_01 PARTITION OF posts_partitioned
FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');

CREATE TABLE posts_2024_02 PARTITION OF posts_partitioned
FOR VALUES FROM ('2024-02-01') TO ('2024-03-01');

CREATE TABLE posts_2024_03 PARTITION OF posts_partitioned
FOR VALUES FROM ('2024-03-01') TO ('2024-04-01');
*/

-- 3. Performance Optimization Functions

-- Function to clean up old data automatically
CREATE OR REPLACE FUNCTION cleanup_old_data()
RETURNS void AS $$
BEGIN
  -- Delete posts older than 2 years (keep for analytics)
  DELETE FROM posts 
  WHERE created_at < NOW() - INTERVAL '2 years' 
  AND status = 'published';
  
  -- Update user streaks for inactive users
  UPDATE user_streaks 
  SET current_streak = 0 
  WHERE last_activity_date < NOW() - INTERVAL '90 days';
  
  -- Log cleanup activity
  INSERT INTO system_logs (action, details, created_at) 
  VALUES ('cleanup', 'Old data cleanup completed', NOW());
END;
$$ LANGUAGE plpgsql;

-- 4. System Monitoring Tables

-- Create system logs table for monitoring
CREATE TABLE IF NOT EXISTS system_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action TEXT NOT NULL,
  details JSONB,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create performance metrics table
CREATE TABLE IF NOT EXISTS performance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_name TEXT NOT NULL,
  metric_value NUMERIC NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  context JSONB
);

-- Create indexes for monitoring tables
CREATE INDEX IF NOT EXISTS idx_system_logs_action_created 
ON system_logs(action, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_performance_metrics_name_timestamp 
ON performance_metrics(metric_name, timestamp DESC);

-- 5. Enhanced RLS Policies for Better Security

-- Drop existing policies and recreate with better performance
DROP POLICY IF EXISTS "Users can view own posts" ON posts;
DROP POLICY IF EXISTS "Users can insert own posts" ON posts;
DROP POLICY IF EXISTS "Users can update own posts" ON posts;
DROP POLICY IF EXISTS "Users can delete own posts" ON posts;

-- Recreate policies with better performance
CREATE POLICY "Users can view own posts" ON posts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own posts" ON posts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own posts" ON posts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own posts" ON posts
  FOR DELETE USING (auth.uid() = user_id);

-- 6. Automated Maintenance Functions

-- Function to update performance metrics
CREATE OR REPLACE FUNCTION update_performance_metrics()
RETURNS void AS $$
DECLARE
  total_posts INTEGER;
  active_users INTEGER;
  avg_response_time NUMERIC;
BEGIN
  -- Count total posts
  SELECT COUNT(*) INTO total_posts FROM posts;
  
  -- Count active users (users with posts in last 30 days)
  SELECT COUNT(DISTINCT user_id) INTO active_users 
  FROM posts 
  WHERE created_at > NOW() - INTERVAL '30 days';
  
  -- Insert metrics
  INSERT INTO performance_metrics (metric_name, metric_value, context) VALUES
    ('total_posts', total_posts, '{"timestamp": "' || NOW() || '"}'),
    ('active_users', active_users, '{"timestamp": "' || NOW() || '"}');
END;
$$ LANGUAGE plpgsql;

-- 7. Database Configuration Optimizations

-- Set optimal PostgreSQL settings for performance
-- Note: These are recommendations - actual values depend on your Supabase plan

-- Enable query plan caching
-- SET plan_cache_mode = 'auto';

-- Optimize work memory for complex queries
-- SET work_mem = '256MB';

-- Enable parallel query execution
-- SET max_parallel_workers_per_gather = 4;

-- 8. Monitoring and Alerting Functions

-- Function to check system health
CREATE OR REPLACE FUNCTION check_system_health()
RETURNS TABLE(
  metric_name TEXT,
  metric_value NUMERIC,
  status TEXT,
  recommendation TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    'total_posts'::TEXT,
    (SELECT COUNT(*) FROM posts)::NUMERIC,
    CASE 
      WHEN (SELECT COUNT(*) FROM posts) > 10000 THEN 'warning'
      ELSE 'healthy'
    END::TEXT,
    CASE 
      WHEN (SELECT COUNT(*) FROM posts) > 10000 THEN 'Consider archiving old posts'
      ELSE 'System performing well'
    END::TEXT
  UNION ALL
  SELECT 
    'active_users'::TEXT,
    (SELECT COUNT(DISTINCT user_id) FROM posts WHERE created_at > NOW() - INTERVAL '30 days')::NUMERIC,
    CASE 
      WHEN (SELECT COUNT(DISTINCT user_id) FROM posts WHERE created_at > NOW() - INTERVAL '30 days') > 500 THEN 'warning'
      ELSE 'healthy'
    END::TEXT,
    CASE 
      WHEN (SELECT COUNT(DISTINCT user_id) FROM posts WHERE created_at > NOW() - INTERVAL '30 days') > 500 THEN 'Consider scaling infrastructure'
      ELSE 'User load is manageable'
    END::TEXT;
END;
$$ LANGUAGE plpgsql;

-- 9. Automated Cleanup Schedule (if using pg_cron extension)

-- Schedule daily cleanup (uncomment if pg_cron is available)
-- SELECT cron.schedule('daily-cleanup', '0 2 * * *', 'SELECT cleanup_old_data();');

-- Schedule performance metrics update every hour
-- SELECT cron.schedule('hourly-metrics', '0 * * * *', 'SELECT update_performance_metrics();');

-- 10. Query Optimization Hints

-- Create a view for frequently accessed user data
CREATE OR REPLACE VIEW user_post_summary AS
SELECT 
  u.id as user_id,
  u.email,
  COUNT(p.id) as total_posts,
  COUNT(CASE WHEN p.status = 'published' THEN 1 END) as published_posts,
  COUNT(CASE WHEN p.status = 'scheduled' THEN 1 END) as scheduled_posts,
  MAX(p.created_at) as last_post_date,
  us.current_streak,
  us.longest_streak
FROM auth.users u
LEFT JOIN posts p ON u.id = p.user_id
LEFT JOIN user_streaks us ON u.id = us.user_id
GROUP BY u.id, u.email, us.current_streak, us.longest_streak;

-- Create index on the view for better performance
CREATE INDEX IF NOT EXISTS idx_user_post_summary_user_id 
ON user_post_summary(user_id);

-- 11. Final Verification

-- Verify all indexes are created
SELECT 
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes 
WHERE tablename IN ('posts', 'user_streaks', 'system_logs', 'performance_metrics')
ORDER BY tablename, indexname;

-- Check system health
SELECT * FROM check_system_health();

-- Display optimization summary
SELECT 
  'Database optimization completed successfully!' as status,
  COUNT(*) as total_indexes,
  (SELECT COUNT(*) FROM posts) as total_posts,
  (SELECT COUNT(DISTINCT user_id) FROM posts) as total_users
FROM pg_indexes 
WHERE tablename IN ('posts', 'user_streaks');

