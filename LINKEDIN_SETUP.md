# LinkedIn OAuth Setup Guide

This guide will help you set up LinkedIn OAuth for profile connection and posting capabilities, separate from user authentication.

## 🎯 **What This Setup Enables:**

- ✅ **Profile Connection**: Users can connect their LinkedIn profiles
- ✅ **Profile Information**: Display user's LinkedIn profile data
- ✅ **Direct Posting**: Post content directly to LinkedIn
- ✅ **No Authentication**: Users still login with email/password or Google

## 📋 **Step-by-Step Setup:**

### **Step 1: Create LinkedIn OAuth App**

1. **Go to LinkedIn Developers**:
   - Visit: https://www.linkedin.com/developers/
   - Sign in with your LinkedIn account

2. **Create New App**:
   - Click "Create App" button
   - Fill in the form:
     - **App Name**: `Mark-0 LinkedIn Integration`
     - **LinkedIn Page**: Select your LinkedIn page
     - **App Logo**: Upload a logo (optional)
   - Click "Create App"

3. **Get App Credentials**:
   - After creating, note down:
     - **Client ID** (you'll need this)
     - **Client Secret** (you'll need this)

### **Step 2: Configure LinkedIn OAuth Settings**

1. **In your LinkedIn app dashboard**:
   - Click on "Auth" tab in the left sidebar

2. **Add Redirect URLs**:
   - In "Redirect URLs" section, add:
   ```
  
   https://mark-0.netlify.app/linkedin-callback
   ```

3. **Configure OAuth Scopes**:
   - Add these scopes:
     - `openid`
     - `profile`
     - `email`
     - `w_member_social`

4. **Save Settings**:
   - Click "Update" to save your changes

### **Step 3: Configure Environment Variables**

Add these environment variables to your `.env.local` file:

```env
# LinkedIn OAuth Configuration
LINKEDIN_CLIENT_ID=your_linkedin_client_id_here
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret_here
NEXT_PUBLIC_SITE_URL=https://mark-0.netlify.app
```

### **Step 4: Update LinkedIn Analytics Card**

Replace `YOUR_LINKEDIN_CLIENT_ID` in `components/LinkedInAnalyticsCard.tsx` with your actual Client ID:

```typescript
const popup = window.open(
  'https://www.linkedin.com/oauth/v2/authorization?' +
  'response_type=code' +
  '&client_id=YOUR_ACTUAL_CLIENT_ID_HERE' + // Replace this
  '&redirect_uri=' + encodeURIComponent(`${window.location.origin}/linkedin-callback`) +
  '&scope=' + encodeURIComponent('openid profile email w_member_social') +
  '&state=' + Math.random().toString(36).substring(7),
  'linkedin-oauth',
  'width=600,height=600'
)
```

## 🔄 **How It Works:**

### **User Flow:**
1. **User clicks "Connect LinkedIn Profile"**
2. **Popup opens** with LinkedIn OAuth
3. **User authorizes** the app on LinkedIn
4. **Callback page** exchanges code for token
5. **Profile data** is stored in user metadata
6. **Popup closes** and shows success message
7. **Dashboard updates** to show LinkedIn profile

### **API Flow:**
1. **Frontend**: Opens LinkedIn OAuth popup
2. **LinkedIn**: Returns authorization code
3. **Callback**: `/linkedin-callback` page
4. **Backend**: `/api/linkedin/exchange-token` exchanges code
5. **Profile**: Fetches user profile from LinkedIn
6. **Storage**: Saves profile in Supabase user metadata
7. **Success**: Updates UI and enables posting

## 🧪 **Testing:**

### **Test Connection:**
1. **Visit**: https://mark-0.netlify.app
2. **Sign in** to your account
3. **Go to Dashboard** → Click "Connect LinkedIn Profile"
4. **Authorize** on LinkedIn popup
5. **Verify** profile appears in dashboard

### **Test Posting:**
1. **Go to "Create Post" tab**
2. **Generate a post**
3. **Click "Post to LinkedIn"**
4. **Check LinkedIn** → Verify post appears

## 🔧 **Troubleshooting:**

### **Common Issues:**

1. **"Invalid redirect URI"**:
   - Check redirect URL in LinkedIn app settings
   - Ensure it matches exactly: `https://mark-0.netlify.app/linkedin-callback`

2. **"Client ID not found"**:
   - Verify Client ID in environment variables
   - Check Client ID in LinkedIn Analytics Card component

3. **"OAuth not configured"**:
   - Ensure environment variables are set
   - Check LinkedIn app is properly configured

4. **"Failed to exchange token"**:
   - Verify Client Secret is correct
   - Check redirect URI matches exactly

### **Debug Steps:**
1. **Check browser console** for errors
2. **Verify environment variables** are loaded
3. **Test OAuth URL** manually
4. **Check LinkedIn app settings** match exactly

## 📱 **Features Enabled:**

### **Profile Display:**
- ✅ User's LinkedIn profile picture
- ✅ Name and headline
- ✅ Location information
- ✅ Connection status

### **Posting Capabilities:**
- ✅ Direct posting to LinkedIn
- ✅ Text posts with hashtags
- ✅ Media upload support
- ✅ Post scheduling with LinkedIn

### **Analytics:**
- ✅ Post performance metrics
- ✅ Engagement tracking
- ✅ Follower count display

## 🚀 **Deployment:**

After setup, deploy to production:

```bash
git add .
git commit -m "Add LinkedIn OAuth integration"
netlify deploy --prod
```

## ✅ **Success Indicators:**

- ✅ LinkedIn connection popup opens
- ✅ User can authorize the app
- ✅ Profile information displays in dashboard
- ✅ "Post to LinkedIn" buttons work
- ✅ Posts appear on user's LinkedIn profile

---

**Need Help?** Check the troubleshooting section or review the LinkedIn Developers documentation for additional guidance.
