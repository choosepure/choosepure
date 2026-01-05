from fastapi import APIRouter, HTTPException, status, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase
from models import NewsletterSubscribe, Newsletter
import logging
from email_service import email_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/newsletter", tags=["Newsletter"])

async def get_db():
    from server import db
    return db

@router.post("/subscribe")
async def subscribe_to_newsletter(subscribe_data: NewsletterSubscribe, db: AsyncIOMotorDatabase = Depends(get_db)):
    """Subscribe to newsletter."""
    try:
        # Check if email already exists
        existing = await db.newsletter_subscribers.find_one({"email": subscribe_data.email})
        if existing:
            if existing.get("active", False):
                return {
                    "success": True,
                    "message": "Email already subscribed"
                }
            else:
                # Reactivate subscription
                await db.newsletter_subscribers.update_one(
                    {"email": subscribe_data.email},
                    {"$set": {"active": True}}
                )
                return {
                    "success": True,
                    "message": "Subscription reactivated"
                }
        
        # Create new subscription
        newsletter = Newsletter(email=subscribe_data.email)
        result = await db.newsletter_subscribers.insert_one(newsletter.dict(by_alias=True, exclude={"id"}))
        
        # Send confirmation email
        email_result = await email_service.send_newsletter_confirmation_email(subscribe_data.email)
        if not email_result["success"]:
            logger.error(f"Failed to send newsletter confirmation email: {email_result.get('message')}")
            # Don't fail the subscription if email fails
        
        return {
            "success": True,
            "message": "Successfully subscribed to newsletter",
            "subscriberId": str(result.inserted_id)
        }
    except Exception as e:
        logger.error(f"Newsletter subscription error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to subscribe to newsletter"
        )

@router.post("/unsubscribe")
async def unsubscribe_from_newsletter(subscribe_data: NewsletterSubscribe, db: AsyncIOMotorDatabase = Depends(get_db)):
    """Unsubscribe from newsletter."""
    try:
        result = await db.newsletter_subscribers.update_one(
            {"email": subscribe_data.email},
            {"$set": {"active": False}}
        )
        
        if result.modified_count == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Email not found in subscribers"
            )
        
        return {
            "success": True,
            "message": "Successfully unsubscribed from newsletter"
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Newsletter unsubscription error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to unsubscribe from newsletter"
        )
