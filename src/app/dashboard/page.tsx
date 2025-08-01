"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import AgentDashboard from "@/components/AgentDashboard";
import ChatNotification from "@/components/ChatNotification";
import { getSocket } from "@/utils/socket";
import api from "@/utils/api";

interface PendingNotification {
  escalationId: string;
  escalation: {
    customerName: string;
    concern: string;
    caseNumber: string;
  };
}

export default function DashboardPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState<PendingNotification[]>([]);

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login");
    }
  }, [user, isLoading, router]);

  // Listen for chat assignment notifications
  useEffect(() => {
    if (!user?.businessId) return;

    const socket = getSocket();
    
    const handleChatStarted = async ({ agentId, escalationId }: { agentId: string; escalationId: string }) => {
      if (agentId === user._id) {
        try {
          // Fetch escalation details for notification
          const response = await api.get(`/escalation/${escalationId}`);
          const escalation = response.data;
          
          setNotifications(prev => [...prev, {
            escalationId,
            escalation: {
              customerName: escalation.customerName,
              concern: escalation.concern,
              caseNumber: escalation.caseNumber
            }
          }]);
        } catch (error) {
          console.error('[DashboardPage] Failed to fetch escalation details:', error);
        }
      }
    };

    socket.on('chat_started', handleChatStarted);

    return () => {
      socket.off('chat_started', handleChatStarted);
    };
  }, [user?._id, user?.businessId]);

  const handleChatAccept = (escalationId: string) => {
    // Remove notification
    setNotifications(prev => prev.filter(n => n.escalationId !== escalationId));
    
    // Navigate to escalation page
    router.push(`/dashboard/escalations/${escalationId}`);
  };

  const handleNotificationDismiss = (escalationId: string) => {
    setNotifications(prev => prev.filter(n => n.escalationId !== escalationId));
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Chat Notifications */}
      {notifications.map((notification) => (
        <ChatNotification
          key={notification.escalationId}
          escalationId={notification.escalationId}
          customerName={notification.escalation.customerName}
          concern={notification.escalation.concern}
          caseNumber={notification.escalation.caseNumber}
          onAccept={() => handleChatAccept(notification.escalationId)}
          onDismiss={() => handleNotificationDismiss(notification.escalationId)}
        />
      ))}

      {/* Main Dashboard */}
      <AgentDashboard onChatAccept={handleChatAccept} />
    </div>
  );
}
