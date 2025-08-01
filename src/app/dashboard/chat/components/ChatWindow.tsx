"use client"

import React, { useRef, useEffect, useContext, useState } from "react";
import ChatMessage from "./ChatMessage";
import { useChatTabs } from "../../../../context/ChatTabsContext";
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
}

export default function ChatWindow({ id, name, avatar, businessId, sessionId }: ChatWindowProps) {
  const user = useAuth().user;
  const agentId = user?._id;
  const bottomRef = useRef<HTMLDivElement>(null);
  const { closeTab } = useChatTabs();
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [connected, setConnected] = useState(false);
  const [customerTyping, setCustomerTyping] = useState(false);
  const [escalationDetails, setEscalationDetails] = useState<any>(null);

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

  // Load chat messages
  useEffect(() => {
    if (!sessionId) return;
    setLoading(true);
    api.get(`/chat/session/${sessionId}`)
      .then(res => {
        setMessages(res.data);
      })
      .catch(err => {
        console.error('[ChatWindow] Failed to load messages:', err);
        setMessages([]);
      })
      .finally(() => setLoading(false));
  }, [sessionId]);

  // Socket connection and message handling
  useEffect(() => {
    if (!sessionId || !id) return;
    
    const socket = getSocket();
    const chatRoom = `chat_${id}`;
    
    // Join the chat room
    socket.emit('join_chat_room', { room: chatRoom, agentId, escalationId: id });
    setConnected(true);
    console.log(`[ChatWindow] Agent joined chat room: ${chatRoom}`);

    // Listen for new messages
    const handleNewMessage = (msg: any) => {
      console.log('[ChatWindow] New message received:', msg);
      if (msg.sessionId === sessionId || msg.escalationId === id) {
        setMessages(prev => {
          // Avoid duplicates
          if (prev.find(m => m._id === msg._id)) return prev;
          return [...prev, msg];
        });
      }
    };

    // Listen for typing indicators
    const handleCustomerTyping = (data: any) => {
      if (data.escalationId === id && data.senderType === 'customer') {
        setCustomerTyping(true);
        setTimeout(() => setCustomerTyping(false), 3000);
      }
    };

    // Listen for agent assignment confirmation
    const handleAgentJoined = (data: any) => {
      console.log('[ChatWindow] Agent joined confirmation:', data);
      if (data.agentId === agentId && data.escalationId === id) {
        setConnected(true);
      }
    };

    socket.on("new_message", handleNewMessage);
    socket.on("customer_typing", handleCustomerTyping);
    socket.on("agent_joined", handleAgentJoined);

    return () => {
      socket.off("new_message", handleNewMessage);
      socket.off("customer_typing", handleCustomerTyping);
      socket.off("agent_joined", handleAgentJoined);
      
      // Leave the chat room
      socket.emit('leave_chat_room', { room: chatRoom, agentId });
      console.log(`[ChatWindow] Agent left chat room: ${chatRoom}`);
    };
  }, [sessionId, id, agentId]);

  // Auto scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, customerTyping]);

  const handleCloseChat = () => {
    const socket = getSocket();
    socket.emit('end_chat', { escalationId: id, agentId });
    closeTab(id);
  };

  return (
    <Card className="relative flex flex-col h-full w-full max-w-lg min-h-[540px] min-w-[380px] rounded-2xl shadow-xl overflow-hidden mx-auto border m-6">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b bg-muted/30">
        <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
          {avatar || name.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-base truncate">{name}</span>
            {connected && (
              <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse" />
                Live
              </Badge>
            )}
          </div>
          {escalationDetails && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              <span>Case: {escalationDetails.caseNumber}</span>
              {sessionId && <span>• Session: {sessionId.slice(-8)}</span>}
            </div>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCloseChat}
          className="text-muted-foreground hover:text-foreground"
        >
          ✕
        </Button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-3 bg-muted/10">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-2"></div>
            <span>Loading conversation...</span>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
            <User className="w-12 h-12 mb-2 opacity-50" />
            <span>No messages yet</span>
            <span className="text-xs">Start the conversation!</span>
          </div>
        ) : (
          messages.map((msg) => (
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
    </Card>
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
  
  const sendMessage = async () => {
    if (!input.trim() || !sessionId || !agentId) return;
    
    setSending(true);
    try {
      await api.post("/chat/send-message", {
        businessId,
        sessionId,
        message: input,
        senderType: "agent",
        agentId,
        escalationId
      });
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

