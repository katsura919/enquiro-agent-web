"use client"

import React from "react";
import { Badge } from "@/components/ui/badge";
import { User, Bot, CheckCircle2 } from "lucide-react";

interface ChatMessageProps {
  sender: 'customer' | 'agent' | 'ai' | 'system';
  text: string;
  time: string;
}

export default function ChatMessage({ sender, text, time }: ChatMessageProps) {
  const isAgent = sender === "agent";
  const isSystem = sender === "system";
  const isAI = sender === "ai";
  
  return (
    <div className={`flex ${isAgent ? "justify-end" : "justify-start"} items-start gap-2`}>
      {!isAgent && (
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
          isSystem 
            ? "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
            : isAI
            ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
            : "bg-muted text-muted-foreground"
        }`}>
          {isSystem ? "!" : isAI ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
        </div>
      )}
      
      <div className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg shadow-sm ${
        isAgent 
          ? "bg-primary text-primary-foreground rounded-br-sm" 
          : isSystem
          ? "bg-orange-50 border border-orange-200 text-orange-900 dark:bg-orange-950 dark:border-orange-800 dark:text-orange-100 rounded-bl-sm"
          : isAI
          ? "bg-blue-50 border border-blue-200 text-blue-900 dark:bg-blue-950 dark:border-blue-800 dark:text-blue-100 rounded-bl-sm"
          : "bg-muted text-foreground rounded-bl-sm"
      }`}>
        <div className="text-sm whitespace-pre-wrap break-words">{text}</div>
        <div className={`flex items-center gap-1 mt-1 text-xs ${
          isAgent ? "text-primary-foreground/70 justify-end" : "text-muted-foreground"
        }`}>
          <span>{time}</span>
          {isAgent && <CheckCircle2 className="w-3 h-3" />}
        </div>
      </div>

      {isAgent && (
        <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium">
          <User className="w-4 h-4" />
        </div>
      )}
    </div>
  );
}
