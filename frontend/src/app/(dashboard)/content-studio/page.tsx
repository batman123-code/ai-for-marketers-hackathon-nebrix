"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, Save, Eye, Mail, FileText, Globe, LayoutTemplate } from "lucide-react";

export default function ContentStudioPage() {
  const templates = [
    { name: "Email Newsletter", icon: Mail },
    { name: "Blog Post", icon: FileText },
    { name: "Landing Page Copy", icon: Globe },
    { name: "Social Media Post", icon: LayoutTemplate },
  ];

  return (
    <div className="flex h-[calc(100vh-6rem)] flex-1 flex-col">
      <div className="mb-6 flex flex-col gap-4 rounded-[32px] border border-border bg-card p-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-muted-foreground">Creative workspace</p>
          <h2 className="mt-2 text-3xl font-medium tracking-[-0.02em] text-foreground">Content Studio</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">Generate AI marketing content across all formats.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" className="rounded-full">
            <Eye className="mr-2 h-4 w-4" /> Preview
          </Button>
          <Button className="rounded-full">
            <Save className="mr-2 h-4 w-4" /> Save Draft
          </Button>
        </div>
      </div>

      <div className="grid h-full min-h-0 gap-6 lg:grid-cols-3">
        {/* Templates & Prompt Area */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-1 flex flex-col gap-6"
        >
          <Card className="flex-1">
            <div className="border-b border-border/80 p-4">
              <h3 className="flex items-center font-semibold text-foreground">
                <Sparkles className="mr-2 h-4 w-4 text-primary" />
                AI Generator
              </h3>
            </div>
            <CardContent className="p-4 space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Select Template</label>
                <div className="grid grid-cols-2 gap-2">
                  {templates.map(t => (
                    <Button key={t.name} variant="outline" className="h-auto justify-start rounded-[18px] bg-background px-3 py-2 text-xs">
                      <t.icon className="mr-2 h-3 w-3" />
                      {t.name}
                    </Button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Topic / Brief</label>
                <textarea 
                  className="h-32 w-full resize-none rounded-[8px] border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
                  placeholder="Describe what you want to write about..."
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Keywords (Optional)</label>
                <Input placeholder="AI, marketing, growth..." />
              </div>
              <Button className="mt-2 w-full rounded-full">Generate Content</Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Editor Area */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 h-full min-h-0 flex flex-col"
        >
          <Card className="flex flex-1 flex-col overflow-hidden">
            <div className="flex items-center gap-1 border-b border-border/80 bg-muted/40 p-2">
              {/* Fake Toolbar */}
              {['H1', 'H2', 'B', 'I', 'U', 'List', 'Link'].map((tool, i) => (
                <Button key={i} variant="ghost" size="sm" className="h-8 rounded-full px-2 text-xs font-medium text-muted-foreground">
                  {tool}
                </Button>
              ))}
            </div>
            <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
              <h1 className="mb-4 text-4xl font-semibold tracking-[-0.02em] text-foreground outline-none empty:before:content-['Title_here...'] empty:before:text-muted-foreground" contentEditable></h1>
              <div className="prose max-w-none text-sm leading-8 text-muted-foreground outline-none empty:before:content-['Start_writing_or_use_AI_to_generate_content...'] empty:before:text-muted-foreground" contentEditable>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
