import React from 'react';
import { Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';

interface GraphToolbarProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  filterType: string;
  setFilterType: (val: string) => void;
}

const nodeTypes = ["All", "Brand", "Campaign", "AI Agent", "Content", "Audience", "Channel", "Report", "Dataset"];

export default function GraphToolbar({ 
  searchQuery, setSearchQuery, 
  filterType, setFilterType 
}: GraphToolbarProps) {
  return (
    <div className="flex items-center gap-3 bg-slate-900/90 backdrop-blur-md p-3 rounded-xl border border-slate-700 shadow-xl m-4 pointer-events-auto">
      
      {/* Search Input */}
      <div className="relative flex items-center">
        <Search className="absolute left-3 text-slate-400" size={16} />
        <Input 
          placeholder="Search nodes..." 
          className="pl-9 h-10 w-64 bg-slate-950/50 border-slate-700 text-slate-200 placeholder:text-slate-500 focus-visible:ring-primary"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="w-px h-6 bg-slate-700" />

      {/* Filter Dropdown */}
      <div className="flex items-center gap-2">
        <Filter className="text-slate-400 ml-1" size={16} />
        <Select value={filterType} onValueChange={(v) => setFilterType(v || "All")}>
          <SelectTrigger className="w-40 h-10 bg-slate-950/50 border-slate-700 text-slate-200 focus:ring-primary">
            <SelectValue placeholder="Filter type" />
          </SelectTrigger>
          <SelectContent className="bg-slate-900 border-slate-700 text-slate-200">
            {nodeTypes.map(type => (
              <SelectItem key={type} value={type} className="hover:bg-slate-800 focus:bg-slate-800 focus:text-slate-100">
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

    </div>
  );
}
