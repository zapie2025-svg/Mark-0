# 🚀 Deployment Guide - LinkedIn Post Automation

## Deploy to Netlify

### Prerequisites
- ✅ Supabase project set up with database schema
- ✅ Environment variables configured
- ✅ Project builds successfully locally

### Step 1: Prepare Your Repository

1. **Initialize Git** (if not already done):
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. **Create GitHub Repository**:
   - Go to [GitHub](https://github.com)
   - Create a new repository
   - Push your code:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git branch -M main
   git push -u origin main
   ```

### Step 2: Deploy to Netlify

#### Option A: Deploy from GitHub (Recommended)

1. **Go to Netlify**:
   - Visit [netlify.com](https://netlify.com)
   - Sign up/Login with your GitHub account

2. **Create New Site**:
   - Click **"New site from Git"**
   - Choose **GitHub**
   - Select your repository

3. **Configure Build Settings**:
   - **Build command**: `npm run build`
   - **Publish directory**: `.next`
   - Click **"Deploy site"**

#### Option B: Deploy from Local Files

1. **Install Netlify CLI**:
   ```bash
   npm install -g netlify-cli
   ```

2. **Login to Netlify**:
   ```bash
   netlify login
   ```

3. **Deploy**:
   ```bash
   netlify deploy
   ```

### Step 3: Configure Environment Variables

1. **Go to Site Settings**:
   - In your Netlify dashboard, go to **Site settings** → **Environment variables**

2. **Add Environment Variables**:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://hohfixivtuqnowrdpucr.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
   ```

3. **Redeploy**:
   - Go to **Deploys** tab
   - Click **"Trigger deploy"** → **"Deploy site"**

### Step 4: Configure Supabase for Production

1. **Update Supabase Auth Settings**:
   - Go to your Supabase dashboard
   - **Authentication** → **URL Configuration**
   - Add your Netlify URL to **Site URL**
   - Add your Netlify URL + `/auth/callback` to **Redirect URLs**

2. **Example URLs**:
   ```
   Site URL: https://your-app-name.netlify.app
   Redirect URLs: https://your-app-name.netlify.app/auth/callback
   ```

### Step 5: Test Your Deployment

1. **Visit your site**: `https://your-app-name.netlify.app`
2. **Test authentication**: Try logging in
3. **Test features**: Create posts, save drafts, etc.

### Troubleshooting

#### Build Errors
- Check build logs in Netlify dashboard
- Ensure all dependencies are in `package.json`
- Verify TypeScript compilation

#### Authentication Issues
- Check environment variables in Netlify
- Verify Supabase URL configuration
- Check browser console for errors

#### API Errors
- Ensure Supabase database is set up
- Check RLS policies are configured
- Verify API routes are working

### Custom Domain (Optional)

1. **Add Custom Domain**:
   - Go to **Domain settings** in Netlify
   - Click **"Add custom domain"**
   - Follow DNS configuration instructions

2. **Update Supabase URLs**:
   - Update Site URL and Redirect URLs in Supabase
   - Redeploy your application

### Performance Optimization

1. **Enable Netlify Analytics** (Optional)
2. **Configure CDN settings**
3. **Enable compression**
4. **Set up caching headers**

---

## 🎉 Your App is Live!

Your LinkedIn Post Automation Dashboard is now deployed and accessible worldwide!

**Next Steps:**
- Share your app with users
- Monitor performance and usage
- Set up monitoring and analytics
- Consider adding a custom domain
