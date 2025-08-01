"use client"

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  MessageCircle, 
  Clock, 
  User, 
  Phone, 
  Mail, 
  AlertCircle,
  CheckCircle2,
  Users
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import api from "@/utils/api";
import { getSocket } from "@/utils/socket";

interface QueueItem {
  _id: string;
  escalationId: string;
  businessId: string;
  status: 'waiting' | 'assigned' | 'completed';
  requestedAt: string;
  agentId?: string;
  escalation?: {
    customerName: string;
    customerEmail: string;
    customerPhone?: string;
    concern: string;
    caseNumber: string;
    description?: string;
  };
}

interface AgentDashboardProps {
  onChatAccept: (escalationId: string) => void;
}

export default function AgentDashboard({ onChatAccept }: AgentDashboardProps) {
  const { user } = useAuth();
  const [queueItems, setQueueItems] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [agentStats, setAgentStats] = useState({
    chatsToday: 0,
    avgResponseTime: 0,
    customerSatisfaction: 0
  });

  // Load queue data
  const loadQueue = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/queue/${user?.businessId}`);
      setQueueItems(response.data);
    } catch (error) {
      console.error('[AgentDashboard] Failed to load queue:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load agent statistics
  const loadStats = async () => {
    try {
      const response = await api.get(`/agent/${user?._id}/stats`);
      setAgentStats(response.data);
    } catch (error) {
      console.error('[AgentDashboard] Failed to load stats:', error);
    }
  };

  useEffect(() => {
    if (user?.businessId) {
      loadQueue();
      loadStats();

      // Set up real-time queue updates
      const socket = getSocket();
      
      const handleQueueUpdate = () => {
        loadQueue();
      };

      socket.on('queue_updated', handleQueueUpdate);
      socket.on('customer_waiting', handleQueueUpdate);
      socket.on('chat_started', handleQueueUpdate);

      return () => {
        socket.off('queue_updated', handleQueueUpdate);
        socket.off('customer_waiting', handleQueueUpdate);
        socket.off('chat_started', handleQueueUpdate);
      };
    }
  }, [user?.businessId]);

  const waitingCustomers = queueItems.filter(item => item.status === 'waiting');
  const assignedChats = queueItems.filter(item => item.status === 'assigned' && item.agentId === user?._id);

  const formatWaitTime = (requestedAt: string) => {
    const now = new Date();
    const requested = new Date(requestedAt);
    const diffMs = now.getTime() - requested.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return 'Just now';
    if (diffMins === 1) return '1 min';
    return `${diffMins} mins`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'waiting': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'assigned': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-64"></div>
          <div className="h-32 bg-muted rounded"></div>
          <div className="h-48 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold">Live Chat Dashboard</h1>
        <p className="text-muted-foreground">Manage your customer conversations</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <MessageCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Chats Today</p>
              <p className="text-2xl font-semibold">{agentStats.chatsToday}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <Clock className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Avg Response</p>
              <p className="text-2xl font-semibold">{agentStats.avgResponseTime}s</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Satisfaction</p>
              <p className="text-2xl font-semibold">{agentStats.customerSatisfaction}%</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Queue Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Waiting Customers */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-yellow-600" />
            <h2 className="text-lg font-semibold">Waiting Customers</h2>
            <Badge variant="secondary">{waitingCustomers.length}</Badge>
          </div>

          <div className="space-y-3">
            {waitingCustomers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No customers waiting</p>
              </div>
            ) : (
              waitingCustomers.map((item) => (
                <div key={item._id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{item.escalation?.customerName}</h3>
                        <Badge className={getStatusColor(item.status)}>
                          {item.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Case #{item.escalation?.caseNumber}
                      </p>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Waiting {formatWaitTime(item.requestedAt)}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <AlertCircle className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">{item.escalation?.concern}</span>
                    </div>
                    {item.escalation?.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {item.escalation.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {item.escalation?.customerEmail}
                      </div>
                      {item.escalation?.customerPhone && (
                        <div className="flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {item.escalation.customerPhone}
                        </div>
                      )}
                    </div>
                  </div>

                  <Button
                    onClick={() => onChatAccept(item.escalationId)}
                    className="w-full bg-green-600 hover:bg-green-700"
                    size="sm"
                  >
                    Accept Chat
                  </Button>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Active Chats */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <MessageCircle className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold">Active Chats</h2>
            <Badge variant="secondary">{assignedChats.length}</Badge>
          </div>

          <div className="space-y-3">
            {assignedChats.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No active chats</p>
              </div>
            ) : (
              assignedChats.map((item) => (
                <div key={item._id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{item.escalation?.customerName}</h3>
                        <Badge className={getStatusColor(item.status)}>
                          Active
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Case #{item.escalation?.caseNumber}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <AlertCircle className="w-4 h-4 text-muted-foreground" />
                    <span>{item.escalation?.concern}</span>
                  </div>

                  <Button
                    onClick={() => onChatAccept(item.escalationId)}
                    variant="outline"
                    className="w-full"
                    size="sm"
                  >
                    Open Chat
                  </Button>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
