import React, { useState, useEffect } from 'react';
import { Node } from '@xyflow/react';
import { X, Sparkles, Activity, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DetailPanelProps {
  node: Node | null;
  onClose: () => void;
}

export default function DetailPanel({ node, onClose }: DetailPanelProps) {
  const [insight, setInsight] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (node) {
      // Fetch AI insight for the node
      setInsight(null);
      setLoading(true);
      const token = localStorage.getItem("token");
      fetch(`http://localhost:8000/api/v1/graph/node/${node.id}/insight`, {
        headers: { "Authorization": `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => {
        setInsight(data.insight);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setInsight("Failed to generate AI insight.");
        setLoading(false);
      });
    }
  }, [node]);

  if (!node) return null;

  return (
    <div className="absolute top-4 right-4 w-96 max-h-[calc(100%-2rem)] bg-slate-900/95 backdrop-blur-xl border border-slate-700 shadow-2xl rounded-2xl overflow-y-auto z-10 flex flex-col transform transition-transform duration-300 ease-in-out">
      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b border-slate-800">
        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">{node.data.type ? String(node.data.type) : "Unknown"}</span>
          <h2 className="text-xl font-bold text-slate-100 mt-1">{node.data.label ? String(node.data.label) : "Unnamed"}</h2>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-slate-800">
          <X size={18} className="text-slate-400" />
        </Button>
      </div>
      
      {/* Body */}
      <div className="p-5 flex flex-col gap-6">
        
        {/* Description */}
        <div>
          <h3 className="text-sm font-medium text-slate-400 mb-2 flex items-center gap-2">
            <FileText size={16} /> Description
          </h3>
          <p className="text-sm text-slate-300 leading-relaxed bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
            {node.data.description ? String(node.data.description) : "No description provided."}
          </p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-purple-400 mb-2 flex items-center gap-2">
            <Sparkles size={16} /> AI Insight
          </h3>
          <div className="text-sm text-purple-200/90 leading-relaxed bg-purple-900/20 p-4 rounded-lg border border-purple-500/20">
            {loading ? (
              <div className="flex items-center gap-2 animate-pulse">
                <div className="w-4 h-4 rounded-full bg-purple-500/40" />
                <span>Generating intelligent analysis...</span>
              </div>
            ) : (
              insight || "AI insights are not available for this node at the moment."
            )}
          </div>
        </div>
        {!!node.data.metadata && Object.keys(node.data.metadata as object).length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-slate-400 mb-2 flex items-center gap-2">
              <Activity size={16} /> Statistics
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(node.data.metadata as Record<string, any>).map(([key, value]) => (
                <div key={key} className="bg-slate-800/50 p-3 rounded-lg border border-slate-700/50 flex flex-col">
                  <span className="text-xs text-slate-400 capitalize mb-1">{key.replace(/_/g, ' ')}</span>
                  <span className="text-sm font-semibold text-slate-200">{String(value)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
