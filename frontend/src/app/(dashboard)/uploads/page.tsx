"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UploadCloud, File as FileIcon, X, CheckCircle2 } from "lucide-react";
import { useState, useCallback } from "react";
import { toast } from "sonner";

export default function UploadsPage() {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<{name: string, size: string, status: 'uploading' | 'completed'}[]>([]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const newFiles = Array.from(e.dataTransfer.files).map(f => ({
        name: f.name,
        size: (f.size / (1024 * 1024)).toFixed(2) + " MB",
        status: 'completed' as const
      }));
      setFiles(prev => [...prev, ...newFiles]);
      toast.success(`${newFiles.length} files uploaded and indexed by AI.`);
    }
  };

  return (
    <div className="mx-auto flex-1 max-w-4xl space-y-6">
      <div className="rounded-[32px] border border-border bg-card p-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-muted-foreground">Knowledge intake</p>
        <h2 className="mt-2 text-3xl font-medium tracking-[-0.02em] text-foreground">Upload Center</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">Upload marketing documents, assets, and data for AI indexing.</p>
      </div>

      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}>
        <Card className={`border-2 border-dashed ${isDragging ? "border-primary bg-primary/10" : "border-border/80 bg-background/80"}`}>
          <CardContent className="flex flex-col items-center justify-center py-24 text-center" onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}>
            <div className="mb-6 rounded-full border border-border/80 bg-primary/15 p-4">
              <UploadCloud className="h-10 w-10 text-primary" />
            </div>
            <h3 className="mb-2 text-xl font-semibold text-foreground">Drag & drop files here</h3>
            <p className="mb-6 max-w-sm text-sm leading-6 text-muted-foreground">
              Support for PDF, CSV, Excel, Word, and Images. AI will automatically parse and index your documents.
            </p>
            <Button variant="secondary" className="rounded-full px-8">
              Browse Files
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {files.length > 0 && (
        <div className="mt-8 space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Recent Uploads</h3>
          <div className="space-y-3">
            {files.map((file, i) => (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={i} className="flex items-center justify-between rounded-[24px] border border-border/80 bg-background/80 p-4">
                <div className="flex items-center gap-4">
                  <div className="rounded-2xl border border-border/80 bg-muted p-2">
                    <FileIcon className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{file.size}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="flex items-center rounded-full bg-primary/15 px-2.5 py-1 text-xs font-medium text-primary">
                    <CheckCircle2 className="mr-1 h-3 w-3" /> Indexed
                  </span>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
