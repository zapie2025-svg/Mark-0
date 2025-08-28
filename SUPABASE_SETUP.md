# 🔗 Supabase Setup Guide for LinkedIn Post Automation Dashboard

## 📋 **Prerequisites**
- Supabase account (https://supabase.com)
- Your project URL: `https://hohfixivtuqnowrdpucr.supabase.co`

## 🚀 **Step 1: Get Your Supabase Credentials**

1. **Go to your Supabase Dashboard**
   - Visit: https://supabase.com/dashboard
   - Select your project: `hohfixivtuqnowrdpucr`

2. **Get API Keys**
   - Navigate to: **Settings** → **API**
   - Copy the following values:
     - **Project URL**: `https://hohfixivtuqnowrdpucr.supabase.co`
     - **anon public key**: (starts with `eyJ...`)

## 🔧 **Step 2: Set Up Environment Variables**

1. **Create `.env.local` file** in your project root:
```bash
touch .env.local
```

2. **Add your credentials** to `.env.local`:
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://hohfixivtuqnowrdpucr.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_actual_anon_key_here
```

## 🗄️ **Step 3: Set Up Database Schema**

### Option A: Using Supabase Dashboard (Recommended)

1. **Go to SQL Editor** in your Supabase dashboard
2. **Create a new query** and paste this SQL:

```sql
-- Create the posts table
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
```

3. **Run the query** to create all tables and policies

### Option B: Using Supabase CLI (Advanced)

If you have Supabase CLI installed:
```bash
supabase db push
```

## 🔐 **Step 4: Configure Authentication**

1. **Go to Authentication** → **Settings** in your Supabase dashboard
2. **Enable Google OAuth**:
   - Add your Google OAuth credentials
   - Redirect URL: `https://hohfixivtuqnowrdpucr.supabase.co/auth/v1/callback`

3. **Enable LinkedIn OAuth** (Optional):
   - Add your LinkedIn OAuth credentials
   - Redirect URL: `https://hohfixivtuqnowrdpucr.supabase.co/auth/v1/callback`

## 🧪 **Step 5: Test the Connection**

1. **Start your development server**:
```bash
npm run dev
```

2. **Visit your app**: http://localhost:3000

3. **Check the console** for any connection errors

## 🔍 **Step 6: Verify Setup**

1. **Check Tables**: Go to **Table Editor** in Supabase dashboard
   - You should see `posts` and `user_streaks` tables

2. **Check Policies**: Go to **Authentication** → **Policies**
   - Verify RLS policies are created

3. **Test Authentication**: Try logging in with Google

## 🚨 **Troubleshooting**

### Common Issues:

1. **"Invalid API key" error**:
   - Double-check your anon key in `.env.local`
   - Make sure there are no extra spaces

2. **"Table doesn't exist" error**:
   - Run the SQL schema creation script
   - Check if tables exist in Table Editor

3. **Authentication not working**:
   - Verify OAuth providers are configured
   - Check redirect URLs

4. **RLS policies blocking access**:
   - Ensure user is authenticated
   - Check policy conditions

## 📞 **Need Help?**

- **Supabase Docs**: https://supabase.com/docs
- **Discord Community**: https://discord.supabase.com
- **GitHub Issues**: Create an issue in your project repo

## ✅ **Next Steps**

Once setup is complete:
1. Your app will automatically switch from demo mode to real Supabase
2. All data will be persisted in your database
3. Authentication will work with real users
4. Streak tracking will be automatic
5. You can deploy to production!

---

**🎉 Congratulations! Your LinkedIn Post Automation Dashboard is now connected to Supabase!**
