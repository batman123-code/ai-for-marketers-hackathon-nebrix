"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, Share2, Plus, File } from "lucide-react";

export default function ReportsPage() {
  const reports = [
    { id: 1, name: "Q3 Marketing Performance", date: "Oct 12, 2026", status: "Ready", type: "PDF" },
    { id: 2, name: "Social Media ROI Analysis", date: "Oct 10, 2026", status: "Ready", type: "Excel" },
    { id: 3, name: "Weekly Campaign Summary", date: "Oct 08, 2026", status: "Ready", type: "PDF" },
    { id: 4, name: "Competitor Market Share", date: "Oct 05, 2026", status: "Generating", type: "PDF" },
  ];

  return (
    <div className="flex-1 space-y-6">
      <div className="flex flex-col gap-4 rounded-[32px] border border-border bg-card p-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-muted-foreground">Deliverables</p>
          <h2 className="mt-2 text-3xl font-medium tracking-[-0.02em] text-foreground">Reports</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">Generate, view, and export your marketing reports.</p>
        </div>
        <Button className="rounded-full">
          <Plus className="mr-2 h-4 w-4" />
          New Report
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {reports.map((report, i) => (
          <motion.div key={report.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: i * 0.1 }}>
            <Card className="flex h-full flex-col transition-all duration-300 hover:-translate-y-0.5">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="rounded-2xl border border-border/80 bg-background p-2">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${report.status === "Ready" ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"}`}>
                    {report.status}
                  </span>
                </div>
                <CardTitle className="mt-4 text-lg">{report.name}</CardTitle>
                <CardDescription>Generated on {report.date}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <File className="h-4 w-4" />
                  {report.type} Format
                </div>
              </CardContent>
              <CardFooter className="gap-2 border-t border-border/80 pt-3">
                <Button variant="outline" size="sm" className="w-full rounded-full" disabled={report.status !== "Ready"}>
                  <Download className="mr-2 h-3 w-3" /> Export
                </Button>
                <Button variant="outline" size="sm" className="w-full rounded-full" disabled={report.status !== "Ready"}>
                  <Share2 className="mr-2 h-3 w-3" /> Share
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
