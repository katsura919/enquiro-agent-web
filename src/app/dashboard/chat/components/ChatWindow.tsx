"use client"

import React, { useRef, useEffect, useContext } from "react";
import ChatMessage from "./ChatMessage";
import { useChatTabs } from "../../../../context/ChatTabsContext";

import { Send } from "lucide-react";

const messages = [
  { id: 1, sender: "customer", text: "Hello, I need help with my order.", time: "10:40 AM" },
  { id: 2, sender: "agent", text: "Hi! I’m here to assist you. Can you provide your order number?", time: "10:41 AM" },
  { id: 3, sender: "customer", text: "Sure, it's #12345.", time: "10:42 AM" },
];

export default function ChatWindow({ id, name, avatar }: { id: number; name: string; avatar: string }) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const { closeTab } = useChatTabs();
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="bg-card relative flex flex-col h-full w-full max-w-lg min-h-[540px] min-w-[380px] rounded-2xl shadow-xl overflow-hidden mx-auto border m-6">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-2 border-b rounded-t-2xl">
        <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-base object-cover">{avatar}</div>
        <span className="font-semibold text-base flex-1 truncate">{name}</span>
        <button className="ml-auto text-xl leading-none" onClick={() => closeTab(id)}>&#10005;</button>
      </div>
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-3">
        {messages.map((msg) => (
          <ChatMessage key={msg.id} {...msg} />
        ))}
        <div ref={bottomRef} />
      </div>
      {/* Input */}
      <div className="absolute left-0 right-0 bottom-0 px-3 pb-3 pointer-events-none">
        <div className="relative w-full flex justify-center">
          <div className="w-full max-w-[98%] pointer-events-auto">
            <ChatInputModern />
          </div>
        </div>
      </div>
    </div>
  );
}

// Modern chat input with icon button
function ChatInputModern() {
  const [input, setInput] = React.useState("");
  const sendMessage = () => {
    if (!input.trim()) return;
    setInput("");
    // TODO: send message logic
  };
  return (
    <form className="flex items-center gap-2 bg-muted rounded-full px-3 py-2 shadow border" onSubmit={e => { e.preventDefault(); sendMessage(); }}>
      <input
        className="flex-1 rounded-full px-3 py-1.5 bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none text-base"
        value={input}
        onChange={e => setInput(e.target.value)}
        placeholder="Type a message..."
        autoComplete="off"
      />
      <button
        type="submit"
        className="p-2 rounded-full bg-primary hover:bg-primary/90 text-white flex items-center justify-center transition shadow focus:outline-none focus:ring-2 focus:ring-primary/40"
        aria-label="Send"
      >
        <Send className="w-5 h-5" />
      </button>
    </form>
  );
}

