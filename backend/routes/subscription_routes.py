from fastapi import APIRouter, HTTPException, status, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase
from models import SubscriptionTier, SubscriptionTierCreate, UserSubscription, PaymentVerification
from bson import ObjectId
from datetime import datetime, timedelta
import razorpay
import os
import hmac
import hashlib
import logging
from middleware import require_admin

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/subscriptions", tags=["Subscriptions"])

# Initialize Razorpay client
razorpay_client = razorpay.Client(auth=(
    os.environ.get("RAZORPAY_KEY_ID"),
    os.environ.get("RAZORPAY_KEY_SECRET")
))

async def get_db():
    from server import db
    return db

# ============ SUBSCRIPTION TIER MANAGEMENT (Admin) ============

@router.get("/tiers")
async def get_subscription_tiers(db: AsyncIOMotorDatabase = Depends(get_db)):
    """Get all subscription tiers."""
    try:
        tiers = await db.subscription_tiers.find({"is_active": True}).sort("price", 1).to_list(100)
        
        for tier in tiers:
            tier["id"] = str(tier["_id"])
            del tier["_id"]
            if "created_at" in tier:
                del tier["created_at"]
        
        return {"tiers": tiers}
    except Exception as e:
        logger.error(f"Get tiers error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get subscription tiers"
        )

@router.get("/tiers/{tier_id}")
async def get_tier(tier_id: str, db: AsyncIOMotorDatabase = Depends(get_db)):
    """Get a single tier."""
    try:
        if not ObjectId.is_valid(tier_id):
            raise HTTPException(status_code=400, detail="Invalid tier ID")
        
        tier = await db.subscription_tiers.find_one({"_id": ObjectId(tier_id)})
        if not tier:
            raise HTTPException(status_code=404, detail="Tier not found")
        
        tier["id"] = str(tier["_id"])
        del tier["_id"]
        if "created_at" in tier:
            del tier["created_at"]
        
        return tier
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get tier error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get tier")

@router.post("/tiers")
async def create_subscription_tier(tier_data: SubscriptionTierCreate, db: AsyncIOMotorDatabase = Depends(get_db)):
    """Create a new subscription tier (Admin only)."""
    try:
        tier = SubscriptionTier(**tier_data.dict())
        result = await db.subscription_tiers.insert_one(tier.dict(by_alias=True, exclude={"id"}))
        
        return {
            "success": True,
            "message": "Subscription tier created successfully",
            "tierId": str(result.inserted_id)
        }
    except Exception as e:
        logger.error(f"Create tier error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to create tier")

@router.put("/tiers/{tier_id}")
async def update_subscription_tier(tier_id: str, tier_data: SubscriptionTierCreate, db: AsyncIOMotorDatabase = Depends(get_db)):
    """Update a subscription tier (Admin only)."""
    try:
        if not ObjectId.is_valid(tier_id):
            raise HTTPException(status_code=400, detail="Invalid tier ID")
        
        result = await db.subscription_tiers.update_one(
            {"_id": ObjectId(tier_id)},
            {"$set": tier_data.dict()}
        )
        
        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="Tier not found")
        
        return {"success": True, "message": "Tier updated successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Update tier error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to update tier")

@router.delete("/tiers/{tier_id}")
async def delete_subscription_tier(tier_id: str, db: AsyncIOMotorDatabase = Depends(get_db)):
    """Delete/deactivate a subscription tier (Admin only)."""
    try:
        if not ObjectId.is_valid(tier_id):
            raise HTTPException(status_code=400, detail="Invalid tier ID")
        
        result = await db.subscription_tiers.update_one(
            {"_id": ObjectId(tier_id)},
            {"$set": {"is_active": False}}
        )
        
        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="Tier not found")
        
        return {"success": True, "message": "Tier deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Delete tier error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to delete tier")

# ============ USER SUBSCRIPTION & PAYMENT ============

