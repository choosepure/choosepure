#!/usr/bin/env python3
"""
Debug email service configuration
"""

import os
import asyncio
from dotenv import load_dotenv
from pathlib import Path

# Load environment variables
load_dotenv()

# Import email service
from email_service import email_service

async def debug_email_service():
    """Debug email service configuration"""
    
    print("🔧 Email Service Debug")
    print("=" * 40)
    
    # Check environment variables
    print("Environment Variables:")
    print(f"  MAILGUN_API_KEY: {'SET' if os.getenv('MAILGUN_API_KEY') else 'NOT SET'}")
    print(f"  MAILGUN_DOMAIN: {os.getenv('MAILGUN_DOMAIN')}")
    print(f"  MAILGUN_FROM_EMAIL: {os.getenv('MAILGUN_FROM_EMAIL')}")
    
    print("\nEmail Service Status:")
    print(f"  Enabled: {email_service.enabled}")
    print(f"  API Key: {'SET' if email_service.api_key else 'NOT SET'}")
    print(f"  Domain: {email_service.domain}")
    print(f"  From Email: {email_service.from_email}")
    print(f"  Base URL: {email_service.base_url}")
    
    if not email_service.enabled:
        print("\n❌ Email service is disabled!")
        return
    
    # Test sending a welcome email
    print("\n🧪 Testing welcome email...")
    result = await email_service.send_welcome_email(
        to_email="test@example.com",
        user_name="Test User"
    )
    
    print(f"\nResult: {result}")

if __name__ == "__main__":
    asyncio.run(debug_email_service())