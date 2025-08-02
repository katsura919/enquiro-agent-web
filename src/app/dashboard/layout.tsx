"use client";
import { useAuth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { TopBar } from "@/components/dashboard/TopBar";
import { TabBar } from "@/components/dashboard/TabBar";
import { TabContent } from "@/components/dashboard/TabContent";
import { useTabs } from "@/context/TabsContext";
import { useEffect } from "react";
import { ChatTabsProvider } from "@/context/ChatTabsContext";
import ChatPanel from "@/components/ChatPanel";
import AgentToolsBar from "@/components/AgentToolsBar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const { tabs, activeTabId } = useTabs();

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!user) {
    redirect('/');
  }

  return (
    <ChatTabsProvider>
      <div className="h-screen flex flex-col overflow-hidden bg-background">
        {/* Top Bar */}
        <TopBar />
        
        {/* Tab Bar */}
        <TabBar />
        
        {/* Main Content Area - Now with chat panel on right */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left: Tab Content */}
          <div className="flex-1 flex overflow-hidden">
            <TabContent />
          </div>
          
          {/* Right: Chat Panel - Only show when chat is active */}
          <ChatPanel />
        </div>
        
        {/* Agent Tools Bar (bottom bar with agent tools only) */}
        <AgentToolsBar />
      </div>
    </ChatTabsProvider>
  );
}
