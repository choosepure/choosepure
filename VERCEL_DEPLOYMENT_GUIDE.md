# Vercel Deployment Guide for ChoosePure Frontend

## Prerequisites
- Vercel account
- GitHub repository connected to Vercel
- Backend deployed on Render (or similar) with a public URL

## Step 1: Environment Variables in Vercel

In your Vercel project settings, add the following environment variable:

```
REACT_APP_BACKEND_URL=https://your-backend-url.onrender.com
```

**Important**: Replace `https://your-backend-url.onrender.com` with your actual backend URL from Render.

## Step 2: Deployment Configuration

The following files are already configured for Vercel deployment:

### `vercel.json`
```json
{
  "buildCommand": "yarn build",
  "outputDirectory": "build",
  "framework": "create-react-app",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### `.npmrc`
```
legacy-peer-deps=true
```

## Step 3: Deploy to Vercel

### Option A: Via Vercel Dashboard
1. Go to [vercel.com](https://vercel.com)
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. Select the `frontend` folder as the root directory
5. Add the environment variable `REACT_APP_BACKEND_URL`
6. Click "Deploy"

### Option B: Via Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Navigate to frontend folder
cd frontend

# Deploy
vercel

# Follow the prompts and add environment variables when asked
```

## Step 4: Production Razorpay Keys

Before going live, update your backend's Razorpay keys from TEST to LIVE:

**Backend `.env` file on Render:**
```
RAZORPAY_KEY_ID=your_live_key_id
RAZORPAY_KEY_SECRET=your_live_key_secret
```

## Common Issues & Solutions

### Issue 1: "ajv" Dependency Conflicts
**Solution**: The `overrides` have been removed from `package.json`. The `.npmrc` file handles this with `legacy-peer-deps=true`.

### Issue 2: API Calls Failing
**Solution**: 
- Ensure `REACT_APP_BACKEND_URL` is set correctly in Vercel environment variables
- Backend URL should NOT have a trailing slash
- Example: `https://choosepure-api.onrender.com` (correct)
- Example: `https://choosepure-api.onrender.com/` (incorrect)

### Issue 3: 404 Errors on Route Refresh
**Solution**: The `rewrites` configuration in `vercel.json` handles this. All routes are redirected to `index.html` for client-side routing.

### Issue 4: Build Warnings
**Solution**: Peer dependency warnings are normal and won't affect deployment. They're caused by React 19 being newer than some dependencies expect.

## Step 5: Post-Deployment Testing

After deployment, test these critical flows:

1. **Homepage**: Should load correctly
2. **Login**: Test with admin credentials (support@choosepure.in / 123456)
3. **Reports Page**: Should show content gating for non-subscribers
4. **Pricing Page**: Should display all subscription tiers
5. **Admin Panel**: Should be accessible after login (for admin users)
6. **Subscription Flow**: Test with TEST Razorpay keys first

## Step 6: Backend Deployment on Render

Your backend should already be deployed, but ensure:

1. All environment variables are set correctly:
   ```
   MONGO_URL=your_mongodb_connection_string
   DB_NAME=test_database
   JWT_SECRET=your_secret_key
   RAZORPAY_KEY_ID=your_key_id
   RAZORPAY_KEY_SECRET=your_key_secret
   ```

2. Backend URL is accessible and returns data:
   ```bash
   curl https://your-backend-url.onrender.com/api/reports
   ```

## Support

If you encounter any issues during deployment:
1. Check Vercel build logs for specific errors
2. Verify all environment variables are set correctly
3. Test backend API endpoints independently
4. Check browser console for frontend errors

---

**Note**: Make sure to update Razorpay keys from TEST to LIVE before accepting real payments!
