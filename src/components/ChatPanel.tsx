"use client";

import React, { useState, useEffect } from "react";
import { useTabs } from "@/context/TabsContext";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import ChatWindow from "@/app/dashboard/chat/components/ChatWindow";
import { X, MessageSquare, User, Clock } from "lucide-react";

export default function ChatPanel() {
  const { user } = useAuth();
  const { chatWindowState, setChatWindowState, disconnectFromChat } = useTabs();
  const agentId = user?._id;
  const [showEndChatDialog, setShowEndChatDialog] = useState(false);

  // Monitor disconnection and auto-close panel
  useEffect(() => {
    // If chat is marked as disconnected, automatically end chat without dialog
    if (chatWindowState.disconnected && chatWindowState.escalationId && agentId) {
      console.log('[ChatPanel] Customer disconnected, auto-closing chat panel');
      // Call disconnectFromChat to ensure cleanup, but don't show dialog
      disconnectFromChat(agentId);
    }
  }, [chatWindowState.disconnected, chatWindowState.escalationId, agentId, disconnectFromChat]);

  // Don't render if no chat is active
  if (!chatWindowState.visible || !chatWindowState.escalationId) {
    return null;
  }

  const handleEndChat = () => {
    if (chatWindowState.escalationId && agentId) {
      disconnectFromChat(agentId);
      setShowEndChatDialog(false);
    }
  };

  return (
    <div className="w-96 border-l bg-background flex flex-col h-full min-h-0">
      {/* Chat Panel Header */}
      <div className="flex items-center justify-between p-4 border-b bg-muted/30 shrink-0">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm shrink-0">
            {chatWindowState.customerName?.charAt(0).toUpperCase() || 'C'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-base truncate">
                {chatWindowState.customerName || 'Customer'}
              </span>
              {chatWindowState.connected && (
                <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 shrink-0">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse" />
                  Live
                </Badge>
              )}
            </div>
          </div>
        </div>
        
        {/* End Chat with Confirmation Dialog */}
        <AlertDialog open={showEndChatDialog} onOpenChange={setShowEndChatDialog}>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 shrink-0"
              title="End Chat"
            >
              <X className="w-4 h-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>End Chat Session</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to end this chat session with {chatWindowState.customerName || 'the customer'}? 
                This action cannot be undone and will disconnect the customer.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleEndChat}
                className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
              >
                End Chat
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
      
      {/* Chat Content */}
      <div className="flex-1 overflow-hidden">
        {chatWindowState.escalationId && chatWindowState.sessionId && (
          <ChatWindow
            id={chatWindowState.escalationId}
            name={chatWindowState.customerName || 'Customer'}
            avatar=""
            businessId={chatWindowState.businessId || ''}
            sessionId={chatWindowState.sessionId}
            onEndChat={handleEndChat}
          />
        )}
      </div>
    </div>
  );
}
