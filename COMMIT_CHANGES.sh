#!/bin/bash

# Script to commit the fixed frontend changes for Vercel deployment

echo "🔧 Committing Vercel deployment fixes..."

cd /app

# Add all frontend changes
git add frontend/package.json
git add frontend/vercel.json
git add frontend/yarn.lock
git add frontend/.npmrc
git add VERCEL_DEPLOYMENT_GUIDE.md
git add frontend/VERCEL_SETTINGS.md

# Create commit
git commit -m "fix: Vercel deployment configuration

- Updated vercel.json to use yarn consistently
- Regenerated yarn.lock to fix html-webpack-plugin issue
- Configured proper build and install commands
- Ready for Vercel deployment"

echo "✅ Changes committed!"
echo ""
echo "📤 Next steps:"
echo "1. Push to GitHub: git push origin main"
echo "2. Configure Vercel Root Directory to: frontend"
echo "3. Add environment variable: REACT_APP_BACKEND_URL"
echo "4. Deploy!"
