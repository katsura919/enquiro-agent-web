import * as React from "react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { MessageSquare, Mail } from "lucide-react";
import { ConversationHistory } from "./ConversationHistory";
import { EmailThread } from "./EmailThread";

interface ChatMessage {
  _id: string
  businessId: string
  sessionId: string
  query: string
  response: string
  isGoodResponse?: boolean | null
  createdAt: string
  updatedAt: string
}

interface EmailMessage {
  id: string;
  threadId: string;
  snippet: string;
  subject: string;
  from: string;
  to: string;
  date: string;
  body: string;
  quotedContent: string | null;
  isHTML: boolean;
  labels: string[];
  internalDate: string;
  attachments: { 
    partId?: string;
    mimeType?: string;
    filename?: string;
    name: string; 
    size: string | number; 
    url?: string; 
    contentType?: string;
    attachmentId?: string;
    contentId?: string;
  }[];
  isFromCustomer?: boolean;
  isRead?: boolean;
}

interface CommunicationTabsProps {
  // Chat props
  chatMessages: ChatMessage[];
  loadingChats: boolean;
  refreshingChats: boolean;
  handleRefreshChats: () => void;
  
  // Email props
  emails: EmailMessage[];
  loadingEmails: boolean;
  refreshingEmails: boolean;
  handleRefreshEmails: () => void;
  onSendEmailReply: (content: string, recipients: string[], originalMessageId?: string) => void;
  onSendNewEmail: (emailData: { to: string; subject: string; content: string }) => void;
  
  // Common
  formatTime: (dateString: string) => string;
  formatEmailDate?: (dateString: string) => string;
  customerEmail: string;
  customerName: string;
  concernSubject: string;
}

type TabType = "chat" | "email";

export function CommunicationTabs({
  chatMessages,
  loadingChats,
  refreshingChats,
  handleRefreshChats,
  emails,
  loadingEmails,
  refreshingEmails,
  handleRefreshEmails,
  onSendEmailReply,
  onSendNewEmail,
  formatTime,
  formatEmailDate,
  customerEmail,
  customerName,
  concernSubject,
}: CommunicationTabsProps) {
  const [activeTab, setActiveTab] = useState<TabType>("chat");

  const unreadEmails = emails.filter(email => !email.isRead).length;

  const tabs = [
    {
      id: "chat" as TabType,
      label: "Chat History",
      icon: MessageSquare,
      count: chatMessages.length,
      hasNew: false,
    },
    {
      id: "email" as TabType,
      label: "Email Thread",
      icon: Mail,
      count: emails.length,
      hasNew: unreadEmails > 0,
      newCount: unreadEmails,
    },
  ];

  return (
    <div className="space-y-4">
      {/* Tab Navigation */}
      <Card className="bg-card p-1">
        <div className="flex space-x-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors flex-1 justify-center",
                  activeTab === tab.id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
                {tab.count > 0 && (
                  <Badge 
                    variant={activeTab === tab.id ? "secondary" : "outline"} 
                    className={cn(
                      "text-xs",
                      activeTab === tab.id && "bg-primary-foreground/10 text-primary-foreground"
                    )}
                  >
                    {tab.count}
                  </Badge>
                )}
                {tab.hasNew && tab.newCount && (
                  <Badge variant="destructive" className="text-xs ml-1">
                    {tab.newCount}
                  </Badge>
                )}
              </button>
            );
          })}
        </div>
      </Card>

      {/* Tab Content */}
      <div className="space-y-4">
        {activeTab === "chat" && (
          <ConversationHistory
            chatMessages={chatMessages}
            loadingChats={loadingChats}
            refreshing={refreshingChats}
            handleRefreshChats={handleRefreshChats}
            formatTime={formatTime}
          />
        )}

        {activeTab === "email" && (
          <EmailThread
            emails={emails}
            loading={loadingEmails}
            refreshing={refreshingEmails}
            onRefresh={handleRefreshEmails}
            onSendReply={onSendEmailReply}
            onSendNewEmail={onSendNewEmail}
            formatTime={formatTime}
            formatEmailDate={formatEmailDate}
            customerEmail={customerEmail}
            customerName={customerName}
            concernSubject={concernSubject}
            userEmail="katsuragik919@gmail.com"
          />
        )}
      </div>
    </div>
  );
}
