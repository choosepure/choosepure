"""
Seed script to populate the database with initial data
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

# Initial data
test_reports_data = [
    {
        "product_name": "Amul Gold Milk",
        "brand": "Amul",
        "category": "Dairy",
        "purity_score": 9.6,
        "test_date": "2025-01-15",
        "tested_by": "NABL Certified Lab",
        "image": "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500",
        "parameters": [
            {"name": "Fat Content", "result": "4.5%", "status": "pass"},
            {"name": "SNF", "result": "8.7%", "status": "pass"},
            {"name": "Adulterants", "result": "None Detected", "status": "pass"},
            {"name": "Antibiotics", "result": "Not Found", "status": "pass"}
        ],
        "summary": "Excellent purity. No adulterants detected. Meets all FSSAI standards.",
        "created_at": datetime.utcnow()
    },
    {
        "product_name": "Mother Dairy Milk",
        "brand": "Mother Dairy",
        "category": "Dairy",
        "purity_score": 8.8,
        "test_date": "2025-01-15",
        "tested_by": "NABL Certified Lab",
        "image": "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=500",
        "parameters": [
            {"name": "Fat Content", "result": "4.2%", "status": "pass"},
            {"name": "SNF", "result": "8.5%", "status": "pass"},
            {"name": "Adulterants", "result": "None Detected", "status": "pass"},
            {"name": "Antibiotics", "result": "Not Found", "status": "pass"}
        ],
        "summary": "Good purity. Meets FSSAI standards with minor variations.",
        "created_at": datetime.utcnow()
    },
    {
        "product_name": "Dabur Honey",
        "brand": "Dabur",
        "category": "Sweeteners",
        "purity_score": 7.2,
        "test_date": "2025-01-10",
        "tested_by": "FSSAI Approved Lab",
        "image": "https://images.unsplash.com/photo-1587049352846-4a222e784578?w=500",
        "parameters": [
            {"name": "Sugar Composition", "result": "Natural", "status": "pass"},
            {"name": "Moisture Content", "result": "18%", "status": "warning"},
            {"name": "Antibiotics", "result": "Not Found", "status": "pass"},
            {"name": "Additives", "result": "None", "status": "pass"}
        ],
        "summary": "Acceptable purity. Slight moisture concerns but within limits.",
        "created_at": datetime.utcnow()
    }
]

upcoming_tests_data = [
    {
        "product_category": "Cooking Oil",
        "description": "Testing purity of popular cooking oil brands for adulterants and chemical residues",
        "votes": 342,
        "funded": 78,
        "target_funding": 100,
        "estimated_test_date": "2025-02-01",
        "voters": [],
        "contributors": [],
        "status": "voting",
        "created_at": datetime.utcnow()
    },
    {
        "product_category": "Turmeric Powder",
        "description": "Checking for lead chromate, synthetic colors, and starch adulteration",
        "votes": 289,
        "funded": 65,
        "target_funding": 100,
        "estimated_test_date": "2025-02-10",
        "voters": [],
        "contributors": [],
        "status": "voting",
        "created_at": datetime.utcnow()
    },
    {
        "product_category": "Paneer",
        "description": "Testing for starch, detergent, and urea contamination",
        "votes": 256,
        "funded": 52,
        "target_funding": 100,
        "estimated_test_date": "2025-02-15",
        "voters": [],
        "contributors": [],
        "status": "voting",
        "created_at": datetime.utcnow()
    },
    {
        "product_category": "Atta (Wheat Flour)",
        "description": "Analyzing nutritional content and checking for adulteration",
        "votes": 198,
        "funded": 41,
        "target_funding": 100,
        "estimated_test_date": "2025-02-20",
        "voters": [],
        "contributors": [],
        "status": "voting",
        "created_at": datetime.utcnow()
    }
]

blog_posts_data = [
    {
        "title": "The Hidden Dangers of Adulterated Turmeric",
        "excerpt": "Lead chromate in turmeric powder is a serious health hazard. Learn how to identify and avoid it.",
        "content": "<h2>Understanding Turmeric Adulteration</h2><p>Turmeric is one of the most commonly adulterated spices in India...</p>",
        "author": "Dr. Meera Singh",
        "category": "Food Safety",
        "image": "https://images.unsplash.com/photo-1615485736247-d21a3c33e321?w=800",
        "views": 1234,
        "publish_date": "2025-01-20",
        "created_at": datetime.utcnow()
    },
    {
        "title": "Understanding Food Safety Standards: FSSAI, FDA, and EFSA",
        "excerpt": "A comprehensive guide to global food safety standards and what they mean for Indian consumers.",
        "content": "<h2>Global Food Safety Standards</h2><p>Food safety is governed by multiple international bodies...</p>",
        "author": "Team ChoosePure",
        "category": "Education",
        "image": "https://images.unsplash.com/photo-1758685734244-1eb74ec0b983?w=800",
        "views": 2341,
        "publish_date": "2025-01-18",
        "created_at": datetime.utcnow()
    },
    {
        "title": "How We Test: Inside Our Laboratory Process",
        "excerpt": "Transparency is our promise. Here's exactly how we conduct independent food testing.",
        "content": "<h2>Our Testing Protocol</h2><p>Every test we conduct follows strict protocols...</p>",
        "author": "Lab Team",
        "category": "Behind the Scenes",
        "image": "https://images.unsplash.com/photo-1758685848602-09e52ef9c7d3?w=800",
        "views": 3456,
        "publish_date": "2025-01-15",
        "created_at": datetime.utcnow()
    }
]

async def seed_database():
    print("Starting database seeding...")
    
    try:
        # Clear existing data
        print("Clearing existing data...")
        await db.test_reports.delete_many({})
        await db.upcoming_tests.delete_many({})
        await db.blog_posts.delete_many({})
        
        # Insert test reports
        print("Inserting test reports...")
        await db.test_reports.insert_many(test_reports_data)
        print(f"✓ Inserted {len(test_reports_data)} test reports")
        
        # Insert upcoming tests
        print("Inserting upcoming tests...")
        await db.upcoming_tests.insert_many(upcoming_tests_data)
        print(f"✓ Inserted {len(upcoming_tests_data)} upcoming tests")
        
        # Insert blog posts
        print("Inserting blog posts...")
        await db.blog_posts.insert_many(blog_posts_data)
        print(f"✓ Inserted {len(blog_posts_data)} blog posts")
        
        print("\n✓ Database seeding completed successfully!")
        
    except Exception as e:
        print(f"\n✗ Error seeding database: {str(e)}")
    finally:
        client.close()

if __name__ == "__main__":
    asyncio.run(seed_database())
