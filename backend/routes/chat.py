"""
MemoryOS AI - Chat Routes

AI-powered chat assistant route that injects live database context (customer LTV, campaigns)
into the AI generation flow to provide highly contextual marketing suggestions.
"""

import logging
from fastapi import APIRouter, Depends, HTTPException, status
from backend.services.ai_service import ai_service
from backend.utils.auth_dependencies import CurrentUser
from backend.utils.validators import ChatMessageRequest
from database.db_service import db_service

logger = logging.getLogger("memoryos.chat")

router = APIRouter(prefix="/chat", tags=["Chat"])


@router.get("/health")
async def chat_health():
    """Health check for chat module."""
    return {"success": True, "message": "Chat module is available"}


@router.post(
    "/message",
    summary="Send a message to the AI marketing assistant",
)
async def chat_message(
    body: ChatMessageRequest,
    user: CurrentUser
) -> dict:
    """Chat with the AI assistant, pulling real database context from SQLite."""
    user_id = user.get("id") or user.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid access token"
        )

    prov = db_service.provision_user_and_company(user_id, user.get("email", ""))
    company_id = prov["company_id"]

    try:
        # 1. Fetch campaigns context
        campaigns = db_service.execute_query(
            "SELECT name, platform, spend, conversions FROM campaigns WHERE company_id = ? LIMIT 5",
            (company_id,)
        )

        # 2. Fetch customers context
        cust_res = db_service.execute_query(
            "SELECT COUNT(*) as count, SUM(lifetime_value) as ltv FROM customers WHERE company_id = ?",
            (company_id,)
        )
        total_customers = cust_res[0]["count"] if cust_res else 0
        total_ltv = cust_res[0]["ltv"] if cust_res and cust_res[0]["ltv"] is not None else 0.0

        # 3. Create context prompt
        context_details = f"You are a Chief Marketing Officer AI assistant. The user's active company has {total_customers} customers with a total LTV of ${total_ltv:.2f}."
        if campaigns:
            camp_details = ", ".join([f"{c['name']} on {c['platform']} (${c['spend']} spent, {c['conversions']} conversions)" for c in campaigns])
            context_details += f" The current marketing campaigns include: {camp_details}."
        else:
            context_details += " There are no active campaigns yet."

        full_prompt = f"{context_details}\nUser: {body.message}\nAssistant:"

        # 4. Generate AI response
        reply = await ai_service.generate_response(full_prompt)

        return {
            "success": True,
            "reply": reply
        }

    except Exception as exc:
        logger.error("Failed to generate chat response: %s", str(exc), exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Chat assistant failed: {str(exc)}"
        )
