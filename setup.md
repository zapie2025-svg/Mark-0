# 🚀 LinkedIn Post Automation - Setup Guide

## Quick Setup Steps

### 1. Environment Configuration

Create a `.env.local` file in the root directory with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. Supabase Database Setup

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `supabase-schema.sql`
4. Run the SQL to create the database schema

### 3. Authentication Setup (Optional)

#### For Google OAuth:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add your domain to authorized origins
6. In Supabase: Settings > Auth > Providers > Google
7. Add your Google Client ID and Secret

#### For LinkedIn OAuth:
1. Go to [LinkedIn Developers](https://developer.linkedin.com/)
2. Create a new app
3. Configure OAuth 2.0 settings
4. In Supabase: Settings > Auth > Providers > LinkedIn
5. Add your LinkedIn Client ID and Secret

### 4. Start Development Server

```bash
npm run dev
```

Visit http://localhost:3000 to see your application!

## 🎯 What You'll Get

✅ **Complete Authentication Flow**
- Google and LinkedIn OAuth
- Secure user sessions
- Protected routes

✅ **Post Creation with AI**
- Topic and tone selection
- Mock AI post generation
- Save as draft functionality

✅ **Post Scheduling**
- Date and time picker
- Schedule management
- Visual calendar view

✅ **Post Publishing**
- One-click publishing
- Status tracking
- Published post history

✅ **Modern UI/UX**
- Responsive design
- Loading states
- Toast notifications
- Clean navigation

## 🔧 API Endpoints Ready

- `POST /api/posts/generate` - Generate AI posts
- `POST /api/posts` - Create new posts
- `GET /api/posts` - Fetch user posts
- `POST /api/posts/schedule` - Schedule posts
- `POST /api/posts/publish` - Publish posts

## 🗄️ Database Schema

The `posts` table includes:
- User authentication
- Post content and status
- Scheduling capabilities
- Row-level security
- Automatic timestamps

## 🚀 Next Steps

1. **Test the Authentication**: Try logging in with Google/LinkedIn
2. **Create Your First Post**: Use the AI generator
3. **Schedule a Post**: Set a future date/time
4. **Publish a Post**: Mark it as published
5. **Customize**: Modify the UI, add features, integrate real AI

## 🆘 Troubleshooting

**Authentication Issues:**
- Check your Supabase URL and anon key
- Verify OAuth provider settings
- Check browser console for errors

**Database Issues:**
- Ensure the SQL schema was executed
- Check Supabase logs for errors
- Verify RLS policies are active

**API Issues:**
- Check network tab for failed requests
- Verify environment variables
- Check server logs

## 🎉 You're Ready!

Your LinkedIn Post Automation Dashboard is now fully functional with:
- ✅ User authentication
- ✅ Post creation and management
- ✅ Scheduling system
- ✅ Publishing workflow
- ✅ Modern, responsive UI

Start creating and scheduling your LinkedIn posts! 🚀
