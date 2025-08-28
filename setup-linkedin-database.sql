-- LinkedIn Profiles Table
CREATE TABLE IF NOT EXISTS linkedin_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  linkedin_id TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  profile_picture TEXT,
  email TEXT,
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, linkedin_id)
);

-- Add LinkedIn columns to posts table
ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS linkedin_post_id TEXT,
ADD COLUMN IF NOT EXISTS linkedin_posted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS linkedin_post_status TEXT DEFAULT 'pending';

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_linkedin_profiles_user_id ON linkedin_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_linkedin_profiles_linkedin_id ON linkedin_profiles(linkedin_id);
CREATE INDEX IF NOT EXISTS idx_posts_linkedin_post_id ON posts(linkedin_post_id);

-- RLS Policies for linkedin_profiles
ALTER TABLE linkedin_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own LinkedIn profile" ON linkedin_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own LinkedIn profile" ON linkedin_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own LinkedIn profile" ON linkedin_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own LinkedIn profile" ON linkedin_profiles
  FOR DELETE USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for linkedin_profiles
CREATE TRIGGER update_linkedin_profiles_updated_at 
  BEFORE UPDATE ON linkedin_profiles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
