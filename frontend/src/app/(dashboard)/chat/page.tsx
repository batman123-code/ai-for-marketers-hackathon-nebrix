"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Send, Paperclip, Mic, Image as ImageIcon, 
  Settings2, Bot, User, StopCircle, RefreshCw, 
  Copy, Share, FileText, ChevronRight, ChevronLeft,
  Sparkles
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
      const res = await apiClient.post("/chat/message", { message: userMessage.content });
      const reply = res.data.reply;
      
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
    <div className="flex h-[calc(100vh-6rem)] w-full overflow-hidden rounded-2xl border border-border/50 bg-card/50 backdrop-blur-xl shadow-sm">
      {/* Context Sidebar (Left) */}
      <AnimatePresence initial={false}>
        {isSidebarOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="border-r border-border/50 bg-muted/20 flex flex-col hidden md:flex"
          >
            <div className="p-4 border-b border-border/50">
              <Button variant="outline" className="w-full justify-start text-muted-foreground bg-background/50">
                <FileText className="mr-2 h-4 w-4" />
                New Chat
              </Button>
            </div>
            <ScrollArea className="flex-1 p-2">
              <div className="space-y-1">
                <div className="px-2 py-1 text-xs font-semibold text-muted-foreground mt-2">Today</div>
                <Button variant="ghost" className="w-full justify-start text-sm truncate bg-primary/10 text-primary">
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
          <Button variant="outline" size="icon" className="h-8 w-8 rounded-full bg-background/50 backdrop-blur-sm" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
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
                <Avatar className={`h-8 w-8 ${msg.role === 'user' ? 'border-primary border' : 'bg-primary/20 text-primary'}`}>
                  {msg.role === "user" ? (
                    <>
                      <AvatarImage src="" />
                      <AvatarFallback>U</AvatarFallback>
                    </>
                  ) : (
                    <div className="flex h-full w-full items-center justify-center rounded-full bg-primary text-white shadow-lg shadow-primary/30">
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
                  <div className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    msg.role === "user" 
                      ? "bg-primary text-primary-foreground rounded-tr-sm" 
                      : "bg-muted/50 text-foreground border border-border/50 rounded-tl-sm"
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
        <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-background via-background to-transparent pt-10 pb-4 px-4 sm:px-6">
          <div className="max-w-3xl mx-auto">
            <form 
              onSubmit={handleSubmit}
              className="relative flex items-end w-full rounded-2xl border border-border/50 bg-card/80 backdrop-blur-xl shadow-lg p-2 focus-within:ring-1 focus-within:ring-primary focus-within:border-primary transition-all duration-300"
            >
              <div className="flex items-center gap-1 pb-1 pl-1">
                <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground rounded-full hover:bg-muted">
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
                  <Button type="button" size="icon" className="h-8 w-8 rounded-full bg-destructive/10 text-destructive hover:bg-destructive/20 transition-all">
                    <StopCircle className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button type="submit" size="icon" disabled={!input.trim()} className="h-8 w-8 rounded-full shadow-md transition-all group disabled:opacity-50">
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
