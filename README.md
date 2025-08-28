# LinkedIn Post Automation Dashboard

A modern web application for creating, scheduling, and publishing LinkedIn posts with AI assistance. Built with Next.js, Supabase, and Tailwind CSS.

## 🚀 Features

### ✅ Phase 1 - Complete
- **Authentication**: Google and LinkedIn OAuth via Supabase
- **Create Posts**: AI-powered post generation based on topic and tone
- **Schedule Posts**: Set specific dates and times for post publishing
- **Publish Posts**: Mark posts as published (LinkedIn API integration planned for future)
- **Dashboard**: Clean, modern interface with tabbed navigation
- **Real-time Updates**: Live post status updates and notifications

### 🔮 Future Enhancements
- LinkedIn API integration for actual posting
- Advanced AI post generation with OpenAI
- Post analytics and performance tracking
- Bulk post scheduling
- Post templates and saved drafts
- Team collaboration features

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Icons**: Lucide React
- **Notifications**: React Hot Toast
- **Date Handling**: date-fns

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account
- Google OAuth credentials (optional)
- LinkedIn OAuth credentials (optional)

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone <repository-url>
cd linkedin-post-automation
```

### 2. Install Dependencies
```bash
npm install
# or
yarn install
```

### 3. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Settings > API to get your project URL and anon key
3. Copy the SQL from `supabase-schema.sql` and run it in your Supabase SQL editor

### 4. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 5. Configure Authentication (Optional)

#### Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add your domain to authorized origins
6. Add the client ID and secret to Supabase Auth settings

#### LinkedIn OAuth
1. Go to [LinkedIn Developers](https://developer.linkedin.com/)
2. Create a new app
3. Configure OAuth 2.0 settings
4. Add the client ID and secret to Supabase Auth settings

### 6. Run the Development Server
```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
├── app/                    # Next.js 13+ app directory
│   ├── api/               # API routes
│   │   └── posts/         # Post-related endpoints
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Main page
├── components/            # React components
│   ├── AuthPage.tsx       # Authentication page
│   ├── Dashboard.tsx      # Main dashboard
│   ├── CreatePostTab.tsx  # Post creation tab
│   ├── ScheduleTab.tsx    # Post scheduling tab
│   └── PublishTab.tsx     # Post publishing tab
├── lib/                   # Utility libraries
│   └── supabase.ts        # Supabase client configuration
├── supabase-schema.sql    # Database schema
└── README.md             # This file
```

## 🔧 API Endpoints

### POST `/api/posts/generate`
Generate AI-powered posts based on topic and tone.

**Request:**
```json
{
  "topic": "AI in business",
  "tone": "professional"
}
```

**Response:**
```json
{
  "postContent": "🚀 **AI in business**: A Game-Changer..."
}
```

### POST `/api/posts`
Create a new post.

**Request:**
```json
{
  "content": "Post content here...",
  "status": "draft"
}
```

### GET `/api/posts`
Fetch all posts for the authenticated user.

### POST `/api/posts/schedule`
Schedule a post for publishing.

**Request:**
```json
{
  "postId": "uuid",
  "scheduleTime": "2024-01-15T10:00:00Z"
}
```

### POST `/api/posts/publish`
Publish a post (updates status to 'published').

**Request:**
```json
{
  "postId": "uuid"
}
```

## 🗄️ Database Schema

### Posts Table
```sql
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  status TEXT CHECK (status IN ('draft', 'scheduled', 'published')) DEFAULT 'draft',
  schedule_time TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## 🎨 UI Components

The application uses a clean, modern design with:

- **Responsive Layout**: Works on desktop, tablet, and mobile
- **Tabbed Navigation**: Easy switching between Create, Schedule, and Publish
- **Loading States**: Smooth loading indicators
- **Toast Notifications**: User feedback for actions
- **Form Validation**: Client-side validation with helpful error messages
- **Empty States**: Friendly messages when no data is available

## 🔒 Security Features

- **Row Level Security (RLS)**: Users can only access their own posts
- **Authentication Required**: All API endpoints require valid user session
- **Input Validation**: Server-side validation for all inputs
- **CORS Protection**: Configured for production use

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Other Platforms
The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues:

1. Check the [Issues](https://github.com/your-repo/issues) page
2. Create a new issue with detailed information
3. Include your environment details and error messages

## 🙏 Acknowledgments

- [Supabase](https://supabase.com) for the amazing backend platform
- [Next.js](https://nextjs.org) for the React framework
- [Tailwind CSS](https://tailwindcss.com) for the styling system
- [Lucide](https://lucide.dev) for the beautiful icons
