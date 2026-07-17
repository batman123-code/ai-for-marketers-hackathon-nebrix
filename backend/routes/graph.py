from fastapi import APIRouter, Depends, HTTPException, status
from typing import Dict, Any

from backend.utils.auth_dependencies import get_current_user
from backend.models.graph import (
    GraphNodeCreate,
    GraphNodeUpdate,
    GraphNodeResponse,
    GraphEdgeCreate,
    GraphEdgeResponse,
    GraphPayload
)
from backend.services.graph_service import graph_service

router = APIRouter(prefix="/graph", tags=["graph"])

@router.get("/", response_model=GraphPayload)
async def get_graph(current_user: dict = Depends(get_current_user)):
    """Get all nodes and edges for the authenticated user's graph."""
    user_id = current_user.get("id")
    return graph_service.get_full_graph(user_id)

@router.post("/node", response_model=GraphNodeResponse)
async def create_node(node: GraphNodeCreate, current_user: dict = Depends(get_current_user)):
    user_id = current_user.get("id")
    try:
        return graph_service.create_node(user_id, node)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/node/{node_id}", response_model=GraphNodeResponse)
async def update_node(node_id: str, node: GraphNodeUpdate, current_user: dict = Depends(get_current_user)):
    user_id = current_user.get("id")
    try:
        return graph_service.update_node(user_id, node_id, node)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/node/{node_id}")
async def delete_node(node_id: str, current_user: dict = Depends(get_current_user)):
    user_id = current_user.get("id")
    try:
        success = graph_service.delete_node(user_id, node_id)
        if not success:
            raise HTTPException(status_code=404, detail="Node not found")
        return {"success": True}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/edge", response_model=GraphEdgeResponse)
async def create_edge(edge: GraphEdgeCreate, current_user: dict = Depends(get_current_user)):
    user_id = current_user.get("id")
    try:
        return graph_service.create_edge(user_id, edge)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/edge/{edge_id}")
async def delete_edge(edge_id: str, current_user: dict = Depends(get_current_user)):
    user_id = current_user.get("id")
    try:
        success = graph_service.delete_edge(user_id, edge_id)
        if not success:
            raise HTTPException(status_code=404, detail="Edge not found")
        return {"success": True}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/node/{node_id}/insight")
async def get_node_insight(node_id: str, current_user: dict = Depends(get_current_user)):
    user_id = current_user.get("id")
    try:
        return await graph_service.generate_insight(user_id, node_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
