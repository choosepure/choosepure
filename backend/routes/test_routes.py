from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
import logging
from email_service import email_service

router = APIRouter()
logger = logging.getLogger(__name__)

class TestEmailRequest(BaseModel):
    email: EmailStr
    name: str = "Test User"

class TestWaitlistEmailRequest(BaseModel):
    email: EmailStr
    firstName: str = "Test User"

@router.post("/test-waitlist-email")
async def test_waitlist_email(request: TestWaitlistEmailRequest):
    """
    Test endpoint to send waitlist confirmation email (for debugging)
    """
    try:
        logger.info(f"Testing waitlist confirmation email for {request.email}")
        
        # Check email service status
        if not email_service.enabled:
            return {
                "success": False,
                "error": "Email service not enabled",
                "details": {
                    "api_key_set": bool(email_service.api_key),
                    "domain_set": bool(email_service.domain),
                    "from_email": email_service.from_email
                }
            }
        
        # Send waitlist confirmation email
        result = await email_service.send_waitlist_confirmation_email(
            to_email=request.email,
            first_name=request.firstName
        )
        
        logger.info(f"Waitlist confirmation email result: {result}")
        
        return {
            "success": result["success"],
            "message": result.get("message", ""),
            "message_id": result.get("message_id"),
            "error": result.get("error"),
            "email_service_status": {
                "enabled": email_service.enabled,
                "domain": email_service.domain,
                "from_email": email_service.from_email,
                "base_url": email_service.base_url
            }
        }
        
    except Exception as e:
        logger.error(f"Test waitlist email error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Test failed: {str(e)}")

@router.post("/test-welcome-email")
async def test_welcome_email(request: TestEmailRequest):
    """
    Test endpoint to send welcome email (for debugging)
    """
    try:
        logger.info(f"Testing welcome email for {request.email}")
        
        # Check email service status
        if not email_service.enabled:
            return {
                "success": False,
                "error": "Email service not enabled",
                "details": {
                    "api_key_set": bool(email_service.api_key),
                    "domain_set": bool(email_service.domain),
                    "from_email": email_service.from_email
                }
            }
        
        # Send welcome email
        result = await email_service.send_welcome_email(
            to_email=request.email,
            user_name=request.name
        )
        
        logger.info(f"Welcome email result: {result}")
        
        return {
            "success": result["success"],
            "message": result.get("message", ""),
            "message_id": result.get("message_id"),
            "error": result.get("error"),
            "email_service_status": {
                "enabled": email_service.enabled,
                "domain": email_service.domain,
                "from_email": email_service.from_email,
                "base_url": email_service.base_url
            }
        }
        
    except Exception as e:
        logger.error(f"Test welcome email error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Test failed: {str(e)}")

@router.get("/email-service-status")
async def get_email_service_status():
    """
    Get email service configuration status
    """
    return {
        "enabled": email_service.enabled,
        "domain": email_service.domain,
        "from_email": email_service.from_email,
        "base_url": email_service.base_url,
        "api_key_configured": bool(email_service.api_key),
        "endpoint": email_service.endpoint
    }