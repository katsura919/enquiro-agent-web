"use client";
import { Tab } from "@/context/TabsContext";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTabs } from "@/context/TabsContext";
import {
  FileText,
  User,
  Calendar,
  MessageSquare,
  AlertTriangle,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  ArrowLeft,
} from "lucide-react";
import api from "@/utils/api";
import type { ChatMessage } from "@/types/ChatMessage";

// Import the existing escalation components
import {
  ActivityFeed,
  CaseNotes,
  CommunicationTabs,
  CustomerIssueCard,
} from "@/app/dashboard/escalations/[id]/components";
import { EscalationHeader } from "@/app/dashboard/escalations/[id]/components/EscalationHeader";

interface CaseDetailsTabProps {
  tab: Tab;
}

interface Escalation {
  _id: string;
  sessionId: string;
  businessId: string;
  caseNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  concern: string;
  description?: string;
  status: "escalated" | "pending" | "resolved";
  assignedTo?: string;
  emailThreadId?: string;
  createdAt: string;
  updatedAt: string;
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

interface CaseNote {
  id: string;
  content: string;
  author: string;
  createdAt: string;
}

interface Activity {
  id: string;
  action: string;
  timestamp: string;
  details?: string;
}

// Wrapper component for escalation details that doesn't rely on Next.js params
function EscalationDetailsWrapper({ escalationId }: { escalationId: string }) {
  const [escalation, setEscalation] = useState<Escalation | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [emails, setEmails] = useState<EmailMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingChats, setLoadingChats] = useState(false);
  const [loadingEmails, setLoadingEmails] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshingEmails, setRefreshingEmails] = useState(false);
  const [caseNotes, setCaseNotes] = useState<CaseNote[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [copiedCaseNumber, setCopiedCaseNumber] = useState(false);
  const [copiedSessionId, setCopiedSessionId] = useState(false);

  const statusColors = {
    escalated: "text-red-400",
    pending: "text-yellow-400", 
    resolved: "text-green-400"
  };

  const statusIcons = {
    escalated: AlertTriangle,
    pending: Clock,
    resolved: CheckCircle
  };

  useEffect(() => {
    if (!escalationId) return;
    setLoading(true);
    api.get(`/escalation/${escalationId}`)
      .then((res: any) => {
        setEscalation(res.data);
        if (res.data.sessionId) {
          fetchChatMessages(res.data.sessionId);
        }
        fetchActivities(res.data._id);
        fetchNotes();
      })
      .catch(() => setEscalation(null))
      .finally(() => setLoading(false));
  }, [escalationId]);

  useEffect(() => {
    if (escalation?.emailThreadId) {
      fetchEmails();
    }
  }, [escalation?.emailThreadId]);

  const fetchChatMessages = async (sessionId: string) => {
    setLoadingChats(true);
    try {
      const response = await api.get(`/chat/session/${sessionId}`);
      setChatMessages(response.data);
    } catch (error) {
      console.error('Error fetching chat messages:', error);
      setChatMessages([]);
    } finally {
      setLoadingChats(false);
    }
  };

  const fetchActivities = async (escalationId: string) => {
    try {
      const response = await api.get(`/activity/escalation/${escalationId}`);
      const transformedActivities = response.data.map((activity: any) => ({
        id: activity._id,
        action: activity.action,
        timestamp: activity.timestamp,
        details: activity.details
      }));
      setActivities(transformedActivities);
    } catch (error) {
      console.error('Error fetching activities:', error);
      setActivities([]);
    }
  };

  const fetchNotes = async () => {
    try {
      const response = await api.get(`/notes/escalation/${escalationId}`);
      // Transform the response to match the expected CaseNote interface
      const transformedNotes = response.data.map((note: any) => ({
        id: note._id,
        content: note.content,
        author: note.author || "Agent", // Default to "Agent" if no author specified
        createdAt: note.createdAt
      }));
      setCaseNotes(transformedNotes);
    } catch (error) {
      console.error('Error fetching notes:', error);
      setCaseNotes([]);
    }
  };

  const fetchEmails = async () => {
    if (!escalation?.emailThreadId) return;
    setLoadingEmails(true);
    try {
      const response = await api.get(`/email/threads/${escalation.emailThreadId}/messages`);
      if (response.data.success && response.data.data.messages) {
        const transformedEmails = response.data.data.messages.map((message: any) => ({
          ...message,
          internalDate: message.internalDate || message.date, // Ensure internalDate is present
          isFromCustomer: !message.labels.includes('SENT'),
          isRead: true,
          attachments: message.attachments?.map((att: any) => ({
            ...att,
            name: att.filename || att.name || 'attachment',
            size: att.size || 0
          })) || []
        }));
        setEmails(transformedEmails);
      } else {
        setEmails([]);
      }
    } catch (error) {
      console.error('Error fetching emails:', error);
      setEmails([]);
    } finally {
      setLoadingEmails(false);
    }
  };

  const handleRefreshEmails = async () => {
    if (!escalation?.emailThreadId) return;
    setRefreshingEmails(true);
    try {
      const response = await api.get(`/email/threads/${escalation.emailThreadId}/messages`);
      if (response.data.success && response.data.data.messages) {
        const transformedEmails = response.data.data.messages.map((message: any) => ({
          ...message,
          internalDate: message.internalDate || message.date, // Ensure internalDate is present
          isFromCustomer: !message.labels.includes('SENT'),
          isRead: true,
          attachments: message.attachments?.map((att: any) => ({
            ...att,
            name: att.filename || att.name || 'attachment',
            size: att.size || 0
          })) || []
        }));
        setEmails(transformedEmails);
      }
    } catch (error) {
      console.error('Error refreshing emails:', error);
    } finally {
      setRefreshingEmails(false);
    }
  };

  const handleSendEmailReply = async (content: string, recipients: string[], originalMessageId?: string) => {
    if (!escalation?.emailThreadId || !originalMessageId) return;
    try {
      await api.post(`/email/reply`, {
        threadId: escalation.emailThreadId,
        to: recipients[0],
        body: content,
        from: "Customer Support",
        originalMessageId: originalMessageId
      });
      handleRefreshEmails();
      const newActivity = {
        id: `act-${Date.now()}`,
        action: "Email Sent",
        timestamp: new Date().toISOString(),
        details: `Replied to ${recipients.join(", ")}`
      };
      setActivities([newActivity, ...activities]);
    } catch (error) {
      console.error('Error sending email reply:', error);
    }
  };

  const handleSendNewEmail = async (emailData: { to: string; subject: string; content: string }) => {
    if (!escalation) return;
    try {
      await api.post(`/email/send`, {
        to: emailData.to,
        subject: emailData.subject,
        body: emailData.content,
        from: "Support Team",
        escalationId: escalation._id,
      });
      if (escalation.emailThreadId) {
        handleRefreshEmails();
      }
      const newActivity = {
        id: `act-${Date.now()}`,
        action: "Email Sent",
        timestamp: new Date().toISOString(),
        details: `Sent to ${emailData.to}`
      };
      setActivities([newActivity, ...activities]);
    } catch (error) {
      console.error('Error sending new email:', error);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!escalation) return;
    try {
      await api.patch(`/escalation/${escalation._id}/status`, { status: newStatus });
      const newUpdatedAt = new Date().toISOString();
      setEscalation(prev => prev ? { ...prev, status: newStatus as any, updatedAt: newUpdatedAt } : null);
      fetchActivities(escalation._id);
    } catch (error) {
      console.error('Error updating escalation status:', error);
    }
  };

  const handleRefreshChats = async () => {
    if (!escalation?.sessionId) return;
    setRefreshing(true);
    try {
      const response = await api.get(`/chat/session/${escalation.sessionId}`);
      setChatMessages(response.data);
    } catch (error) {
      console.error('Error refreshing chat messages:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const addCaseNote = async (noteText: string) => {
    try {
      const response = await api.post('/notes', {
        escalationId: escalationId,
        content: noteText
      });
      if (response.data.success) {
        fetchNotes();
        const newActivity: Activity = {
          id: `act-${Date.now()}`,
          action: "Note Added",
          timestamp: new Date().toISOString()
        };
        setActivities([newActivity, ...activities]);
      }
    } catch (error) {
      console.error('Error adding note:', error);
    }
  };

  const deleteNote = async (noteId: string) => {
    try {
      const response = await api.delete(`/notes/${noteId}`);
      if (response.data.success) {
        fetchNotes();
        const newActivity: Activity = {
          id: `act-${Date.now()}`,
          action: "Note Deleted",
          timestamp: new Date().toISOString()
        };
        setActivities([newActivity, ...activities]);
      }
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatEmailDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading escalation details...</p>
        </div>
      </div>
    );
  }

  if (!escalation) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Escalation Not Found</h3>
          <p className="text-muted-foreground">
            Could not load details for escalation ID: {escalationId}
          </p>
        </div>
      </div>
    );
  }

  const StatusIcon = statusIcons[escalation.status];

  return (
    <div className="bg-background min-h-full flex flex-col">
      <EscalationHeader
        escalation={{
          caseNumber: escalation.caseNumber,
          sessionId: escalation.sessionId,
          status: escalation.status,
        }}
        statusColors={statusColors}
        StatusIcon={StatusIcon}
        copiedCaseNumber={copiedCaseNumber}
        copiedSessionId={copiedSessionId}
        setCopiedCaseNumber={setCopiedCaseNumber}
        setCopiedSessionId={setCopiedSessionId}
        handleStatusChange={handleStatusChange}
      />
      
      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 p-4 md:p-6">        
          <div className="lg:col-span-2 space-y-4">
            <CustomerIssueCard
              customerName={escalation.customerName}
              customerEmail={escalation.customerEmail}
              customerPhone={escalation.customerPhone}
              concern={escalation.concern}
              description={escalation.description}
              status={escalation.status}
            />

            <CommunicationTabs
              chatMessages={chatMessages}
              loadingChats={loadingChats}
              refreshingChats={refreshing}
              handleRefreshChats={handleRefreshChats}
              emails={emails}
              loadingEmails={loadingEmails}
              refreshingEmails={refreshingEmails}
              handleRefreshEmails={handleRefreshEmails}
              onSendEmailReply={handleSendEmailReply}
              onSendNewEmail={handleSendNewEmail}
              formatTime={formatTime}
              formatEmailDate={formatEmailDate}
              customerEmail={escalation.customerEmail}
              customerName={escalation.customerName}
              concernSubject={escalation.concern}
            />
          </div>

          <div className="lg:border-l lg:border-border/40">
            <div className="p-0 lg:p-4 space-y-6 md:space-y-8">
              <CaseNotes 
                notes={caseNotes}
                onAddNote={addCaseNote}
                onDeleteNote={deleteNote}
                formatDate={formatDate}
              />            
              <ActivityFeed 
                activities={activities}
                formatDate={formatDate}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function CaseDetailsTab({ tab }: CaseDetailsTabProps) {
  const { updateTab } = useTabs();
  const caseData = tab.data;

  // If it's an escalation type, render the existing escalation detail component
  if (caseData?.type === "escalation") {
    return (
      <div className="flex-1 overflow-auto">
        <EscalationDetailsWrapper escalationId={caseData.escalationId} />
      </div>
    );
  }

  // For product type, show product details
  if (caseData?.type === "product") {
    const productDetails = {
      id: caseData.productId || "PROD-001",
      title: caseData.productName || "Product Details",
      sku: "WH-2024-001",
      category: "Electronics",
      price: 299.99,
      stock: 45,
      rating: 4.8,
      description: "High-quality product with advanced features.",
      specifications: [
        "High-quality materials",
        "Advanced technology",
        "User-friendly design",
        "Long-lasting durability",
      ],
      warranty: "2 years manufacturer warranty",
      shipping: "Free shipping on orders over $50",
    };

    return (
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">{productDetails.title}</h1>
              <p className="text-muted-foreground">Product ID: {productDetails.id}</p>
            </div>
            <Badge variant="outline" className="bg-blue-100 text-blue-800">
              ACTIVE
            </Badge>
          </div>

          {/* Product Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Product Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="font-medium">SKU:</span> {productDetails.sku}</div>
                <div><span className="font-medium">Category:</span> {productDetails.category}</div>
                <div><span className="font-medium">Price:</span> ${productDetails.price}</div>
                <div><span className="font-medium">Stock:</span> {productDetails.stock} units</div>
                <div><span className="font-medium">Rating:</span> ⭐ {productDetails.rating}/5</div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Description:</h4>
                <p className="text-sm text-muted-foreground">{productDetails.description}</p>
              </div>

              <div>
                <h4 className="font-medium mb-2">Features:</h4>
                <ul className="text-sm space-y-1">
                  {productDetails.specifications.map((spec, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3 text-green-500" />
                      {spec}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div><span className="font-medium">Warranty:</span> {productDetails.warranty}</div>
                <div><span className="font-medium">Shipping:</span> {productDetails.shipping}</div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start" size="sm">
                <MessageSquare className="w-4 h-4 mr-2" />
                Recommend to Customer
              </Button>
              <Button variant="outline" className="w-full justify-start" size="sm">
                <Package className="w-4 h-4 mr-2" />
                Check Inventory
              </Button>
              <Button variant="outline" className="w-full justify-start" size="sm">
                <FileText className="w-4 h-4 mr-2" />
                View Documentation
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Default generic case view
  return (
    <div className="flex-1 overflow-auto p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold">{tab.title}</h1>
          <p className="text-muted-foreground">
            Case details for {caseData?.caseId || "unknown case"}
          </p>
        </div>
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Case Details</h3>
          <p className="text-muted-foreground">
            Detailed case information will be displayed here
          </p>
        </div>
      </div>
    </div>
  );
}
