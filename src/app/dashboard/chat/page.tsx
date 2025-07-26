"use client"

import React, { useState } from "react";
import ChatSessionsList from "./components/ChatSessionsList";
import ChatWindow from "./components/ChatWindow";

export default function ChatPage() {
  const [selectedId, setSelectedId] = useState(1);

  return (
    <div className="flex min-h-screen h-full w-full overflow-hidden">
      {/* Left: Sessions List */}
      <ChatSessionsList onSelect={setSelectedId} selectedId={selectedId} />
      {/* Right: Chat Window */}
      <div className="flex-1 min-w-0 flex flex-col">
       
      </div>
    </div>
  );
}
