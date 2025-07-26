"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { ChatTabsProvider } from "@/context/ChatTabsContext";
import ChatTabsBar from "@/components/chat-tab-bar";


import {
  LayoutDashboard,
  MessageSquare,
  AlertTriangle,
  Settings,
  LogOut,
  User as UserIcon
} from "lucide-react";

const navigation = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "Chat Sessions", href: "/dashboard/chat", icon: MessageSquare },
  { name: "Escalations", href: "/dashboard/escalations", icon: AlertTriangle },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];


export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
      setIsSidebarOpen(window.innerWidth >= 1024);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <ChatTabsProvider>
      {/* Layout content */}
      <div className="min-h-screen bg-card">
        {/* Sidebar */}
        <div
          className={cn(
            "fixed top-0 left-0 z-40 flex flex-col h-screen transition-all duration-300 ease-out bg-gray-900/90 backdrop-blur-xl border-r border-border",
            isSidebarOpen ? "w-64" : "lg:w-20 -translate-x-full lg:translate-x-0"
          )}
        >
          <div className="flex grow flex-col overflow-y-auto px-4 pb-4 h-full">
            {/* Brand/Header */}
            <div className="flex h-20 shrink-0 items-center justify-between px-2">
              <Link href="/dashboard" className="flex items-center gap-3 text-white font-bold text-xl">
                <span className="flex-shrink-0 w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-lg">E</span>
                <span className={cn("transition-all duration-300 ease-out whitespace-nowrap", !isSidebarOpen && "lg:opacity-0 lg:w-0 lg:overflow-hidden")}>Enquiro</span>
              </Link>
              {/* Mobile menu button */}
              <button
                className="lg:hidden h-9 w-9 p-0 rounded-lg transition-all duration-300 hover:bg-accent"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                aria-label="Toggle sidebar"
              >
                <svg className="h-5 w-5 text-muted-foreground" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
              </button>
            </div>
            {/* Navigation */}
            <nav className="flex flex-1 flex-col px-2 py-4 gap-2">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "group flex items-center rounded-xl p-3 text-sm font-medium transition-all duration-300 cursor-pointer relative",
                      isActive ? "bg-primary/20 text-white shadow-lg" : "text-zinc-300 hover:bg-accent hover:text-white",
                      !isSidebarOpen && "lg:justify-center gap-0"
                    )}
                    onClick={() => isMobile && setIsSidebarOpen(false)}
                    tabIndex={0}
                    aria-label={item.name}
                  >
                    <Icon className={cn("h-5 w-5 mr-3 transition-all", !isSidebarOpen && "lg:mr-0")}/>
                    <span className={cn("transition-all duration-300 ease-out", !isSidebarOpen && "lg:opacity-0 lg:w-0 lg:overflow-hidden")}>{item.name}</span>
                    {/* Tooltip for collapsed sidebar */}
                    {!isSidebarOpen && (
                      <span className="absolute left-full ml-2 top-1/2 -translate-y-1/2 bg-gray-800 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 pointer-events-none z-50 shadow-lg whitespace-nowrap">
                        {item.name}
                      </span>
                    )}
                  </Link>
                );
              })}
              {/* User profile and sign out */}
              <div className="mt-auto pt-4 border-t border-border flex flex-col gap-2">
                <div className={cn(
                  "flex items-center gap-3 p-3 rounded-xl transition-all duration-300",
                  !isSidebarOpen && "lg:justify-center gap-0"
                )}>
                  <div className="flex-shrink-0">
                    <UserIcon className="h-6 w-6 text-zinc-400" />
                  </div>
                  <span className={cn("text-sm text-zinc-300 font-medium transition-all duration-300", !isSidebarOpen && "lg:opacity-0 lg:w-0 lg:overflow-hidden")}>Agent Name</span>
                </div>
                <Link
                  href="/auth"
                  className={cn(
                    "flex items-center rounded-xl p-3 text-sm font-medium transition-all duration-300 text-red-500 hover:bg-red-500/10 hover:text-red-600",
                    !isSidebarOpen && "lg:justify-center gap-0"
                  )}
                  onClick={() => isMobile && setIsSidebarOpen(false)}
                  tabIndex={0}
                  aria-label="Sign out"
                >
                  <LogOut className="h-5 w-5 mr-3" />
                  <span className={cn(!isSidebarOpen && "lg:opacity-0 lg:w-0 lg:overflow-hidden")}>Sign out</span>
                  {/* Tooltip for collapsed sidebar */}
                  {!isSidebarOpen && (
                    <span className="absolute left-full ml-2 top-1/2 -translate-y-1/2 bg-gray-800 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 pointer-events-none z-50 shadow-lg whitespace-nowrap">
                      Sign out
                    </span>
                  )}
                </Link>
              </div>
            </nav>
          </div>
        </div>
        {/* Main content */}
        <main
          className={cn(
            "transition-all duration-300 flex flex-col min-h-screen",
            isSidebarOpen ? "lg:pl-64" : "lg:pl-20 pl-0"
          )}
        >
          {/* Topbar placeholder */}
          {/* <Topbar /> */}
          <div className="bg-background flex flex-col flex-1 h-full">
            {children}
          </div>
        </main>
        {/* Persistent chat tabs bar */}
        <ChatTabsBar />
      </div>
    </ChatTabsProvider>
  );
}
