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
  const [currentStatus, setCurrentStatus] = useState<'offline' | 'online' | 'available' | 'away' | 'in-chat'>('offline');
  const [hasActiveChat, setHasActiveChat] = useState(false); // Track if there's an active chat session
  console.log("status: ", currentStatus);
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
          setCurrentStatus('in-chat'); // Agent is now in chat
          setHasActiveChat(true); // Mark that we have an active chat
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

      // Listen for system messages
      socket.on("system_message", (message) => {
        console.log("[Agent] system_message event received", message);
        // System messages can be shown as notifications or logged for awareness
        if (message.escalationId === escalationDetails?._id) {
          // You can add specific handling for different system message types here
          console.log(`[Agent] System message: ${message.message} (${message.systemMessageType})`);
        }
      });

      // Listen for agent status updates from backend
      socket.on("agent_status_update", ({ agentId: updatedAgentId, status }) => {
        console.log("[Agent] agent_status_update event received", { updatedAgentId, status });
        if (updatedAgentId === agentId) {
          setCurrentStatus(status);
          // Update local state based on status
          switch (status) {
            case 'offline':
              setIsOnline(false);
              setIsAvailable(false);
              setConnected(false);
              // Clear chat states when going offline
              setChatRoom(null);
              setEscalationDetails(null);
              setHasNewMessage(false);
              break;
            case 'online':
              setIsOnline(true);
              setIsAvailable(false);
              setConnected(false);
              break;
            case 'available':
              setIsOnline(true);
              setIsAvailable(true);
              setConnected(false);
              break;
            case 'away':
              setIsOnline(true);
              setIsAvailable(false);
              setConnected(false);
              // Don't clear chat states here - let handleEndChat do it
              // This allows the end chat button to remain visible
              break;
            case 'in-chat':
              setIsOnline(true);
              setIsAvailable(false);
              setConnected(true);
              break;
          }
        }
      });

      // Listen for agent disconnection during chat
      socket.on("agent_disconnected_during_chat", ({ agentId: disconnectedAgentId, escalationId, message }) => {
        console.log("[Agent] agent_disconnected_during_chat event received", { disconnectedAgentId, escalationId, message });
        if (disconnectedAgentId === agentId) {
          // Show notification to agent about their disconnection (for debugging/awareness)
          console.warn("[Agent] You were disconnected during an active chat:", message);
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
        socket.off("system_message");
        socket.off("agent_status_update");
        socket.off("agent_disconnected_during_chat");
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
    setCurrentStatus('available');
    socketRef.current?.emit("update_status", { businessId, agentId, status: "available" });
  };

  // Set agent unavailable (away)
  const goUnavailable = () => {
    setIsAvailable(false);
    setCurrentStatus('away');
    socketRef.current?.emit("update_status", { businessId, agentId, status: "away" });
  };

  // Go offline
  const goOffline = () => {
    setIsOnline(false);
    setIsAvailable(false);
    setConnected(false);
    setChatRoom(null);
    setCustomer(null);
    setCurrentStatus('offline');
    socketRef.current?.emit("update_status", { businessId, agentId, status: "offline" });
    disconnectSocket();
  };

  // End chat
  // End chat and cleanup
  const handleEndChat = () => {
    const socket = getSocket();
    socket.emit('end_chat', { escalationId: escalationDetails?._id, agentId });
    
    // Clear local chat state immediately
    setConnected(false);
    setChatRoom(null);
    setCustomer(null);
    setEscalationDetails(null);
    setHasActiveChat(false); // Clear active chat flag
    setChatWindowState({ 
      visible: false,
      escalationId: undefined,
      customerName: undefined,
      sessionId: undefined,
      businessId: undefined
    });
    setHasNewMessage(false);
    
    // Don't manually set status here - the backend will handle it and send 'agent_status_update' event
    // The agent_status_update listener will automatically update the status to 'away'
  };

  const handleCloseChat = () => {
    closeTab(escalationDetails?._id || '');
    handleEndChat();
  };

  // Get agent status display
  const getAgentStatus = () => {
    switch (currentStatus) {
      case 'offline':
        return { text: "Offline", color: "bg-gray-500", icon: WifiOff };
      case 'online':
        return { text: "Online", color: "bg-blue-400", icon: Wifi };
      case 'available':
        return { text: "Available", color: "bg-green-500", icon: Circle };
      case 'away':
        return { text: "Away", color: "bg-yellow-500", icon: Clock };
      case 'in-chat':
        return { text: "In Chat", color: "bg-blue-600", icon: MessageSquare };
      default:
        return { text: "Offline", color: "bg-gray-500", icon: WifiOff };
    }
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
              {currentStatus === 'in-chat' && escalationDetails && (
                <span className="text-muted-foreground">
                  - {escalationDetails.customerName}
                </span>
              )}
            </div>
          </div>

          {/* Status Controls */}
          <div className="space-y-2">
            {currentStatus === 'offline' ? (
              <Button
                onClick={() => {
                  setIsOnline(true);
                  setCurrentStatus('online');
                  // Emit status update to backend
                  socketRef.current?.emit("update_status", { businessId, agentId, status: "online" });
                }}
                className="w-full"
                size="sm"
              >
                <Wifi className="w-4 h-4 mr-2" />
                Go Online
              </Button>
            ) : currentStatus === 'online' || currentStatus === 'away' ? (
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
            ) : currentStatus === 'available' ? (
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
                  Go Away
                </Button>
              </div>
            ) : currentStatus === 'in-chat' ? (
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
      {chatWindowState.visible && escalationDetails && (
        <div className="absolute bottom-12 right-4 pointer-events-auto">
          <ChatWindow 
            id={escalationDetails._id} 
            name={escalationDetails.customerName} 
            avatar={escalationDetails.customerName?.charAt(0).toUpperCase() || 'C'} 
            businessId={escalationDetails.businessId} 
            sessionId={escalationDetails.sessionId}
            onClose={() => setChatWindowState({ visible: false })}
            onEndChat={handleCloseChat}
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
            {!escalationDetails && currentStatus !== 'in-chat' && !agentToolVisible && (
              <span className="text-sm text-muted-foreground">No active chats</span>
            )}
            {escalationDetails && (
              <span className="text-xs text-muted-foreground">
                Connected to {escalationDetails.customerName || 'Customer'}
              </span>
            )}
          </div>

          {/* Right side - Chat section */}
          <div className="flex items-center gap-2">
            {/* Active chat tab - show if we have an active chat session */}
            {hasActiveChat && (
              <>
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
                    {escalationDetails?.customerName || 'Customer'}
                  </span>
                  {hasNewMessage && (
                    <Badge variant="destructive" className="ml-1 h-4 w-4 p-0 text-xs blink-orange">
                      !
                    </Badge>
                  )}
                </div>
                
                {/* End Chat Button */}
                <Button
                  onClick={handleEndChat}
                  variant="outline"
                  size="sm"
                  className="text-xs px-2 py-1 h-7"
                >
                  End Chat
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
