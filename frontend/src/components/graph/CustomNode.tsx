import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { 
  Building2, 
  Target, 
  Bot, 
  FileText, 
  Megaphone, 
  Users, 
  LineChart, 
  Database 
} from 'lucide-react';

const iconMap: Record<string, React.ReactNode> = {
  "Brand": <Building2 size={18} className="text-blue-400" />,
  "Campaign": <Target size={18} className="text-emerald-400" />,
  "AI Agent": <Bot size={18} className="text-purple-400" />,
  "Content": <FileText size={18} className="text-amber-400" />,
  "Audience": <Users size={18} className="text-pink-400" />,
  "Channel": <Megaphone size={18} className="text-orange-400" />,
  "Report": <LineChart size={18} className="text-cyan-400" />,
  "Dataset": <Database size={18} className="text-slate-400" />
};

const CustomNode = ({ data, selected }: NodeProps) => {
  const typeIcon = iconMap[data.type as string] || <Building2 size={18} className="text-slate-400" />;

  return (
    <div 
      className={`px-4 py-3 shadow-lg rounded-xl border backdrop-blur-md transition-all duration-200 min-w-[150px]
        ${selected ? 'ring-2 ring-primary border-primary bg-slate-900/90' : 'border-slate-800 bg-slate-900/60 hover:bg-slate-900/80 hover:border-slate-700'}`}
    >
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-slate-600 border-2 border-slate-900" />
      
      <div className="flex items-center gap-3">
        <div className="p-2 bg-slate-800/50 rounded-lg">
          {typeIcon}
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">{data.type as string}</span>
          <span className="text-sm font-semibold text-slate-100">{data.label as string}</span>
        </div>
      </div>
      
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-slate-600 border-2 border-slate-900" />
    </div>
  );
};

export default memo(CustomNode);
