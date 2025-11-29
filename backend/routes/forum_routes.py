from fastapi import APIRouter, HTTPException, status, Depends, Query
from motor.motor_asyncio import AsyncIOMotorDatabase
from models import ForumPostCreate, ForumPost, ForumReplyCreate, ForumLike, ForumReply
from bson import ObjectId
from typing import Optional
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/forum", tags=["Forum"])

async def get_db():
    from server import db
    return db

@router.get("/posts")
async def get_forum_posts(
    category: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Get all forum posts with optional filtering."""
    try:
        query = {}
        
        # Add category filter
        if category and category != "All":
            query["category"] = category
        
        # Add search filter
        if search:
            query["$or"] = [
                {"title": {"$regex": search, "$options": "i"}},
                {"content": {"$regex": search, "$options": "i"}}
            ]
        
        posts = await db.forum_posts.find(query).sort("created_at", -1).to_list(100)
        
        # Convert ObjectId to string and format response
        for post in posts:
            post["id"] = str(post["_id"])
            del post["_id"]
            post["authorImage"] = post.pop("author_image")
            post["userId"] = post.pop("user_id")
            
            # Calculate time ago
            created_at = post["created_at"]
            time_diff = datetime.utcnow() - created_at
            if time_diff.days > 0:
                post["timeAgo"] = f"{time_diff.days} day{'s' if time_diff.days > 1 else ''} ago"
            elif time_diff.seconds >= 3600:
                hours = time_diff.seconds // 3600
                post["timeAgo"] = f"{hours} hour{'s' if hours > 1 else ''} ago"
            else:
                minutes = time_diff.seconds // 60
                post["timeAgo"] = f"{minutes} minute{'s' if minutes > 1 else ''} ago"
            
            # Get counts
            post["likesCount"] = len(post.get("likes", []))
            post["repliesCount"] = len(post.get("replies", []))
            
            del post["created_at"]
            del post["updated_at"]
            # Keep only count, not full arrays for list view
            post["likes"] = post["likesCount"]
            post["replies"] = post["repliesCount"]
        
        return {"posts": posts}
    except Exception as e:
        logger.error(f"Get forum posts error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get forum posts"
        )

@router.get("/posts/{post_id}")
async def get_forum_post(post_id: str, db: AsyncIOMotorDatabase = Depends(get_db)):
    """Get a single forum post with all details."""
    try:
        if not ObjectId.is_valid(post_id):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid post ID"
            )
        
        post = await db.forum_posts.find_one({"_id": ObjectId(post_id)})
        
        if not post:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Post not found"
            )
        
        # Format response
        post["id"] = str(post["_id"])
        del post["_id"]
        post["authorImage"] = post.pop("author_image")
        post["userId"] = post.pop("user_id")
        del post["created_at"]
        del post["updated_at"]
        
        return post
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get forum post error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get forum post"
        )

@router.post("/posts")
async def create_forum_post(post_data: ForumPostCreate, db: AsyncIOMotorDatabase = Depends(get_db)):
    """Create a new forum post."""
    try:
        # Get user info
        user = await db.users.find_one({"_id": ObjectId(post_data.user_id)})
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Create post
        post = ForumPost(
            user_id=post_data.user_id,
            author=user["name"],
            author_image=f"https://i.pravatar.cc/150?u={user['email']}",
            title=post_data.title,
            content=post_data.content,
            category=post_data.category
        )
        
        result = await db.forum_posts.insert_one(post.dict(by_alias=True, exclude={"id"}))
        
        return {
            "success": True,
            "message": "Post created successfully",
            "postId": str(result.inserted_id)
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Create forum post error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create post"
        )

@router.post("/posts/{post_id}/like")
async def like_forum_post(post_id: str, like_data: ForumLike, db: AsyncIOMotorDatabase = Depends(get_db)):
    """Like or unlike a forum post."""
    try:
        if not ObjectId.is_valid(post_id):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid post ID"
            )
        
        post = await db.forum_posts.find_one({"_id": ObjectId(post_id)})
        if not post:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Post not found"
            )
        
        # Check if already liked
        likes = post.get("likes", [])
        if like_data.user_id in likes:
            # Unlike
            await db.forum_posts.update_one(
                {"_id": ObjectId(post_id)},
                {"$pull": {"likes": like_data.user_id}}
            )
            return {"success": True, "message": "Post unliked", "liked": False}
        else:
            # Like
            await db.forum_posts.update_one(
                {"_id": ObjectId(post_id)},
                {"$push": {"likes": like_data.user_id}}
            )
            return {"success": True, "message": "Post liked", "liked": True}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Like post error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to like post"
        )

@router.post("/posts/{post_id}/reply")
async def reply_to_post(post_id: str, reply_data: ForumReplyCreate, db: AsyncIOMotorDatabase = Depends(get_db)):
    """Reply to a forum post."""
    try:
        if not ObjectId.is_valid(post_id):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid post ID"
            )
        
        # Get user info
        user = await db.users.find_one({"_id": ObjectId(reply_data.user_id)})
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Create reply
        reply = ForumReply(
            user_id=reply_data.user_id,
            user_name=user["name"],
            user_image=f"https://i.pravatar.cc/150?u={user['email']}",
            content=reply_data.content
        )
        
        # Add reply to post
        await db.forum_posts.update_one(
            {"_id": ObjectId(post_id)},
            {
                "$push": {"replies": reply.dict()},
                "$set": {"updated_at": datetime.utcnow()}
            }
        )
        
        return {
            "success": True,
            "message": "Reply added successfully"
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Reply to post error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to add reply"
        )
