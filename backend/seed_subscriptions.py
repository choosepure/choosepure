"""
Seed script to add subscription tiers to the database
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime
import os
from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Subscription tiers data
subscription_tiers = [
    {
        "name": "Basic",
        "price": 299,
        "duration_days": 30,
        "description": "Perfect for trying out our service",
        "features": [
            "Access to all test reports",
            "View detailed purity scores",
            "Basic test parameters"
        ],
        "is_active": True,
        "created_at": datetime.utcnow()
    },
    {
        "name": "Premium",
        "price": 799,
        "duration_days": 90,
        "description": "Best value for regular users",
        "features": [
            "Everything in Basic",
            "Priority voting for new tests",
            "Downloadable test reports",
            "Email alerts for new reports",
            "Save 33% compared to monthly"
        ],
        "is_active": True,
        "created_at": datetime.utcnow()
    },
    {
        "name": "Annual",
        "price": 2499,
        "duration_days": 365,
        "description": "Maximum savings for committed members",
        "features": [
            "Everything in Premium",
            "Exclusive community badge",
            "Early access to new features",
            "Direct support channel",
            "Save 50% compared to monthly",
            "Influence product testing roadmap"
        ],
        "is_active": True,
        "created_at": datetime.utcnow()
    }
]

async def seed_subscriptions():
    """Seed subscription tiers"""
    print("Seeding subscription tiers...")
    
    # Clear existing tiers
    await db.subscription_tiers.delete_many({})
    
    # Insert new tiers
    result = await db.subscription_tiers.insert_many(subscription_tiers)
    print(f"✓ Created {len(result.inserted_ids)} subscription tiers")
    
    # Display created tiers
    tiers = await db.subscription_tiers.find({}).to_list(10)
    for tier in tiers:
        print(f"  - {tier['name']}: ₹{tier['price']} for {tier['duration_days']} days")

async def main():
    try:
        await seed_subscriptions()
        print("\nSubscription seeding completed successfully!")
    except Exception as e:
        print(f"Error during seeding: {str(e)}")
    finally:
        client.close()

if __name__ == "__main__":
    asyncio.run(main())
