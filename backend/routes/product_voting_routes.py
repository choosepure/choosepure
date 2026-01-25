from fastapi import APIRouter, HTTPException, status, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase
from models import ProductSuggestion, ProductSuggestionCreate, UserVote, VoteRequest, ShareInvite
from bson import ObjectId
from datetime import datetime, timedelta
import logging
from typing import Optional, List

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/product-voting", tags=["Product Voting"])

async def get_db():
    from server import db
    return db

async def get_current_user_id():
    # This should be replaced with actual JWT token validation
    # For now, returning a placeholder
    return "user_123"

async def is_premium_user(user_id: str, db: AsyncIOMotorDatabase):
    """Check if user has premium subscription"""
    # Check user's subscription status
    user = await db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        return False
    
    # Check if user has active subscription
    subscription = await db.user_subscriptions.find_one({
        "user_id": user_id,
        "status": "active",
        "end_date": {"$gt": datetime.utcnow()}
    })
    
    return subscription is not None

async def get_user_monthly_vote_count(user_id: str, db: AsyncIOMotorDatabase):
    """Get user's vote count for current month"""
    current_month = datetime.now().strftime("%Y-%m")
    
    vote_count = await db.user_votes.count_documents({
        "user_id": user_id,
        "month_year": current_month
    })
    
    return vote_count

