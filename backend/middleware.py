"""
Middleware for role-based access control
"""
from fastapi import HTTPException, status, Depends
from auth import get_current_user
from bson import ObjectId

async def get_db():
    from server import db
    return db

async def require_admin(current_user: dict = Depends(get_current_user), db = Depends(get_db)):
    """Middleware to check if user has admin role."""
    try:
        user = await db.users.find_one({"_id": ObjectId(current_user["user_id"])})
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        if user.get("role") != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Admin access required"
            )
        
        return user
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to verify admin access"
        )
