"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useChatTabs } from "../context/ChatTabsContext";
import ChatWindow from "../app/dashboard/chat/components/ChatWindow";
import api from "../utils/api";
import { getSocket, disconnectSocket } from "../utils/socket";
import { useAuth } from "@/lib/auth";
import { 
  Minus, 
  X, 
  User, 
  Wifi, 
  WifiOff, 
  Circle, 
  Clock,
  MessageSquare,
  Settings
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";


export default function ChatTabsBar() {
  const router = useRouter();
  const { user } = useAuth();
  const { tabs, closeTab } = useChatTabs();
  const agentId = user?._id;
  const businessId = user?.businessId;

  // Agent tool tab state
  const [agentToolVisible, setAgentToolVisible] = useState(false);
  const [agentToolMinimized, setAgentToolMinimized] = useState(false);

  // Agent status states
  const [isOnline, setIsOnline] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);
  const [customerInQueue, setCustomerInQueue] = useState(false);
  const [connected, setConnected] = useState(false);
  const [chatRoom, setChatRoom] = useState<string | null>(null);
  const [customer, setCustomer] = useState<{ id: number; name: string; avatar: string; sessionId?: string } | null>(null);
  const [escalationDetails, setEscalationDetails] = useState<any>(null);
  const socketRef = useRef<any>(null);
  console.log(escalationDetails)
  // Connect/disconnect socket
  useEffect(() => {
    if (isOnline) {
      const socket = getSocket();
      socketRef.current = socket;
      socket.emit("join_status", { businessId, agentId });
      console.log(`[Agent] join_status emitted: agentId=${agentId}, businessId=${businessId}, socketId=${socket.id}`);

      // Listen for chat assignment
      socket.on("chat_started", async ({ agentId: assignedAgentId, escalationId, room }) => {
        console.log("[Agent] chat_started event received", { assignedAgentId, escalationId, room });
        if (assignedAgentId === agentId) {
          console.log("[Agent] This agent is assigned to the chat. Joining room:", room);
          setConnected(true);
          setChatRoom(room);
          let sessionId = undefined;
          let customerName = `Customer ${escalationId}`;
          let escalation = null;
          if (escalationId) {
            try {
              const res = await api.get(`/escalation/${escalationId}`);
              sessionId = res.data.sessionId;
              if (res.data.customerName) customerName = res.data.customerName;
              escalation = res.data;
              setEscalationDetails(res.data);
              console.log("[Agent] Escalation details fetched", res.data);
            } catch (err) {
              console.error("[Agent] Failed to fetch escalation details", err);
            }
            router.push(`/dashboard/escalations/${escalationId}`);
          }
         
        }
      });

      // Listen for agent_joined event for confirmation/debugging
      const handleAgentJoined = (data: { agentId: string; escalationId: string; room: string; joinedAt: number }) => {
        console.log("[Agent] agent_joined event received", data);
        if (data.agentId === agentId) {
          // Optionally, you could update state/UI here if needed
        }
      };
      socket.on("agent_joined", handleAgentJoined);

      // Listen for customer queue (optional: backend can emit this)
      socket.on("customer_waiting", () => {
        console.log("[Agent] customer_waiting event received");
        setCustomerInQueue(true);
      });

      socket.on("connect", () => {
        console.log("[Agent] Socket connected", socket.id);
      });
      socket.on("disconnect", () => {
        console.log("[Agent] Socket disconnected", socket.id);
      });

      return () => {
        socket.off("chat_started");
        socket.off("agent_joined", handleAgentJoined);
        socket.off("customer_waiting");
        socket.off("connect");
        socket.off("disconnect");
        disconnectSocket();
      };
    }
  }, [isOnline, agentId, businessId]);


  // Set agent available for chat
  const goAvailable = () => {
    setIsAvailable(true);
    setCustomerInQueue(false);
    socketRef.current?.emit("update_status", { businessId, agentId, status: "available" });
  };

  // Set agent unavailable (busy)
  const goUnavailable = () => {
    setIsAvailable(false);
    socketRef.current?.emit("update_status", { businessId, agentId, status: "busy" });
  };

  // Go offline
  const goOffline = () => {
    setIsOnline(false);
    setIsAvailable(false);
    setConnected(false);
    setChatRoom(null);
    setCustomer(null);
    socketRef.current?.emit("update_status", { businessId, agentId, status: "offline" });
    disconnectSocket();
  };

  // End chat
  // End chat and cleanup
  const handleEndChat = () => {
    const socket = getSocket();
    socket.emit('end_chat', { escalationId: escalationDetails?._id, agentId });
    
    setConnected(false);
    setChatRoom(null);
    setCustomer(null);
    setEscalationDetails(null);
    setIsAvailable(false);
    
    // After ending, agent can go available again
    goAvailable();
  };

  const handleCloseChat = () => {
    closeTab(escalationDetails?._id || '');
    handleEndChat();
  };

  // Get agent status display
  const getAgentStatus = () => {
    if (!isOnline) return { text: "Offline", color: "bg-gray-500", icon: WifiOff };
    if (connected) return { text: "In Chat", color: "bg-blue-500", icon: MessageSquare };
    if (isAvailable) return { text: "Available", color: "bg-green-500", icon: Circle };
    return { text: "Unavailable", color: "bg-yellow-500", icon: Clock };
  };

  const status = getAgentStatus();
  const StatusIcon = status.icon;

  // Agent Tool Panel Component
  const AgentToolPanel = () => (
    <div className="bg-background border border-border rounded-t-lg shadow-lg w-80">
      {/* Tab header */}
      <div className="flex items-center justify-between p-3 border-b border-border">
        <div className="flex items-center gap-2">
      
          <Badge variant="secondary" className={`text-xs ${status.color} text-white`}>
            <StatusIcon className="w-3 h-3 mr-1" />
            {status.text}
          </Badge>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={() => setAgentToolMinimized(!agentToolMinimized)}
          >
            <Minus className="w-3 h-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={() => setAgentToolVisible(false)}
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* Tab content */}
      {!agentToolMinimized && (
        <div className="p-4 space-y-4">
          {/* Agent Status */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Agent Status</h4>
            <div className="flex items-center gap-2 text-sm">
              <div className={`w-2 h-2 rounded-full ${status.color}`} />
              <span>{status.text}</span>
              {connected && escalationDetails && (
                <span className="text-muted-foreground">
                  - {escalationDetails.customerName}
                </span>
              )}
            </div>
          </div>

          {/* Status Controls */}
          <div className="space-y-2">
            {!isOnline ? (
              <Button
                onClick={() => setIsOnline(true)}
                className="w-full"
                size="sm"
              >
                <Wifi className="w-4 h-4 mr-2" />
                Go Online
              </Button>
            ) : !isAvailable && !connected ? (
              <div className="flex gap-2">
                <Button
                  onClick={goAvailable}
                  className="flex-1 bg-green-500 hover:bg-green-600"
                  size="sm"
                >
                  <Circle className="w-4 h-4 mr-2" />
                  Available
                </Button>
                <Button
                  onClick={goOffline}
                  variant="outline"
                  size="sm"
                >
                  <WifiOff className="w-4 h-4 mr-2" />
                  Offline
                </Button>
              </div>
            ) : isAvailable && !connected ? (
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground flex items-center gap-2">
                  <div className="animate-pulse w-2 h-2 bg-green-500 rounded-full" />
                  Waiting for customer...
                </div>
                <Button
                  onClick={goUnavailable}
                  variant="outline"
                  className="w-full"
                  size="sm"
                >
                  <Clock className="w-4 h-4 mr-2" />
                  Go Unavailable
                </Button>
              </div>
            ) : connected ? (
              <Button
                onClick={handleEndChat}
                variant="destructive"
                className="w-full"
                size="sm"
              >
                <X className="w-4 h-4 mr-2" />
                End Chat
              </Button>
            ) : null}
          </div>

          {/* Agent Info */}
          <div className="pt-2 border-t border-border">
            <div className="text-xs text-muted-foreground space-y-1">
              <div>Agent: {user?.firstName} {user?.lastName}</div>
              <div>ID: {agentId}</div>
              <div>Business: {businessId}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      {/* Chat windows and agent tool panel positioned above the tab bar */}
      <div className="absolute bottom-12 left-0 right-0 flex justify-end items-end gap-4 px-4 pointer-events-none">
        {/* Active chat windows */}
        {connected && escalationDetails && (
          <div className="pointer-events-auto">
            <ChatWindow 
              id={escalationDetails._id} 
              name={escalationDetails.customerName} 
              avatar={escalationDetails.customerName?.charAt(0).toUpperCase() || 'C'} 
              businessId={escalationDetails.businessId} 
              sessionId={escalationDetails.sessionId} 
            />
          </div>
        )}

        {/* Agent Tool Panel */}
        {agentToolVisible && (
          <div className="pointer-events-auto">
            <AgentToolPanel />
          </div>
        )}
      </div>

      {/* Bottom tab bar - full width */}
      <div className="w-full bg-background/95 backdrop-blur-sm border-t border-border shadow-lg">
        <div className="flex items-center justify-between px-4 py-2">
          {/* Left side - Chat tabs */}
          <div className="flex items-center gap-2 flex-1">
            {tabs.length === 0 && !connected && !agentToolVisible && (
              <span className="text-sm text-muted-foreground">No active chats</span>
            )}
            
            {/* Active chat tab */}
            {connected && escalationDetails && (
              <div className="flex items-center gap-2 bg-blue-100 dark:bg-blue-900/50 px-3 py-1 rounded-md">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium">
                  {escalationDetails.customerName || 'Customer'}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 ml-1"
                  onClick={handleEndChat}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            )}
          </div>

          {/* Right side - Agent tool tab */}
          <div className="flex items-center gap-2">
            {/* Agent status indicator */}
            <div className="flex items-center gap-2 text-sm">
              <StatusIcon className="w-4 h-4" />
              <span className="hidden sm:inline">{status.text}</span>
            </div>

            {/* Agent Tool Tab */}
            <Button
              variant={agentToolVisible ? "default" : "outline"}
              size="sm"
              className="flex items-center gap-2"
              onClick={() => {
                if (agentToolVisible) {
                  if (agentToolMinimized) {
                    setAgentToolMinimized(false);
                  } else {
                    setAgentToolVisible(false);
                  }
                } else {
                  setAgentToolVisible(true);
                  setAgentToolMinimized(false);
                }
              }}
            >
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Agent Tools</span>
              {agentToolVisible && agentToolMinimized && (
                <Badge variant="secondary" className="ml-1 h-4 w-4 p-0 text-xs">
                  -
                </Badge>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
