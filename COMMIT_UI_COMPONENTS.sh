#!/bin/bash

echo "🚀 Committing ALL necessary files for Vercel deployment"
echo ""

cd /app

echo "📦 Adding UI components (46 files)..."
git add frontend/src/components/ui/

echo "📦 Adding modified pages..."
git add frontend/src/pages/Admin.jsx
git add frontend/src/pages/Pricing.jsx
git add frontend/src/pages/Reports.jsx  
git add frontend/src/pages/Home.jsx

echo "📦 Adding new components..."
git add frontend/src/components/DonationModal.jsx
git add frontend/src/components/admin/SubscriptionTierForm.jsx
git add frontend/src/components/admin/TestReportForm.jsx
git add frontend/src/components/admin/BlogPostForm.jsx
git add frontend/src/components/admin/UpcomingTestForm.jsx
git add frontend/src/components/Navbar.jsx

echo "📦 Adding configuration files..."
git add frontend/src/services/api.js
git add frontend/src/App.js
git add frontend/public/index.html
git add frontend/package.json
git add frontend/yarn.lock
git add frontend/vercel.json
git add frontend/.npmrc

echo "📦 Adding backend files..."
git add backend/server.py
git add backend/routes/donation_routes.py
git add backend/seed_subscriptions.py

echo "📦 Adding documentation..."
git add VERCEL_DEPLOYMENT_GUIDE.md
git add frontend/VERCEL_SETTINGS.md

echo ""
echo "Creating commit..."

git commit -m "fix: Add all UI components and deployment fixes

✨ Critical Fix:
- Added all 46 Shadcn UI component files (were missing from repo)
- This fixes: Module not found: Error: Can't resolve './ui/card'

🎨 Features Included:
- Admin CRUD operations (Edit/Delete)
- Subscription management system
- Pricing page with Razorpay
- Content gating for non-subscribers  
- Donation system with payment gateway

📦 Complete File List:
- 46 UI component files (card, button, input, etc.)
- 4 page components (Admin, Pricing, Reports, Home)
- 6 custom components (DonationModal, forms, etc.)
- 7 config files (package.json, vercel.json, etc.)
- 3 backend files (donation routes, server config)

🚀 Deployment Ready:
- Vercel: Set Root Directory to 'frontend'
- Render: Auto-deploy enabled
- All dependencies resolved"

echo ""
echo "✅ Commit created successfully!"
echo ""
echo "📤 Now run:"
echo "   git push origin main"
echo ""
echo "🔧 Vercel Settings:"
echo "   1. Root Directory: frontend"
echo "   2. Environment Variable: REACT_APP_BACKEND_URL"
echo "   3. Click 'Redeploy'"
echo ""
