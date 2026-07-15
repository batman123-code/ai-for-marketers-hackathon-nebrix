"use client";

import * as React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  Bot,
  BarChart,
  FileText,
  Upload,
  Briefcase,
  PenTool,
  Image as ImageIcon,
  BookOpen,
  Settings,
  Search,
  Bell,
  Sparkles,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const mainNavigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "AI Assistant", href: "/chat", icon: Bot },
  { name: "Campaigns", href: "/campaigns", icon: Briefcase },
  { name: "Customers", href: "/customers", icon: Users },
  { name: "Analytics", href: "/analytics", icon: BarChart },
  { name: "Reports", href: "/reports", icon: FileText },
  { name: "Content Studio", href: "/content-studio", icon: PenTool },
];

const mediaNavigation = [
  { name: "Uploads", href: "/uploads", icon: Upload },
  { name: "Media Library", href: "/media", icon: ImageIcon },
  { name: "Knowledge Base", href: "/knowledge", icon: BookOpen },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar variant="sidebar" collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border/80 p-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="truncate text-[15px] font-semibold tracking-tight">Nebrix AI</div>
            <div className="truncate text-xs text-muted-foreground">Marketing command center</div>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-3">
        <SidebarGroup>
          <SidebarGroupLabel className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/90">
            Main Menu
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton
                      render={<Link href={item.href} />}
                      isActive={isActive}
                      tooltip={item.name}
                      className={isActive ? "bg-primary/15 text-foreground font-medium before:absolute before:left-0 before:top-1/2 before:h-5 before:w-0.5 before:-translate-y-1/2 before:rounded-full before:bg-primary relative" : "text-foreground hover:bg-muted"}
                    >
                      <item.icon className={isActive ? "text-primary" : "text-foreground"} />
                      <span>{item.name}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/90">
            Library & Media
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mediaNavigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton
                      render={<Link href={item.href} />}
                      isActive={isActive}
                      tooltip={item.name}
                      className={isActive ? "bg-primary/15 text-foreground font-medium before:absolute before:left-0 before:top-1/2 before:h-5 before:w-0.5 before:-translate-y-1/2 before:rounded-full before:bg-primary relative" : "text-foreground hover:bg-muted"}
                    >
                      <item.icon className={isActive ? "text-primary" : "text-foreground"} />
                      <span>{item.name}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border/80 p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton render={<Link href="/settings" />} tooltip="Settings" className="text-foreground hover:bg-muted">
              <Settings />
              <span>Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton render={<Link href="/profile" className="flex items-center gap-2" />} tooltip="Profile" className="text-foreground hover:bg-muted">
              <Avatar className="h-7 w-7 border border-border/80">
                <AvatarImage src="" />
                <AvatarFallback className="bg-primary/15 text-[11px] font-medium text-primary">U</AvatarFallback>
              </Avatar>
              <span>John Doe</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
