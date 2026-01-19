#!/usr/bin/env python3
"""
Test registration flow with welcome email
"""

import asyncio
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Add current directory to path
sys.path.insert(0, '.')

from email_service import email_service

async def test_registration_email():
    """Test the registration email flow"""
    
    print("🔧 Testing Registration Welcome Email")
    print("=" * 50)
    
    # Check email service status
    print(f"Email service enabled: {email_service.enabled}")
    
    if not email_service.enabled:
        print("❌ Email service is not enabled")
        return
    
    # Get test details
    test_email = input("Enter email address for test registration: ").strip()
    test_name = input("Enter name for test registration: ").strip() or "Test User"
    
    if not test_email:
        print("❌ No email provided")
        return
    
    print(f"\n📧 Sending welcome email to: {test_email}")
    print(f"👤 User name: {test_name}")
    
    # Send welcome email (simulating registration)
    result = await email_service.send_welcome_email(
        to_email=test_email,
        user_name=test_name
    )
    
    print("\n📊 Welcome Email Result:")
    print("=" * 30)
    print(f"Success: {result['success']}")
    
    if result['success']:
        print(f"✅ Message ID: {result.get('message_id', 'N/A')}")
        print(f"✅ Message: {result.get('message', 'N/A')}")
        print("\n🎉 Welcome email sent successfully!")
        print("📬 Check your inbox (and spam folder)")
        
        # Additional success info
        print("\n📋 Email Details:")
        print(f"   From: {email_service.from_email}")
        print(f"   To: {test_email}")
        print(f"   Subject: Welcome to ChoosePure!")
        
    else:
        print(f"❌ Error: {result.get('error', 'Unknown')}")
        print(f"❌ Message: {result.get('message', 'N/A')}")
        print(f"❌ Status Code: {result.get('status_code', 'N/A')}")
        print("\n🔍 Troubleshooting:")
        print("   1. Check Mailgun domain verification")
        print("   2. Verify API key permissions")
        print("   3. Check Mailgun logs")
        print("   4. Ensure domain DNS is configured")

if __name__ == "__main__":
    asyncio.run(test_registration_email())