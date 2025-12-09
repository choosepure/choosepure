from fastapi import APIRouter, HTTPException, status, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase
from pydantic import BaseModel
from datetime import datetime
import razorpay
import os
import hmac
import hashlib
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/donations", tags=["Donations"])

# Initialize Razorpay client
razorpay_client = razorpay.Client(auth=(
    os.environ.get("RAZORPAY_KEY_ID"),
    os.environ.get("RAZORPAY_KEY_SECRET")
))

async def get_db():
    from server import db
    return db

class DonationCreate(BaseModel):
    amount: float
    donor_name: str
    donor_email: str
    donor_phone: str = ""
    message: str = ""

class DonationVerification(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str
    donor_name: str
    donor_email: str
    donor_phone: str
    amount: float
    message: str = ""

@router.post("/create-order")
async def create_donation_order(donation: DonationCreate, db: AsyncIOMotorDatabase = Depends(get_db)):
    """Create Razorpay order for donation."""
    try:
        # Create Razorpay order
        order_amount = int(donation.amount * 100)  # Convert to paise
        order_data = {
            "amount": order_amount,
            "currency": "INR",
            "receipt": f"donation_{datetime.utcnow().timestamp()}",
            "notes": {
                "donor_name": donation.donor_name,
                "donor_email": donation.donor_email,
                "donor_phone": donation.donor_phone,
                "message": donation.message,
                "type": "donation"
            }
        }
        
        order = razorpay_client.order.create(data=order_data)
        
        # Store pending donation
        donation_record = {
            "donor_name": donation.donor_name,
            "donor_email": donation.donor_email,
            "donor_phone": donation.donor_phone,
            "amount": donation.amount,
            "message": donation.message,
            "razorpay_order_id": order["id"],
            "status": "pending",
            "created_at": datetime.utcnow()
        }
        
        await db.donations.insert_one(donation_record)
        
        return {
            "success": True,
            "order_id": order["id"],
            "amount": order_amount,
            "currency": order["currency"],
            "key_id": os.environ.get("RAZORPAY_KEY_ID")
        }
    except Exception as e:
        logger.error(f"Create donation order error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to create donation order")

@router.post("/verify-payment")
async def verify_donation_payment(payment_data: DonationVerification, db: AsyncIOMotorDatabase = Depends(get_db)):
    """Verify Razorpay payment for donation."""
    try:
        # Verify signature
        signature = hmac.new(
            os.environ.get("RAZORPAY_KEY_SECRET").encode(),
            f"{payment_data.razorpay_order_id}|{payment_data.razorpay_payment_id}".encode(),
            hashlib.sha256
        ).hexdigest()
        
        if signature != payment_data.razorpay_signature:
            raise HTTPException(status_code=400, detail="Invalid payment signature")
        
        # Update donation record
        result = await db.donations.update_one(
            {"razorpay_order_id": payment_data.razorpay_order_id},
            {
                "$set": {
                    "razorpay_payment_id": payment_data.razorpay_payment_id,
                    "status": "completed",
                    "completed_at": datetime.utcnow(),
                    "donor_name": payment_data.donor_name,
                    "donor_email": payment_data.donor_email,
                    "donor_phone": payment_data.donor_phone,
                    "amount": payment_data.amount,
                    "message": payment_data.message
                }
            }
        )
        
        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="Donation record not found")
        
        return {
            "success": True,
            "message": "Thank you for your generous donation! Together we're making food safer for our children."
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Verify donation payment error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to verify payment")

@router.get("/stats")
async def get_donation_stats(db: AsyncIOMotorDatabase = Depends(get_db)):
    """Get donation statistics."""
    try:
        # Get total donations
        pipeline = [
            {"$match": {"status": "completed"}},
            {"$group": {
                "_id": None,
                "total_amount": {"$sum": "$amount"},
                "total_count": {"$sum": 1}
            }}
        ]
        
        result = await db.donations.aggregate(pipeline).to_list(1)
        
        if result:
            return {
                "total_amount": result[0]["total_amount"],
                "total_donors": result[0]["total_count"]
            }
        else:
            return {
                "total_amount": 0,
                "total_donors": 0
            }
    except Exception as e:
        logger.error(f"Get donation stats error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get donation stats")

@router.get("/recent")
async def get_recent_donations(limit: int = 10, db: AsyncIOMotorDatabase = Depends(get_db)):
    """Get recent donations (for public display)."""
    try:
        donations = await db.donations.find(
            {"status": "completed"},
            {"donor_name": 1, "amount": 1, "message": 1, "completed_at": 1, "_id": 0}
        ).sort("completed_at", -1).limit(limit).to_list(limit)
        
        # Format dates
        for donation in donations:
            if donation.get("completed_at"):
                donation["completed_at"] = donation["completed_at"].isoformat()
        
        return {"donations": donations}
    except Exception as e:
        logger.error(f"Get recent donations error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get recent donations")
