-- LinkedIn Post Automation Database Setup
-- Run this in your Supabase SQL Editor

-- Create posts table
CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  status TEXT CHECK (status IN ('draft', 'scheduled', 'published')) DEFAULT 'draft',
  schedule_time TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user streaks table for tracking posting streaks
CREATE TABLE IF NOT EXISTS user_streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  total_posts INTEGER DEFAULT 0,
  last_activity_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_schedule_time ON posts(schedule_time);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at);
CREATE INDEX IF NOT EXISTS idx_user_streaks_user_id ON user_streaks(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_streaks ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for posts
CREATE POLICY "Users can view own posts" ON posts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own posts" ON posts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own posts" ON posts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own posts" ON posts
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for user_streaks
CREATE POLICY "Users can view own streaks" ON user_streaks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own streaks" ON user_streaks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own streaks" ON user_streaks
  FOR UPDATE USING (auth.uid() = user_id);

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update the updated_at column
CREATE TRIGGER update_posts_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_streaks_updated_at
  BEFORE UPDATE ON user_streaks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create a function to update user streaks when posts are created
CREATE OR REPLACE FUNCTION update_user_streak()
RETURNS TRIGGER AS $$
DECLARE
  user_streak_record user_streaks%ROWTYPE;
  today_date DATE := CURRENT_DATE;
BEGIN
  -- Try to get existing streak record
  SELECT * INTO user_streak_record 
  FROM user_streaks 
  WHERE user_id = NEW.user_id;
  
  -- If no streak record exists, create one
  IF user_streak_record IS NULL THEN
    INSERT INTO user_streaks (user_id, current_streak, longest_streak, total_posts, last_activity_date)
    VALUES (NEW.user_id, 1, 1, 1, today_date);
  ELSE
    -- Check if this is a new day
    IF user_streak_record.last_activity_date < today_date THEN
      -- Check if it's consecutive (yesterday)
      IF user_streak_record.last_activity_date = today_date - INTERVAL '1 day' THEN
        -- Increment streak
        UPDATE user_streaks 
        SET 
          current_streak = current_streak + 1,
          longest_streak = GREATEST(current_streak + 1, longest_streak),
          total_posts = total_posts + 1,
          last_activity_date = today_date
        WHERE user_id = NEW.user_id;
      ELSE
        -- Reset streak to 1
        UPDATE user_streaks 
        SET 
          current_streak = 1,
          total_posts = total_posts + 1,
          last_activity_date = today_date
        WHERE user_id = NEW.user_id;
      END IF;
    ELSE
      -- Same day, just increment total posts
      UPDATE user_streaks 
      SET total_posts = total_posts + 1
      WHERE user_id = NEW.user_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update streaks when posts are created
CREATE TRIGGER update_streak_on_post_create
  AFTER INSERT ON posts
  FOR EACH ROW
  EXECUTE FUNCTION update_user_streak();

-- Verify the setup
SELECT 'Database setup completed successfully!' as status;
