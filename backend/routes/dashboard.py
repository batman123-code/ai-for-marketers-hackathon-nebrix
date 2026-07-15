"""
MemoryOS AI - Dashboard Routes

Provides aggregated data endpoints for the dashboard UI.
"""

import logging
from fastapi import APIRouter, Depends, HTTPException, status
from backend.services.analytics_service import analytics_service
from backend.utils.auth_dependencies import CurrentUser
from backend.utils.validators import SuccessResponse
from database.db_service import db_service

logger = logging.getLogger("memoryos.dashboard")

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/health")
async def dashboard_health():
    """Health check for dashboard module."""
    return {"success": True, "message": "Dashboard module is available"}


@router.get(
    "/metrics",
    response_model=SuccessResponse,
    summary="Get business metrics for dashboard cards",
)
async def get_dashboard_metrics(user: CurrentUser) -> dict:
    """Retrieve summary metrics of revenue, campaigns, customers, and AI creations."""
    user_id = user.get("id") or user.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid access token"
        )

    prov = db_service.provision_user_and_company(user_id, user.get("email", ""))
    company_id = prov["company_id"]

    try:
        revenue = await analytics_service.get_revenue_metrics(company_id)
        customers = await analytics_service.get_customer_metrics(company_id)
        campaigns = await analytics_service.get_campaign_metrics(company_id)

        # Count total reports as AI generations
        rep_res = db_service.execute_query(
            "SELECT COUNT(*) as val FROM reports WHERE company_id = ?",
            (company_id,)
        )
        report_count = rep_res[0]["val"] if rep_res else 0

        return {
            "success": True,
            "message": "Dashboard metrics loaded successfully",
            "data": {
                "total_revenue": revenue["total_revenue"],
                "growth_rate": revenue["growth_rate"],
                "active_campaigns": campaigns["active_campaigns"],
                "campaign_growth": 12.5, # default percentage
                "total_customers": customers["total_customers"],
                "customer_growth": 19.0, # default percentage
                "ai_generations": report_count + 5,  # initial seed
                "status": "Online"
            }
        }
    except Exception as e:
        logger.error("Failed to load dashboard metrics: %s", str(e), exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal error calculating dashboard metrics"
        )


@router.get(
    "/charts",
    response_model=SuccessResponse,
    summary="Get revenue and conversions charts data",
)
async def get_dashboard_charts(user: CurrentUser) -> dict:
    """Retrieve timeline revenue and channel distributions for rendering Recharts."""
    user_id = user.get("id") or user.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid access token"
        )

    prov = db_service.provision_user_and_company(user_id, user.get("email", ""))
    company_id = prov["company_id"]

    try:
        revenue_timeline = await analytics_service.get_revenue_timeline(company_id)
        conversions_by_channel = await analytics_service.get_conversions_by_channel(company_id)

        return {
            "success": True,
            "message": "Dashboard chart data loaded successfully",
            "data": {
                "revenue_timeline": revenue_timeline,
                "conversions_by_channel": conversions_by_channel
            }
        }
    except Exception as e:
        logger.error("Failed to load dashboard charts: %s", str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal error loading charts data"
        )
