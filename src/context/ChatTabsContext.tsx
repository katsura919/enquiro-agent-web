"use client";
import React, { createContext, useContext, useState, ReactNode } from "react";

interface ChatTab {
  id: string;
  name: string;
  avatar: string;
  minimized: boolean;
  type: 'chat' | 'escalation' | 'agent-tools';
  data?: any; // Additional data like escalation details
}

interface ChatTabsContextType {
  tabs: ChatTab[];
  openTab: (tab: ChatTab) => void;
  closeTab: (id: string) => void;
  toggleMinimize: (id: string) => void;
  updateTab: (id: string, updates: Partial<ChatTab>) => void;
  getActiveChats: () => ChatTab[];
}

const ChatTabsContext = createContext<ChatTabsContextType | undefined>(undefined);

export function ChatTabsProvider({ children }: { children: ReactNode }) {
  // Initialize with empty tabs for agent frontend
  const [tabs, setTabs] = useState<ChatTab[]>([]);

  const openTab = (tab: ChatTab) => {
    setTabs((prev) => {
      if (prev.find((t) => t.id === tab.id)) return prev;
      return [...prev, tab];
    });
  };
  
  const closeTab = (id: string) => setTabs((prev) => prev.filter((t) => t.id !== id));
  
  const toggleMinimize = (id: string) => setTabs((prev) => prev.map((t) => t.id === id ? { ...t, minimized: !t.minimized } : t));
  
  const updateTab = (id: string, updates: Partial<ChatTab>) => {
    setTabs((prev) => prev.map((t) => t.id === id ? { ...t, ...updates } : t));
  };
  
  const getActiveChats = () => {
    return tabs.filter(tab => tab.type === 'chat' || tab.type === 'escalation');
  };

  return (
    <ChatTabsContext.Provider value={{ tabs, openTab, closeTab, toggleMinimize, updateTab, getActiveChats }}>
      {children}
    </ChatTabsContext.Provider>
  );
}

export function useChatTabs() {
  const ctx = useContext(ChatTabsContext);
  if (!ctx) throw new Error("useChatTabs must be used within ChatTabsProvider");
  return ctx;
}
