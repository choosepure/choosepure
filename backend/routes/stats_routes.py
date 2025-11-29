from fastapi import APIRouter, HTTPException, status, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/stats", tags=["Statistics"])

async def get_db():
    from server import db
    return db

@router.get("/community")
async def get_community_stats(db: AsyncIOMotorDatabase = Depends(get_db)):
    """Get community statistics."""
    try:
        # Get counts from different collections
        total_members = await db.users.count_documents({}) + await db.waitlist.count_documents({})
        tests_completed = await db.test_reports.count_documents({})
        upcoming_tests = await db.upcoming_tests.count_documents({"status": "voting"})
        active_posts = await db.forum_posts.count_documents({})
        
        # Calculate products analyzed (unique brands * categories)
        pipeline = [
            {"$group": {"_id": {"brand": "$brand", "category": "$category"}}},
            {"$count": "total"}
        ]
        products_result = await db.test_reports.aggregate(pipeline).to_list(1)
        products_analyzed = products_result[0]["total"] if products_result else 0
        
        # Calculate total funds pooled (simplified - Rs 150 per member * active contributors)
        # In real scenario, this would sum actual contributions
        active_contributors = max(50, total_members // 10)  # Estimate 10% contribute
        funds_pooled = active_contributors * 150  # Rs 150 per month average
        
        return {
            "totalMembers": total_members,
            "testsCompleted": tests_completed,
            "productsAnalyzed": max(products_analyzed, tests_completed * 3),  # At least 3 products per test
            "fundsPooled": funds_pooled,
            "upcomingTests": upcoming_tests,
            "activePosts": active_posts
        }
    except Exception as e:
        logger.error(f"Get community stats error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get community stats"
        )

@router.get("/user/{user_id}")
async def get_user_stats(user_id: str, db: AsyncIOMotorDatabase = Depends(get_db)):
    """Get user-specific statistics."""
    try:
        if not ObjectId.is_valid(user_id):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid user ID"
            )
        
        # Count votes cast
        votes_pipeline = [
            {"$match": {"voters": user_id}},
            {"$count": "total"}
        ]
        votes_result = await db.upcoming_tests.aggregate(votes_pipeline).to_list(1)
        votes_cast = votes_result[0]["total"] if votes_result else 0
        
        # Count forum posts
        forum_posts = await db.forum_posts.count_documents({"user_id": user_id})
        
        # Count contributions (simplified)
        contributions_pipeline = [
            {"$match": {"contributors.user_id": user_id}},
            {"$count": "total"}
        ]
        contrib_result = await db.upcoming_tests.aggregate(contributions_pipeline).to_list(1)
        tests_contributed = contrib_result[0]["total"] if contrib_result else 0
        
        return {
            "testsContributed": tests_contributed,
            "votesCast": votes_cast,
            "forumPosts": forum_posts,
            "contributions": []
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get user stats error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get user stats"
        )
