from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import os
import logging
from services.razorpay_service import razorpay_service

router = APIRouter()
logger = logging.getLogger(__name__)

class DebugResponse(BaseModel):
    environment_check: dict
    razorpay_status: dict
    test_order_result: dict

@router.get("/debug/razorpay-status")
async def debug_razorpay_status():
    """
    Debug endpoint to check Razorpay configuration and status
    """
    try:
        # Check environment variables (without exposing secrets)
        env_check = {
            "razorpay_key_id_set": bool(os.getenv('RAZORPAY_KEY_ID')),
            "razorpay_key_secret_set": bool(os.getenv('RAZORPAY_KEY_SECRET')),
            "razorpay_webhook_secret_set": bool(os.getenv('RAZORPAY_WEBHOOK_SECRET')),
            "key_id_prefix": os.getenv('RAZORPAY_KEY_ID', '')[:10] + "..." if os.getenv('RAZORPAY_KEY_ID') else "Not set",
        }
        
        # Check Razorpay service status
        razorpay_status = {
            "service_initialized": razorpay_service.client is not None,
            "key_id_loaded": razorpay_service.key_id is not None,
            "key_secret_loaded": razorpay_service.key_secret is not None,
            "webhook_secret_loaded": razorpay_service.webhook_secret is not None,
        }
        
        # Try to create a test order (small amount)
        test_order_result = {"status": "not_attempted"}
        if razorpay_service.client:
            try:
                test_order = razorpay_service.create_order(
                    amount=1.0,  # ₹1 test order
                    currency="INR",
                    receipt="debug_test_order",
                    notes={"test": "debug_endpoint"}
                )
                test_order_result = {
                    "status": "success" if test_order["success"] else "failed",
                    "order_created": test_order["success"],
                    "error": test_order.get("error") if not test_order["success"] else None
                }
            except Exception as e:
                test_order_result = {
                    "status": "error",
                    "error": str(e)
                }
        else:
            test_order_result = {
                "status": "service_not_initialized",
                "error": "Razorpay client not initialized - check credentials"
            }
        
        return DebugResponse(
            environment_check=env_check,
            razorpay_status=razorpay_status,
            test_order_result=test_order_result
        )
        
    except Exception as e:
        logger.error(f"Debug endpoint error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Debug check failed: {str(e)}")

@router.get("/debug/env-vars")
async def debug_env_vars():
    """
    Check which environment variables are set (without exposing values)
    """
    env_vars = [
        'MONGO_URL',
        'DB_NAME', 
        'SECRET_KEY',
        'MAILGUN_API_KEY',
        'MAILGUN_DOMAIN',
        'RAZORPAY_KEY_ID',
        'RAZORPAY_KEY_SECRET',
        'RAZORPAY_WEBHOOK_SECRET'
    ]
    
    result = {}
    for var in env_vars:
        value = os.getenv(var)
        if value:
            # Show first few characters for identification
            if len(value) > 10:
                result[var] = f"{value[:6]}...{value[-4:]}"
            else:
                result[var] = f"{value[:3]}..."
        else:
            result[var] = "NOT SET"
    
    return {"environment_variables": result}