# Mailgun Email Service Integration

This document explains how to set up and use the Mailgun email service integration in the ChoosePure backend.

## Setup

### 1. Install Dependencies

The required dependency has been added to `requirements.txt`:
```
mailgun==0.1.1
```

Install it with:
```bash
pip install -r requirements.txt
```

### 2. Configure Environment Variables

Add the following environment variables to your `.env` file:

```env
MAILGUN_API_KEY=your-mailgun-api-key-here
MAILGUN_DOMAIN=your-domain.com
MAILGUN_FROM_EMAIL=noreply@your-domain.com
```

**Getting Mailgun Credentials:**
1. Sign up at [mailgun.com](https://www.mailgun.com/)
2. Verify your domain or use the sandbox domain for testing
3. Get your API key from the dashboard
4. Set your domain (e.g., `mg.yourdomain.com` or sandbox domain)

### 3. Verify Setup

Use the test endpoint to verify your configuration:
```bash
POST /api/email/test
{
  "to_email": "your-email@example.com"
}
```

## Features

### Automatic Email Sending

The service automatically sends emails for:

1. **User Registration** - Welcome email with platform introduction
2. **Password Reset** - OTP code with secure styling
3. **Newsletter Subscription** - Confirmation email

### Manual Email Management

Admin users can:

- Send custom emails via `/api/email/send`
- Test email configuration via `/api/email/test`
- Check service status via `/api/email/status`
- Resend welcome emails via `/api/email/resend-welcome`

## API Endpoints

### Email Routes (`/api/email/`)

#### `POST /send` (Admin only)
Send custom email with HTML and text content.

#### `POST /test` (Admin only)
Send test email to verify Mailgun configuration.

#### `GET /status` (Admin only)
Get current email service configuration status.

#### `POST /resend-welcome` (Admin only)
Resend welcome email to existing user.

## Email Templates

The service includes pre-built templates for:

- **Welcome Email** - Branded welcome message for new users
- **Password Reset** - Secure OTP delivery with expiration notice
- **Newsletter Confirmation** - Subscription confirmation with unsubscribe info

All templates are responsive and include both HTML and plain text versions.

## Error Handling

The email service is designed to be resilient:

- Failed emails don't break user registration/login flows
- Detailed logging for debugging
- Graceful degradation when Mailgun is not configured
- Timeout handling for API calls

## Security Features

- Password reset tokens are hashed before storage
- 15-minute expiration for reset codes
- Rate limiting considerations built-in
- Admin-only access for management endpoints

## Development vs Production

**Development:**
- Uses sandbox domain for testing
- Logs email content for debugging
- Test endpoints available

**Production:**
- Requires verified domain
- Removes debug information
- Enhanced security measures

## Troubleshooting

### Common Issues

1. **"Email service not configured"**
   - Check environment variables are set
   - Verify Mailgun API key is correct

2. **"API_ERROR" responses**
   - Check domain verification in Mailgun
   - Verify API key permissions
   - Check rate limits

3. **Emails not received**
   - Check spam folder
   - Verify recipient email is valid
   - Check Mailgun logs in dashboard

### Logs

Email service logs include:
- Successful sends with message IDs
- Failed attempts with error details
- Configuration status on startup

Check application logs for detailed error information.