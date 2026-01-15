from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
from datetime import datetime
from bson import ObjectId

# Custom ObjectId type for Pydantic v2
class PyObjectId(ObjectId):
    @classmethod
    def __get_pydantic_core_schema__(cls, source_type, handler):
        from pydantic_core import core_schema
        return core_schema.union_schema([
            core_schema.is_instance_schema(ObjectId),
            core_schema.chain_schema([
                core_schema.str_schema(),
                core_schema.no_info_plain_validator_function(cls.validate),
            ])
        ], serialization=core_schema.plain_serializer_function_ser_schema(str))

    @classmethod
    def validate(cls, v):
        if isinstance(v, ObjectId):
            return v
        if isinstance(v, str) and ObjectId.is_valid(v):
            return ObjectId(v)
        raise ValueError("Invalid ObjectId")

# User Models
class User(BaseModel):
    id: Optional[PyObjectId] = Field(default_factory=PyObjectId, alias="_id")
    name: str
    email: EmailStr
    mobile: str
    password: str
    role: str = "member"
    created_at: datetime = Field(default_factory=datetime.utcnow)
    last_login: Optional[datetime] = None

    class Config:
        json_encoders = {ObjectId: str}
        populate_by_name = True

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    mobile: str
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    mobile: str
    role: str

# Waitlist Model
class Waitlist(BaseModel):
    id: Optional[PyObjectId] = Field(default_factory=PyObjectId, alias="_id")
    first_name: str
    mobile: str
    email: EmailStr
    pincode: Optional[str] = None
    joined_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        json_encoders = {ObjectId: str}
        populate_by_name = True

class WaitlistCreate(BaseModel):
    firstName: str
    mobile: str
    email: EmailStr
    pincode: Optional[str] = None

# Test Report Models
class TestParameter(BaseModel):
    name: str
    result: str
    status: str  # pass, warning, fail

class TestReport(BaseModel):
    id: Optional[PyObjectId] = Field(default_factory=PyObjectId, alias="_id")
    product_name: str
    brand: str
    category: str
    purity_score: float
    test_date: str
    tested_by: str
    image: str
    parameters: List[TestParameter]
    summary: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        json_encoders = {ObjectId: str}
        populate_by_name = True

class TestReportCreate(BaseModel):
    product_name: str
    brand: str
    category: str
    purity_score: float
    test_date: str
    tested_by: str
    image: str
    parameters: List[TestParameter]
    summary: str

# Voting Models
class Contributor(BaseModel):
    user_id: str
    amount: float
    date: datetime

class UpcomingTest(BaseModel):
    id: Optional[PyObjectId] = Field(default_factory=PyObjectId, alias="_id")
    product_category: str
    description: str
    votes: int = 0
    funded: int = 0
    target_funding: int = 100
    estimated_test_date: str
    voters: List[str] = []  # user IDs
    contributors: List[Contributor] = []
    status: str = "voting"  # voting, funded, testing, completed
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        json_encoders = {ObjectId: str}
        populate_by_name = True

class UpcomingTestCreate(BaseModel):
    product_category: str
    description: str
    estimated_test_date: str
    target_funding: int = 100

class VoteCreate(BaseModel):
    test_id: str
    user_id: str

# Blog Models
class BlogPost(BaseModel):
    id: Optional[PyObjectId] = Field(default_factory=PyObjectId, alias="_id")
    title: str
    excerpt: str
    content: str
    author: str
    category: str
    image: str
    views: int = 0
    publish_date: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        json_encoders = {ObjectId: str}
        populate_by_name = True

class BlogPostCreate(BaseModel):
    title: str
    excerpt: str
    content: str
    author: str
    category: str
    image: str
    publish_date: str

# Newsletter Model
class Newsletter(BaseModel):
    id: Optional[PyObjectId] = Field(default_factory=PyObjectId, alias="_id")
    email: EmailStr
    subscribed_at: datetime = Field(default_factory=datetime.utcnow)
    active: bool = True

    class Config:
        json_encoders = {ObjectId: str}
        populate_by_name = True

class NewsletterSubscribe(BaseModel):
    email: EmailStr

# Community Stats Model
class CommunityStats(BaseModel):
    total_members: int
    tests_completed: int
    products_analyzed: int
    funds_pooled: float
    upcoming_tests: int
    active_posts: int

# Subscription Tier Models
class SubscriptionTier(BaseModel):
    id: Optional[PyObjectId] = Field(default_factory=PyObjectId, alias="_id")
    name: str
    description: str
    price: float
    duration_days: int
    features: List[str]
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        json_encoders = {ObjectId: str}
        populate_by_name = True

class SubscriptionTierCreate(BaseModel):
    name: str
    description: str
    price: float
    duration_days: int
    features: List[str]

# User Subscription Models
class UserSubscription(BaseModel):
    id: Optional[PyObjectId] = Field(default_factory=PyObjectId, alias="_id")
    user_id: str
    tier_id: str
    razorpay_order_id: Optional[str] = None
    razorpay_payment_id: Optional[str] = None
    razorpay_subscription_id: Optional[str] = None
    status: str  # pending, active, expired, cancelled
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    amount_paid: float
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        json_encoders = {ObjectId: str}
        populate_by_name = True

class PaymentVerification(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str
    tier_id: str
    user_id: str
