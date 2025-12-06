# Vercel Project Settings Configuration

## Important: Project Root Directory

When setting up the project in Vercel, you MUST configure it correctly:

### Option 1: Deploy ONLY the Frontend Folder (Recommended)

**In Vercel Dashboard:**
1. Go to Project Settings → General
2. Find "Root Directory" setting
3. Click "Edit"
4. Enter: `frontend`
5. Click "Save"

This tells Vercel to use the `frontend` folder as the root of your project.

### Option 2: Deploy from Repository Root (Alternative)

If you're deploying from the repository root, you need to:

1. Create `/vercel.json` at repository root with:
```json
{
  "buildCommand": "cd frontend && yarn build",
  "outputDirectory": "frontend/build",
  "installCommand": "cd frontend && yarn install",
  "framework": "create-react-app"
}
```

## Framework Preset

- **Framework Preset**: Create React App
- **Build Command**: `yarn build` (if Root Directory is `frontend`)
- **Output Directory**: `build`
- **Install Command**: `yarn install`

## Environment Variables

Add in Vercel Dashboard → Settings → Environment Variables:

```
REACT_APP_BACKEND_URL=https://your-backend-url.onrender.com
```

**IMPORTANT**: 
- NO trailing slash at the end of URL
- Must start with `REACT_APP_` prefix (required by Create React App)
- Add for all environments (Production, Preview, Development)

## Common Error Solutions

### Error: "Could not read package.json"
**Solution**: 
1. Ensure "Root Directory" is set to `frontend` in Project Settings
2. Re-deploy after saving the setting

### Error: "Module not found" or dependency errors
**Solution**:
1. Check that `.npmrc` file exists in frontend folder
2. Ensure `vercel.json` has correct build command
3. Clear Vercel cache and redeploy

### Error: "REACT_APP_BACKEND_URL is undefined"
**Solution**:
1. Verify environment variable is set in Vercel Dashboard
2. Ensure variable name starts with `REACT_APP_`
3. Redeploy after adding environment variables

## Step-by-Step Deployment Checklist

- [ ] Push latest code to GitHub
- [ ] Set Root Directory to `frontend` in Vercel Project Settings
- [ ] Add `REACT_APP_BACKEND_URL` environment variable
- [ ] Trigger deployment
- [ ] Check build logs for errors
- [ ] Test deployed site

## Troubleshooting Commands

### Test Build Locally
```bash
cd frontend
yarn install
yarn build
```

### Check JSON Syntax
```bash
cd frontend
cat package.json | python3 -m json.tool
```

### Verify Environment in Build
Add this to your build to debug:
```bash
echo "Backend URL: $REACT_APP_BACKEND_URL"
```
