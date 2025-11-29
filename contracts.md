# ChoosePure Community Platform - Contracts Document

## Overview
This document outlines the integration plan between frontend and backend for the ChoosePure community platform.

## Mock Data to Replace
The following data in `mockData.js` will be replaced with actual backend API calls:

1. **testReports** - Test reports data
2. **upcomingTests** - Voting and upcoming tests
3. **forumPosts** - Community forum discussions
4. **blogPosts** - Blog articles
5. **testimonials** - User testimonials
6. **communityStats** - Community statistics
7. **features, howItWorks, foodDangers** - Static content (can remain in frontend)

## API Contracts

### 1. Authentication APIs

#### POST `/api/auth/register`
**Request:**
```json
{
  "name": "string",
  "email": "string",
  "mobile": "string",
  "password": "string"
}
```
**Response:**
```json
{
  "success": true,
  "token": "jwt_token",
  "user": {
    "id": "string",
    "name": "string",
    "email": "string",
    "mobile": "string"
  }
}
```

#### POST `/api/auth/login`
**Request:**
```json
{
  "email": "string",
  "password": "string"
}
```
**Response:**
```json
{
  "success": true,
  "token": "jwt_token",
  "user": {
    "id": "string",
    "name": "string",
    "email": "string"
  }
}
```

### 2. Waitlist APIs

#### POST `/api/waitlist`
**Request:**
```json
{
  "firstName": "string",
  "mobile": "string",
  "email": "string",
  "pincode": "string"
}
```
**Response:**
```json
{
  "success": true,
  "message": "Successfully added to waitlist",
  "waitlistId": "string"
}
```

#### GET `/api/waitlist/count`
**Response:**
```json
{
  "count": 1247
}
```

### 3. Test Reports APIs

#### GET `/api/reports`
**Query Params:** `?category=Dairy&search=milk`
**Response:**
```json
{
  "reports": [
    {
      "id": "string",
      "productName": "string",
      "brand": "string",
      "category": "string",
      "purityScore": 9.6,
      "testDate": "2025-01-15",
      "testedBy": "string",
      "image": "url",
      "parameters": [...],
      "summary": "string"
    }
  ]
}
```

#### GET `/api/reports/:id`
**Response:**
```json
{
  "id": "string",
  "productName": "string",
  "brand": "string",
  "category": "string",
  "purityScore": 9.6,
  "testDate": "2025-01-15",
  "testedBy": "string",
  "image": "url",
  "parameters": [...],
  "summary": "string"
}
```

### 4. Voting System APIs

#### GET `/api/voting/upcoming-tests`
**Response:**
```json
{
  "tests": [
    {
      "id": "string",
      "productCategory": "string",
      "votes": 342,
      "funded": 78,
      "targetFunding": 100,
      "estimatedTestDate": "2025-02-01",
      "description": "string"
    }
  ]
}
```

#### POST `/api/voting/vote`
**Request:**
```json
{
  "testId": "string",
  "userId": "string"
}
```
**Response:**
```json
{
  "success": true,
  "message": "Vote recorded",
  "newVoteCount": 343
}
```

### 5. Forum APIs

#### GET `/api/forum/posts`
**Query Params:** `?category=Test Results&search=honey`
**Response:**
```json
{
  "posts": [
    {
      "id": "string",
      "author": "string",
      "authorImage": "url",
      "title": "string",
      "content": "string",
      "category": "string",
      "replies": 23,
      "likes": 45,
      "timeAgo": "2 hours ago",
      "createdAt": "timestamp"
    }
  ]
}
```

#### POST `/api/forum/posts`
**Request:**
```json
{
  "userId": "string",
  "title": "string",
  "content": "string",
  "category": "string"
}
```

#### POST `/api/forum/posts/:id/like`
**Request:**
```json
{
  "userId": "string"
}
```

#### POST `/api/forum/posts/:id/reply`
**Request:**
```json
{
  "userId": "string",
  "content": "string"
}
```

### 6. Blog APIs

#### GET `/api/blog/posts`
**Query Params:** `?search=turmeric`
**Response:**
```json
{
  "posts": [
    {
      "id": "string",
      "title": "string",
      "excerpt": "string",
      "author": "string",
      "publishDate": "2025-01-20",
      "readTime": "5 min read",
      "category": "string",
      "image": "url",
      "views": 1234,
      "content": "full_html_content"
    }
  ]
}
```

#### GET `/api/blog/posts/:id`

### 7. Community Stats APIs

