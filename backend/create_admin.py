"""
Create admin user for ChoosePure
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from pathlib import Path
from auth import get_password_hash
from datetime import datetime

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

async def create_admin_user():
    print("Creating admin user...")
    
    try:
        # Check if user already exists
        existing_user = await db.users.find_one({"email": "support@choosepure.in"})
        
        if existing_user:
            print("Admin user already exists!")
            print(f"Email: support@choosepure.in")
            print("You can login with the existing account.")
            return
        
        # Create admin user
        admin_user = {
            "name": "ChoosePure Admin",
            "email": "support@choosepure.in",
            "mobile": "9999999999",
            "password": get_password_hash("123456"),
            "role": "admin",
            "created_at": datetime.utcnow(),
            "last_login": None
        }
        
        result = await db.users.insert_one(admin_user)
        
        print("✓ Admin user created successfully!")
        print(f"  Email: support@choosepure.in")
        print(f"  Password: 123456")
        print(f"  User ID: {result.inserted_id}")
        print("\nYou can now login with these credentials.")
        
    except Exception as e:
        print(f"✗ Error creating admin user: {str(e)}")
    finally:
        client.close()

if __name__ == "__main__":
    asyncio.run(create_admin_user())
