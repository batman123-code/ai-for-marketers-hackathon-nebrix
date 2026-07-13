"""
MemoryOS AI - Upload Routes

Handles CSV file uploads, validation, parsing, database persistence, and history.
"""

import logging
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status

from backend.services.csv_service import csv_service
from backend.utils.auth_dependencies import CurrentUser
from backend.utils.validators import SuccessResponse, ErrorResponse
from database.db_service import db_service

logger = logging.getLogger("memoryos.upload")

router = APIRouter(prefix="/upload", tags=["Upload"])


@router.get("/health")
async def upload_health():
    """Health check for upload module."""
    return {"success": True, "message": "Upload module is available"}


@router.post(
    "",
    response_model=SuccessResponse,
    summary="Upload and process a marketing CSV file",
)
async def upload_csv(
    file: UploadFile,
    user: CurrentUser
) -> dict:
    """
    Accepts a CSV file, validates extension, parses records via csv_service,
    and inserts rows into customers/campaigns database tables.
    """
    # Verify file extension
    filename = file.filename or "uploaded_file.csv"
    if not filename.lower().endswith(".csv"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file format. Only CSV files are supported."
        )

    # Resolve company ID for authenticated user
    user_id = user.get("id") or user.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid access token"
        )
    
    prov = db_service.provision_user_and_company(user_id, user.get("email", ""))
    company_id = prov["company_id"]

    try:
        content_bytes = await file.read()
        content_str = content_bytes.decode("utf-8", errors="ignore")
        
        result = await csv_service.process_and_save_csv(
            company_id=company_id,
            filename=filename,
            file_path=f"uploads/{filename}",
            content=content_str
        )

        if not result.get("success"):
            raise Exception(result.get("error", "Unknown error processing CSV"))

        return {
            "success": True,
            "message": f"Successfully parsed and saved {result['row_count']} rows of {result['type']} data.",
            "data": result
        }

    except Exception as exc:
        logger.error("Failed to parse uploaded CSV: %s", str(exc))
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Failed to process CSV file: {str(exc)}"
        )


@router.get(
    "/history",
    response_model=SuccessResponse,
    summary="Retrieve CSV upload log history",
)
async def upload_history(user: CurrentUser) -> dict:
    """Fetch the list of historical CSV uploads for the active company."""
    user_id = user.get("id") or user.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid access token"
        )
        
    prov = db_service.provision_user_and_company(user_id, user.get("email", ""))
    company_id = prov["company_id"]

    uploads = db_service.execute_query(
        "SELECT * FROM uploads WHERE company_id = ? ORDER BY created_at DESC",
        (company_id,)
    )

    return {
        "success": True,
        "message": "Upload logs retrieved successfully",
        "data": uploads
    }