#### GET `/api/stats/community`
**Response:**
```json
{
  "totalMembers": 1247,
  "testsCompleted": 28,
  "productsAnalyzed": 156,
  "fundsPooled": 142000,
  "upcomingTests": 4,
  "activePosts": 89
}
```

### 8. Newsletter APIs

#### POST `/api/newsletter/subscribe`
**Request:**
```json
{
  "email": "string"
}
```

### 9. User Dashboard APIs

#### GET `/api/user/:userId/stats`
**Response:**
```json
{
  "testsContributed": 3,
  "votesCast": 5,
  "forumPosts": 7,
  "contributions": []
}
```

## MongoDB Collections

### 1. users
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  mobile: String,
  password: String (hashed),
  role: String (default: 'member'),
  createdAt: Date,
  lastLogin: Date
}
```

### 2. waitlist
```javascript
{
  _id: ObjectId,
  firstName: String,
  mobile: String,
  email: String,
  pincode: String,
  joinedAt: Date
}
```

### 3. test_reports
```javascript
{
  _id: ObjectId,
  productName: String,
  brand: String,
  category: String,
  purityScore: Number,
  testDate: Date,
  testedBy: String,
  image: String,
  parameters: [{
    name: String,
    result: String,
    status: String
  }],
  summary: String,
  createdAt: Date
}
```

### 4. upcoming_tests
```javascript
{
  _id: ObjectId,
  productCategory: String,
  description: String,
  votes: Number,
  funded: Number,
  targetFunding: Number,
  estimatedTestDate: Date,
  voters: [ObjectId], // user IDs who voted
  contributors: [{
    userId: ObjectId,
    amount: Number,
    date: Date
  }],
  status: String, // 'voting', 'funded', 'testing', 'completed'
  createdAt: Date
}
```

### 5. forum_posts
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  title: String,
  content: String,
  category: String,
  likes: [ObjectId], // user IDs who liked
  replies: [{
    userId: ObjectId,
    content: String,
    createdAt: Date
  }],
  createdAt: Date,
  updatedAt: Date
}
```

### 6. blog_posts
```javascript
{
  _id: ObjectId,
  title: String,
  excerpt: String,
  content: String,
  author: String,
  category: String,
  image: String,
  views: Number,
  publishDate: Date,
  createdAt: Date
}
```

### 7. testimonials
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  name: String,
  role: String,
  location: String,
  quote: String,
  rating: Number,
  approved: Boolean,
  createdAt: Date
}
```

### 8. newsletter_subscribers
```javascript
{
  _id: ObjectId,
  email: String (unique),
  subscribedAt: Date,
  active: Boolean
}
```

## Frontend Integration Steps

### Phase 1: Authentication
1. Create AuthContext for managing user state
2. Store JWT token in localStorage
3. Add axios interceptors for auth headers
4. Update Navbar to use real auth state
5. Protect dashboard routes

### Phase 2: Waitlist & Newsletter
1. Connect waitlist form to POST `/api/waitlist`
2. Connect newsletter forms to POST `/api/newsletter/subscribe`
3. Show success/error toasts

### Phase 3: Test Reports
1. Replace mock testReports with API call to GET `/api/reports`
2. Update Reports page to fetch data on mount
3. Update ReportDetail to fetch single report
4. Add loading states and error handling

### Phase 4: Voting System
1. Fetch upcoming tests from GET `/api/voting/upcoming-tests`
2. Implement vote submission to POST `/api/voting/vote`
3. Track voted tests per user
4. Update UI after successful vote

### Phase 5: Forum
1. Fetch forum posts from GET `/api/forum/posts`
2. Implement post creation (requires auth)
3. Implement like and reply functionality
4. Add real-time updates (optional)

### Phase 6: Blog
1. Fetch blog posts from GET `/api/blog/posts`
2. Create blog detail page with full content
3. Track views

### Phase 7: Dashboard
1. Fetch user stats from GET `/api/user/:userId/stats`
2. Fetch community stats from GET `/api/stats/community`
3. Show personalized data based on logged-in user

## Security Considerations
- JWT token validation on all protected routes
- Password hashing with bcrypt
- Input validation and sanitization
- Rate limiting on API endpoints
- CORS configuration
- XSS protection

## Error Handling
- Consistent error response format
- Proper HTTP status codes
- User-friendly error messages in UI
- Logging for debugging

## Next Steps
1. Implement backend APIs
2. Create authentication middleware
3. Set up MongoDB models
4. Test each endpoint
5. Integrate frontend with backend
6. Test end-to-end flows
