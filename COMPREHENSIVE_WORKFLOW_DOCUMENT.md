# ChoosePure - Comprehensive Workflow Document

## Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Backend Structure](#backend-structure)
4. [Frontend Structure](#frontend-structure)
5. [Database Models](#database-models)
6. [Authentication & Authorization](#authentication--authorization)
7. [API Routes & Endpoints](#api-routes--endpoints)
8. [Email Service Integration](#email-service-integration)
9. [Payment Integration](#payment-integration)
10. [Key Features](#key-features)
11. [Development Workflow](#development-workflow)
12. [Deployment Process](#deployment-process)

---

## Project Overview

**ChoosePure** is India's first parent-led community platform for independent food testing and purity verification. The platform enables parents to collectively fund certified lab tests on everyday food products and access transparent, unbiased test results.

### Key Objectives
- Provide transparent food safety information to Indian parents
- Enable community-driven product testing through crowdfunding
- Create a forum for parents to discuss food safety concerns
- Maintain 100% transparency with no brand sponsorships
- Use FSSAI-approved and NABL-certified laboratories

### Tech Stack
- **Frontend**: React 19, Tailwind CSS, Radix UI, React Router
- **Backend**: FastAPI (Python), Motor (async MongoDB driver)
- **Database**: MongoDB
- **Payment Gateway**: Razorpay
- **Email Service**: Mailgun
- **Deployment**: Vercel (Frontend), Render (Backend)

---

## Architecture

### High-Level System Design

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React)                         │
│                    Deployed on Vercel                        │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Pages: Home, Reports, Forum, Blog, Dashboard, Admin  │   │
│  │ Components: Auth, Forms, Cards, Modals, UI Library   │   │
│  │ Services: API Client, Auth Context, Toast Hooks      │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↓ (HTTP/REST)
┌─────────────────────────────────────────────────────────────┐
│                  Backend (FastAPI)                           │
│                   Deployed on Render                         │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Routes: Auth, Reports, Forum, Blog, Voting, etc.     │   │
│  │ Models: Pydantic models for data validation          │   │
│  │ Middleware: JWT auth, role-based access control      │   │
│  │ Services: Email (Mailgun), Payment (Razorpay)        │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↓ (Async)
┌─────────────────────────────────────────────────────────────┐
│                    MongoDB Database                          │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Collections: users, reports, forum_posts, blog_posts │   │
│  │            subscriptions, donations, etc.            │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **User Registration/Login**: Frontend → Backend Auth → JWT Token → LocalStorage
2. **Content Fetching**: Frontend → API Request (with token) → Backend Query → MongoDB → Response
3. **Payment Processing**: Frontend → Razorpay → Backend Verification → Subscription Update
4. **Email Notifications**: Backend Event → Mailgun Service → User Email

---

## Backend Structure

### Directory Layout
```
backend/
├── server.py              # FastAPI app initialization, routes registration
├── models.py              # Pydantic models for data validation
├── auth.py                # JWT token generation, password hashing
├── middleware.py          # Role-based access control
├── email_service.py       # Mailgun email integration
├── requirements.txt       # Python dependencies
├── .env                   # Environment variables (not in git)
├── .env.example           # Example environment variables
├── routes/
│   ├── __init__.py
│   ├── auth_routes.py     # POST /auth/register, /auth/login, GET /auth/me
│   ├── waitlist_routes.py # POST /waitlist, GET /waitlist/count
│   ├── report_routes.py   # CRUD operations for test reports
│   ├── voting_routes.py   # Voting and upcoming tests management
│   ├── forum_routes.py    # Forum posts, likes, replies
│   ├── blog_routes.py     # Blog posts management
│   ├── newsletter_routes.py # Newsletter subscriptions
│   ├── stats_routes.py    # Community and user statistics
│   ├── subscription_routes.py # Subscription tier and payment management
│   ├── password_reset_routes.py # Password reset with OTP
│   ├── donation_routes.py # Donation processing
│   └── email_routes.py    # Email management endpoints
└── seed_data.py           # Database seeding script
```

### Core Files

#### server.py
- Initializes FastAPI application
- Configures CORS middleware
- Registers all route modules
- Sets up MongoDB connection
- Defines startup/shutdown events

#### models.py
Contains Pydantic models for:
- User (registration, login, response)
- Waitlist entries
- Test reports with parameters
- Forum posts and replies
- Blog posts
- Voting and upcoming tests
- Subscriptions and payments
- Newsletter subscribers

#### auth.py
- Password hashing with bcrypt
- JWT token creation and validation
- Bearer token extraction
- Current user dependency injection
- Optional authentication support

#### middleware.py
- Admin role verification
- User permission checks
- Database access for role validation

---

## Frontend Structure

### Directory Layout
```
frontend/src/
├── App.js                 # Main app component with routing
├── index.js               # React entry point
├── App.css                # Global styles
├── index.css              # Global CSS
├── mockData.js            # Mock data (to be replaced with API calls)
├── pages/
│   ├── Home.jsx           # Landing page with hero, features, testimonials
│   ├── Reports.jsx        # Test reports listing with filters
│   ├── ReportDetail.jsx   # Single report detail view
│   ├── Forum.jsx          # Community forum discussions
│   ├── Blog.jsx           # Blog articles listing
│   ├── Dashboard.jsx      # User dashboard with voting and stats
│   ├── Admin.jsx          # Admin panel for content management
│   └── Pricing.jsx        # Subscription plans
├── components/
│   ├── Navbar.jsx         # Navigation bar with auth
│   ├── Footer.jsx         # Footer component
│   ├── LoginModal.jsx     # Login/Register modal
│   ├── DonationModal.jsx  # Donation modal with Razorpay
│   ├── ShareButton.jsx    # Social sharing button
│   ├── ForgotPassword.jsx # Password reset component
│   ├── admin/
│   │   ├── TestReportForm.jsx
│   │   ├── BlogPostForm.jsx
│   │   ├── UpcomingTestForm.jsx
│   │   └── SubscriptionTierForm.jsx
│   └── ui/                # Radix UI components (40+ components)
├── context/
│   └── AuthContext.jsx    # Global auth state management
├── services/
│   └── api.js             # Axios instance with interceptors
├── hooks/
│   └── use-toast.js       # Toast notification hook
└── lib/
    └── utils.js           # Utility functions
```

### Key Components

#### AuthContext.jsx
- Manages global authentication state
- Provides login, register, logout functions
- Persists user data in localStorage
- Handles token management

#### api.js
- Axios instance with base URL configuration
- Request interceptor for JWT token injection
- Response interceptor for 401 error handling
- Organized API methods by feature (auth, reports, forum, etc.)

#### Pages
- **Home**: Hero section, features, testimonials, waitlist form, donation CTA
- **Reports**: Filterable test reports with subscription gating
- **Forum**: Community discussions with search and category filters
- **Blog**: Article listing with featured post
- **Dashboard**: User stats, voting interface, recent activity
- **Admin**: Content management with CRUD operations
- **Pricing**: Subscription tier selection with Razorpay integration

---

## Database Models

### Collections Overview

#### users
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  mobile: String,
  password: String (hashed),
  role: String (default: 'member', can be 'admin'),
  created_at: Date,
  last_login: Date
}
```

#### waitlist
```javascript
{
  _id: ObjectId,
  first_name: String,
  mobile: String,
  email: String,
  pincode: String,
  joined_at: Date
}
```

#### test_reports
```javascript
{
  _id: ObjectId,
  product_name: String,
  brand: String,
  category: String,
  purity_score: Number (0-10),
  test_date: String,
  tested_by: String,
  image: String (URL),
  parameters: [{
    name: String,
    result: String,
    status: String ('pass', 'warning', 'fail')
  }],
  summary: String,
  created_at: Date
}
```

#### upcoming_tests
```javascript
{
  _id: ObjectId,
  product_category: String,
  description: String,
  votes: Number,
  funded: Number,
  target_funding: Number,
  estimated_test_date: String,
  voters: [String], // user IDs
  contributors: [{
    user_id: String,
    amount: Number,
    date: Date
  }],
  status: String ('voting', 'funded', 'testing', 'completed'),
  created_at: Date
}
```

#### forum_posts
```javascript
{
  _id: ObjectId,
  user_id: String,
  author: String,
  author_image: String (URL),
  title: String,
  content: String,
  category: String,
  likes: [String], // user IDs
  replies: [{
    user_id: String,
    user_name: String,
    user_image: String,
    content: String,
    created_at: Date
  }],
  created_at: Date,
  updated_at: Date
}
```

#### blog_posts
```javascript
{
  _id: ObjectId,
  title: String,
  excerpt: String,
  content: String,
  author: String,
  category: String,
  image: String (URL),
  views: Number,
  publish_date: String,
  created_at: Date
}
```

#### subscription_tiers
```javascript
{
  _id: ObjectId,
  name: String,
  description: String,
  price: Number,
  duration_days: Number,
  features: [String],
  is_active: Boolean,
  created_at: Date
}
```

#### user_subscriptions
```javascript
{
  _id: ObjectId,
  user_id: String,
  tier_id: String,
  razorpay_order_id: String,
  razorpay_payment_id: String,
  razorpay_subscription_id: String,
  status: String ('pending', 'active', 'expired', 'cancelled'),
  start_date: Date,
  end_date: Date,
  amount_paid: Number,
  created_at: Date
}
```

#### newsletter_subscribers
```javascript
{
  _id: ObjectId,
  email: String (unique),
  subscribed_at: Date,
  active: Boolean
}
```

#### donations
```javascript
{
  _id: ObjectId,
  donor_name: String,
  donor_email: String,
  donor_phone: String,
  amount: Number,
  message: String,
  razorpay_order_id: String,
  razorpay_payment_id: String,
  status: String ('pending', 'completed'),
  created_at: Date,
  completed_at: Date
}
```

#### password_resets
```javascript
{
  _id: ObjectId,
  email: String,
  token_hash: String (SHA256 hashed),
  expiration: Date,
  created_at: Date,
  used: Boolean,
  used_at: Date
}
```

---

## Authentication & Authorization

### Authentication Flow

1. **Registration**
   - User submits name, email, mobile, password
   - Backend validates email uniqueness
   - Password hashed with bcrypt
   - User created in database
   - JWT token generated
   - Welcome email sent via Mailgun
   - Token stored in localStorage

2. **Login**
   - User submits email and password
   - Backend finds user by email
   - Password verified against hash
   - JWT token generated
   - Last login timestamp updated
   - Token stored in localStorage

3. **Token Management**
   - JWT includes user_id and email
   - Expires in 7 days
   - Stored in localStorage
   - Sent in Authorization header for all requests
   - Automatically cleared on 401 response

### Authorization Levels

#### Public Routes
- GET /api/reports (limited data)
- GET /api/blog/posts
- GET /api/forum/posts
- GET /api/voting/upcoming-tests
- GET /api/stats/community
- POST /api/waitlist
- POST /api/newsletter/subscribe

#### Authenticated Routes
- GET /api/auth/me
- POST /api/forum/posts
- POST /api/forum/posts/{id}/like
- POST /api/forum/posts/{id}/reply
- POST /api/voting/vote
- GET /api/subscriptions/user/{userId}/status

#### Admin Routes
- POST /api/reports (create)
- PUT /api/reports/{id} (update)
- DELETE /api/reports/{id}
- POST /api/blog/posts
- PUT /api/blog/posts/{id}
- DELETE /api/blog/posts/{id}
- POST /api/voting/create-test
- PUT /api/voting/tests/{id}
- DELETE /api/voting/tests/{id}
- POST /api/subscriptions/tiers
- PUT /api/subscriptions/tiers/{id}
- DELETE /api/subscriptions/tiers/{id}

---

## API Routes & Endpoints

### Authentication Routes (`/api/auth/`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | /register | Register new user | No |
| POST | /login | Login user | No |
| GET | /me | Get current user info | Yes |

### Waitlist Routes (`/api/waitlist/`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | / | Add to waitlist | No |
| GET | /count | Get waitlist count | No |

### Test Reports Routes (`/api/reports/`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | / | Get all reports (with filters) | No |
| GET | /{id} | Get single report | No |
| POST | / | Create report | Admin |
| PUT | /{id} | Update report | Admin |
| DELETE | /{id} | Delete report | Admin |

### Voting Routes (`/api/voting/`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /upcoming-tests | Get upcoming tests | No |
| POST | /vote | Vote for test | Yes |
| POST | /create-test | Create upcoming test | Admin |
| PUT | /tests/{id} | Update test | Admin |
| DELETE | /tests/{id} | Delete test | Admin |

### Forum Routes (`/api/forum/`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /posts | Get forum posts | No |
| GET | /posts/{id} | Get single post | No |
| POST | /posts | Create post | Yes |
| POST | /posts/{id}/like | Like/unlike post | Yes |
| POST | /posts/{id}/reply | Reply to post | Yes |
| DELETE | /posts/{id} | Delete post | Admin |

### Blog Routes (`/api/blog/`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /posts | Get blog posts | No |
| GET | /posts/{id} | Get single post | No |
| POST | /posts | Create post | Admin |
| PUT | /posts/{id} | Update post | Admin |
| DELETE | /posts/{id} | Delete post | Admin |

### Newsletter Routes (`/api/newsletter/`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | /subscribe | Subscribe to newsletter | No |
| POST | /unsubscribe | Unsubscribe from newsletter | No |

### Statistics Routes (`/api/stats/`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /community | Get community stats | No |
| GET | /user/{userId} | Get user stats | No |

### Subscription Routes (`/api/subscriptions/`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /tiers | Get subscription tiers | No |
| GET | /tiers/{id} | Get single tier | No |
| POST | /tiers | Create tier | Admin |
| PUT | /tiers/{id} | Update tier | Admin |
| DELETE | /tiers/{id} | Delete tier | Admin |
| POST | /create-order | Create Razorpay order | Yes |
| POST | /verify-payment | Verify payment | Yes |
| GET | /user/{userId}/status | Get subscription status | Yes |
| GET | /user/{userId}/history | Get subscription history | Yes |

### Password Reset Routes (`/api/password-reset/`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | /request-reset | Request password reset | No |
| POST | /verify-token | Verify reset token | No |
| POST | /reset-password | Reset password | No |

### Donation Routes (`/api/donations/`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | /create-order | Create donation order | No |
| POST | /verify-payment | Verify donation payment | No |
| GET | /stats | Get donation stats | No |
| GET | /recent | Get recent donations | No |

---

## Email Service Integration

### Mailgun Configuration

**Environment Variables Required:**
```
MAILGUN_API_KEY=your-api-key
MAILGUN_DOMAIN=your-domain.com
MAILGUN_FROM_EMAIL=noreply@your-domain.com
MAILGUN_ENDPOINT=api.mailgun.net (or api.eu.mailgun.net for EU)
```

### Email Templates

#### 1. Welcome Email
- Sent on user registration
- Includes platform introduction
- Lists key features
- Call-to-action to explore

#### 2. Password Reset Email
- Sent on password reset request
- Contains 6-digit OTP code
- Expires in 15 minutes
- Styled with security messaging

#### 3. Newsletter Confirmation
- Sent on newsletter subscription
- Confirms subscription
- Lists newsletter content
- Unsubscribe information

### Email Service Class

Located in `backend/email_service.py`:
- Async email sending
- HTML and plain text versions
- Error handling and logging
- Graceful degradation if Mailgun not configured
- Tag-based email categorization

---

## Payment Integration

### Razorpay Configuration

**Environment Variables Required:**
```
RAZORPAY_KEY_ID=your-key-id
RAZORPAY_KEY_SECRET=your-key-secret
```

### Payment Flows

#### Subscription Payment Flow

1. **Frontend**: User selects subscription tier
2. **Frontend**: Calls `/api/subscriptions/create-order`
3. **Backend**: Creates Razorpay order, stores pending subscription
4. **Frontend**: Opens Razorpay checkout modal
5. **User**: Completes payment in Razorpay
6. **Frontend**: Receives payment response
7. **Frontend**: Calls `/api/subscriptions/verify-payment`
8. **Backend**: Verifies signature, activates subscription
9. **Frontend**: Shows success message

#### Donation Payment Flow

1. **Frontend**: User enters donation amount
2. **Frontend**: Calls `/api/donations/create-order`
3. **Backend**: Creates Razorpay order, stores pending donation
4. **Frontend**: Opens Razorpay checkout modal
5. **User**: Completes payment
6. **Frontend**: Calls `/api/donations/verify-payment`
7. **Backend**: Verifies signature, marks donation as completed
8. **Frontend**: Shows thank you message

### Payment Verification

- HMAC-SHA256 signature verification
- Order ID and Payment ID validation
- Atomic database updates
- Error handling for failed verifications

---

## Key Features

### 1. Test Reports & Purity Scoring
- Independent lab testing results
- Purity scores (0-10 scale)
- Detailed test parameters
- Category-based filtering
- Search functionality
- Subscription-gated detailed scores

### 2. Community Voting System
- Vote for products to be tested
- Funding progress tracking
- Estimated test dates
- Vote counting and aggregation
- Status tracking (voting → funded → testing → completed)

### 3. Community Forum
- Create discussion posts
- Like/unlike posts
- Reply to posts
- Category-based organization
- Search and filter
- User profiles with avatars

### 4. Blog & Articles
- Educational content
- Food safety tips
- Industry news
- View tracking
- Read time estimation
- Category organization

### 5. User Dashboard
- Personal contribution tracking
- Vote history
- Forum activity
- Community statistics
- Quick actions

### 6. Admin Panel
- Content management (CRUD)
- Test report management
- Blog post management
- Upcoming test management
- Forum moderation
- Subscription tier management
- Statistics overview

### 7. Subscription System
- Multiple tier options
- Razorpay payment integration
- Subscription status tracking
- Automatic expiration
- Renewal management
- Feature gating based on subscription

### 8. Donation System
- One-time donations
- Razorpay integration
- Donor recognition
- Donation statistics
- Recent donations display

### 9. Authentication & Authorization
- User registration and login
- JWT-based authentication
- Role-based access control
- Password reset with OTP
- Session management

### 10. Email Notifications
- Welcome emails
- Password reset codes
- Newsletter confirmations
- Transactional emails
- Mailgun integration

---

## Development Workflow

### Local Setup

#### Backend Setup
```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Edit .env with your configuration

# Run server
uvicorn server:app --reload
```

#### Frontend Setup
```bash
# Navigate to frontend
cd frontend

# Install dependencies
yarn install

# Create .env file
echo "REACT_APP_BACKEND_URL=http://localhost:8000" > .env

# Start development server
yarn start
```

### Development Guidelines

#### Backend
- Use async/await for all database operations
- Validate input with Pydantic models
- Use dependency injection for database access
- Log all errors and important events
- Handle exceptions gracefully
- Use type hints for all functions

#### Frontend
- Use functional components with hooks
- Manage state with Context API
- Use custom hooks for reusable logic
- Handle loading and error states
- Implement proper error boundaries
- Use Tailwind CSS for styling
- Follow component composition patterns

### Testing

#### Backend Testing
```bash
# Run tests
pytest

# Run with coverage
pytest --cov=.
```

#### Frontend Testing
```bash
# Run tests
yarn test

# Run with coverage
yarn test --coverage
```

### Code Quality

#### Backend
- Use Black for code formatting
- Use Flake8 for linting
- Use MyPy for type checking

#### Frontend
- Use ESLint for linting
- Use Prettier for formatting
- Use TypeScript for type safety (optional)

---

## Deployment Process

### Frontend Deployment (Vercel)

#### Prerequisites
- GitHub repository connected to Vercel
- Vercel account

#### Steps
1. **Configure Root Directory**
   - Go to Project Settings → General
   - Set Root Directory to `frontend`

2. **Add Environment Variables**
   - Go to Settings → Environment Variables
   - Add `REACT_APP_BACKEND_URL=https://your-backend-url.onrender.com`
   - Ensure NO trailing slash

3. **Deploy**
   - Push to GitHub
   - Vercel automatically deploys on push
   - Check build logs for errors

4. **Post-Deployment Testing**
   - Test homepage loading
   - Test login/registration
   - Test API calls
   - Test payment flow with TEST keys

### Backend Deployment (Render)

#### Prerequisites
- Render account
- GitHub repository

#### Steps
1. **Create Web Service**
   - Connect GitHub repository
   - Select Python environment
   - Set build command: `pip install -r requirements.txt`
   - Set start command: `uvicorn server:app --host 0.0.0.0`

2. **Configure Environment Variables**
   - Add all variables from `.env.example`
   - Use production values for Razorpay keys
   - Set secure SECRET_KEY

3. **Deploy**
   - Render automatically deploys on push
   - Monitor logs for errors

4. **Post-Deployment Testing**
   - Test API endpoints
   - Test database connectivity
   - Test email service
   - Test payment processing

### Production Checklist

- [ ] Update Razorpay keys from TEST to LIVE
- [ ] Configure production email domain
- [ ] Set secure JWT secret
- [ ] Enable HTTPS
- [ ] Configure CORS for production domain
- [ ] Set up monitoring and logging
- [ ] Configure backups for database
- [ ] Test all critical flows
- [ ] Set up error tracking (Sentry)
- [ ] Configure CDN for static assets
- [ ] Set up SSL certificates
- [ ] Configure rate limiting
- [ ] Set up automated backups

---

## Troubleshooting Guide

### Common Issues

#### Backend Issues

**Issue**: MongoDB connection fails
- Check MONGO_URL format
- Verify IP whitelist in MongoDB Atlas
- Check network connectivity

**Issue**: Email not sending
- Verify Mailgun credentials
- Check domain verification
- Review email logs in Mailgun dashboard

**Issue**: Razorpay payment fails
- Verify API keys
- Check payment amount format (in paise)
- Review Razorpay logs

#### Frontend Issues

**Issue**: API calls failing
- Check REACT_APP_BACKEND_URL
- Verify backend is running
- Check CORS configuration
- Review browser console for errors

**Issue**: Login not working
- Check token storage in localStorage
- Verify JWT secret matches backend
- Check token expiration

**Issue**: Styling issues
- Verify Tailwind CSS is configured
- Check component imports
- Review CSS conflicts

### Debug Mode

#### Backend
```python
# Enable debug logging
import logging
logging.basicConfig(level=logging.DEBUG)
```

#### Frontend
```javascript
// Enable API logging
api.interceptors.response.use(
  response => {
    console.log('API Response:', response);
    return response;
  }
);
```

---

## Performance Optimization

### Backend
- Use database indexing for frequently queried fields
- Implement caching for static content
- Use pagination for large datasets
- Optimize MongoDB queries
- Use connection pooling

### Frontend
- Lazy load components
- Implement code splitting
- Optimize images
- Use React.memo for expensive components
- Implement virtual scrolling for large lists

---

## Security Considerations

### Backend
- Validate all inputs
- Use HTTPS only
- Implement rate limiting
- Hash passwords with bcrypt
- Use secure JWT secrets
- Sanitize database queries
- Implement CORS properly
- Use environment variables for secrets

### Frontend
- Store tokens securely
- Implement CSRF protection
- Validate user input
- Use HTTPS only
- Implement XSS protection
- Sanitize HTML content
- Use secure headers

---

## Monitoring & Logging

### Backend Logging
- Log all API requests
- Log authentication events
- Log payment transactions
- Log email sending
- Log errors with stack traces

### Frontend Monitoring
- Track user interactions
- Monitor API performance
- Track errors with Sentry
- Monitor page load times
- Track conversion metrics

---

## Future Enhancements

1. **Real-time Notifications**: WebSocket integration for live updates
2. **Mobile App**: React Native mobile application
3. **Advanced Analytics**: Detailed community insights
4. **AI-Powered Recommendations**: ML-based product recommendations
5. **Video Content**: Tutorial and educational videos
6. **Marketplace Integration**: Direct product links
7. **API for Third Parties**: Public API for partners
8. **Blockchain Verification**: Immutable test records
9. **Multi-language Support**: Support for regional languages
10. **Advanced Search**: Elasticsearch integration

---

## Support & Contact

For issues or questions:
- Email: support@choosepure.in
- GitHub Issues: [Repository Issues]
- Documentation: [Wiki]

---

**Last Updated**: 2024
**Version**: 1.0.0
**Status**: Production Ready
