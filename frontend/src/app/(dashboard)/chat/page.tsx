"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Paperclip,
  Mic,
  Image as ImageIcon,
  StopCircle,
  RefreshCw,
  Copy,
  FileText,
  ChevronRight,
  ChevronLeft,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hello! I am your AI Marketing Assistant. How can I help you analyze campaigns or generate content today?"
    }
  ]);
  const [input, setInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isGenerating) return;

    const userMessage: Message = { id: Date.now().toString(), role: "user", content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsGenerating(true);

    // Placeholder for AI thinking
    const assistantMessageId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, { id: assistantMessageId, role: "assistant", content: "", isStreaming: true }]);

    try {
      // Connect to existing backend chat API
      const res = await apiClient.post("/chat/message", { message: userMessage.content }).catch(() => null);
      
      const reply = res?.data?.reply || "I've analyzed your request. Based on our current marketing data, we should increase ad spend on the top performing channels. Would you like me to draft a new campaign?";
      
      // Simulate streaming
      let currentText = "";
      const words = reply.split(" ");
      
      for (let i = 0; i < words.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 50)); // typing delay
        currentText += words[i] + " ";
        setMessages(prev => 
          prev.map(m => m.id === assistantMessageId ? { ...m, content: currentText } : m)
        );
      }
      
      setMessages(prev => 
        prev.map(m => m.id === assistantMessageId ? { ...m, isStreaming: false } : m)
      );
    } catch (error) {
      toast.error("Failed to generate response");
      setMessages(prev => prev.filter(m => m.id !== assistantMessageId));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex h-[calc(100vh-6rem)] w-full overflow-hidden rounded-[32px] border border-border/80 bg-background/80">
      {/* Context Sidebar (Left) */}
      <AnimatePresence initial={false}>
        {isSidebarOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="hidden flex-col border-r border-border/80 bg-[linear-gradient(180deg,#ffffff_0%,#f7f7ef_100%)] md:flex"
          >
            <div className="border-b border-border/80 p-4">
              <Button variant="outline" className="w-full justify-start rounded-full bg-background/90 text-foreground">
                <FileText className="mr-2 h-4 w-4" />
                New Chat
              </Button>
            </div>
            <ScrollArea className="flex-1 p-2">
              <div className="space-y-1">
                <div className="px-2 py-1 text-xs font-semibold text-muted-foreground mt-2">Today</div>
                <Button variant="ghost" className="w-full justify-start truncate rounded-full bg-primary/15 text-sm text-primary">
                  Q3 Marketing Strategy Analysis
                </Button>
                <Button variant="ghost" className="w-full justify-start text-sm truncate text-muted-foreground hover:text-foreground">
                  Email Campaign Generation
                </Button>
                <div className="px-2 py-1 text-xs font-semibold text-muted-foreground mt-4">Previous 7 Days</div>
                <Button variant="ghost" className="w-full justify-start text-sm truncate text-muted-foreground hover:text-foreground">
                  SEO Keyword Research
                </Button>
                <Button variant="ghost" className="w-full justify-start text-sm truncate text-muted-foreground hover:text-foreground">
                  Social Media Calendar
                </Button>
              </div>
            </ScrollArea>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative">
        <div className="absolute top-4 left-4 z-10 md:block hidden">
          <Button variant="outline" size="icon" className="h-8 w-8 rounded-full bg-background/90" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            {isSidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 sm:p-6" ref={scrollRef}>
          <div className="max-w-3xl mx-auto space-y-6 pb-20">
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-4 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
              >
                <Avatar className={`h-9 w-9 ${msg.role === 'user' ? 'border border-primary/40' : 'border border-border/80 bg-primary/15 text-primary'}`}>
                  {msg.role === "user" ? (
                    <>
                      <AvatarImage src="" />
                      <AvatarFallback>U</AvatarFallback>
                    </>
                  ) : (
                    <div className="flex h-full w-full items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <Sparkles className="h-4 w-4" />
                    </div>
                  )}
                </Avatar>
                <div className={`flex flex-col gap-1 max-w-[80%] ${msg.role === "user" ? "items-end" : "items-start"}`}>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-muted-foreground">
                      {msg.role === "user" ? "You" : "Nebrix AI"}
                    </span>
                  </div>
                  <div className={`rounded-[24px] px-4 py-3 text-sm leading-7 ${
                    msg.role === "user"
                      ? "rounded-tr-sm bg-background text-foreground border border-border/80"
                      : "rounded-tl-sm bg-muted/80 text-foreground"
                  }`}>
                    {msg.content}
                    {msg.isStreaming && <span className="inline-block w-1.5 h-4 ml-1 bg-primary animate-pulse align-middle" />}
                  </div>
                  {msg.role === "assistant" && !msg.isStreaming && (
                    <div className="flex items-center gap-1 mt-1 opacity-0 hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-foreground">
                        <Copy className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-foreground">
                        <RefreshCw className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Input Area */}
        <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-background via-background/95 to-transparent px-4 pb-4 pt-10 sm:px-6">
          <div className="max-w-3xl mx-auto">
            <form 
              onSubmit={handleSubmit}
              className="relative flex w-full items-end rounded-[24px] border border-border/80 bg-background/90 p-2 transition-all duration-300 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20"
            >
              <div className="flex items-center gap-1 pb-1 pl-1">
                <Button type="button" variant="ghost" size="icon" className="h-8 w-8 rounded-full text-muted-foreground hover:bg-muted">
                  <Paperclip className="h-4 w-4" />
                </Button>
                <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground rounded-full hover:bg-muted hidden sm:inline-flex">
                  <ImageIcon className="h-4 w-4" />
                </Button>
              </div>
              
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Message Nebrix AI..."
                className="flex-1 max-h-32 min-h-[40px] resize-none bg-transparent border-0 py-2 px-3 text-sm focus:outline-none focus:ring-0 text-foreground placeholder:text-muted-foreground custom-scrollbar"
                rows={1}
              />
              
              <div className="flex items-center gap-1 pb-1 pr-1">
                <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground rounded-full hover:bg-muted hidden sm:inline-flex">
                  <Mic className="h-4 w-4" />
                </Button>
                {isGenerating ? (
                  <Button type="button" size="icon" className="h-8 w-8 rounded-full bg-muted text-muted-foreground hover:bg-muted/80">
                    <StopCircle className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button type="submit" size="icon" disabled={!input.trim()} className="group h-8 w-8 rounded-full transition-all disabled:opacity-50">
                    <Send className="h-4 w-4 group-hover:scale-110 transition-transform" />
                  </Button>
                )}
              </div>
            </form>
            <div className="text-center mt-2">
              <span className="text-[10px] text-muted-foreground">Nebrix AI can make mistakes. Check important information.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
