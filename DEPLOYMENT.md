# 🚀 Deployment Guide for LinkedIn Post Automation

This guide will help you deploy your LinkedIn Post Automation Dashboard to Netlify.

## 📋 **Prerequisites**

- GitHub account
- Netlify account
- Supabase project set up
- OpenAI API key (for AI post generation)

## 🔧 **Step 1: Prepare Your Repository**

### **Initialize Git (if not already done)**
```bash
git init
git add .
git commit -m "Initial commit"
```

### **Create GitHub Repository**
1. Go to https://github.com/new
2. Name your repository (e.g., "Mark-0")
3. Make it public or private
4. Don't initialize with README (we already have one)

### **Push to GitHub**
```bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main
```

## 🌐 **Step 2: Deploy to Netlify**

### **Option A: Deploy from GitHub (Recommended)**

1. **Go to**: https://app.netlify.com
2. **Click "Add new site"** → **"Import an existing project"**
3. **Connect to GitHub** and select your repository
4. **Configure build settings**:
   - **Build command**: `npm run build`
   - **Publish directory**: `.next`
   - **Base directory**: (leave empty)
5. **Click "Deploy site"**

### **Option B: Deploy using Netlify CLI**

```bash
# Install Netlify CLI globally
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy
netlify deploy --prod
```

## ⚙️ **Step 3: Configure Environment Variables**

### **In Netlify Dashboard:**
1. **Go to your site dashboard**
2. **Navigate to**: Site settings → Environment variables
3. **Add these variables**:

```
NEXT_PUBLIC_SUPABASE_URL=https://hohfixivtuqnowrdpucr.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhvaGZpeGl2dHVxbm93cmRwdWNyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYyMDQwMzksImV4cCI6MjA3MTc4MDAzOX0.6nD1dmkTw8pwN6jlhhC_2NlXCNESE884VIr9tVJsz1Y
OPENAI_API_KEY=your_openai_api_key_here
```

### **Get OpenAI API Key:**
1. **Go to**: https://platform.openai.com/api-keys
2. **Create a new API key**
3. **Copy the key** and add it to Netlify environment variables

## 🔐 **Step 4: Configure Supabase Authentication**

### **Update Supabase Settings:**
1. **Go to your Supabase dashboard**
2. **Navigate to**: Authentication → URL Configuration
3. **Update these URLs**:
   - **Site URL**: `https://your-site-name.netlify.app`
   - **Redirect URLs**: 
     - `https://your-site-name.netlify.app/auth/callback`
     - `https://your-site-name.netlify.app/dashboard`

## 🧪 **Step 5: Test Your Deployment**

1. **Visit your live site**
2. **Test authentication** (sign up/login)
3. **Test post generation** with AI
4. **Test all features** (create, draft, schedule, publish)

## 🔄 **Step 6: Set Up Continuous Deployment**

### **Enable Auto-Deploy:**
1. **Go to your site dashboard**
2. **Navigate to**: Site settings → Build & deploy → Continuous deployment
3. **Connect to GitHub** (if not already connected)
4. **Set branch to deploy**: `main`
5. **Configure build settings**:
   - **Build command**: `npm run build`
   - **Publish directory**: `.next`

## 🚀 **Step 7: Update and Deploy**

### **For Future Updates:**
```bash
# Make your changes
git add .
git commit -m "Your update message"
git push origin main

# Netlify will automatically deploy your changes
```

## 🎯 **Environment URLs**

- **Production**: `https://mark-0.netlify.app`
- **Staging**: `https://mark-0-staging.netlify.app`

## 🔧 **Troubleshooting**

### **Common Issues:**

1. **Build Fails:**
   - Check build logs in Netlify dashboard
   - Ensure all dependencies are in package.json
   - Verify environment variables are set

2. **Authentication Issues:**
   - Verify Supabase URL and keys
   - Check redirect URLs in Supabase settings
   - Ensure environment variables are correct

3. **AI Generation Fails:**
   - Verify OpenAI API key is set
   - Check API key permissions
   - Ensure you have OpenAI credits

### **Get Help:**
- **Netlify Docs**: https://docs.netlify.com
- **Supabase Docs**: https://supabase.com/docs
- **OpenAI Docs**: https://platform.openai.com/docs

## 🎉 **Success!**

Your LinkedIn Post Automation Dashboard is now live with:
- ✅ **Real AI-powered post generation**
- ✅ **User authentication**
- ✅ **Post management** (draft, schedule, publish)
- ✅ **Professional UI/UX**
- ✅ **Continuous deployment**

---

**Need help?** Check the troubleshooting section or reach out for support!
