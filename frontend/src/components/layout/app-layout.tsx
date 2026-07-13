"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./app-sidebar";
import { Topbar } from "./topbar";
import { Loader2 } from "lucide-react";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 1. Fetch current session from Supabase SDK
    supabase.auth.getSession().then(({ data: { session } }: any) => {
      setSession(session);
      setIsLoading(false);
      if (!session) {
        localStorage.removeItem("token");
        router.push("/login");
      }
    });

    // 2. Setup observer to handle dynamic logouts/expiry
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: string, currentSession: any) => {
      setSession(currentSession);
      if (!currentSession) {
        localStorage.removeItem("token");
        router.push("/login");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#090D16]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 text-primary animate-spin" />
          <p className="text-sm text-muted-foreground font-medium animate-pulse">
            Verifying secure session...
          </p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null; // prevents rendering layout before redirecting
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full flex-col bg-background md:flex-row">
        <AppSidebar />
        <div className="flex flex-1 flex-col transition-all duration-300 ease-in-out">
          <Topbar />
          <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
