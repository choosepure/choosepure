from fastapi import APIRouter, HTTPException, status, Depends, BackgroundTasks
from motor.motor_asyncio import AsyncIOMotorDatabase
from models import WaitlistCreate, Waitlist
from email_service import email_service
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/waitlist", tags=["Waitlist"])

async def get_db():
    from server import db
    return db

@router.post("")
async def add_to_waitlist(
    waitlist_data: WaitlistCreate, 
    background_tasks: BackgroundTasks,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Add user to waitlist."""
    try:
        # Check if email already exists
        existing = await db.waitlist.find_one({"email": waitlist_data.email})
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already on waitlist"
            )
        
        # Create waitlist entry
        waitlist = Waitlist(
            first_name=waitlist_data.firstName,
            mobile=waitlist_data.mobile,
            email=waitlist_data.email,
            pincode=waitlist_data.pincode
        )
        
        result = await db.waitlist.insert_one(waitlist.dict(by_alias=True, exclude={"id"}))
        
        # Send waitlist confirmation email
        logger.info(f"Attempting to send waitlist confirmation email to {waitlist_data.email}")
        email_result = await email_service.send_waitlist_confirmation_email(
            to_email=waitlist_data.email,
            first_name=waitlist_data.firstName
        )
        logger.info(f"Waitlist confirmation email result: {email_result}")
        
        if not email_result["success"]:
            logger.error(f"Failed to send waitlist confirmation email: {email_result.get('message')}")
            logger.error(f"Email service enabled: {email_service.enabled}")
            # Don't fail waitlist signup if email fails
        else:
            logger.info(f"Waitlist confirmation email sent successfully to {waitlist_data.email}")
            logger.info(f"Message ID: {email_result.get('message_id')}")
        
        return {
            "success": True,
            "message": "Successfully added to waitlist",
            "waitlistId": str(result.inserted_id)
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Waitlist error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to add to waitlist"
        )

@router.get("/count")
async def get_waitlist_count(db: AsyncIOMotorDatabase = Depends(get_db)):
    """Get total waitlist count."""
    try:
        count = await db.waitlist.count_documents({})
        return {"count": count}
    except Exception as e:
        logger.error(f"Waitlist count error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get waitlist count"
        )
