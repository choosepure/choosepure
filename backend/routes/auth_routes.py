from fastapi import APIRouter, HTTPException, status, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase
from models import UserCreate, UserLogin, UserResponse, User
from auth import get_password_hash, verify_password, create_access_token, get_current_user
from datetime import datetime
import logging
from email_service import email_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["Authentication"])

async def get_db():
    from server import db
    return db

@router.post("/register")
async def register(user_data: UserCreate, db: AsyncIOMotorDatabase = Depends(get_db)):
    """Register a new user."""
    try:
        # Check if user already exists
        existing_user = await db.users.find_one({"email": user_data.email})
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        # Hash password
        hashed_password = get_password_hash(user_data.password)
        
        # Create user
        user = User(
            name=user_data.name,
            email=user_data.email,
            mobile=user_data.mobile,
            password=hashed_password,
            created_at=datetime.utcnow()
        )
        
        result = await db.users.insert_one(user.dict(by_alias=True, exclude={"id"}))
        user_id = str(result.inserted_id)
        
        # Send welcome email
        email_result = await email_service.send_welcome_email(
            to_email=user.email,
            user_name=user.name
        )
        if not email_result["success"]:
            logger.error(f"Failed to send welcome email: {email_result.get('message')}")
            # Don't fail registration if email fails
        
        # Create access token
        access_token = create_access_token(data={"sub": user_id, "email": user.email})
        
        return {
            "success": True,
            "token": access_token,
            "user": {
                "id": user_id,
                "name": user.name,
                "email": user.email,
                "mobile": user.mobile,
                "role": user.role,
                "isAdmin": user.role == "admin"
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Registration error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Registration failed"
        )

@router.post("/login")
async def login(credentials: UserLogin, db: AsyncIOMotorDatabase = Depends(get_db)):
    """Login user."""
    try:
        # Find user
        user = await db.users.find_one({"email": credentials.email})
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )
        
        # Verify password
        if not verify_password(credentials.password, user["password"]):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )
        
        # Update last login
        await db.users.update_one(
            {"_id": user["_id"]},
            {"$set": {"last_login": datetime.utcnow()}}
        )
        
        # Create access token
        user_id = str(user["_id"])
        access_token = create_access_token(data={"sub": user_id, "email": user["email"]})
        
        return {
            "success": True,
            "token": access_token,
            "user": {
                "id": user_id,
                "name": user["name"],
                "email": user["email"],
                "mobile": user["mobile"],
                "role": user.get("role", "member"),
                "isAdmin": user.get("role") == "admin"
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Login failed"
        )

@router.get("/me")
async def get_current_user_info(current_user: dict = Depends(get_current_user), db: AsyncIOMotorDatabase = Depends(get_db)):
    """Get current user information."""
    try:
        from bson import ObjectId
        user = await db.users.find_one({"_id": ObjectId(current_user["user_id"])})
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        return {
            "id": str(user["_id"]),
            "name": user["name"],
            "email": user["email"],
            "mobile": user["mobile"],
            "role": user.get("role", "member"),
            "isAdmin": user.get("role") == "admin"
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get user error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get user information"
        )
