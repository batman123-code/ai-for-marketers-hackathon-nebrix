"use client";

import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./app-sidebar";
import { Topbar } from "./topbar";

export function AppLayout({ children }: { children: React.ReactNode }) {
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
