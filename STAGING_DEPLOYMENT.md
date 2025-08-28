# 🚀 Staging Deployment Workflow Guide

This guide will help you implement a proper staging → production deployment workflow using Netlify.

## 📋 **Overview**

We'll set up a workflow where:
- **Staging**: `staging` branch → `https://mark-0-staging.netlify.app`
- **Production**: `main` branch → `https://mark-0.netlify.app`

## 🔧 **Step 1: Create Staging Branch**

```bash
# Create and switch to staging branch
git checkout -b staging

# Commit your current changes
git add .
git commit -m "Setup staging branch"

# Push staging branch to GitHub
git push -u origin staging
```

## 🌐 **Step 2: Create Staging Site on Netlify**

### **Option A: Using Netlify CLI**

```bash
# Create a new staging site
netlify sites:create --name mark-0-staging

# Link the staging site to your project
netlify link --name mark-0-staging

# Deploy staging site
netlify deploy --prod --dir=.next
```

### **Option B: Using Netlify Web Interface**

1. **Go to**: https://app.netlify.com
2. **Click "Add new site"** → **"Import an existing project"**
3. **Connect to GitHub** and select your repository
4. **Configure build settings**:
   - **Build command**: `npm run build`
   - **Publish directory**: `.next`
   - **Base directory**: (leave empty)
5. **Click "Deploy site"**

## ⚙️ **Step 3: Configure Branch Deployments**

### **For Staging Site:**
1. **Go to your staging site dashboard**
2. **Navigate to**: Site settings → Build & deploy → Continuous deployment
3. **Connect to GitHub** (if not already connected)
4. **Set branch to deploy**: `staging`
5. **Configure build settings**:
   - **Build command**: `npm run build`
   - **Publish directory**: `.next`

### **For Production Site:**
1. **Go to your production site dashboard** (mark-0)
2. **Navigate to**: Site settings → Build & deploy → Continuous deployment
3. **Set branch to deploy**: `main` (or `master`)
4. **Configure build settings**:
   - **Build command**: `npm run build`
   - **Publish directory**: `.next`

## 🔄 **Step 4: Set Up Environment Variables**

### **Staging Environment Variables:**
1. **Go to staging site dashboard**
2. **Navigate to**: Site settings → Environment variables
3. **Add the same variables as production**:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://hohfixivtuqnowrdpucr.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhvaGZpeGl2dHVxbm93cmRwdWNyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYyMDQwMzksImV4cCI6MjA3MTc4MDAzOX0.6nD1dmkTw8pwN6jlhhC_2NlXCNESE884VIr9tVJsz1Y
   ```

## 🚀 **Step 5: Workflow Process**

### **Development Workflow:**

```bash
# 1. Create feature branch from staging
git checkout staging
git checkout -b feature/new-feature

# 2. Make your changes
# ... code changes ...

# 3. Commit and push to feature branch
git add .
git commit -m "Add new feature"
git push origin feature/new-feature

# 4. Create Pull Request to staging branch
# Go to GitHub and create PR: feature/new-feature → staging
```

### **Staging → Production Workflow:**

```bash
# 1. Test on staging site
# Visit: https://mark-0-staging.netlify.app

# 2. If approved, merge staging to main
git checkout main
git merge staging
git push origin main

# 3. Production will auto-deploy from main branch
```

## 📝 **Step 6: Create Deployment Scripts**

Create these scripts in your `package.json`:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "deploy:staging": "git push origin staging",
    "deploy:prod": "git checkout main && git merge staging && git push origin main"
  }
}
```

## 🔍 **Step 7: Add Staging Indicators**

Add a staging banner to your app when deployed to staging:

```typescript
// components/StagingBanner.tsx
export default function StagingBanner() {
  if (process.env.NODE_ENV === 'production' && 
      typeof window !== 'undefined' && 
      window.location.hostname.includes('staging')) {
    return (
      <div className="bg-yellow-500 text-black text-center py-2 px-4">
        🧪 STAGING ENVIRONMENT - This is a test version
      </div>
    )
  }
  return null
}
```

## 🎯 **Step 8: Automated Testing (Optional)**

Add GitHub Actions for automated testing:

```yaml
# .github/workflows/staging.yml
name: Staging Deployment

on:
  push:
    branches: [staging]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - run: npm run lint
```

## 📊 **Step 9: Monitoring and Rollback**

### **Monitor Deployments:**
- **Staging**: https://app.netlify.com/sites/mark-0-staging/deploys
- **Production**: https://app.netlify.com/sites/mark-0/deploys

### **Rollback Process:**
1. **Go to site dashboard** → **Deploys**
2. **Find the previous working deploy**
3. **Click "Publish deploy"** to rollback

## 🔐 **Step 10: Security Considerations**

### **Environment Separation:**
- Use different Supabase projects for staging and production
- Use different API keys and environment variables
- Consider using Netlify's environment-specific variables

### **Access Control:**
- Limit who can merge to main branch
- Require pull request reviews
- Set up branch protection rules on GitHub

## 🎉 **Benefits of This Workflow:**

✅ **Safe Testing**: Test changes on staging before production  
✅ **Easy Rollback**: Quick rollback if issues arise  
✅ **Team Collaboration**: Multiple developers can work on staging  
✅ **Automated Deployments**: No manual deployment needed  
✅ **Environment Isolation**: Staging and production are separate  

## 🚀 **Quick Commands:**

```bash
# Deploy to staging
npm run deploy:staging

# Deploy to production (after staging approval)
npm run deploy:prod

# Check current branch
git branch

# Switch between environments
git checkout staging  # for staging work
git checkout main     # for production work
```

---

**Next Steps:**
1. Create the staging branch and push to GitHub
2. Set up the staging site on Netlify
3. Configure branch deployments
4. Test the workflow with a small change

Would you like me to help you implement any specific part of this workflow?