@router.post("/create-order")
async def create_razorpay_order(tier_id: str, user_id: str, db: AsyncIOMotorDatabase = Depends(get_db)):
    """Create Razorpay order for subscription payment."""
    try:
        # Get tier details
        if not ObjectId.is_valid(tier_id):
            raise HTTPException(status_code=400, detail="Invalid tier ID")
        
        tier = await db.subscription_tiers.find_one({"_id": ObjectId(tier_id)})
        if not tier:
            raise HTTPException(status_code=404, detail="Tier not found")
        
        # Create Razorpay order
        order_amount = int(tier["price"] * 100)  # Convert to paise
        order_data = {
            "amount": order_amount,
            "currency": "INR",
            "receipt": f"sub_{user_id}_{tier_id}",
            "notes": {
                "user_id": user_id,
                "tier_id": tier_id,
                "tier_name": tier["name"]
            }
        }
        
        order = razorpay_client.order.create(data=order_data)
        
        # Store pending subscription
        subscription = UserSubscription(
            user_id=user_id,
            tier_id=tier_id,
            razorpay_order_id=order["id"],
            status="pending",
            amount_paid=tier["price"]
        )
        
        await db.user_subscriptions.insert_one(subscription.dict(by_alias=True, exclude={"id"}))
        
        return {
            "success": True,
            "order_id": order["id"],
            "amount": order_amount,
            "currency": order["currency"],
            "key_id": os.environ.get("RAZORPAY_KEY_ID"),
            "tier_name": tier["name"]
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Create order error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to create payment order")

@router.post("/verify-payment")
async def verify_payment(payment_data: PaymentVerification, db: AsyncIOMotorDatabase = Depends(get_db)):
    """Verify Razorpay payment and activate subscription."""
    try:
        # Verify signature
        signature = hmac.new(
            os.environ.get("RAZORPAY_KEY_SECRET").encode(),
            f"{payment_data.razorpay_order_id}|{payment_data.razorpay_payment_id}".encode(),
            hashlib.sha256
        ).hexdigest()
        
        if signature != payment_data.razorpay_signature:
            raise HTTPException(status_code=400, detail="Invalid payment signature")
        
        # Get tier details
        tier = await db.subscription_tiers.find_one({"_id": ObjectId(payment_data.tier_id)})
        if not tier:
            raise HTTPException(status_code=404, detail="Tier not found")
        
        # Calculate subscription dates
        start_date = datetime.utcnow()
        end_date = start_date + timedelta(days=tier["duration_days"])
        
        # Update subscription
        result = await db.user_subscriptions.update_one(
            {
                "user_id": payment_data.user_id,
                "razorpay_order_id": payment_data.razorpay_order_id
            },
            {
                "$set": {
                    "razorpay_payment_id": payment_data.razorpay_payment_id,
                    "status": "active",
                    "start_date": start_date,
                    "end_date": end_date
                }
            }
        )
        
        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="Subscription not found")
        
        return {
            "success": True,
            "message": "Payment verified and subscription activated",
            "end_date": end_date.isoformat()
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Verify payment error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to verify payment")

@router.get("/user/{user_id}/status")
async def get_user_subscription_status(user_id: str, db: AsyncIOMotorDatabase = Depends(get_db)):
    """Check if user has active subscription."""
    try:
        subscription = await db.user_subscriptions.find_one({
            "user_id": user_id,
            "status": "active",
            "end_date": {"$gt": datetime.utcnow()}
        })
        
        if subscription:
            return {
                "is_subscribed": True,
                "tier_id": subscription["tier_id"],
                "end_date": subscription["end_date"].isoformat(),
                "days_remaining": (subscription["end_date"] - datetime.utcnow()).days
            }
        else:
            return {
                "is_subscribed": False,
                "tier_id": None,
                "end_date": None,
                "days_remaining": 0
            }
    except Exception as e:
        logger.error(f"Get subscription status error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get subscription status")

@router.get("/user/{user_id}/history")
async def get_user_subscription_history(user_id: str, db: AsyncIOMotorDatabase = Depends(get_db)):
    """Get user's subscription history."""
    try:
        subscriptions = await db.user_subscriptions.find(
            {"user_id": user_id}
        ).sort("created_at", -1).to_list(100)
        
        for sub in subscriptions:
            sub["id"] = str(sub["_id"])
            del sub["_id"]
            if sub.get("start_date"):
                sub["start_date"] = sub["start_date"].isoformat()
            if sub.get("end_date"):
                sub["end_date"] = sub["end_date"].isoformat()
            if sub.get("created_at"):
                sub["created_at"] = sub["created_at"].isoformat()
        
        return {"subscriptions": subscriptions}
    except Exception as e:
        logger.error(f"Get subscription history error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get subscription history")
