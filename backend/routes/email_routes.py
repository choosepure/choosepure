from fastapi import APIRouter, HTTPException, status, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase
from pydantic import BaseModel, EmailStr
from typing import Optional, List
import logging
from email_service import email_service
from auth import get_current_user

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/email", tags=["Email"])

async def get_db():
    from server import db
    return db

class SendEmailRequest(BaseModel):
    to_email: EmailStr
    subject: str
    html_content: str
    text_content: Optional[str] = None
    tags: Optional[List[str]] = None

class TestEmailRequest(BaseModel):
    to_email: EmailStr

@router.post("/send")
async def send_custom_email(
    email_data: SendEmailRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Send a custom email (admin only)."""
    try:
        # Check if user is admin
        from bson import ObjectId
        user = await db.users.find_one({"_id": ObjectId(current_user["user_id"])})
        if not user or user.get("role") != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Admin access required"
            )
        
        # Send email
        result = await email_service.send_email(
            to_email=email_data.to_email,
            subject=email_data.subject,
            html_content=email_data.html_content,
            text_content=email_data.text_content,
            tags=email_data.tags or ['custom', 'admin']
        )
        
        if result["success"]:
            return {
                "success": True,
                "message": "Email sent successfully",
                "message_id": result.get("message_id")
            }
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to send email: {result.get('message')}"
            )
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Send email error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to send email"
        )

@router.post("/test")
async def send_test_email(
    test_data: TestEmailRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Send a test email to verify Mailgun configuration (admin only)."""
    try:
        # Check if user is admin
        from bson import ObjectId
        user = await db.users.find_one({"_id": ObjectId(current_user["user_id"])})
        if not user or user.get("role") != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Admin access required"
            )
        
        # Send test email
        html_content = """
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>Test Email</title>
        </head>
        <body style="font-family: Arial, sans-serif; padding: 20px;">
            <h2 style="color: #667eea;">Mailgun Test Email</h2>
            <p>This is a test email to verify that your Mailgun integration is working correctly.</p>
            <p>If you received this email, your email service is configured properly!</p>
            <hr>
            <p style="font-size: 12px; color: #666;">
                Sent from ChoosePure Email Service
            </p>
        </body>
        </html>
        """
        
        text_content = """
        Mailgun Test Email
        
        This is a test email to verify that your Mailgun integration is working correctly.
        
        If you received this email, your email service is configured properly!
        
        Sent from ChoosePure Email Service
        """
        
        result = await email_service.send_email(
            to_email=test_data.to_email,
            subject="ChoosePure - Mailgun Test Email",
            html_content=html_content,
            text_content=text_content,
            tags=['test', 'admin']
        )
        
        if result["success"]:
            return {
                "success": True,
                "message": "Test email sent successfully",
                "message_id": result.get("message_id")
            }
        else:
            return {
                "success": False,
                "message": f"Failed to send test email: {result.get('message')}",
                "error": result.get("error")
            }
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Send test email error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to send test email"
        )

@router.get("/status")
async def get_email_service_status(
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Get email service status (admin only)."""
    try:
        # Check if user is admin
        from bson import ObjectId
        user = await db.users.find_one({"_id": ObjectId(current_user["user_id"])})
        if not user or user.get("role") != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Admin access required"
            )
        
        return {
            "enabled": email_service.enabled,
            "domain": email_service.domain if email_service.enabled else None,
            "from_email": email_service.from_email if email_service.enabled else None,
            "api_configured": bool(email_service.api_key) if email_service.enabled else False
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get email status error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get email service status"
        )

@router.post("/resend-welcome")
async def resend_welcome_email(
    email_data: TestEmailRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Resend welcome email to a user (admin only)."""
    try:
        # Check if user is admin
        from bson import ObjectId
        admin_user = await db.users.find_one({"_id": ObjectId(current_user["user_id"])})
        if not admin_user or admin_user.get("role") != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Admin access required"
            )
        
        # Find the target user
        target_user = await db.users.find_one({"email": email_data.to_email})
        if not target_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Send welcome email
        result = await email_service.send_welcome_email(
            to_email=target_user["email"],
            user_name=target_user["name"]
        )
        
        if result["success"]:
            return {
                "success": True,
                "message": "Welcome email sent successfully",
                "message_id": result.get("message_id")
            }
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to send welcome email: {result.get('message')}"
            )
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Resend welcome email error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to resend welcome email"
        )