"use client"

import React from "react";
import { Badge } from "@/components/ui/badge";
import { User, Bot, CheckCircle2, UserPlus, UserMinus, MessageCircle, PhoneOff } from "lucide-react";

interface ChatMessageProps {
  sender: 'customer' | 'agent' | 'ai' | 'system';
  text: string;
  time: string;
  systemMessageType?: string;
}

export default function ChatMessage({ sender, text, time, systemMessageType }: ChatMessageProps) {
  const isAgent = sender === "agent";
  const isSystem = sender === "system";
  const isAI = sender === "ai";
  
  // Get system message icon based on type
  const getSystemMessageIcon = () => {
    switch (systemMessageType) {
      case 'agent_joined':
      case 'agent_assigned':
        return <UserPlus className="w-4 h-4" />;
      case 'agent_left':
        return <UserMinus className="w-4 h-4" />;
      case 'customer_joined':
        return <User className="w-4 h-4" />;
      case 'customer_left':
        return <UserMinus className="w-4 h-4" />;
      case 'chat_started':
        return <MessageCircle className="w-4 h-4" />;
      case 'chat_ended':
        return <PhoneOff className="w-4 h-4" />;
      default:
        return "!";
    }
  };

  // System messages should be centered
  if (isSystem) {
    return (
      <div className="flex justify-center items-center my-2">
        <div className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-3 py-1 rounded-full text-xs text-center">
          {text}
        </div>
      </div>
    );
  }
  
  return (
    <div className={`flex ${isAgent ? "justify-end" : "justify-start"} items-start gap-2`}>
      {!isAgent && (
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
          isSystem 
            ? "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
            : isAI
            ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
            : "bg-muted text-muted-foreground"
        }`}>
          {isSystem ? getSystemMessageIcon() : isAI ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
        </div>
      )}
      
      <div className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg shadow-sm ${
        isAgent 
          ? "bg-primary text-primary-foreground rounded-br-sm" 
          : isSystem
          ? "bg-gray-50 border border-gray-200 text-gray-700 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300 rounded-bl-sm"
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
