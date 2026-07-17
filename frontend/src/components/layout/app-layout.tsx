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
    let mounted = true;
    console.log("[app-layout] Mounting, initial session state:", session);

    async function checkSession() {
      console.log("[app-layout] checkSession called");
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        console.log("[app-layout] checkSession getSession returned:", { session, error });
        if (error) throw error;
        
        if (mounted) {
          console.log("[app-layout] Setting session state to:", session);
          setSession(session);
          setIsLoading(false);
          if (!session) {
            console.log("[app-layout] checkSession triggered logout redirect because session is null");
            localStorage.removeItem("token");
            router.push("/login");
          } else {
            console.log("[app-layout] checkSession: session found, staying on dashboard");
          }
        }
      } catch (err) {
        console.error("[app-layout] Session check failed:", err);
        if (mounted) {
          setIsLoading(false);
          console.log("[app-layout] checkSession error triggered logout redirect");
          localStorage.removeItem("token");
          router.push("/login");
        }
      }
    }

    checkSession();

    // 2. Setup observer to handle dynamic logouts/expiry
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event: string, currentSession: any) => {
      console.log(`[app-layout] onAuthStateChange event: ${event}, currentSession:`, currentSession);
      if (mounted) {
        if (event === 'INITIAL_SESSION') {
          return;
        }
        setSession(currentSession);
        setIsLoading(false); // <--- CRITICAL FIX: Ensure loading spinner stops
        if (!currentSession) {
          console.log("[app-layout] onAuthStateChange: no session, redirecting to /login");
          localStorage.removeItem("token");
          router.push("/login");
        }
      }
    });

    return () => {
      console.log("[app-layout] Unmounting");
      mounted = false;
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
          <main className="flex-1 overflow-y-auto bg-transparent p-4 sm:p-6 lg:p-8">
            <div className="mx-auto flex max-w-7xl flex-col gap-6">{children}</div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
