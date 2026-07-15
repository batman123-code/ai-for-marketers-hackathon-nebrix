"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, MoreHorizontal, Calendar, ArrowRight } from "lucide-react";

export default function CampaignsPage() {
  const columns = [
    { title: "Planning", items: ["Q4 Product Launch", "Holiday Email Series"] },
    { title: "Active", items: ["SaaS Retargeting Ad", "LinkedIn Brand Awareness"] },
    { title: "Review", items: ["October Newsletter"] },
    { title: "Completed", items: ["Webinar Promotion", "Summer Sale"] },
  ];

  return (
    <div className="flex h-[calc(100vh-6rem)] flex-1 flex-col">
      <div className="mb-6 flex flex-col gap-4 rounded-[32px] border border-border bg-card p-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-muted-foreground">Operations</p>
          <h2 className="mt-2 text-3xl font-medium tracking-[-0.02em] text-foreground">Campaigns</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">Manage your marketing campaigns in a calm kanban board.</p>
        </div>
        <Button className="rounded-full">
          <Plus className="mr-2 h-4 w-4" />
          New Campaign
        </Button>
      </div>

      <div className="flex-1 overflow-x-auto pb-4">
        <div className="flex h-full min-w-max gap-6">
          {columns.map((col, i) => (
            <motion.div key={col.title} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} className="flex w-80 flex-col gap-4">
              <div className="flex items-center justify-between px-1">
                <h3 className="font-semibold text-foreground">{col.title}</h3>
                <span className="rounded-full border border-border/80 bg-background px-2.5 py-0.5 text-xs font-medium text-muted-foreground">{col.items.length}</span>
              </div>

              <div className="flex-1 space-y-3 rounded-[28px] border border-border/80 bg-background/70 p-2">
                {col.items.map((item, j) => (
                  <Card key={j} className="cursor-grab active:cursor-grabbing transition-colors hover:border-primary/40">
                    <CardHeader className="p-4 pb-2">
                      <div className="flex items-start justify-between">
                        <div className="mb-2 rounded-full bg-primary/15 px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.2em] text-primary">Campaign</div>
                        <Button variant="ghost" size="icon" className="-mr-2 -mt-1 h-6 w-6 text-muted-foreground">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                      <CardTitle className="text-base font-semibold">{item}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="mt-4 flex items-center justify-between border-t border-border/80 pt-3 text-xs text-muted-foreground">
                        <div className="flex items-center">
                          <Calendar className="mr-1 h-3 w-3" />
                          Oct 24 - Nov 15
                        </div>
                        <div className="flex items-center font-medium text-primary">
                          View <ArrowRight className="ml-1 h-3 w-3" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
