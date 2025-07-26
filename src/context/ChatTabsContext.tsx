"use client";
import React, { createContext, useContext, useState, ReactNode } from "react";

interface ChatTab {
  id: number;
  name: string;
  avatar: string;
  minimized: boolean;
}

interface ChatTabsContextType {
  tabs: ChatTab[];
  openTab: (tab: ChatTab) => void;
  closeTab: (id: number) => void;
  toggleMinimize: (id: number) => void;
}

const ChatTabsContext = createContext<ChatTabsContextType | undefined>(undefined);

export function ChatTabsProvider({ children }: { children: ReactNode }) {
  // Dummy data for demo
  const [tabs, setTabs] = useState<ChatTab[]>([
    { id: 1, name: "John Doe", avatar: "J", minimized: false },
    { id: 2, name: "Jane Smith", avatar: "J", minimized: true },
  ]);

  const openTab = (tab: ChatTab) => {
    setTabs((prev) => {
      if (prev.find((t) => t.id === tab.id)) return prev;
      return [...prev, tab];
    });
  };
  const closeTab = (id: number) => setTabs((prev) => prev.filter((t) => t.id !== id));
  const toggleMinimize = (id: number) => setTabs((prev) => prev.map((t) => t.id === id ? { ...t, minimized: !t.minimized } : t));

  return (
    <ChatTabsContext.Provider value={{ tabs, openTab, closeTab, toggleMinimize }}>
      {children}
    </ChatTabsContext.Provider>
  );
}

export function useChatTabs() {
  const ctx = useContext(ChatTabsContext);
  if (!ctx) throw new Error("useChatTabs must be used within ChatTabsProvider");
  return ctx;
}
