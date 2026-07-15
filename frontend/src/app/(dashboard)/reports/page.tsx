"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, Plus, File, Loader2, BookOpen } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { useState } from "react";
import { toast } from "sonner";

interface Report {
  id: string;
  report_type: string;
  title: string;
  content: {
    markdown?: string;
    metrics_snapshot?: any;
  };
  created_at: string;
}

export default function ReportsPage() {
  const queryClient = useQueryClient();
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  // 1. Query Reports List
  const { data: response, isLoading } = useQuery({
    queryKey: ["reports"],
    queryFn: async () => {
      const res = await apiClient.get("/reports");
      return res.data;
    }
  });
  const reports: Report[] = response?.data || [];

  // 2. Generate Report Mutation
  const generateMutation = useMutation({
    mutationFn: async () => {
      const res = await apiClient.post("/reports/generate", {
        report_type: "executive",
        title: `Strategic Executive Report - ${new Date().toLocaleDateString()}`
      });
      return res.data;
    },
    onSuccess: (data) => {
      toast.success("AI Strategic Report generated successfully.");
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-metrics"] });
      // Pre-select new report to view
      if (data.data) {
        setSelectedReport(data.data);
      }
    },
    onError: () => {
      toast.error("Failed to generate AI report. Upload CSV data first.");
    }
  });

  return (
    <div className="flex-1 space-y-6">
      <div className="flex flex-col gap-4 rounded-[32px] border border-border bg-card p-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-muted-foreground">Deliverables</p>
          <h2 className="mt-2 text-3xl font-medium tracking-[-0.02em] text-foreground">AI Reports</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">Compile AI-powered executive performance recommendations.</p>
        </div>
        <Button onClick={() => generateMutation.mutate()} disabled={generateMutation.isPending} className="rounded-full">
          {generateMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Plus className="mr-2 h-4 w-4" />
              Generate Report
            </>
          )}
        </Button>
      </div>

      {/* Main Layout: List vs Reader */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Reports Grid (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-lg font-semibold">Saved Reports</h3>
          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="h-48 bg-card/45 border border-border/50 animate-pulse rounded-2xl" />
              ))}
            </div>
          ) : reports.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-border/40 rounded-2xl bg-card/5 text-muted-foreground text-sm">
              No reports compiled yet. Click "Generate Report" above to run AI calculations on your dataset.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {reports.map((report, i) => (
                <motion.div
                  key={report.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                  onClick={() => setSelectedReport(report)}
                  className="cursor-pointer"
                >
                  <Card className={`bg-card/50 backdrop-blur-xl border hover:border-primary/50 transition-colors flex flex-col h-full ${
                    selectedReport?.id === report.id ? "border-primary bg-primary/5 shadow-primary/5" : "border-border/50"
                  }`}>
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <FileText className="h-5 w-5 text-primary" />
                        </div>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-success/10 text-success">
                          READY
                        </span>
                      </div>
                      <CardTitle className="mt-4 text-base font-semibold truncate">{report.title}</CardTitle>
                      <CardDescription>Created: {report.created_at.replace("T", " ").substring(0, 10)}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <File className="h-3.5 w-3.5" />
                        AI Marketing Format
                      </div>
                    </CardContent>
                    <CardFooter className="pt-3 border-t border-border/40 gap-2">
                      <Button variant="outline" size="sm" className="w-full bg-background/50 text-xs h-8 rounded-full">
                        <BookOpen className="mr-1.5 h-3.5 w-3.5" /> View Insights
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Reader Sidebar (1 col) */}
        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <h3 className="text-lg font-semibold mb-4">Report Details</h3>
            {selectedReport ? (
              <Card className="bg-card/45 border-border/50 backdrop-blur-xl overflow-hidden max-h-[calc(100vh-14rem)] flex flex-col">
                <CardHeader className="border-b border-border/40 pb-4">
                  <CardTitle className="text-base">{selectedReport.title}</CardTitle>
                  <CardDescription>Report Type: {selectedReport.report_type.toUpperCase()}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 overflow-y-auto p-4 text-sm leading-relaxed prose prose-invert max-w-none custom-scrollbar">
                  <div className="whitespace-pre-wrap text-muted-foreground font-sans">
                    {selectedReport.content?.markdown || "No analysis content details found."}
                  </div>
                </CardContent>
                <CardFooter className="border-t border-border/40 p-3 bg-muted/10 flex gap-2">
                  <Button variant="secondary" className="w-full text-xs h-8 rounded-full" onClick={() => {
                    const blob = new Blob([selectedReport.content?.markdown || ""], { type: "text/markdown" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `${selectedReport.title.toLowerCase().replace(/ /g, "_")}.md`;
                    a.click();
                  }}>
                    <Download className="mr-1 h-3.5 w-3.5" /> Save Markdown
                  </Button>
                </CardFooter>
              </Card>
            ) : (
              <div className="text-center p-8 border border-border/30 rounded-2xl bg-card/10 text-muted-foreground text-xs">
                Select a report from the list to view the AI analysis details here.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
