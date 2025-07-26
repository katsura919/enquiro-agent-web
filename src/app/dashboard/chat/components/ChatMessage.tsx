"use client"

import React from "react";

export default function ChatMessage({ sender, text, time }: { sender: string; text: string; time: string }) {
  const isAgent = sender === "agent";
  return (
    <div className={`flex ${isAgent ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-xs px-4 py-2 rounded-lg shadow text-sm ${isAgent ? "bg-blue-600 text-white" : "bg-gray-800 text-zinc-200"}`}>
        <div>{text}</div>
        <div className="text-xs text-zinc-400 mt-1 text-right">{time}</div>
      </div>
    </div>
  );
}
