"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useChatTabs } from "../context/ChatTabsContext";
import { useTabs } from "@/context/TabsContext";
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
  const { openTab, chatWindowState, setChatWindowState, connectToChat } = useTabs();
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
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const socketRef = useRef<any>(null);

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
              
              // Use the new connectToChat function for persistent connection
              if (agentId) {
                connectToChat(
                  escalationId, 
                  res.data.sessionId, 
                  res.data.businessId, 
                  res.data.customerName,
                  agentId
                );
              }
              
              // Open new tab with case details instead of routing
              openTab({
                title: `Case ${res.data.caseNumber || escalationId}`,
                type: 'case-details',
                data: {
                  type: 'escalation',
                  escalationId: escalationId,
                  caseId: res.data.caseNumber || escalationId,
                  customerName: res.data.customerName
                }
              });
            } catch (err) {
              console.error("[Agent] Failed to fetch escalation details", err);
            }
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

      // Listen for new messages to show notification
      socket.on("new_message", (message) => {
        console.log("[Agent] new_message event received", message);
        if (message.escalationId === escalationDetails?._id && message.senderType === 'customer') {
          // Only show notification if chat window is not visible
          if (!chatWindowState.visible) {
            setHasNewMessage(true);
          }
        }
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
        socket.off("new_message");
        socket.off("connect");
        socket.off("disconnect");
        disconnectSocket();
      };
    }
  }, [isOnline, agentId, businessId, escalationDetails?._id, chatWindowState.visible]);

  // Restore chat connection on component mount if there's persistent chat state
  useEffect(() => {
    if (chatWindowState.escalationId && isOnline && !connected) {
      // Restore escalation details and connection
      const restoreChat = async () => {
        try {
          const res = await api.get(`/escalation/${chatWindowState.escalationId}`);
          setEscalationDetails(res.data);
          setConnected(true);
          setChatRoom(`chat_${chatWindowState.escalationId}`);
          console.log("[Agent] Restored chat connection", res.data);
        } catch (err) {
          console.error("[Agent] Failed to restore chat connection", err);
          // Clear invalid chat state
          setChatWindowState({ visible: false });
        }
      };
      restoreChat();
    }
  }, [chatWindowState.escalationId, isOnline, connected, setChatWindowState]);


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
    setChatWindowState({ 
      visible: false,
      escalationId: undefined,
      customerName: undefined,
      sessionId: undefined,
      businessId: undefined
    });
    setHasNewMessage(false);
    
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
              <div className="text-sm text-green-600 bg-green-50 dark:bg-green-900/20 px-3 py-1 rounded-md">
                ✓ Connected to chat
              </div>
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
      {/* Chat Window - positioned above the tab bar when visible */}
      {chatWindowState.visible && connected && escalationDetails && (
        <div className="absolute bottom-12 right-4 pointer-events-auto">
          <ChatWindow 
            id={escalationDetails._id} 
            name={escalationDetails.customerName} 
            avatar={escalationDetails.customerName?.charAt(0).toUpperCase() || 'C'} 
            businessId={escalationDetails.businessId} 
            sessionId={escalationDetails.sessionId}
            onClose={() => setChatWindowState({ visible: false })}
            onEndChat={handleEndChat}
          />
        </div>
      )}

      {/* Agent Tool Panel - positioned above the tab bar when visible */}
      {agentToolVisible && (
        <div className="absolute bottom-12 left-4 pointer-events-auto">
          <AgentToolPanel />
        </div>
      )}

      {/* Bottom tab bar - full width */}
      <div className="w-full bg-background/95 backdrop-blur-sm border-t border-border shadow-lg">
        <div className="flex items-center justify-between px-4 py-2">
          {/* Left side - Agent Tools */}
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

          {/* Center - Status message */}
          <div className="flex-1 flex items-center justify-center">
            {!connected && !agentToolVisible && (
              <span className="text-sm text-muted-foreground">No active chats</span>
            )}
            {connected && escalationDetails && (
              <span className="text-xs text-muted-foreground">
                Connected to {escalationDetails.customerName || 'Customer'}
              </span>
            )}
          </div>

          {/* Right side - Chat section */}
          <div className="flex items-center gap-2">
            {/* Active chat tab */}
            {connected && escalationDetails && (
              <div 
                className={`flex items-center gap-2 px-3 py-1 rounded-md cursor-pointer transition-all duration-200 ${
                  hasNewMessage 
                    ? 'bg-orange-100 dark:bg-orange-900/50 blink-orange' 
                    : 'bg-blue-100 dark:bg-blue-900/50'
                }`}
                onClick={() => {
                  setChatWindowState({ visible: !chatWindowState.visible });
                  if (hasNewMessage) {
                    setHasNewMessage(false);
                  }
                }}
              >
                <div className={`w-2 h-2 rounded-full ${
                  hasNewMessage ? 'bg-orange-500 blink-orange' : 'bg-blue-500'
                }`} />
                <MessageSquare className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {escalationDetails.customerName || 'Customer'}
                </span>
                {hasNewMessage && (
                  <Badge variant="destructive" className="ml-1 h-4 w-4 p-0 text-xs blink-orange">
                    !
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
