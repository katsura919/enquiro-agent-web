"use client"

import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, X, Clock, User } from "lucide-react";

interface ChatNotificationProps {
  escalationId: string;
  customerName: string;
  concern: string;
  caseNumber: string;
  onAccept: () => void;
  onDismiss: () => void;
}

export default function ChatNotification({
  escalationId,
  customerName,
  concern,
  caseNumber,
  onAccept,
  onDismiss
}: ChatNotificationProps) {
  const [timeElapsed, setTimeElapsed] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="fixed top-4 right-4 w-96 p-4 border-l-4 border-l-blue-500 shadow-lg bg-background z-50 animate-in slide-in-from-right duration-300">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-full">
            <MessageCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">New Chat Request</h3>
            <Badge variant="secondary" className="text-xs">
              Case #{caseNumber}
            </Badge>
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onDismiss}
          className="h-6 w-6 p-0"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm">
          <User className="w-4 h-4 text-muted-foreground" />
          <span className="font-medium">{customerName}</span>
        </div>
        <div className="text-sm text-muted-foreground">
          <strong>Concern:</strong> {concern}
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="w-3 h-3" />
          <span>Waiting: {formatTime(timeElapsed)}</span>
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          onClick={onAccept}
          className="flex-1 bg-green-600 hover:bg-green-700 text-white"
          size="sm"
        >
          Accept Chat
        </Button>
        <Button
          onClick={onDismiss}
          variant="outline"
          size="sm"
        >
          Dismiss
        </Button>
      </div>
    </Card>
  );
}
