"use client";

import React, { useState, useEffect, useRef } from "react";
import { useTabs } from "@/context/TabsContext";
import api from "@/utils/api";
import { getSocket, disconnectSocket } from "@/utils/socket";
import { useAuth } from "@/lib/auth";
import { 
  User, 
  Wifi, 
  WifiOff, 
  Circle, 
  Clock,
  Settings
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function AgentToolsBar() {
  const { user } = useAuth();
  const { connectToChat, openTab } = useTabs();
  const agentId = user?._id;
  const businessId = user?.businessId;

  // Agent status states
  const [isOnline, setIsOnline] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);
  const [customerInQueue, setCustomerInQueue] = useState(false);
  const [connected, setConnected] = useState(false);
  const [escalationDetails, setEscalationDetails] = useState<any>(null);
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
              
              // Open new tab with case details
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

      // Listen for agent status updates from backend
      socket.on("agent_status_update", ({ agentId: updatedAgentId, status }) => {
        console.log("[AgentToolsBar] agent_status_update event received", { updatedAgentId, status });
        if (updatedAgentId === agentId) {
          // Update local state based on status
          switch (status) {
            case 'offline':
              setIsOnline(false);
              setIsAvailable(false);
              setConnected(false);
              setEscalationDetails(null);
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
              // Don't clear escalation details here - let handleEndChat do it
              break;
            case 'in-chat':
              setIsOnline(true);
              setIsAvailable(false);
              setConnected(true);
              break;
          }
        }
      });

      return () => {
        socket.off("chat_started");
        socket.off("agent_joined", handleAgentJoined);
        socket.off("customer_waiting");
        socket.off("agent_status_update");
      };
    } else {
      if (socketRef.current) {
        disconnectSocket();
        socketRef.current = null;
      }
    }
  }, [isOnline, agentId, businessId, connectToChat, openTab]);

  const goAvailable = () => {
    setIsAvailable(true);
    const socket = getSocket();
    socket.emit("update_status", { businessId, agentId, status: "available" });
  };

  const goUnavailable = () => {
    setIsAvailable(false);
    const socket = getSocket();
    socket.emit("update_status", { businessId, agentId, status: "away" });
  };

  const goOffline = () => {
    setIsOnline(false);
    setIsAvailable(false);
    const socket = getSocket();
    socket.emit("update_status", { businessId, agentId, status: "offline" });
    disconnectSocket();
  };

  const handleEndChat = () => {
    const socket = getSocket();
    socket.emit('end_chat', { escalationId: escalationDetails?._id, agentId });
    
    // Clear local chat state immediately
    setConnected(false);
    setEscalationDetails(null);
    
    // Don't manually set status here - the backend will handle it and send 'agent_status_update' event
    // The agent_status_update listener will automatically update the status to 'away'
  };

  const getStatus = () => {
    if (!isOnline) return { text: "Offline", color: "bg-gray-500", icon: WifiOff };
    if (connected) return { text: "In Chat", color: "bg-blue-500", icon: Circle };
    if (isAvailable) return { text: "Available", color: "bg-green-500", icon: Circle };
    return { text: "Online", color: "bg-yellow-500", icon: Circle };
  };

  const status = getStatus();
  const StatusIcon = status.icon;

  return (
    <div className="border-t bg-background/95 backdrop-blur-sm shadow-lg">
      <div className="flex items-center justify-between px-4 py-2">
        {/* Left side - Agent status */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm">
            <StatusIcon className="w-4 h-4" />
            <span>{status.text}</span>
            {connected && escalationDetails && (
              <span className="text-muted-foreground">
                - {escalationDetails.customerName}
              </span>
            )}
          </div>

          {/* Status Controls */}
          {!isOnline ? (
            <Button
              onClick={() => {
                setIsOnline(true);
                const socket = getSocket();
                socket.emit("update_status", { businessId, agentId, status: "online" });
              }}
              size="sm"
              className="flex items-center gap-2"
            >
              <Wifi className="w-4 h-4" />
              Go Online
            </Button>
          ) : !isAvailable && !connected ? (
            <div className="flex gap-2">
              <Button
                onClick={goAvailable}
                className="bg-green-500 hover:bg-green-600"
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
            <div className="flex items-center gap-4">
              <div className="text-sm text-muted-foreground flex items-center gap-2">
                <div className="animate-pulse w-2 h-2 bg-green-500 rounded-full" />
                Waiting for customer...
              </div>
              <Button
                onClick={goUnavailable}
                variant="outline"
                size="sm"
              >
                <Clock className="w-4 h-4 mr-2" />
                Go Away
              </Button>
            </div>
          ) : connected ? (
            <div className="flex items-center gap-2">
              <div className="text-sm text-green-600 bg-green-50 dark:bg-green-900/20 px-3 py-1 rounded-md">
                ✓ Connected to chat
              </div>
              <Button
                onClick={handleEndChat}
                variant="outline"
                size="sm"
                className="text-xs"
              >
                End Chat
              </Button>
            </div>
          ) : null}
        </div>

        {/* Right side - Agent info and tools */}
        <div className="flex items-center gap-4">
          <div className="text-xs text-muted-foreground">
            {user?.name} • ID: {agentId}
          </div>
          
        </div>
      </div>
    </div>
  );
}
