#!/usr/bin/env python3
"""
Test welcome email functionality
"""

import asyncio
import os
from dotenv import load_dotenv
from pathlib import Path

async def test_welcome_email():
    """Test the welcome email functionality"""
    
    # Load environment variables
    env_path = Path(__file__).parent / '.env'
    load_dotenv(env_path, override=True)
    
    # Import email service after loading env
    from email_service import email_service
    
    print("🔧 Testing Welcome Email Service")
    print("=" * 50)
    
    # Check email service status
    print(f"✅ Email service enabled: {email_service.enabled}")
    print(f"✅ Domain: {email_service.domain}")
    print(f"✅ From email: {email_service.from_email}")
    print(f"✅ API key configured: {'Yes' if email_service.api_key else 'No'}")
    
    if not email_service.enabled:
        print("\n❌ Email service is not enabled")
        return
    
    print("\n🧪 Testing welcome email...")
    
    # Get test email
    test_email = input("Enter email address to test welcome email: ").strip()
    test_name = input("Enter name for welcome email: ").strip() or "Test User"
    
    if not test_email:
        print("❌ No email provided")
        return
    
    # Send welcome email
    result = await email_service.send_welcome_email(
        to_email=test_email,
        user_name=test_name
    )
    
    print("\n📧 Welcome Email Result:")
    print("=" * 30)
    print(f"Success: {result['success']}")
    
    if result['success']:
        print(f"Message ID: {result.get('message_id', 'N/A')}")
        print(f"Message: {result.get('message', 'N/A')}")
        print("\n✅ Welcome email sent successfully!")
        print("Check your inbox (and spam folder)")
    else:
        print(f"Error: {result.get('error', 'Unknown')}")
        print(f"Message: {result.get('message', 'N/A')}")
        print(f"Status Code: {result.get('status_code', 'N/A')}")
        print("\n❌ Welcome email failed to send")
        
        # Additional debugging
        print("\n🔍 Debugging info:")
        print(f"   - Check if domain '{email_service.domain}' is verified in Mailgun")
        print(f"   - Verify API key is correct")
        print(f"   - Check Mailgun logs at https://app.mailgun.com")

if __name__ == "__main__":
    asyncio.run(test_welcome_email())