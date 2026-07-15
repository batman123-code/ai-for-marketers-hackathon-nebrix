"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Filter, Calendar } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

export default function AnalyticsPage() {
  const { data: response, isLoading } = useQuery({
    queryKey: ["analytics-overview"],
    queryFn: async () => {
      const res = await apiClient.get("/analytics/overview");
      return res.data;
    }
  });

  const analyticsData = response?.data || {};
  const data = analyticsData.traffic_breakdown || [
    { name: 'Mon', organic: 0, paid: 0 },
    { name: 'Tue', organic: 0, paid: 0 },
    { name: 'Wed', organic: 0, paid: 0 },
    { name: 'Thu', organic: 0, paid: 0 },
    { name: 'Fri', organic: 0, paid: 0 },
    { name: 'Sat', organic: 0, paid: 0 },
    { name: 'Sun', organic: 0, paid: 0 },
  ];

  return (
    <div className="flex-1 space-y-6">
      <div className="flex flex-col gap-4 rounded-[32px] border border-border bg-card p-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-muted-foreground">Performance insights</p>
          <h2 className="mt-2 text-3xl font-medium tracking-[-0.02em] text-foreground">Analytics</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">Deep dive into your marketing performance across all channels.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" className="rounded-full">
            <Calendar className="mr-2 h-4 w-4" />
            Last 7 Days
          </Button>
          <Button variant="outline" className="rounded-full">
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
          <Button className="rounded-full">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-full">
          <CardHeader>
            <CardTitle>Traffic Sources</CardTitle>
            <CardDescription>Compare organic vs paid traffic over time.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-[400px] flex items-center justify-center">
                <div className="h-8 w-8 border-4 border-primary border-t-transparent animate-spin rounded-full" />
              </div>
            ) : (
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="name" stroke="#9CA3AF" tickLine={false} axisLine={false} />
                    <YAxis stroke="#9CA3AF" tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#10141F', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px' }}
                      cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                    />
                    <Bar dataKey="organic" stackId="a" fill="#5B7FFF" radius={[0, 0, 4, 4]} />
                    <Bar dataKey="paid" stackId="a" fill="#7A5FFF" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
