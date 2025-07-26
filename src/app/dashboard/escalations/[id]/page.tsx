"use client"

import * as React from "react"
import { useRouter, useParams } from "next/navigation"
import api from "@/utils/api"
import { 
  AlertTriangle, 
  Clock, 
  Check,
} from "lucide-react"
import {
  ActivityFeed,
  CaseNotes,
  CommunicationTabs,
  CustomerIssueCard,
} from "./components"
import { useState } from "react"
import { EscalationHeader } from "./components/EscalationHeader"

interface Escalation {
  _id: string
  sessionId: string
  businessId: string
  caseNumber: string
  customerName: string
  customerEmail: string
  customerPhone?: string
  concern: string
  description?: string
  status: "escalated" | "pending" | "resolved"
  assignedTo?: string
  emailThreadId?: string
  createdAt: string
  updatedAt: string
}

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

// Import types from our component files
import type { CaseNote } from './components/CaseNotes'
import type { ActivityItem as Activity } from './components/ActivityFeed'

const statusIcons = {
  escalated: AlertTriangle,
  pending: Clock,
  resolved: Check
}

const statusColors = {
  escalated: "text-orange-400",
  pending: "text-yellow-400",
  resolved: "text-green-400"
}

export default function EscalationDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const { id } = params as { id: string }
  const [escalation, setEscalation] = React.useState<Escalation | null>(null)
  const [chatMessages, setChatMessages] = React.useState<ChatMessage[]>([])
  const [emails, setEmails] = React.useState<EmailMessage[]>([])
  const [loading, setLoading] = React.useState(false)
  const [loadingChats, setLoadingChats] = React.useState(false)
  const [loadingEmails, setLoadingEmails] = React.useState(false)
  const [refreshing, setRefreshing] = React.useState(false)
  const [refreshingEmails, setRefreshingEmails] = React.useState(false)
  const [noteText, setNoteText] = React.useState("")
  const [caseNotes, setCaseNotes] = React.useState<CaseNote[]>([])
  const [loadingNotes, setLoadingNotes] = React.useState(false)
  const [activities, setActivities] = React.useState<Activity[]>([])
  const [loadingActivities, setLoadingActivities] = React.useState(false)
  const [copiedCaseNumber, setCopiedCaseNumber] = useState(false);
  const [copiedSessionId, setCopiedSessionId] = useState(false);
  const fetchNotes = async () => {
    if (!id) return;
    setLoadingNotes(true);
    try {
      const response = await api.get(`/notes/escalation/${id}`);
      if (response.data.success && response.data.data?.notes) {
        // Map backend notes to CaseNote interface
        const notes = response.data.data.notes.map((note: any) => ({
          id: note._id,
          content: note.content,
          author: note.author || "You", // If you have author info, use it
          createdAt: note.createdAt
        }));
        setCaseNotes(notes);
      } else {
        setCaseNotes([]);
      }
    } catch (error) {
      console.error('Error fetching notes:', error);
      setCaseNotes([]);
    } finally {
      setLoadingNotes(false);
    }
  };

  React.useEffect(() => {
    fetchNotes();
    // ...existing code...
  }, [id]);

  const addCaseNote = async (content: string) => {
    if (!content.trim()) return;
    try {
      const response = await api.post(`/notes/escalation/${id}`, { content });
      console.log('Add note response:', response);
      if (response.data.success && response.data.data) {
        fetchNotes();
        const newActivity: Activity = {
          id: `act-${Date.now()}`,
          action: "Note Added",
          timestamp: new Date().toISOString()
        };
        setActivities([newActivity, ...activities]);
      } else {
        alert('Failed to create note.');
      }
    } catch (error) {
      alert('Error adding note.');
      console.error('Error adding note:', error);
    }
  };

  const deleteNote = async (noteId: string) => {
    try {
      const response = await api.delete(`/notes/${noteId}`);
      if (response.data.success) {
        fetchNotes();
        // Add to activities
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
  React.useEffect(() => {
    if (!id) return
    setLoading(true)
    api.get(`/escalation/${id}`)
      .then((res: any) => {
        setEscalation(res.data)
        // Fetch chat messages after getting escalation
        if (res.data.sessionId) {
          fetchChatMessages(res.data.sessionId)
        }
        // Fetch activities for this escalation
        fetchActivities(res.data._id)
        // Fetch emails for this escalation (will be called after escalation is set)
        // fetchEmails will be called in a separate useEffect when escalation changes
      })
      .catch(() => setEscalation(null))
      .finally(() => setLoading(false))
  }, [id])

  // Fetch emails when escalation data is available
  React.useEffect(() => {
    if (escalation?.emailThreadId) {
      fetchEmails();
    }
  }, [escalation?.emailThreadId])

  const fetchChatMessages = async (sessionId: string) => {
    setLoadingChats(true)
    try {
      const response = await api.get(`/chat/session/${sessionId}`)
      setChatMessages(response.data)
    } catch (error) {
      console.error('Error fetching chat messages:', error)
      setChatMessages([])
    } finally {
      setLoadingChats(false)
    }
  }

  const fetchActivities = async (escalationId: string) => {
    setLoadingActivities(true)
    try {
      const response = await api.get(`/activity/escalation/${escalationId}`)
      // Transform server response to match client-side Activity interface
      const transformedActivities = response.data.map((activity: any) => ({
        id: activity._id,
        action: activity.action,
        timestamp: activity.timestamp,
        details: activity.details
      }))
      setActivities(transformedActivities)
    } catch (error) {
      console.error('Error fetching activities:', error)
      setActivities([])
    } finally {
      setLoadingActivities(false)
    }
  }

  const fetchEmails = async () => {
    if (!escalation?.emailThreadId) {
      console.log('No emailThreadId found for this escalation');
      setLoadingEmails(false);
      return;
    }

    setLoadingEmails(true)
    try {
      const response = await api.get(`/email/threads/${escalation.emailThreadId}/messages`)
      
      if (response.data.success && response.data.data.messages) {
        // Transform the API response to include additional UI properties
        const transformedEmails = response.data.data.messages.map((message: any) => ({
          ...message,
          isFromCustomer: !message.labels.includes('SENT'), // If not sent by us, it's from customer
          isRead: true, // You might want to implement read/unread logic based on your needs
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
      console.error('Error fetching emails:', error)
      setEmails([]);
    } finally {
      setLoadingEmails(false)
    }
  }

  const handleRefreshEmails = async () => {
    if (!escalation?.emailThreadId) return
    
    setRefreshingEmails(true)
    try {
      const response = await api.get(`/email/threads/${escalation.emailThreadId}/messages`)
      
      if (response.data.success && response.data.data.messages) {
        // Transform the API response to include additional UI properties
        const transformedEmails = response.data.data.messages.map((message: any) => ({
          ...message,
          isFromCustomer: !message.labels.includes('SENT'), // If not sent by us, it's from customer
          isRead: true, // You might want to implement read/unread logic based on your needs
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
      console.error('Error refreshing emails:', error)
    } finally {
      setRefreshingEmails(false)
    }
  }

  const handleSendEmailReply = async (content: string, recipients: string[], originalMessageId?: string) => {
    if (!escalation?.emailThreadId || !originalMessageId) return
    
    try {
      await api.post(
        `/email/reply`,
        {
          threadId: escalation.emailThreadId,
          to: recipients[0], // Using first recipient
          body: content,
          from: "Customer Support",
          originalMessageId: originalMessageId
        }
      )
      
      // Refresh emails to show the new reply
      handleRefreshEmails()
      
      // Add activity
      const newActivity = {
        id: `act-${Date.now()}`,
        action: "Email Sent",
        timestamp: new Date().toISOString(),
        details: `Replied to ${recipients.join(", ")}`
      }
      setActivities([newActivity, ...activities])
    } catch (error) {
      console.error('Error sending email reply:', error)
    }
  }

  const handleSendNewEmail = async (emailData: { to: string; subject: string; content: string }) => {
    if (!escalation) return
    
    try {
      await api.post(
        `/email/send`,
        {
          to: emailData.to,
          subject: emailData.subject,
          body: emailData.content,
          from: "Support Team",
          escalationId: escalation._id,
        }
      )
      
      // If this creates a new thread, you might need to update the escalation with emailThreadId
      // and then fetch emails
      if (escalation.emailThreadId) {
        handleRefreshEmails()
      }
      
      // Add activity
      const newActivity = {
        id: `act-${Date.now()}`,
        action: "Email Sent",
        timestamp: new Date().toISOString(),
        details: `Sent to ${emailData.to}`
      }
      setActivities([newActivity, ...activities])
    } catch (error) {
      console.error('Error sending new email:', error)
    }
  }

  const handleStatusChange = async (newStatus: string) => {
    if (!escalation) return
    
    try {
      await api.patch(
        `/escalation/${escalation._id}/status`,
        { status: newStatus }
      )
      
      const newUpdatedAt = new Date().toISOString();
      
      // Update escalation state
      setEscalation(prev => prev ? { ...prev, status: newStatus as any, updatedAt: newUpdatedAt } : null)
      
      // Refresh activities to show the new status change activity
      fetchActivities(escalation._id)
    } catch (error) {
      console.error('Error updating escalation status:', error)
    }
  }

  const handleRefreshChats = async () => {
    if (!escalation?.sessionId) return
    
    setRefreshing(true)
    try {
      const response = await api.get(`/chat/session/${escalation.sessionId}`)
      setChatMessages(response.data)
    } catch (error) {
      console.error('Error refreshing chat messages:', error)
    } finally {
      setRefreshing(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  const formatEmailDate = (dateString: string) => {
    // Handle both ISO format and email date format
    return new Date(dateString).toLocaleString()
  }
  
  const StatusIcon = escalation ? statusIcons[escalation.status] : AlertTriangle
  
return (
  <div className="bg-background min-h-screen flex flex-col">
    {escalation && (
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
    )}
    {/* Main Content */}
    <div className="flex-1 overflow-y-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 p-4 md:p-6">        
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-4">
          <CustomerIssueCard
            customerName={escalation?.customerName || ''}
            customerEmail={escalation?.customerEmail || ''}
            customerPhone={escalation?.customerPhone}
            concern={escalation?.concern || ''}
            description={escalation?.description}
            status={escalation?.status || 'escalated'}
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
            customerEmail={escalation?.customerEmail || ''}
            customerName={escalation?.customerName || ''}
            concernSubject={escalation?.concern || ''}
          />
        </div>

        {/* Right Column */}
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
)

}
