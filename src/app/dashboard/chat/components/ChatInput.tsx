"use client"

import React, { useState } from "react";

export default function ChatInput() {
  const [input, setInput] = useState("");

  const sendMessage = () => {
    if (!input.trim()) return;
    // TODO: send message logic
    setInput("");
  };

  return (
    <div className="flex gap-2">
      <input
        className="flex-1 rounded px-3 py-2 bg-gray-800 text-white focus:outline-none"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type a message..."
        onKeyDown={(e) => e.key === "Enter" && sendMessage()}
      />
      <button
        className="bg-blue-600 px-4 py-2 rounded text-white font-bold hover:bg-blue-700"
        onClick={sendMessage}
      >
        Send
      </button>
    </div>
  );
}
