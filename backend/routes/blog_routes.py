from fastapi import APIRouter, HTTPException, status, Depends, Query
from motor.motor_asyncio import AsyncIOMotorDatabase
from models import BlogPostCreate, BlogPost
from bson import ObjectId
from typing import Optional
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/blog", tags=["Blog"])

async def get_db():
    from server import db
    return db

@router.get("/posts")
async def get_blog_posts(
    search: Optional[str] = Query(None),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Get all blog posts with optional search."""
    try:
        query = {}
        
        # Add search filter
        if search:
            query["$or"] = [
                {"title": {"$regex": search, "$options": "i"}},
                {"excerpt": {"$regex": search, "$options": "i"}},
                {"content": {"$regex": search, "$options": "i"}}
            ]
        
        posts = await db.blog_posts.find(query).sort("created_at", -1).to_list(100)
        
        # Convert ObjectId to string and format keys
        for post in posts:
            post["id"] = str(post["_id"])
            del post["_id"]
            post["publishDate"] = post.pop("publish_date")
            post["readTime"] = f"{len(post.get('content', '').split()) // 200} min read"
            if "created_at" in post:
                del post["created_at"]
        
        return {"posts": posts}
    except Exception as e:
        logger.error(f"Get blog posts error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get blog posts"
        )

@router.get("/posts/{post_id}")
async def get_blog_post(post_id: str, db: AsyncIOMotorDatabase = Depends(get_db)):
    """Get a single blog post by ID."""
    try:
        if not ObjectId.is_valid(post_id):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid post ID"
            )
        
        post = await db.blog_posts.find_one({"_id": ObjectId(post_id)})
        
        if not post:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Post not found"
            )
        
        # Increment view count
        await db.blog_posts.update_one(
            {"_id": ObjectId(post_id)},
            {"$inc": {"views": 1}}
        )
        
        # Format response
        post["id"] = str(post["_id"])
        del post["_id"]
        post["publishDate"] = post.pop("publish_date")
        post["readTime"] = f"{len(post.get('content', '').split()) // 200} min read"
        if "created_at" in post:
            del post["created_at"]
        
        return post
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get blog post error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get blog post"
        )

@router.post("/posts")
async def create_blog_post(post_data: BlogPostCreate, db: AsyncIOMotorDatabase = Depends(get_db)):
    """Create a new blog post (admin only)."""
    try:
        post = BlogPost(**post_data.dict())
        result = await db.blog_posts.insert_one(post.dict(by_alias=True, exclude={"id"}))
        
        return {
            "success": True,
            "message": "Blog post created successfully",
            "postId": str(result.inserted_id)
        }
    except Exception as e:
        logger.error(f"Create blog post error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create blog post"
        )
