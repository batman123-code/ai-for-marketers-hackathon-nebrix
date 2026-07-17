"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  Panel,
  MarkerType,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import * as d3 from "d3-force";

import CustomNode from "./CustomNode";
import DetailPanel from "./DetailPanel";
import GraphToolbar from "./GraphToolbar";
import { toast } from "sonner";

const nodeTypes = {
  custom: CustomNode,
};

export default function TalentGraphContainer() {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [loading, setLoading] = useState(true);
  
  // Selection / Panel State
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  
  // Filtering & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("All");

  // Fetch Graph Data
  useEffect(() => {
    async function loadGraph() {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:8000/api/v1/graph/", {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        
        if (!res.ok) throw new Error("Failed to fetch graph data");
        
        const data = await res.json();
        
        // Transform backend nodes to ReactFlow nodes
        const rfNodes: Node[] = data.nodes.map((n: any) => ({
          id: n.id,
          type: "custom",
          position: { x: Math.random() * 800, y: Math.random() * 600 },
          data: {
            label: n.name,
            type: n.type,
            description: n.description,
            metadata: n.metadata,
          },
        }));

        // Transform edges
        const rfEdges: Edge[] = data.edges.map((e: any) => ({
          id: e.id,
          source: e.source_id,
          target: e.target_id,
          label: e.relation_type,
          animated: true,
          style: { stroke: "#64748b", strokeWidth: 2 },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: "#64748b",
          },
        }));

        setNodes(rfNodes);
        setEdges(rfEdges);
      } catch (error: any) {
        toast.error("Graph Error", {
          description: error.message,
        });
      } finally {
        setLoading(false);
      }
    }
    loadGraph();
  }, [setNodes, setEdges]);

  // Physics Simulation
  useEffect(() => {
    if (nodes.length === 0) return;

    const simulation = d3.forceSimulation(nodes as any)
      .force("charge", d3.forceManyBody().strength(-800))
      .force("center", d3.forceCenter(400, 300))
      .force("link", d3.forceLink(edges).id((d: any) => d.id).distance(150))
      .force("collide", d3.forceCollide().radius(80))
      .on("tick", () => {
        setNodes((nds) =>
          nds.map((n) => {
            const simNode = nodes.find((dn: any) => dn.id === n.id) as any;
            return {
              ...n,
              position: { x: simNode?.x || 0, y: simNode?.y || 0 },
            };
          })
        );
      });

    // Run for a short time then stop
    const timer = setTimeout(() => simulation.stop(), 2000);

    return () => {
      clearTimeout(timer);
      simulation.stop();
    };
  }, [edges, setNodes]); 

  const onConnect = useCallback(
    (params: Connection | Edge) => setEdges((eds) => addEdge({ ...params, animated: true }, eds)),
    [setEdges]
  );

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  }, []);

  const filteredNodes = useMemo(() => {
    return nodes.map(n => {
      const label = (n.data?.label as string) || "";
      const type = (n.data?.type as string) || "";
      
      const matchSearch = label.toLowerCase().includes(searchQuery.toLowerCase());
      const matchFilter = filterType === "All" || type === filterType;
      const isVisible = matchSearch && matchFilter;
      
      return {
        ...n,
        hidden: !isVisible,
        style: {
          ...(n.style || {}),
          opacity: isVisible ? 1 : 0.2, // Highlight matches
        }
      };
    });
  }, [nodes, searchQuery, filterType]);

  if (loading) {
    return <div className="flex h-full w-full items-center justify-center">Loading Graph...</div>;
  }

  return (
    <div className="h-full w-full relative">
      <ReactFlow
        nodes={filteredNodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        fitView
        className="bg-slate-950"
      >
        <Background color="#334155" gap={20} size={1} />
        <Controls className="bg-slate-800 border-slate-700 fill-slate-200 text-slate-200" />
        <MiniMap 
          nodeColor={(node) => {
            switch (node.data?.type) {
              case 'Brand': return '#3b82f6';
              case 'Campaign': return '#10b981';
              case 'AI Agent': return '#8b5cf6';
              default: return '#64748b';
            }
          }}
          maskColor="rgba(15, 23, 42, 0.7)"
          className="bg-slate-900 border-slate-800"
        />
        
        <Panel position="top-left">
          <GraphToolbar 
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            filterType={filterType}
            setFilterType={setFilterType}
          />
        </Panel>
      </ReactFlow>

      {/* Detail Side Panel */}
      <DetailPanel 
        node={selectedNode} 
        onClose={() => setSelectedNode(null)} 
      />
    </div>
  );
}
