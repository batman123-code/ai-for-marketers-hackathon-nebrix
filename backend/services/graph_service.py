import logging
from typing import List, Optional, Dict, Any
from uuid import UUID

from backend.config import get_settings
from database.supabase import get_supabase
from backend.models.graph import (
    GraphNodeCreate,
    GraphNodeUpdate,
    GraphNodeResponse,
    GraphEdgeCreate,
    GraphEdgeResponse,
    GraphPayload
)
from backend.services.ai_service import ai_service

logger = logging.getLogger(__name__)
settings = get_settings()


class GraphService:
    def __init__(self):
        self.supabase = get_supabase()

    def get_full_graph(self, user_id: str) -> GraphPayload:
        """Fetch all nodes and edges for the given user."""
        try:
            # Nodes
            nodes_res = self.supabase.table("graph_nodes").select("*").eq("owner_id", user_id).execute()
            nodes = [GraphNodeResponse(**node) for node in nodes_res.data]

            # Edges
            edges_res = self.supabase.table("graph_edges").select("*").eq("owner_id", user_id).execute()
            edges = [GraphEdgeResponse(**edge) for edge in edges_res.data]

            return GraphPayload(nodes=nodes, edges=edges)
        except Exception as e:
            logger.error(f"Error fetching full graph for user {user_id}: {e}")
            # If tables don't exist yet, return empty mock data so UI doesn't crash
            return GraphPayload(nodes=[], edges=[])

    def create_node(self, user_id: str, node_in: GraphNodeCreate) -> GraphNodeResponse:
        data = node_in.dict()
        data["owner_id"] = user_id
        res = self.supabase.table("graph_nodes").insert(data).execute()
        return GraphNodeResponse(**res.data[0])

    def update_node(self, user_id: str, node_id: str, node_in: GraphNodeUpdate) -> GraphNodeResponse:
        data = node_in.dict(exclude_unset=True)
        res = self.supabase.table("graph_nodes").update(data).eq("id", node_id).eq("owner_id", user_id).execute()
        return GraphNodeResponse(**res.data[0])

    def delete_node(self, user_id: str, node_id: str) -> bool:
        res = self.supabase.table("graph_nodes").delete().eq("id", node_id).eq("owner_id", user_id).execute()
        return len(res.data) > 0

    def create_edge(self, user_id: str, edge_in: GraphEdgeCreate) -> GraphEdgeResponse:
        data = edge_in.dict()
        data["owner_id"] = user_id
        res = self.supabase.table("graph_edges").insert(data).execute()
        return GraphEdgeResponse(**res.data[0])

    def delete_edge(self, user_id: str, edge_id: str) -> bool:
        res = self.supabase.table("graph_edges").delete().eq("id", edge_id).eq("owner_id", user_id).execute()
        return len(res.data) > 0

    async def generate_insight(self, user_id: str, node_id: str) -> Dict[str, Any]:
        """Use AI to generate insights about a specific node."""
        node_res = self.supabase.table("graph_nodes").select("*").eq("id", node_id).eq("owner_id", user_id).execute()
        if not node_res.data:
            return {"insight": "Node not found."}
        
        node_data = node_res.data[0]
        
        # Optionally, get connections to provide context
        edges_source = self.supabase.table("graph_edges").select("*, target:graph_nodes!target_id(*)").eq("source_id", node_id).execute()
        edges_target = self.supabase.table("graph_edges").select("*, source:graph_nodes!source_id(*)").eq("target_id", node_id).execute()
        
        context = {
            "node": node_data,
            "outgoing_edges": edges_source.data,
            "incoming_edges": edges_target.data
        }
        
        prompt = f"""
        You are an expert AI Marketing Analyst. 
        Analyze the following entity from a marketing ecosystem graph and provide 1-3 actionable insights.
        Keep it concise, professional, and impactful.
        
        Entity Context: {context}
        """
        
        response = await ai_service.generate_completion(prompt, max_tokens=150)
        return {"insight": response.content}

graph_service = GraphService()
