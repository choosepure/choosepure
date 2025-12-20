#!/bin/bash

echo "🚀 Preparing files for deployment to Vercel and Render"
echo ""

cd /app

echo "📦 Files to commit for deployment:"
echo ""
echo "Frontend changes:"
echo "  - frontend/src/pages/Admin.jsx (subscription management)"
echo "  - frontend/src/pages/Pricing.jsx (NEW - pricing page)"
echo "  - frontend/src/pages/Reports.jsx (content gating)"
echo "  - frontend/src/pages/Home.jsx (donation section)"
echo "  - frontend/src/components/DonationModal.jsx (NEW)"
echo "  - frontend/src/components/admin/SubscriptionTierForm.jsx (NEW)"
echo "  - frontend/src/components/admin/TestReportForm.jsx"
echo "  - frontend/src/components/admin/BlogPostForm.jsx"
echo "  - frontend/src/components/admin/UpcomingTestForm.jsx"
echo "  - frontend/src/components/Navbar.jsx"
echo "  - frontend/src/services/api.js"
echo "  - frontend/src/App.js"
echo "  - frontend/public/index.html"
echo "  - frontend/package.json"
echo "  - frontend/yarn.lock"
echo "  - frontend/vercel.json"
echo "  - frontend/.npmrc"
echo ""
echo "Backend changes:"
echo "  - backend/server.py (optional donation routes)"
echo "  - backend/routes/donation_routes.py (NEW)"
echo "  - backend/seed_subscriptions.py (NEW)"
echo ""

echo "📝 Creating deployment commit..."

# Add all necessary files
git add frontend/src/pages/Admin.jsx
git add frontend/src/pages/Pricing.jsx
git add frontend/src/pages/Reports.jsx  
git add frontend/src/pages/Home.jsx
git add frontend/src/components/DonationModal.jsx
git add frontend/src/components/admin/SubscriptionTierForm.jsx
git add frontend/src/components/admin/TestReportForm.jsx
git add frontend/src/components/admin/BlogPostForm.jsx
git add frontend/src/components/admin/UpcomingTestForm.jsx
git add frontend/src/components/Navbar.jsx
git add frontend/src/services/api.js
git add frontend/src/App.js
git add frontend/public/index.html
git add frontend/package.json
git add frontend/yarn.lock
git add frontend/vercel.json
git add frontend/.npmrc

git add backend/server.py
git add backend/routes/donation_routes.py
git add backend/seed_subscriptions.py

git add VERCEL_DEPLOYMENT_GUIDE.md
git add frontend/VERCEL_SETTINGS.md

# Create commit
git commit -m "feat: Complete P0 features - Admin CRUD, Subscriptions, Donations

✨ New Features:
- Admin panel with Edit/Delete for all content types
- Subscription tier management (Admin)
- User-facing Pricing page with Razorpay
- Content gating for non-subscribers
- Donation system with payment gateway

🐛 Fixes:
- Backend: Optional donation_routes import for compatibility
- Frontend: Vercel build configuration
- Dependencies: Cleaned yarn.lock

📦 Files:
- 17 frontend files modified/created
- 3 backend files modified/created
- Ready for Vercel + Render deployment"

echo ""
echo "✅ Commit created!"
echo ""
echo "📤 Next steps:"
echo "1. Push to GitHub:"
echo "   git push origin main"
echo ""
echo "2. Vercel Frontend Deployment:"
echo "   - Go to Project Settings → General"
echo "   - Set Root Directory: frontend"
echo "   - Add Environment Variable:"
echo "     REACT_APP_BACKEND_URL=https://your-backend-url.onrender.com"
echo "   - Redeploy"
echo ""
echo "3. Render Backend Deployment:"
echo "   - Should auto-deploy from GitHub"
echo "   - Ensure environment variables are set:"
echo "     MONGO_URL, DB_NAME, JWT_SECRET, RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET"
echo ""
echo "4. Test the deployment:"
echo "   - Frontend: Check homepage, pricing, admin panel"
echo "   - Backend: Test API endpoints"
echo "   - Subscriptions: Test Razorpay integration (TEST mode)"
echo ""
