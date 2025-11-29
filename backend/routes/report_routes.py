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
        
        # Convert ObjectId to string
        for report in reports:
            report["id"] = str(report["_id"])
            del report["_id"]
            # Convert snake_case to camelCase for frontend
            report["productName"] = report.pop("product_name")
            report["purityScore"] = report.pop("purity_score")
            report["testDate"] = report.pop("test_date")
            report["testedBy"] = report.pop("tested_by")
            if "created_at" in report:
                del report["created_at"]
        
        return {"reports": reports}
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
