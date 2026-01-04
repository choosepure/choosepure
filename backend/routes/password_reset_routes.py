from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, EmailStr
from motor.motor_asyncio import AsyncIOMotorDatabase
from datetime import datetime, timedelta
import secrets
import hashlib
from passlib.context import CryptContext
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/password-reset", tags=["Password Reset"])

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

async def get_db():
    from server import db
    return db

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    email: EmailStr
    reset_token: str
    new_password: str

class VerifyTokenRequest(BaseModel):
    email: EmailStr
    reset_token: str

def generate_reset_token():
    """Generate a secure 6-digit reset token"""
    return ''.join([str(secrets.randbelow(10)) for _ in range(6)])

@router.post("/request-reset")
async def request_password_reset(request: ForgotPasswordRequest, db: AsyncIOMotorDatabase = Depends(get_db)):
    """Request password reset - generates OTP and stores it"""
    try:
        # Check if user exists
        user = await db.users.find_one({"email": request.email}, {"_id": 0})
        
        if not user:
            # Don't reveal if email exists or not (security best practice)
            return {
                "success": True,
                "message": "If this email exists, you will receive a password reset code"
            }
        
        # Generate reset token (6-digit OTP)
        reset_token = generate_reset_token()
        
        # Hash the token before storing (security best practice)
        token_hash = hashlib.sha256(reset_token.encode()).hexdigest()
        
        # Set expiration (15 minutes from now)
        expiration = datetime.utcnow() + timedelta(minutes=15)
        
        # Store reset token in database
        await db.password_resets.update_one(
            {"email": request.email},
            {
                "$set": {
                    "token_hash": token_hash,
                    "expiration": expiration,
                    "created_at": datetime.utcnow(),
                    "used": False
                }
            },
            upsert=True
        )
        
        # In production, send email here with reset_token
        # For development/demo, we'll return the token
        logger.info(f"Password reset requested for {request.email}")
        logger.info(f"Reset token (DEV ONLY): {reset_token}")
        
        return {
            "success": True,
            "message": "Password reset code sent to your email",
            "reset_token": reset_token,  # Remove this in production!
            "note": "In production, this token would be sent via email only"
        }
        
    except Exception as e:
        logger.error(f"Request password reset error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to process password reset request")

@router.post("/verify-token")
async def verify_reset_token(request: VerifyTokenRequest, db: AsyncIOMotorDatabase = Depends(get_db)):
    """Verify if the reset token is valid"""
    try:
        # Hash the provided token
        token_hash = hashlib.sha256(request.reset_token.encode()).hexdigest()
        
        # Find reset request
        reset_request = await db.password_resets.find_one({
            "email": request.email,
            "token_hash": token_hash,
            "used": False
        })
        
        if not reset_request:
            raise HTTPException(status_code=400, detail="Invalid or expired reset token")
        
        # Check if expired
        if reset_request["expiration"] < datetime.utcnow():
            raise HTTPException(status_code=400, detail="Reset token has expired")
        
        return {
            "success": True,
            "message": "Token verified successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Verify token error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to verify token")

@router.post("/reset-password")
async def reset_password(request: ResetPasswordRequest, db: AsyncIOMotorDatabase = Depends(get_db)):
    """Reset password using verified token"""
    try:
        # Verify user exists
        user = await db.users.find_one({"email": request.email}, {"_id": 0})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Hash the provided token
        token_hash = hashlib.sha256(request.reset_token.encode()).hexdigest()
        
        # Find and verify reset request
        reset_request = await db.password_resets.find_one({
            "email": request.email,
            "token_hash": token_hash,
            "used": False
        })
        
        if not reset_request:
            raise HTTPException(status_code=400, detail="Invalid or expired reset token")
        
        # Check if expired
        if reset_request["expiration"] < datetime.utcnow():
            raise HTTPException(status_code=400, detail="Reset token has expired")
        
        # Validate new password
        if len(request.new_password) < 6:
            raise HTTPException(status_code=400, detail="Password must be at least 6 characters long")
        
        # Hash new password
        hashed_password = pwd_context.hash(request.new_password)
        
        # Update user password
        await db.users.update_one(
            {"email": request.email},
            {"$set": {"password": hashed_password}}
        )
        
        # Mark token as used
        await db.password_resets.update_one(
            {"email": request.email, "token_hash": token_hash},
            {"$set": {"used": True, "used_at": datetime.utcnow()}}
        )
        
        logger.info(f"Password reset successful for {request.email}")
        
        return {
            "success": True,
            "message": "Password reset successfully. You can now login with your new password."
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Reset password error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to reset password")

@router.delete("/cleanup-expired")
async def cleanup_expired_tokens(db: AsyncIOMotorDatabase = Depends(get_db)):
    """Cleanup expired reset tokens (can be called by a scheduled job)"""
    try:
        result = await db.password_resets.delete_many({
            "expiration": {"$lt": datetime.utcnow()}
        })
        
        return {
            "success": True,
            "deleted_count": result.deleted_count
        }
    except Exception as e:
        logger.error(f"Cleanup error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to cleanup expired tokens")
