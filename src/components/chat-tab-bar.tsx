"use client";
import React from "react";
import { useChatTabs } from "../context/ChatTabsContext";
import ChatWindow from "../app/dashboard/chat/components/ChatWindow";

export default function ChatTabsBar() {
  const { tabs, closeTab, toggleMinimize } = useChatTabs();

  return (
    <div className="fixed bottom-0 left-0 w-full z-50 flex flex-col items-end pointer-events-none">
      {/* Open chat windows */}
      <div className="flex gap-4 mb-4 mr-8 pr-2 pointer-events-auto max-w-full overflow-x-auto">
        {tabs.filter(t => !t.minimized).map(tab => (
          <div key={tab.id} className="w-[400px] max-w-[90vw] flex flex-col m-2">
            <ChatWindow id={tab.id} name={tab.name} avatar={tab.avatar} />
          </div>
        ))}
      </div>
      {/* Tab bar */}
      <div className="flex gap-3 bg-background/90 border-t border-border w-auto rounded-t-2xl px-5 py-3 shadow-2xl pointer-events-auto backdrop-blur-md">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-card hover:bg-accent/60 focus:outline-none focus:ring-2 focus:ring-primary/40 transition shadow"
            onClick={() => toggleMinimize(tab.id)}
          >
            <span className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm shadow">{tab.avatar}</span>
            <span className="text-base text-foreground font-medium">{tab.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
