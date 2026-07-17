from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from datetime import datetime
from uuid import UUID

class GraphNodeBase(BaseModel):
    type: str
    name: str
    description: Optional[str] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)

class GraphNodeCreate(GraphNodeBase):
    pass

class GraphNodeUpdate(BaseModel):
    type: Optional[str] = None
    name: Optional[str] = None
    description: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None

class GraphNodeResponse(GraphNodeBase):
    id: UUID
    owner_id: UUID
    created_at: datetime
    updated_at: datetime

class GraphEdgeBase(BaseModel):
    source_id: UUID
    target_id: UUID
    relation_type: str
    metadata: Dict[str, Any] = Field(default_factory=dict)

class GraphEdgeCreate(GraphEdgeBase):
    pass

class GraphEdgeResponse(GraphEdgeBase):
    id: UUID
    owner_id: UUID
    created_at: datetime

class GraphPayload(BaseModel):
    nodes: List[GraphNodeResponse]
    edges: List[GraphEdgeResponse]
