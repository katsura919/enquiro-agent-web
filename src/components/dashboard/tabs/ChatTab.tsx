"use client";
import { Tab } from "@/context/TabsContext";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useTabs } from "@/context/TabsContext";
import {
  MessageSquare,
  Search,
  Plus,
  Clock,
  User,
  MoreVertical,
} from "lucide-react";

interface ChatTabProps {
  tab: Tab;
}

export function ChatTab({ tab }: ChatTabProps) {
  const { openTab, updateTab } = useTabs();
  const [searchQuery, setSearchQuery] = useState("");

  // Mock chat sessions data
  const chatSessions = [
    {
      id: "chat-1",
      customerName: "John Doe",
      customerEmail: "john@example.com",
      status: "active",
      lastMessage: "I need help with my order",
      timestamp: "2 minutes ago",
      unreadCount: 2,
    },
    {
      id: "chat-2",
      customerName: "Jane Smith",
      customerEmail: "jane@example.com",
      status: "waiting",
      lastMessage: "Thank you for your help!",
      timestamp: "15 minutes ago",
      unreadCount: 0,
    },
    {
      id: "chat-3",
      customerName: "Bob Wilson",
      customerEmail: "bob@example.com",
      status: "closed",
      lastMessage: "Issue resolved",
      timestamp: "1 hour ago",
      unreadCount: 0,
    },
  ];

  const filteredSessions = chatSessions.filter(session =>
    session.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    session.customerEmail.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openChatSession = (sessionId: string, customerName: string) => {
    openTab({
      title: `Chat - ${customerName}`,
      type: "chat",
      data: { sessionId, customerName },
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'waiting':
        return 'bg-yellow-500';
      case 'closed':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Active';
      case 'waiting':
        return 'Waiting';
      case 'closed':
        return 'Closed';
      default:
        return status;
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold">Chat Sessions</h1>
          <Button
            size="sm"
            onClick={() => openTab({ title: "New Chat", type: "chat", data: { new: true } })}
          >
            <Plus className="w-4 h-4 mr-2" />
            New Chat
          </Button>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search chats by customer name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Chat Sessions List */}
      <div className="flex-1 overflow-auto p-4">
        <div className="space-y-3">
          {filteredSessions.map((session) => (
            <Card
              key={session.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => openChatSession(session.id, session.customerName)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                    
                    {/* Chat Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium truncate">{session.customerName}</h3>
                        <Badge
                          variant="secondary"
                          className={`text-xs ${getStatusColor(session.status)} text-white border-0`}
                        >
                          {getStatusText(session.status)}
                        </Badge>
                        {session.unreadCount > 0 && (
                          <Badge variant="destructive" className="text-xs">
                            {session.unreadCount}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground truncate mb-1">
                        {session.customerEmail}
                      </p>
                      <p className="text-sm text-muted-foreground truncate">
                        {session.lastMessage}
                      </p>
                    </div>
                  </div>
                  
                  {/* Timestamp and Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {session.timestamp}
                    </div>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredSessions.length === 0 && (
          <div className="text-center py-12">
            <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No chat sessions found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery
                ? "Try adjusting your search terms"
                : "Start a new chat session to begin helping customers"}
            </p>
            {!searchQuery && (
              <Button
                onClick={() => openTab({ title: "New Chat", type: "chat", data: { new: true } })}
              >
                <Plus className="w-4 h-4 mr-2" />
                Start New Chat
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
