"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Filter, Calendar } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Mon', organic: 4000, paid: 2400 },
  { name: 'Tue', organic: 3000, paid: 1398 },
  { name: 'Wed', organic: 2000, paid: 9800 },
  { name: 'Thu', organic: 2780, paid: 3908 },
  { name: 'Fri', organic: 1890, paid: 4800 },
  { name: 'Sat', organic: 2390, paid: 3800 },
  { name: 'Sun', organic: 3490, paid: 4300 },
];

export default function AnalyticsPage() {
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
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#d2d2c8" vertical={false} />
                  <XAxis dataKey="name" stroke="#6e6e64" tickLine={false} axisLine={false} />
                  <YAxis stroke="#6e6e64" tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #d2d2c8', borderRadius: '16px' }} cursor={{ fill: 'rgba(190,255,80,0.08)' }} />
                  <Bar dataKey="organic" stackId="a" fill="#beff50" radius={[0, 0, 8, 8]} />
                  <Bar dataKey="paid" stackId="a" fill="#14140f" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
