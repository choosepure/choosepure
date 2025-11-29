from fastapi import APIRouter, HTTPException, status, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase
from models import UpcomingTestCreate, UpcomingTest, VoteCreate
from bson import ObjectId
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/voting", tags=["Voting"])

async def get_db():
    from server import db
    return db

@router.get("/upcoming-tests")
async def get_upcoming_tests(db: AsyncIOMotorDatabase = Depends(get_db)):
    """Get all upcoming tests for voting."""
    try:
        tests = await db.upcoming_tests.find({"status": "voting"}).sort("votes", -1).to_list(100)
        
        # Convert ObjectId to string and format keys
        for test in tests:
            test["id"] = str(test["_id"])
            del test["_id"]
            test["productCategory"] = test.pop("product_category")
            test["targetFunding"] = test.pop("target_funding")
            test["estimatedTestDate"] = test.pop("estimated_test_date")
            if "created_at" in test:
                del test["created_at"]
        
        return {"tests": tests}
    except Exception as e:
        logger.error(f"Get upcoming tests error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get upcoming tests"
        )

@router.post("/vote")
async def vote_for_test(vote_data: VoteCreate, db: AsyncIOMotorDatabase = Depends(get_db)):
    """Vote for an upcoming test."""
    try:
        if not ObjectId.is_valid(vote_data.test_id):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid test ID"
            )
        
        # Check if test exists
        test = await db.upcoming_tests.find_one({"_id": ObjectId(vote_data.test_id)})
        if not test:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Test not found"
            )
        
        # Check if user already voted
        if vote_data.user_id in test.get("voters", []):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Already voted for this test"
            )
        
        # Add vote
        result = await db.upcoming_tests.update_one(
            {"_id": ObjectId(vote_data.test_id)},
            {
                "$inc": {"votes": 1},
                "$push": {"voters": vote_data.user_id}
            }
        )
        
        # Get updated vote count
        updated_test = await db.upcoming_tests.find_one({"_id": ObjectId(vote_data.test_id)})
        
        return {
            "success": True,
            "message": "Vote recorded",
            "newVoteCount": updated_test["votes"]
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Vote error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to record vote"
        )

@router.post("/create-test")
async def create_upcoming_test(test_data: UpcomingTestCreate, db: AsyncIOMotorDatabase = Depends(get_db)):
    """Create a new upcoming test (admin only)."""
    try:
        test = UpcomingTest(**test_data.dict())
        result = await db.upcoming_tests.insert_one(test.dict(by_alias=True, exclude={"id"}))
        
        return {
            "success": True,
            "message": "Test created successfully",
            "testId": str(result.inserted_id)
        }
    except Exception as e:
        logger.error(f"Create test error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create test"
        )
