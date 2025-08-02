"use client";
import { useAuth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { TopBar } from "@/components/dashboard/TopBar";
import { TabBar } from "@/components/dashboard/TabBar";
import { TabContent } from "@/components/dashboard/TabContent";
import { useTabs } from "@/context/TabsContext";
import { useEffect } from "react";
import { ChatTabsProvider } from "@/context/ChatTabsContext";
import ChatTabsBar from "@/components/chat-tab-bar";

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
        
        {/* Main Content Area - Add bottom padding for the chat bar */}
        <div className="flex-1 flex overflow-hidden pb-12">
          {/* Tab Content */}
          <TabContent />
        </div>
        
        {/* Chat Tabs Bar (full-width bottom bar) */}
        <ChatTabsBar />
      </div>
    </ChatTabsProvider>
  );
}
