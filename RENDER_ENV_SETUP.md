# Render Environment Variables Setup

## Required Environment Variables for Production

The following environment variables need to be set in your Render dashboard for the backend service:

### Database Configuration
```
MONGO_URL=your_mongodb_connection_string
DB_NAME=choosepure_db
```

### JWT Configuration
```
SECRET_KEY=your_jwt_secret_key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

### Mailgun Configuration
```
MAILGUN_API_KEY=your_mailgun_api_key_here
MAILGUN_DOMAIN=choosepure.org
MAILGUN_FROM_EMAIL=support@choosepure.org
```

### Razorpay Configuration (CRITICAL - Missing in Production)
```
RAZORPAY_KEY_ID=your_razorpay_live_key_id
RAZORPAY_KEY_SECRET=your_razorpay_live_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
```

## Steps to Fix Production Deployment

**IMPORTANT**: Replace all placeholder values with your actual credentials from your respective service dashboards.

1. **Go to Render Dashboard**: https://dashboard.render.com/
2. **Select your backend service** (choosepure-backend)
3. **Go to Environment tab**
4. **Add the missing Razorpay environment variables**:
   - `RAZORPAY_KEY_ID` = `your_razorpay_live_key_id`
   - `RAZORPAY_KEY_SECRET` = `your_razorpay_live_secret`
   - `RAZORPAY_WEBHOOK_SECRET` = `your_webhook_secret`
5. **Save and redeploy** the service

## Webhook URL Configuration

After the deployment is successful, configure the webhook URL in your Razorpay dashboard:

**Webhook URL**: `https://choosepure-backend.onrender.com/api/razorpay-webhook`

**Events to subscribe to**:
- `payment.captured`
- `payment.failed`
- `order.paid`
- `subscription.charged`
- `subscription.cancelled`

## Troubleshooting

If you're still getting 500 errors after setting the environment variables:

1. Check the Render logs for specific error messages
2. Ensure all dependencies are installed (razorpay==2.0.0 is in requirements.txt)
3. Verify the service is using the latest commit with Razorpay integration
4. Test the `/api/health` endpoint to ensure basic functionality works

## Testing After Deployment

1. Test health endpoint: `https://choosepure-backend.onrender.com/api/health`
2. Test report purchase: Try purchasing a report from the frontend
3. Check Render logs for any remaining errors