@router.get("/suggestions")
async def get_product_suggestions(
    status: str = "voting",
    limit: int = 50,
    skip: int = 0,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Get all product suggestions for voting"""
    try:
        # Build query
        query = {"status": status}
        
        # Get suggestions sorted by vote count (descending)
        cursor = db.product_suggestions.find(query).sort("votes", -1).skip(skip).limit(limit)
        suggestions = await cursor.to_list(length=limit)
        
        # Convert ObjectId to string and format response
        for suggestion in suggestions:
            suggestion["id"] = str(suggestion["_id"])
            del suggestion["_id"]
            
            # Calculate progress percentage
            suggestion["progress_percentage"] = min(
                (suggestion["votes"] / suggestion["vote_threshold"]) * 100, 100
            )
            
            # Add time remaining estimate
            if suggestion["votes"] > 0:
                days_since_creation = (datetime.utcnow() - suggestion["created_at"]).days
                if days_since_creation > 0:
                    votes_per_day = suggestion["votes"] / days_since_creation
                    if votes_per_day > 0:
                        remaining_votes = suggestion["vote_threshold"] - suggestion["votes"]
                        estimated_days = max(1, int(remaining_votes / votes_per_day))
                        suggestion["estimated_completion_days"] = estimated_days
        
        total_count = await db.product_suggestions.count_documents(query)
        
        return {
            "success": True,
            "data": {
                "suggestions": suggestions,
                "total": total_count,
                "skip": skip,
                "limit": limit
            }
        }
        
    except Exception as e:
        logger.error(f"Error fetching product suggestions: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch product suggestions"
        )

@router.post("/suggestions")
async def create_product_suggestion(
    suggestion_data: ProductSuggestionCreate,
    suggested_by_admin: bool = False,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Create a new product suggestion (admin or user)"""
    try:
        # Get current user (in real implementation, extract from JWT)
        current_user_id = await get_current_user_id()
        
        # Create suggestion document
        suggestion = ProductSuggestion(
            product_name=suggestion_data.product_name,
            brand=suggestion_data.brand,
            category=suggestion_data.category,
            description=suggestion_data.description,
            suggested_by=current_user_id,
            suggested_by_admin=suggested_by_admin,
            estimated_test_date=suggestion_data.estimated_test_date
        )
        
        # Insert into database
        result = await db.product_suggestions.insert_one(
            suggestion.dict(by_alias=True, exclude={"id"})
        )
        
        # Get the created suggestion
        created_suggestion = await db.product_suggestions.find_one(
            {"_id": result.inserted_id}
        )
        
        created_suggestion["id"] = str(created_suggestion["_id"])
        del created_suggestion["_id"]
        
        logger.info(f"Product suggestion created: {result.inserted_id}")
        
        return {
            "success": True,
            "message": "Product suggestion created successfully",
            "data": created_suggestion
        }
        
    except Exception as e:
        logger.error(f"Error creating product suggestion: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create product suggestion"
        )

@router.post("/vote")
async def vote_for_product(
    vote_request: VoteRequest,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Vote for a product suggestion"""
    try:
        # Get current user (in real implementation, extract from JWT)
        current_user_id = await get_current_user_id()
        
        # Validate product suggestion exists
        if not ObjectId.is_valid(vote_request.product_suggestion_id):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid product suggestion ID"
            )
        
        suggestion = await db.product_suggestions.find_one(
            {"_id": ObjectId(vote_request.product_suggestion_id)}
        )
        
        if not suggestion:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Product suggestion not found"
            )
        
        if suggestion["status"] != "voting":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Voting is closed for this product"
            )
        
        # Check if user already voted for this product
        if current_user_id in suggestion.get("voters", []):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You have already voted for this product"
            )
        
        # Check user's monthly vote limit
        current_month = datetime.now().strftime("%Y-%m")
        monthly_votes = await get_user_monthly_vote_count(current_user_id, db)
        is_premium = await is_premium_user(current_user_id, db)
        
        vote_limit = 3 if is_premium else 1
        
        if monthly_votes >= vote_limit:
            limit_type = "premium" if is_premium else "regular"
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Monthly vote limit reached ({vote_limit} votes for {limit_type} users)"
            )
        
        # Record the vote
        user_vote = UserVote(
            user_id=current_user_id,
            product_suggestion_id=vote_request.product_suggestion_id,
            month_year=current_month
        )
        
        await db.user_votes.insert_one(user_vote.dict(by_alias=True, exclude={"id"}))
        
        # Update suggestion vote count and voters list
        result = await db.product_suggestions.update_one(
            {"_id": ObjectId(vote_request.product_suggestion_id)},
            {
                "$inc": {"votes": 1},
                "$push": {"voters": current_user_id}
            }
        )
        
        # Get updated suggestion
        updated_suggestion = await db.product_suggestions.find_one(
            {"_id": ObjectId(vote_request.product_suggestion_id)}
        )
        
        # Check if vote threshold reached
        if updated_suggestion["votes"] >= updated_suggestion["vote_threshold"]:
            # Move to testing status
            await db.product_suggestions.update_one(
                {"_id": ObjectId(vote_request.product_suggestion_id)},
                {"$set": {"status": "testing"}}
            )
            
            logger.info(f"Product suggestion {vote_request.product_suggestion_id} reached vote threshold")
        
        return {
            "success": True,
            "message": "Vote recorded successfully",
            "data": {
                "new_vote_count": updated_suggestion["votes"],
                "threshold_reached": updated_suggestion["votes"] >= updated_suggestion["vote_threshold"],
                "user_monthly_votes_remaining": vote_limit - (monthly_votes + 1)
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error recording vote: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to record vote"
        )

@router.get("/user-votes")
async def get_user_votes(
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Get current user's voting history and limits"""
    try:
        # Get current user (in real implementation, extract from JWT)
        current_user_id = await get_current_user_id()
        
        # Get current month vote count
        current_month = datetime.now().strftime("%Y-%m")
        monthly_votes = await get_user_monthly_vote_count(current_user_id, db)
        is_premium = await is_premium_user(current_user_id, db)
        
        vote_limit = 3 if is_premium else 1
        
        # Get user's voted products
        user_votes = await db.user_votes.find(
            {"user_id": current_user_id}
        ).sort("voted_at", -1).to_list(100)
        
        # Get product details for voted products
        voted_products = []
        for vote in user_votes:
            product = await db.product_suggestions.find_one(
                {"_id": ObjectId(vote["product_suggestion_id"])}
            )
            if product:
                product["id"] = str(product["_id"])
                del product["_id"]
                product["voted_at"] = vote["voted_at"]
                voted_products.append(product)
        
        return {
            "success": True,
            "data": {
                "monthly_votes_used": monthly_votes,
                "monthly_vote_limit": vote_limit,
                "votes_remaining": vote_limit - monthly_votes,
                "is_premium": is_premium,
                "voted_products": voted_products
            }
        }
        
    except Exception as e:
        logger.error(f"Error fetching user votes: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch user votes"
        )

@router.post("/share/{suggestion_id}")
async def share_product_suggestion(
    suggestion_id: str,
    shared_via: str,
    recipient_info: Optional[str] = None,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Record product suggestion share for tracking"""
    try:
        # Get current user (in real implementation, extract from JWT)
        current_user_id = await get_current_user_id()
        
        # Validate suggestion exists
        if not ObjectId.is_valid(suggestion_id):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid suggestion ID"
            )
        
        suggestion = await db.product_suggestions.find_one(
            {"_id": ObjectId(suggestion_id)}
        )
        
        if not suggestion:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Product suggestion not found"
            )
        
        # Record the share
        share_record = ShareInvite(
            product_suggestion_id=suggestion_id,
            shared_by=current_user_id,
            shared_via=shared_via,
            recipient_info=recipient_info
        )
        
        await db.share_invites.insert_one(
            share_record.dict(by_alias=True, exclude={"id"})
        )
        
        # Generate share URL
        share_url = f"https://choosepure.in/vote/{suggestion_id}"
        
        return {
            "success": True,
            "message": "Share recorded successfully",
            "data": {
                "share_url": share_url,
                "product_name": suggestion["product_name"],
                "brand": suggestion["brand"],
                "current_votes": suggestion["votes"],
                "votes_needed": suggestion["vote_threshold"] - suggestion["votes"]
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error recording share: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to record share"
        )

@router.get("/stats")
async def get_voting_stats(
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Get overall voting statistics"""
    try:
        # Get various statistics
        total_suggestions = await db.product_suggestions.count_documents({})
        active_voting = await db.product_suggestions.count_documents({"status": "voting"})
        testing_phase = await db.product_suggestions.count_documents({"status": "testing"})
        completed_tests = await db.product_suggestions.count_documents({"status": "completed"})
        
        # Get total votes cast
        total_votes = await db.user_votes.count_documents({})
        
        # Get most voted products
        most_voted = await db.product_suggestions.find(
            {"status": "voting"}
        ).sort("votes", -1).limit(5).to_list(5)
        
        for product in most_voted:
            product["id"] = str(product["_id"])
            del product["_id"]
        
        return {
            "success": True,
            "data": {
                "total_suggestions": total_suggestions,
                "active_voting": active_voting,
                "testing_phase": testing_phase,
                "completed_tests": completed_tests,
                "total_votes": total_votes,
                "most_voted_products": most_voted
            }
        }
        
    except Exception as e:
        logger.error(f"Error fetching voting stats: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch voting stats"
        )