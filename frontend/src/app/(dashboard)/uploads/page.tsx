"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UploadCloud, File as FileIcon, X, CheckCircle2, Loader2 } from "lucide-react";
import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";

interface UploadLog {
  id: string;
  filename: string;
  row_count: number;
  status: string;
  created_at: string;
}

export default function UploadsPage() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // 1. Query Upload History
  const { data: historyResponse, isLoading: isHistoryLoading } = useQuery({
    queryKey: ["upload-history"],
    queryFn: async () => {
      const res = await apiClient.get("/upload/history");
      return res.data;
    }
  });
  const uploadLogs = historyResponse?.data || [];

  // 2. Mutation for Upload
  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      
      const res = await apiClient.post("/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(data.message || "File uploaded and parsed successfully!");
      queryClient.invalidateQueries({ queryKey: ["upload-history"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-metrics"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-charts"] });
    },
    onError: (err: any) => {
      const errMsg = err.response?.data?.detail || "Upload failed. Please check file format.";
      toast.error(errMsg);
    }
  });

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
      const file = e.dataTransfer.files[0];
      if (file.name.toLowerCase().endsWith(".csv")) {
        uploadMutation.mutate(file);
      } else {
        toast.error("Only CSV files are supported.");
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      uploadMutation.mutate(file);
      e.target.value = ""; // clear input
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
<<<<<<< HEAD
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
=======
    <div className="flex-1 space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Upload Center</h2>
        <p className="text-muted-foreground mt-1">Upload marketing documents, campaigns, and customer databases for indexing.</p>
      </div>

      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept=".csv" 
        className="hidden" 
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        <Card className={`border-2 border-dashed ${isDragging ? 'border-primary bg-primary/5' : 'border-border/50 bg-card/50'} backdrop-blur-xl transition-colors duration-300`}>
          <CardContent 
            className="flex flex-col items-center justify-center py-24 text-center cursor-pointer"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={triggerFileSelect}
          >
            <div className="p-4 bg-primary/10 rounded-full mb-6">
              {uploadMutation.isPending ? (
                <Loader2 className="h-10 w-10 text-primary animate-spin" />
              ) : (
                <UploadCloud className="h-10 w-10 text-primary" />
              )}
            </div>
            <h3 className="text-xl font-semibold mb-2">
              {uploadMutation.isPending ? "Uploading and Parsing CSV..." : "Drag & drop files here"}
            </h3>
            <p className="text-muted-foreground mb-6 max-w-sm">
              Upload customer contact or campaign reports in **CSV format**. AI will automatically map the fields.
            </p>
            <Button variant="secondary" className="px-8" onClick={(e) => { e.stopPropagation(); triggerFileSelect(); }} disabled={uploadMutation.isPending}>
>>>>>>> bf37c5909541ae5551f45803b9cfd61427c7bb43
              Browse Files
            </Button>
          </CardContent>
        </Card>
      </motion.div>

<<<<<<< HEAD
      {files.length > 0 && (
        <div className="mt-8 space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Recent Uploads</h3>
          <div className="space-y-3">
            {files.map((file, i) => (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={i} className="flex items-center justify-between rounded-[24px] border border-border/80 bg-background/80 p-4">
=======
      <div className="space-y-4 mt-8">
        <h3 className="text-lg font-semibold">Upload History</h3>
        {isHistoryLoading ? (
          <div className="space-y-3">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="h-16 bg-card/40 border border-border/50 animate-pulse rounded-xl" />
            ))}
          </div>
        ) : uploadLogs.length === 0 ? (
          <div className="text-center py-8 border border-border/30 rounded-xl bg-card/10 text-muted-foreground text-sm">
            No previous uploads logged. Drag and drop your first CSV above.
          </div>
        ) : (
          <div className="space-y-3">
            {uploadLogs.map((log: UploadLog) => (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={log.id}
                className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-card/30 backdrop-blur-sm"
              >
>>>>>>> bf37c5909541ae5551f45803b9cfd61427c7bb43
                <div className="flex items-center gap-4">
                  <div className="rounded-2xl border border-border/80 bg-muted p-2">
                    <FileIcon className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
<<<<<<< HEAD
                    <p className="text-sm font-medium text-foreground">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{file.size}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="flex items-center rounded-full bg-primary/15 px-2.5 py-1 text-xs font-medium text-primary">
                    <CheckCircle2 className="mr-1 h-3 w-3" /> Indexed
=======
                    <p className="font-medium text-sm">{log.filename}</p>
                    <p className="text-xs text-muted-foreground">
                      {log.row_count} rows indexed | {log.created_at.replace("T", " ").substring(0, 19)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="flex items-center text-xs text-success bg-success/10 px-2 py-1 rounded-full">
                    <CheckCircle2 className="h-3 w-3 mr-1" /> {log.status.toUpperCase()}
>>>>>>> bf37c5909541ae5551f45803b9cfd61427c7bb43
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
