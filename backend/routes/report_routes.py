from fastapi import APIRouter, HTTPException, status, Depends, Query
from motor.motor_asyncio import AsyncIOMotorDatabase
from models import TestReportCreate, TestReport
from bson import ObjectId
from typing import Optional
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/reports", tags=["Test Reports"])

async def get_db():
    from server import db
    return db

@router.get("")
async def get_reports(
    category: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    user_id: Optional[str] = Query(None),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Get all test reports with optional filtering."""
    try:
        query = {}
        
        # Add category filter
        if category and category != "All":
            query["category"] = category
        
        # Add search filter
        if search:
            query["$or"] = [
                {"product_name": {"$regex": search, "$options": "i"}},
                {"brand": {"$regex": search, "$options": "i"}}
            ]
        
        reports = await db.test_reports.find(query).sort("created_at", -1).to_list(100)
        
        # Check if user has active subscription
        is_subscribed = False
        if user_id:
            from datetime import datetime
            subscription = await db.user_subscriptions.find_one({
                "user_id": user_id,
                "status": "active",
                "end_date": {"$gt": datetime.utcnow()}
            })
            is_subscribed = subscription is not None
        
        # Convert ObjectId to string
        for report in reports:
            report["id"] = str(report["_id"])
            del report["_id"]
            # Convert snake_case to camelCase for frontend
            report["productName"] = report.pop("product_name")
            
            # Hide purity score if not subscribed
            if is_subscribed:
                report["purityScore"] = report.pop("purity_score")
            else:
                report.pop("purity_score")
                report["purityScore"] = None
                report["requiresSubscription"] = True
            
            report["testDate"] = report.pop("test_date")
            report["testedBy"] = report.pop("tested_by")
            if "created_at" in report:
                del report["created_at"]
        
        return {"reports": reports, "is_subscribed": is_subscribed}
    except Exception as e:
        logger.error(f"Get reports error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get reports"
        )

@router.get("/{report_id}")
async def get_report(report_id: str, db: AsyncIOMotorDatabase = Depends(get_db)):
    """Get a single test report by ID."""
    try:
        if not ObjectId.is_valid(report_id):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid report ID"
            )
        
        report = await db.test_reports.find_one({"_id": ObjectId(report_id)})
        
        if not report:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Report not found"
            )
        
        # Convert ObjectId to string and format keys
        report["id"] = str(report["_id"])
        del report["_id"]
        report["productName"] = report.pop("product_name")
        report["purityScore"] = report.pop("purity_score")
        report["testDate"] = report.pop("test_date")
        report["testedBy"] = report.pop("tested_by")
        if "created_at" in report:
            del report["created_at"]
        
        return report
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get report error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get report"
        )

@router.post("")
async def create_report(report_data: TestReportCreate, db: AsyncIOMotorDatabase = Depends(get_db)):
    """Create a new test report (admin only)."""
    try:
        report = TestReport(**report_data.dict())
        result = await db.test_reports.insert_one(report.dict(by_alias=True, exclude={"id"}))
        
        return {
            "success": True,
            "message": "Report created successfully",
            "reportId": str(result.inserted_id)
        }
    except Exception as e:
        logger.error(f"Create report error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create report"
        )

@router.put("/{report_id}")
async def update_report(report_id: str, report_data: TestReportCreate, db: AsyncIOMotorDatabase = Depends(get_db)):
    """Update a test report (admin only)."""
    try:
        if not ObjectId.is_valid(report_id):
            raise HTTPException(status_code=400, detail="Invalid report ID")
        
        result = await db.test_reports.update_one(
            {"_id": ObjectId(report_id)},
            {"$set": report_data.dict()}
        )
        
        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="Report not found")
        
        return {"success": True, "message": "Report updated successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Update report error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to update report")

@router.delete("/{report_id}")
async def delete_report(report_id: str, db: AsyncIOMotorDatabase = Depends(get_db)):
    """Delete a test report (admin only)."""
    try:
        if not ObjectId.is_valid(report_id):
            raise HTTPException(status_code=400, detail="Invalid report ID")
        
        result = await db.test_reports.delete_one({"_id": ObjectId(report_id)})
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Report not found")
        
        return {"success": True, "message": "Report deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Delete report error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to delete report")
