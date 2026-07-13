"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { 
  Search, ChevronLeft, ChevronRight, ArrowUpDown, 
  Trash2, Filter, Download, User, Loader2 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  segment: string;
  lifetime_value: number;
  created_at: string;
}

export default function CustomersPage() {
  const queryClient = useQueryClient();
  
  // State for query params
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [segment, setSegment] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Debounced search can be added or standard on change/submit. We will query on state change.
  const limit = 10;

  // 1. Fetch Customers Query
  const { data: response, isLoading, isError } = useQuery({
    queryKey: ["customers", page, search, segment, sortBy, sortOrder],
    queryFn: async () => {
      const res = await apiClient.get("/customers", {
        params: {
          page,
          limit,
          search,
          segment,
          sortBy,
          sortOrder
        }
      });
      return res.data;
    }
  });

  const customerData = response?.data || { list: [], total: 0 };
  const customersList: Customer[] = customerData.list || [];
  const totalCount = customerData.total || 0;
  const totalPages = Math.ceil(totalCount / limit) || 1;

  // 2. Delete Customer Mutation
  const deleteMutation = useMutation({
    mutationFn: async (customerId: string) => {
      const res = await apiClient.delete(`/customers/${customerId}`);
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(data.message || "Customer record deleted.");
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-metrics"] });
    },
    onError: () => {
      toast.error("Failed to delete customer record.");
    }
  });

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(prev => prev === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
    setPage(1);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete customer ${name}?`)) {
      deleteMutation.mutate(id);
    }
  };

  // Unique list of segments for filter (based on known values or fetchable)
  const segments = ["default", "VIP", "Churn Risk", "New Customer", "Enterprise"];

  return (
    <div className="flex-1 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Customer Management</h2>
          <p className="text-muted-foreground mt-1">Audit, edit, and organize customer contact segments.</p>
        </div>
      </div>

      {/* Filters and Search toolbar */}
      <Card className="bg-card/45 border-border/50 backdrop-blur-sm shadow-sm">
        <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:max-w-xs">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search by name or email..." 
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="pl-9 bg-muted/20 border-border/60"
            />
          </div>
          
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div className="flex items-center gap-2 bg-muted/20 px-3 py-1.5 rounded-lg border border-border/40">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <select 
                value={segment} 
                onChange={(e) => { setSegment(e.target.value); setPage(1); }}
                className="bg-transparent text-sm border-none focus:outline-none text-foreground font-medium"
              >
                <option value="" className="bg-card">All Segments</option>
                {segments.map(seg => (
                  <option key={seg} value={seg} className="bg-card">{seg}</option>
                ))}
              </select>
            </div>
            
            <Button variant="outline" className="h-9 bg-muted/10" onClick={() => {
              setSearch("");
              setSegment("");
              setSortBy("name");
              setSortOrder("asc");
              setPage(1);
            }}>
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Table Card */}
      <Card className="border-border/50 bg-card/30 backdrop-blur-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto min-w-full">
          <table className="min-w-full divide-y divide-border/40 text-sm">
            <thead className="bg-muted/10 text-muted-foreground">
              <tr>
                <th scope="col" className="px-6 py-4 text-left font-semibold">
                  <button onClick={() => handleSort("name")} className="flex items-center gap-1 hover:text-foreground">
                    Name <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th scope="col" className="px-6 py-4 text-left font-semibold">
                  <button onClick={() => handleSort("email")} className="flex items-center gap-1 hover:text-foreground">
                    Email <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th scope="col" className="px-6 py-4 text-left font-semibold">Phone</th>
                <th scope="col" className="px-6 py-4 text-left font-semibold">
                  <button onClick={() => handleSort("segment")} className="flex items-center gap-1 hover:text-foreground">
                    Segment <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th scope="col" className="px-6 py-4 text-left font-semibold">
                  <button onClick={() => handleSort("lifetime_value")} className="flex items-center gap-1 hover:text-foreground">
                    LTV / Value <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th scope="col" className="px-6 py-4 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            
            <tbody className="divide-y divide-border/20">
              {isLoading ? (
                [...Array(5)].map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    {[...Array(6)].map((_, i) => (
                      <td key={i} className="px-6 py-4"><div className="h-4 bg-muted/40 rounded w-2/3" /></td>
                    ))}
                  </tr>
                ))
              ) : isError ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-destructive font-medium">
                    Failed to fetch customers list. Ensure the backend is active.
                  </td>
                </tr>
              ) : customersList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-muted-foreground">
                    No customers found. Try uploading a CSV dataset containing contact rows in the Upload Center.
                  </td>
                </tr>
              ) : (
                customersList.map((customer) => (
                  <tr key={customer.id} className="hover:bg-muted/10 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-foreground">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-primary/10 text-primary rounded-full">
                          <User className="h-3.5 w-3.5" />
                        </div>
                        {customer.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">{customer.email || "-"}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">{customer.phone || "-"}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        customer.segment === 'VIP' ? 'bg-primary/20 text-primary' :
                        customer.segment === 'Churn Risk' ? 'bg-destructive/20 text-destructive' :
                        customer.segment === 'Enterprise' ? 'bg-accent/20 text-accent' :
                        'bg-muted text-muted-foreground'
                      }`}>
                        {customer.segment}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-semibold text-foreground">
                      ${customer.lifetime_value?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0.00"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-muted-foreground hover:text-destructive h-8 w-8"
                        onClick={() => handleDelete(customer.id, customer.name)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination bar */}
        {totalCount > 0 && (
          <div className="p-4 border-t border-border/40 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              Showing {(page - 1) * limit + 1} to {Math.min(page * limit, totalCount)} of {totalCount} records
            </span>
            
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                disabled={page === 1 || isLoading}
                className="h-8 bg-muted/5 border-border/50"
              >
                <ChevronLeft className="h-4 w-4" /> Previous
              </Button>
              <span className="text-xs text-muted-foreground px-2 font-medium">
                Page {page} of {totalPages}
              </span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                disabled={page === totalPages || isLoading}
                className="h-8 bg-muted/5 border-border/50"
              >
                Next <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
