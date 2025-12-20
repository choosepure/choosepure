from fastapi import FastAPI, APIRouter
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path

# Import routes
from routes import auth_routes, waitlist_routes, report_routes, voting_routes
from routes import forum_routes, blog_routes, newsletter_routes, stats_routes, subscription_routes

# Try to import donation_routes (may not exist in older deployments)
try:
    from routes import donation_routes
    HAS_DONATION_ROUTES = True
except ImportError:
    HAS_DONATION_ROUTES = False
    logging.warning("donation_routes not found - donation features will be disabled")

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI(title="ChoosePure API", version="1.0.0")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Health check
@api_router.get("/")
async def root():
    return {"message": "ChoosePure API is running", "version": "1.0.0"}

@api_router.get("/health")
async def health_check():
    return {"status": "healthy", "database": "connected"}

# Include all route modules
api_router.include_router(auth_routes.router)
api_router.include_router(waitlist_routes.router)
api_router.include_router(report_routes.router)
api_router.include_router(voting_routes.router)
api_router.include_router(forum_routes.router)
api_router.include_router(blog_routes.router)
api_router.include_router(newsletter_routes.router)
api_router.include_router(stats_routes.router)
api_router.include_router(subscription_routes.router)

# Include donation routes if available
if HAS_DONATION_ROUTES:
    api_router.include_router(donation_routes.router)

# Include the router in the main app
app.include_router(api_router)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("startup")
async def startup_event():
    logger.info("ChoosePure API starting up...")
    logger.info(f"Connected to database: {db.name}")

@app.on_event("shutdown")
async def shutdown_db_client():
    logger.info("Shutting down...")
    client.close()