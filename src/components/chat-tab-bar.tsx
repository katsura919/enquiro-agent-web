"use client";



import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useChatTabs } from "../context/ChatTabsContext";
import ChatWindow from "../app/dashboard/chat/components/ChatWindow";
import api from "../utils/api";
import { getSocket, disconnectSocket } from "../utils/socket";
import { useAuth } from "@/lib/auth";


export default function ChatTabsBar() {
  const router = useRouter();
  const { user } = useAuth();
  const { closeTab } = useChatTabs();
  const agentId = user?._id;
  const businessId = user?.businessId;

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

  return (
    <div className="fixed bottom-0 left-0 w-full z-50 flex flex-col items-center pointer-events-none">
      {/* Chat window when connected */}
      {connected && escalationDetails && (
        <div className="w-full max-w-md mb-2 pointer-events-auto">
          <ChatWindow 
            id={escalationDetails._id} 
            name={escalationDetails.customerName} 
            avatar={escalationDetails.customerName?.charAt(0).toUpperCase() || 'C'} 
            businessId={escalationDetails.businessId} 
            sessionId={escalationDetails.sessionId} 
          />
          <div className="flex justify-end mt-2">
            <button
              className="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600 text-sm"
              onClick={handleEndChat}
            >
              End Chat
            </button>
          </div>
        </div>
      )}
      {/* Bottom tab bar */}
      <div className="flex gap-2 bg-background/90 border-t border-border w-full max-w-md rounded-t-2xl px-2 py-2 shadow-2xl pointer-events-auto backdrop-blur-md justify-center min-h-[56px] items-center">
        {!isOnline ? (
          <button
            className="px-6 py-2 rounded-xl bg-primary text-white font-semibold shadow hover:bg-primary/80 transition"
            onClick={() => setIsOnline(true)}
          >
            Go Online
          </button>
        ) : !isAvailable && !connected ? (
          <>
            <button
              className="px-6 py-2 rounded-xl bg-green-500 text-white font-semibold shadow hover:bg-green-600 transition"
              onClick={goAvailable}
            >
              Go Available
            </button>
            <button
              className="ml-4 px-4 py-2 rounded-xl bg-secondary text-foreground font-semibold shadow hover:bg-accent/60 transition border border-border"
              onClick={goOffline}
            >
              Go Offline
            </button>
          </>
        ) : isAvailable && !connected ? (
          <>
            <span className="text-muted-foreground text-base">Waiting for customer...</span>
            <button
              className="ml-4 px-4 py-2 rounded-xl bg-yellow-500 text-white font-semibold shadow hover:bg-yellow-600 transition border border-border"
              onClick={goUnavailable}
            >
              Go Unavailable
            </button>
          </>
        ) : null}
      </div>
    </div>
  );
}
