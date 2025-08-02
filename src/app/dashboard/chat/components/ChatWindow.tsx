"use client"

import React, { useRef, useEffect, useContext, useState } from "react";
import ChatMessage from "./ChatMessage";
import { useTabs } from "../../../../context/TabsContext";
import { Send, User, AlertCircle, Clock } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import api from "@/utils/api";
import { getSocket } from "@/utils/socket";

interface ChatWindowProps {
  id: string;
  name: string;
  avatar: string;
  businessId: string;
  sessionId?: string;
  onClose?: () => void; // Add close callback
  onEndChat?: () => void; // Add end chat callback
}

export default function ChatWindow({ id, name, avatar, businessId, sessionId, onClose, onEndChat }: ChatWindowProps) {
  const user = useAuth().user;
  const agentId = user?._id;
  const bottomRef = useRef<HTMLDivElement>(null);
  const { closeTab, chatWindowState, disconnectFromChat, addChatMessage } = useTabs();
  const [sending, setSending] = useState(false);
  const [customerTyping, setCustomerTyping] = useState(false);
  const [escalationDetails, setEscalationDetails] = useState<any>(null);

  // Get data from persistent state
  const messages = chatWindowState.messages || [];
  const connected = chatWindowState.connected || false;

  // Load escalation details
  useEffect(() => {
    const loadEscalationDetails = async () => {
      try {
        const res = await api.get(`/escalation/${id}`);
        setEscalationDetails(res.data);
      } catch (err) {
        console.error('[ChatWindow] Failed to load escalation details:', err);
      }
    };
    loadEscalationDetails();
  }, [id]);

  // Listen for typing indicators (still need this for UI updates)
  useEffect(() => {
    if (!sessionId || !id || !agentId) return;
    
    const socket = getSocket();

    // Listen for typing indicators
    const handleCustomerTyping = (data: any) => {
      console.log('[ChatWindow] Customer typing event:', data);
      if (data.escalationId === id && data.senderType === 'customer') {
        setCustomerTyping(true);
        setTimeout(() => setCustomerTyping(false), 3000);
      }
    };

    socket.on("customer_typing", handleCustomerTyping);

    return () => {
      socket.off("customer_typing", handleCustomerTyping);
    };
  }, [sessionId, id, agentId]);

  // Auto scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, customerTyping]);

  const handleCloseChat = () => {
    if (agentId) {
      disconnectFromChat(agentId);
    }
    closeTab(id);
    onEndChat?.(); // Call the parent end chat callback
    onClose?.(); // Also call the close callback
  };

  return (
    <div className="flex flex-col h-full w-full overflow-hidden">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-3 bg-muted/10">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
            <User className="w-12 h-12 mb-2 opacity-50" />
            <span>No messages yet</span>
            <span className="text-xs">Start the conversation!</span>
          </div>
        ) : (
          messages.map((msg: any) => (
            <ChatMessage
              key={msg._id}
              sender={msg.senderType}
              text={msg.message}
              time={new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            />
          ))
        )}
        
        {/* Typing indicator */}
        {customerTyping && (
          <div className="flex justify-start">
            <div className="max-w-xs px-4 py-2 rounded-lg bg-muted text-muted-foreground text-sm">
              <div className="flex items-center gap-1">
                <span>Customer is typing</span>
                <div className="flex gap-1">
                  <div className="w-1 h-1 bg-current rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                  <div className="w-1 h-1 bg-current rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                  <div className="w-1 h-1 bg-current rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={bottomRef} />
      </div>

      {/* Input Area */}
      <div className="p-3 border-t bg-background">
        <ChatInputModern
          businessId={businessId}
          sessionId={sessionId}
          agentId={agentId || ''}
          escalationId={id}
          onMessageSent={() => {
            // Message is handled by socket events now
          }}
          sending={sending}
          setSending={setSending}
        />
      </div>
    </div>
  );
}

// Modern chat input with icon button
interface ChatInputModernProps {
  businessId: string;
  sessionId?: string;
  agentId: string;
  escalationId: string;
  onMessageSent: () => void;
  sending: boolean;
  setSending: (sending: boolean) => void;
}

function ChatInputModern({ businessId, sessionId, agentId, escalationId, onMessageSent, sending, setSending }: ChatInputModernProps) {
  const [input, setInput] = React.useState("");
  const { addChatMessage } = useTabs();
  
  const sendMessage = async () => {
    if (!input.trim() || !sessionId || !agentId) return;
    
    setSending(true);
    try {
      const response = await api.post("/chat/send-message", {
        businessId,
        sessionId,
        message: input,
        senderType: "agent",
        agentId,
        escalationId
      });
      
      // Add the message to persistent state (backend will also emit via socket)
      if (response.data?.data) {
        addChatMessage(response.data.data);
      }
      
      setInput("");
      onMessageSent();
      
      // Emit typing stopped
      const socket = getSocket();
      socket.emit('agent_stopped_typing', { escalationId, agentId });
    } catch (err) {
      console.error('[ChatInputModern] Error sending message:', err);
    } finally {
      setSending(false);
    }
  };

  // Handle typing events
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    
    // Emit typing event
    const socket = getSocket();
    socket.emit('agent_typing', { escalationId, agentId });
  };

  return (
    <form 
      className="flex items-center gap-2 bg-muted/50 rounded-full px-3 py-2 border" 
      onSubmit={e => { e.preventDefault(); sendMessage(); }}
    >
      <input
        className="flex-1 rounded-full px-3 py-1.5 bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none text-sm"
        value={input}
        onChange={handleInputChange}
        placeholder="Type your message..."
        autoComplete="off"
        disabled={sending || !sessionId}
      />
      <Button
        type="submit"
        size="sm"
        disabled={sending || !input.trim() || !sessionId}
        className="rounded-full p-2 h-8 w-8"
      >
        {sending ? (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground"></div>
        ) : (
          <Send className="w-4 h-4" />
        )}
      </Button>
    </form>
  );
}

