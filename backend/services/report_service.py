"""
MemoryOS AI - Report Service

Generates business intelligence marketing reports and saves them in the database.
"""

import logging
import json
from database.db_service import db_service
from backend.services.analytics_service import analytics_service
from backend.services.ai_service import ai_service
from backend.utils.helpers import generate_uuid

logger = logging.getLogger("memoryos.report")

class ReportService:
    """Generates executive, marketing, campaign, and customer reports."""

    async def generate_report(self, report_type: str, company_id: str, title: str = "") -> dict:
        """Retrieve metrics, trigger AI analysis, and save the report in database."""
        # 1. Fetch current metrics
        revenue_metrics = await analytics_service.get_revenue_metrics(company_id)
        customer_metrics = await analytics_service.get_customer_metrics(company_id)
        campaign_metrics = await analytics_service.get_campaign_metrics(company_id)

        # Merge metrics into one dict for the AI prompt
        metrics = {
            **revenue_metrics,
            **customer_metrics,
            **campaign_metrics
        }

        # 2. Get company name
        comp_res = db_service.execute_query(
            "SELECT name FROM companies WHERE id = ?",
            (company_id,)
        )
        company_name = comp_res[0]["name"] if comp_res else "Our Company"

        # 3. Generate AI report text
        logger.info("Generating report of type '%s' for company: %s", report_type, company_name)
        report_text = await ai_service.generate_marketing_report(
            report_type=report_type,
            company_name=company_name,
            metrics=metrics
        )

        # 4. Save to SQLite database
        report_id = generate_uuid()
        report_title = title or f"{report_type.capitalize()} Analysis Report"
        
        content_dict = {
            "markdown": report_text,
            "metrics_snapshot": {
                "total_revenue": metrics.get("total_revenue", 0.0),
                "total_spend": metrics.get("total_spend", 0.0),
                "total_customers": metrics.get("total_customers", 0),
                "active_campaigns": metrics.get("active_campaigns", 0)
            }
        }

        success = db_service.execute_write(
            """INSERT INTO reports (id, company_id, report_type, title, content) 
               VALUES (?, ?, ?, ?, ?)""",
            (report_id, company_id, report_type, report_title, json.dumps(content_dict))
        )

        if not success:
            logger.error("Failed to insert report record to DB.")
            raise Exception("Database write error saving report")

        return {
            "id": report_id,
            "company_id": company_id,
            "report_type": report_type,
            "title": report_title,
            "content": content_dict,
            "created_at": "Just now"
        }

report_service = ReportService()
