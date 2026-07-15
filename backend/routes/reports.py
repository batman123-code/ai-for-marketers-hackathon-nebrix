"""
MemoryOS AI - Reports Routes

Generates and retrieves executive, marketing, campaign, and customer reports.
"""

import logging
import json
from fastapi import APIRouter, Depends, HTTPException, status
from backend.services.report_service import report_service
from backend.utils.auth_dependencies import CurrentUser
from backend.utils.validators import SuccessResponse, ReportGenerateRequest
from database.db_service import db_service

logger = logging.getLogger("memoryos.reports")

router = APIRouter(prefix="/reports", tags=["Reports"])


@router.get("/health")
async def reports_health():
    """Health check for reports module."""
    return {"success": True, "message": "Reports module is available"}


@router.get(
    "",
    response_model=SuccessResponse,
    summary="List all reports",
)
async def get_reports(user: CurrentUser) -> dict:
    """Retrieve all reports generated for the active user's company."""
    user_id = user.get("id") or user.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid access token"
        )
        
    prov = db_service.provision_user_and_company(user_id, user.get("email", ""))
    company_id = prov["company_id"]

    reports = db_service.execute_query(
        "SELECT * FROM reports WHERE company_id = ? ORDER BY created_at DESC",
        (company_id,)
    )

    # Decode JSON content column
    for r in reports:
        if isinstance(r.get("content"), str):
            try:
                r["content"] = json.loads(r["content"])
            except:
                r["content"] = {"markdown": r["content"]}

    return {
        "success": True,
        "message": "Reports list retrieved successfully",
        "data": reports
    }


@router.post(
    "/generate",
    response_model=SuccessResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Trigger generating an AI marketing report",
)
async def generate_report(
    body: ReportGenerateRequest,
    user: CurrentUser
) -> dict:
    """Analyze campaign metrics and compile a strategic marketing report using Gemini."""
    user_id = user.get("id") or user.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid access token"
        )
        
    prov = db_service.provision_user_and_company(user_id, user.get("email", ""))
    company_id = prov["company_id"]

    try:
        report = await report_service.generate_report(
            report_type=body.report_type,
            company_id=company_id,
            title=body.title
        )
        return {
            "success": True,
            "message": "Report generated successfully",
            "data": report
        }
    except Exception as exc:
        logger.error("Failed to generate report: %s", str(exc))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Report generation failed: {str(exc)}"
        )
