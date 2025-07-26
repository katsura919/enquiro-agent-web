"use client"

import React from "react";

const sessions = [
  { id: 1, name: "John Doe", lastMessage: "Thank you!", unread: 2, time: "10:45 AM", avatar: "J" },
  { id: 2, name: "Jane Smith", lastMessage: "Can you help me?", unread: 0, time: "09:30 AM", avatar: "J" },
];

export default function ChatSessionsList({ onSelect, selectedId }: { onSelect: (id: number) => void; selectedId: number }) {
  return (
    <div className="w-72 bg-gray-900 border-r border-border flex flex-col h-full">
      <div className="p-4 border-b border-border">
        <input
          className="w-full rounded px-3 py-2 bg-gray-800 text-white focus:outline-none"
          placeholder="Search sessions..."
        />
      </div>
      <div className="flex-1 overflow-y-auto">
        {sessions.map((s) => (
          <div
            key={s.id}
            className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-800 transition ${selectedId === s.id ? "bg-gray-800" : ""}`}
            onClick={() => onSelect(s.id)}
          >
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold text-lg">
              {s.avatar}
            </div>
            <div className="flex-1">
              <div className="font-semibold text-white">{s.name}</div>
              <div className="text-xs text-zinc-400 truncate">{s.lastMessage}</div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className="text-xs text-zinc-400">{s.time}</span>
              {s.unread > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5">{s.unread}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
