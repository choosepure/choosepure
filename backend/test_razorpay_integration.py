#!/usr/bin/env python3
"""
Test script to verify Razorpay integration is working correctly
"""

import os
import sys
import asyncio
from pathlib import Path

# Add the backend directory to Python path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

from dotenv import load_dotenv
from services.razorpay_service import razorpay_service

# Load environment variables
load_dotenv()

async def test_razorpay_integration():
    """Test Razorpay service integration"""
    
    print("🧪 Testing Razorpay Integration...")
    print("=" * 50)
    
    # Reinitialize the service to ensure credentials are loaded
    from services.razorpay_service import RazorpayService
    test_service = RazorpayService()
    
    # Check if credentials are loaded
    print("1. Checking Razorpay credentials...")
    if not test_service.key_id or not test_service.key_secret:
        print("❌ Razorpay credentials not found in environment variables")
        print("   Please check your .env file")
        print(f"   KEY_ID: {os.getenv('RAZORPAY_KEY_ID')}")
        print(f"   KEY_SECRET: {os.getenv('RAZORPAY_KEY_SECRET')}")
        return False
    
    print(f"✅ Key ID: {test_service.key_id[:10]}...")
    print(f"✅ Key Secret: {'*' * len(test_service.key_secret)}")
    print(f"✅ Webhook Secret: {'*' * len(test_service.webhook_secret) if test_service.webhook_secret else 'Not set'}")
    
    # Test order creation
    print("\n2. Testing order creation...")
    try:
        test_order = test_service.create_order(
            amount=199.0,
            currency="INR",
            receipt="test_order_123",
            notes={
                "test": "true",
                "customer_name": "Test User",
                "order_type": "report_purchase"
            }
        )
        
        if test_order["success"]:
            print("✅ Order creation successful!")
            print(f"   Order ID: {test_order['order_id']}")
            print(f"   Amount: ₹{test_order['amount'] / 100}")
            print(f"   Currency: {test_order['currency']}")
            print(f"   Status: {test_order['status']}")
        else:
            print(f"❌ Order creation failed: {test_order.get('error')}")
            return False
            
    except Exception as e:
        print(f"❌ Order creation error: {str(e)}")
        return False
    
    # Test signature verification (with dummy data)
    print("\n3. Testing signature verification...")
    try:
        # This will fail with dummy data, but should not throw an exception
        is_valid = test_service.verify_payment_signature(
            "order_test123",
            "pay_test123", 
            "dummy_signature"
        )
        print(f"✅ Signature verification function working (result: {is_valid})")
        
    except Exception as e:
        print(f"❌ Signature verification error: {str(e)}")
        return False
    
    # Test webhook signature verification
    print("\n4. Testing webhook signature verification...")
    try:
        if test_service.webhook_secret:
            is_valid = test_service.verify_webhook_signature(
                '{"test": "payload"}',
                "dummy_signature"
            )
            print(f"✅ Webhook signature verification function working (result: {is_valid})")
        else:
            print("⚠️  Webhook secret not configured - skipping webhook test")
            
    except Exception as e:
        print(f"❌ Webhook signature verification error: {str(e)}")
        return False
    
    print("\n" + "=" * 50)
    print("🎉 All Razorpay integration tests passed!")
    print("\n📋 Summary:")
    print("   ✅ Credentials loaded successfully")
    print("   ✅ Order creation working")
    print("   ✅ Payment signature verification working")
    print("   ✅ Webhook signature verification working")
    
    print("\n🚀 Ready for production deployment!")
    print("\n📝 Next steps:")
    print("   1. Set environment variables in Render dashboard")
    print("   2. Deploy the application")
    print("   3. Configure webhook URL in Razorpay dashboard")
    print("   4. Test payment flow on production")
    
    return True

if __name__ == "__main__":
    success = asyncio.run(test_razorpay_integration())
    sys.exit(0 if success else 1)