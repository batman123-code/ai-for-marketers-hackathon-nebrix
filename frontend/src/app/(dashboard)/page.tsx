"use client";

import { motion } from "framer-motion";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Area, 
  AreaChart, 
  ResponsiveContainer, 
  Tooltip, 
  XAxis, 
  YAxis,
  Bar,
  BarChart,
  CartesianGrid
} from "recharts";
import { ArrowUpRight, TrendingUp, Users, Target, Activity } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

export default function DashboardPage() {
  // 1. Fetch system health
  const { data: healthData } = useQuery({
    queryKey: ["health"],
    queryFn: async () => {
      const res = await apiClient.get("/dashboard/health").catch(() => ({ data: { status: "Mocking" } }));
      return res.data;
    }
  });

  // 2. Fetch live metrics
  const { data: metricsResponse, isLoading: isMetricsLoading } = useQuery({
    queryKey: ["dashboard-metrics"],
    queryFn: async () => {
      const res = await apiClient.get("/dashboard/metrics");
      return res.data;
    }
  });

  // 3. Fetch chart data
  const { data: chartsResponse, isLoading: isChartsLoading } = useQuery({
    queryKey: ["dashboard-charts"],
    queryFn: async () => {
      const res = await apiClient.get("/dashboard/charts");
      return res.data;
    }
  });

  const metrics = metricsResponse?.data || {};
  const charts = chartsResponse?.data || {};

  const revenueData = charts.revenue_timeline || [
    { name: "Jan", total: 0 },
    { name: "Feb", total: 0 },
    { name: "Mar", total: 0 },
    { name: "Apr", total: 0 },
    { name: "May", total: 0 },
    { name: "Jun", total: 0 },
  ];

  const conversionData = charts.conversions_by_channel || [
    { name: "Email", value: 0 },
    { name: "Social", value: 0 },
    { name: "Direct", value: 0 },
    { name: "Organic", value: 0 },
  ];

  // Helper format currency
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2
    }).format(val || 0);
  };

  return (
    <motion.div
      className="flex-1 space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="flex flex-col gap-4 rounded-[32px] border border-border bg-card p-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-muted-foreground">Executive overview</p>
          <h2 className="mt-2 text-3xl font-medium tracking-[-0.02em] text-foreground">Dashboard</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Monitor campaigns, audience growth, and AI production in one calm command center.
          </p>
        </div>
        <div className="flex items-center space-x-2">
<<<<<<< HEAD
          {isLoading ? (
            <div className="h-8 w-24 animate-pulse rounded-full bg-muted" />
          ) : (
            <span className="inline-flex items-center rounded-full border border-border/80 bg-background px-3 py-1.5 text-xs font-medium text-foreground">
              System: {healthData?.status || "Online"}
            </span>
          )}
        </div>
      </div>

      <motion.div variants={itemVariants} className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { title: "Total Revenue", value: "$45,231.89", note: "+20.1% from last month", icon: TrendingUp, accent: "text-primary" },
          { title: "Active Campaigns", value: "+2350", note: "+180.1% from last month", icon: Target, accent: "text-foreground" },
          { title: "Audience Reached", value: "+12,234", note: "+19% from last month", icon: Users, accent: "text-muted-foreground" },
          { title: "AI Generations", value: "+573", note: "+201 since last hour", icon: Activity, accent: "text-primary" },
        ].map((item, index) => {
          const Icon = item.icon;
          return (
            <Card key={item.title} className="transition-all duration-300 hover:-translate-y-0.5">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{item.title}</CardTitle>
                <div className="rounded-full border border-border/80 bg-background p-2">
                  <Icon className={`h-4 w-4 ${item.accent}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold tracking-[-0.02em] text-foreground">{item.value}</div>
                <p className="mt-2 flex items-center text-xs text-muted-foreground">
                  <ArrowUpRight className="mr-1 h-3.5 w-3.5 text-primary" />
                  {item.note}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </motion.div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <motion.div variants={itemVariants} className="col-span-4">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Revenue Overview</CardTitle>
              <CardDescription>AI-driven revenue prediction across all channels.</CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#beff50" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#beff50" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" stroke="#6e6e64" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#6e6e64" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                    <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #d2d2c8', borderRadius: '16px' }} itemStyle={{ color: '#14140f' }} />
                    <Area type="monotone" dataKey="total" stroke="#beff50" strokeWidth={2.5} fillOpacity={1} fill="url(#colorTotal)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants} className="col-span-3">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Conversions by Channel</CardTitle>
              <CardDescription>Top performing channels this month.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={conversionData} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#d2d2c8" />
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" stroke="#6e6e64" fontSize={12} tickLine={false} axisLine={false} width={80} />
                    <Tooltip cursor={{ fill: 'rgba(190,255,80,0.08)' }} contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #d2d2c8', borderRadius: '16px' }} />
                    <Bar dataKey="value" fill="#beff50" radius={[0, 8, 8, 0]} />
                  </BarChart>
                </ResponsiveContainer>
=======
          <span className="inline-flex items-center rounded-full bg-success/10 px-2.5 py-0.5 text-xs font-medium text-success ring-1 ring-inset ring-success/20">
            System: {metrics.status || healthData?.status || "Online"}
          </span>
        </div>
      </div>

      {isMetricsLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-card/40 border border-border/50 animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : (
        <motion.div variants={itemVariants} className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Card 1: Revenue */}
          <Card className="bg-card/50 backdrop-blur-xl border-border/50 shadow-sm hover:shadow-primary/5 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
              <div className="p-2 bg-primary/10 rounded-full">
                <TrendingUp className="h-4 w-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(metrics.total_revenue)}</div>
              <p className="text-xs text-success flex items-center mt-1">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                +{metrics.growth_rate}% from last month
              </p>
            </CardContent>
          </Card>

          {/* Card 2: Active Campaigns */}
          <Card className="bg-card/50 backdrop-blur-xl border-border/50 shadow-sm hover:shadow-primary/5 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Campaigns</CardTitle>
              <div className="p-2 bg-accent/10 rounded-full">
                <Target className="h-4 w-4 text-accent" />
>>>>>>> bf37c5909541ae5551f45803b9cfd61427c7bb43
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+{metrics.active_campaigns}</div>
              <p className="text-xs text-muted-foreground mt-1">
                +{metrics.campaign_growth}% from last month
              </p>
            </CardContent>
          </Card>

          {/* Card 3: Total Customers */}
          <Card className="bg-card/50 backdrop-blur-xl border-border/50 shadow-sm hover:shadow-primary/5 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Audience Reached</CardTitle>
              <div className="p-2 bg-warning/10 rounded-full">
                <Users className="h-4 w-4 text-warning" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+{metrics.total_customers}</div>
              <p className="text-xs text-success flex items-center mt-1">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                +{metrics.customer_growth}% from last month
              </p>
            </CardContent>
          </Card>

          {/* Card 4: AI Creations */}
          <Card className="bg-card/50 backdrop-blur-xl border-border/50 shadow-sm hover:shadow-primary/5 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">AI Generations</CardTitle>
              <div className="p-2 bg-success/10 rounded-full">
                <Activity className="h-4 w-4 text-success" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+{metrics.ai_generations}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Strategic suggestions calculated
              </p>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {isChartsLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <div className="col-span-4 h-96 bg-card/40 border border-border/50 animate-pulse rounded-2xl" />
          <div className="col-span-3 h-96 bg-card/40 border border-border/50 animate-pulse rounded-2xl" />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          {/* Chart 1: Revenue Timeline */}
          <motion.div variants={itemVariants} className="col-span-4">
            <Card className="bg-card/50 backdrop-blur-xl border-border/50">
              <CardHeader>
                <CardTitle>Revenue Overview</CardTitle>
                <CardDescription>
                  AI-driven revenue prediction across all channels.
                </CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={revenueData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#5B7FFF" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#5B7FFF" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis 
                        dataKey="name" 
                        stroke="#9CA3AF" 
                        fontSize={12} 
                        tickLine={false} 
                        axisLine={false} 
                      />
                      <YAxis 
                        stroke="#9CA3AF" 
                        fontSize={12} 
                        tickLine={false} 
                        axisLine={false} 
                        tickFormatter={(value) => `$${value}`}
                      />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#10141F', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px' }}
                        itemStyle={{ color: '#fff' }}
                      />
                      <Area type="monotone" dataKey="total" stroke="#5B7FFF" strokeWidth={2} fillOpacity={1} fill="url(#colorTotal)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
          {/* Chart 2: Conversions by Platform */}
          <motion.div variants={itemVariants} className="col-span-3">
            <Card className="bg-card/50 backdrop-blur-xl border-border/50 h-full">
              <CardHeader>
                <CardTitle>Conversions by Channel</CardTitle>
                <CardDescription>
                  Top performing channels this month.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={conversionData} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.05)" />
                      <XAxis type="number" hide />
                      <YAxis dataKey="name" type="category" stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} width={80} />
                      <Tooltip 
                        cursor={{ fill: 'rgba(255,255,255,0.05)' }} 
                        contentStyle={{ backgroundColor: '#10141F', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px' }}
                      />
                      <Bar dataKey="value" fill="#7A5FFF" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
