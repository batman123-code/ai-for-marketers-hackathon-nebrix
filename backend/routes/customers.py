"""
MemoryOS AI - Customers Routes

Handles list, search, sort, filter, pagination, and deletion of customer profiles.
"""

import logging
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, Query, status

from backend.utils.auth_dependencies import CurrentUser
from backend.utils.validators import SuccessResponse
from database.db_service import db_service

logger = logging.getLogger("memoryos.customers")

router = APIRouter(prefix="/customers", tags=["Customers"])


@router.get(
    "",
    response_model=SuccessResponse,
    summary="Get customer list with filters, sorting, and pagination",
)
async def get_customers(
    user: CurrentUser,
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=10, ge=1, le=100),
    search: str = Query(default=""),
    segment: str = Query(default=""),
    sortBy: str = Query(default="name"),
    sortOrder: str = Query(default="asc"),
) -> dict:
    """Retrieve customers matching filters for the active user's company."""
    user_id = user.get("id") or user.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid access token"
        )
        
    prov = db_service.provision_user_and_company(user_id, user.get("email", ""))
    company_id = prov["company_id"]

    # Validate sorting fields
    allowed_sort_fields = {"name", "email", "phone", "segment", "lifetime_value", "created_at"}
    if sortBy not in allowed_sort_fields:
        sortBy = "name"
    
    sort_order_str = "DESC" if sortOrder.lower() == "desc" else "ASC"

    # Construct sql query
    base_query = "FROM customers WHERE company_id = ?"
    params = [company_id]

    if search:
        base_query += " AND (name LIKE ? OR email LIKE ?)"
        search_term = f"%{search}%"
        params.extend([search_term, search_term])

    if segment:
        base_query += " AND segment = ?"
        params.append(segment)

    # 1. Fetch total count
    count_query = f"SELECT COUNT(*) as total {base_query}"
    count_res = db_service.execute_query(count_query, tuple(params))
    total_count = count_res[0]["total"] if count_res else 0

    # 2. Fetch list with pagination and sorting
    offset = (page - 1) * limit
    list_query = f"SELECT * {base_query} ORDER BY {sortBy} {sort_order_str} LIMIT ? OFFSET ?"
    params.extend([limit, offset])
    
    customers_list = db_service.execute_query(list_query, tuple(params))

    return {
        "success": True,
        "message": "Customers retrieved successfully",
        "data": {
            "list": customers_list,
            "total": total_count,
            "page": page,
            "limit": limit
        }
    }


@router.delete(
    "/{customer_id}",
    response_model=SuccessResponse,
    summary="Delete a customer record",
)
async def delete_customer(
    customer_id: str,
    user: CurrentUser
) -> dict:
    """Delete a customer record belonging to the user's company."""
    user_id = user.get("id") or user.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid access token"
        )
        
    prov = db_service.provision_user_and_company(user_id, user.get("email", ""))
    company_id = prov["company_id"]

    # Verify ownership
    check = db_service.execute_query(
        "SELECT id FROM customers WHERE id = ? AND company_id = ?",
        (customer_id, company_id)
    )
    if not check:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Customer not found or access denied"
        )

    success = db_service.execute_write(
        "DELETE FROM customers WHERE id = ?",
        (customer_id,)
    )

    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete customer record"
        )

    return {
        "success": True,
        "message": "Customer record deleted successfully"
    }
