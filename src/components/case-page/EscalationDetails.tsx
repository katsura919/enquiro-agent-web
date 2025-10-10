"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  User, 
  Mail, 
  Phone,
  Calendar,
  MessageSquare,
  Bot,
  UserCircle,
  ExternalLink,
  RefreshCw,
  Plus,
  FileText,
  Send,
  History,
  Activity,
  Tag,
  Paperclip
} from "lucide-react"

interface Escalation {
  _id: string
  sessionId: string
  businessId: string
  caseNumber: string
  customerDetails: {
    name: string
    email: string
    phoneNumber?: string
  }
  concern: string
  description?: string
  status: "escalated" | "pending" | "resolved"
  assignedTo?: string
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

interface CaseNote {
  _id: string
  escalationId: string
  content: string
  author: string
  createdAt: string
  updatedAt: string
}

interface CaseLog {
  _id: string
  escalationId: string
  action: string
  description: string
  author: string
  createdAt: string
}

interface EscalationDetailsProps {
  escalation: Escalation
  onUpdateStatus: (escalationId: string, newStatus: string) => void
}

const API_URL = process.env.NEXT_PUBLIC_API_URL

const statusIcons = {
  escalated: AlertTriangle,
  pending: Clock,
  resolved: CheckCircle
}

const statusColors = {
  escalated: "text-orange-400",
  pending: "text-yellow-400", 
  resolved: "text-green-400"
}

export default function EscalationDetails({
  escalation,
  onUpdateStatus
}: EscalationDetailsProps) {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [caseNotes, setCaseNotes] = useState<CaseNote[]>([])
  const [caseLogs, setCaseLogs] = useState<CaseLog[]>([])
  const [newNote, setNewNote] = useState("")
  const [loadingChats, setLoadingChats] = useState(false)
  const [loadingNotes, setLoadingNotes] = useState(false)
  const [submittingNote, setSubmittingNote] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [activeTab, setActiveTab] = useState<"conversation" | "notes" | "logs">("conversation")

  const StatusIcon = statusIcons[escalation.status]
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
  // Fetch chat messages for the session
  useEffect(() => {
    if (!escalation.sessionId || !token) return
    fetchChatMessages()
    fetchCaseNotes()
    fetchCaseLogs()
  }, [escalation.sessionId, token])

  const fetchChatMessages = async () => {
    setLoadingChats(true)
    try {
      const response = await axios.get(`${API_URL}/chat/session/${escalation.sessionId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setChatMessages(response.data)
    } catch (error) {
      console.error('Error fetching chat messages:', error)
      setChatMessages([])
    } finally {
      setLoadingChats(false)
    }
  }

  const fetchCaseNotes = async () => {
    setLoadingNotes(true)
    try {
      // TODO: Replace with actual API endpoint
      // const response = await axios.get(`${API_URL}/escalation/${escalation._id}/notes`, {
      //   headers: { Authorization: `Bearer ${token}` }
      // })
      // setCaseNotes(response.data)
      
      // Mock data for now
      setCaseNotes([
        {
          _id: '1',
          escalationId: escalation._id,
          content: 'Customer contacted via phone. Explained the issue in detail and provided workaround.',
          author: 'John Doe',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ])
    } catch (error) {
      console.error('Error fetching case notes:', error)
      setCaseNotes([])
    } finally {
      setLoadingNotes(false)
    }
  }

  const fetchCaseLogs = async () => {
    try {
      // TODO: Replace with actual API endpoint
      // const response = await axios.get(`${API_URL}/escalation/${escalation._id}/logs`, {
      //   headers: { Authorization: `Bearer ${token}` }
      // })
      // setCaseLogs(response.data)
      
      // Mock data for now
      setCaseLogs([
        {
          _id: '1',
          escalationId: escalation._id,
          action: 'Status Changed',
          description: 'Status updated from escalated to pending',
          author: 'System',
          createdAt: new Date().toISOString()
        },
        {
          _id: '2',
          escalationId: escalation._id,
          action: 'Case Created',
          description: 'Escalation case created from chat session',
          author: 'System',
          createdAt: escalation.createdAt
        }
      ])
    } catch (error) {
      console.error('Error fetching case logs:', error)
      setCaseLogs([])
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
  
  const handleStatusChange = async (newStatus: string) => {
    try {
      const response = await axios.patch(
        `${API_URL}/escalation/${escalation._id}/status`,
        { status: newStatus },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )
      
      // Call the parent component's update function
      onUpdateStatus(escalation._id, newStatus)
    } catch (error) {
      console.error('Error updating escalation status:', error)
      // You might want to show a toast notification here
    }
  }
  const handleRefreshChats = async () => {
    setRefreshing(true)
    await fetchChatMessages()
    setRefreshing(false)
  }

  const handleSubmitNote = async () => {
    if (!newNote.trim()) return
    
    setSubmittingNote(true)
    try {
      // TODO: Replace with actual API call
      // await axios.post(`${API_URL}/escalation/${escalation._id}/notes`, {
      //   content: newNote
      // }, {
      //   headers: { Authorization: `Bearer ${token}` }
      // })
      
      // Mock success - add note locally
      const mockNote: CaseNote = {
        _id: Date.now().toString(),
        escalationId: escalation._id,
        content: newNote,
        author: 'Current User', // Replace with actual user name
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      setCaseNotes(prev => [mockNote, ...prev])
      setNewNote("")
      
      // Add log entry for note creation
      const logEntry: CaseLog = {
        _id: Date.now().toString() + '_log',
        escalationId: escalation._id,
        action: 'Note Added',
        description: 'Case note added by user',
        author: 'Current User',
        createdAt: new Date().toISOString()
      }
      setCaseLogs(prev => [logEntry, ...prev])
      
    } catch (error) {
      console.error('Error submitting note:', error)
    } finally {
      setSubmittingNote(false)
    }
  }
  return (
    <div className="h-full bg-gradient-to-br from-background to-muted/30">
      {/* Enhanced Header Section */}
      <div className="border-b border-border/50 bg-card/80 backdrop-blur-xl sticky top-0 z-10 shadow-sm">
        <div className="p-6">
          <div className="flex items-start justify-between mb-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "h-10 w-10 rounded-xl flex items-center justify-center",
                    "bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20"
                  )}>
                    <StatusIcon className={cn("h-5 w-5", statusColors[escalation.status])} />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-foreground tracking-tight">
                      Case #{escalation.caseNumber}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                      Session: {escalation.sessionId}
                    </p>
                  </div>
                </div>
                <Badge 
                  variant="outline" 
                  className={cn(
                    "ml-4 text-xs font-medium border-2",
                    escalation.status === "escalated" && "border-orange-200 text-orange-700 bg-orange-50 dark:border-orange-800 dark:text-orange-300 dark:bg-orange-950",
                    escalation.status === "pending" && "border-yellow-200 text-yellow-700 bg-yellow-50 dark:border-yellow-800 dark:text-yellow-300 dark:bg-yellow-950",
                    escalation.status === "resolved" && "border-green-200 text-green-700 bg-green-50 dark:border-green-800 dark:text-green-300 dark:bg-green-950"
                  )}
                >
                  {escalation.status.charAt(0).toUpperCase() + escalation.status.slice(1)}
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={escalation.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                className={cn(
                  "px-4 py-2 bg-background/50 border border-input rounded-xl text-sm font-medium",
                  "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
                  "backdrop-blur-sm transition-all duration-200 hover:bg-background/80"
                )}
              >
                <option value="escalated">Escalated</option>
                <option value="pending">Pending</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
          </div>

          {/* Enhanced Customer Info Card */}
          <Card className="bg-gradient-to-r from-card/50 to-muted/30 border-border/50 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "h-12 w-12 rounded-xl flex items-center justify-center",
                    "bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20"
                  )}>
                    <UserCircle className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Customer</p>
                    <p className="text-sm font-semibold text-foreground truncate">{escalation.customerDetails.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "h-12 w-12 rounded-xl flex items-center justify-center",
                    "bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20"
                  )}>
                    <Mail className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Email</p>
                    <p className="text-sm font-semibold text-foreground truncate">{escalation.customerDetails.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "h-12 w-12 rounded-xl flex items-center justify-center",
                    "bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20"
                  )}>
                    <Phone className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Phone</p>
                    <p className="text-sm font-semibold text-foreground">{escalation.customerDetails.phoneNumber || 'Not provided'}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Content with Enhanced Layout */}
      <div className="flex-1 overflow-hidden">
        <div className="grid grid-cols-12 gap-6 p-6 h-full">
          {/* Left Column - Issue Details */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-red-500/10 to-red-600/5 border border-red-500/20 flex items-center justify-center">
                    <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
                  </div>
                  <CardTitle className="text-lg">Issue Details</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Tag className="h-3 w-3" />
                    Primary Concern
                  </h4>
                  <p className="text-sm text-muted-foreground leading-relaxed p-3 bg-muted/30 rounded-lg border border-border/50">
                    {escalation.concern}
                  </p>
                </div>
                {escalation.description && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <FileText className="h-3 w-3" />
                      Additional Details
                    </h4>
                    <p className="text-sm text-muted-foreground leading-relaxed p-3 bg-muted/30 rounded-lg border border-border/50">
                      {escalation.description}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Timeline Card */}
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 flex items-center justify-center">
                    <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <CardTitle className="text-lg">Timeline</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  <span className="text-muted-foreground">Created:</span>
                  <span className="font-medium">{formatDate(escalation.createdAt)}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                  <span className="text-muted-foreground">Updated:</span>
                  <span className="font-medium">{formatDate(escalation.updatedAt)}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Tabbed Content */}
          <div className="col-span-12 lg:col-span-8 flex flex-col">
            {/* Tab Navigation */}
            <div className="flex space-x-1 mb-6 p-1 bg-muted/30 rounded-xl border border-border/50 backdrop-blur-sm">
              {[
                { id: "conversation", label: "Conversation", icon: MessageSquare, count: chatMessages.length },
                { id: "notes", label: "Case Notes", icon: FileText, count: caseNotes.length },
                { id: "logs", label: "Activity Log", icon: Activity, count: caseLogs.length }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200",
                    activeTab === tab.id
                      ? "bg-background text-foreground shadow-sm border border-border/50"
                      : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                  )}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                  <Badge variant="secondary" className="ml-1 text-xs">
                    {tab.count}
                  </Badge>
                </button>
              ))}
            </div>            {/* Tab Content */}
            <Card className="flex-1 bg-card/50 backdrop-blur-sm border-border/50 overflow-hidden">
              {activeTab === "conversation" && (
                <div className="h-full flex flex-col">
                  <CardHeader className="pb-3 border-b border-border/50">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <MessageSquare className="h-5 w-5 text-blue-500" />
                        Conversation History
                      </CardTitle>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRefreshChats}
                        disabled={refreshing}
                        className="gap-2"
                      >
                        <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} />
                        Refresh
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 p-0">
                    {loadingChats ? (
                      <div className="flex items-center justify-center h-96">
                        <div className="text-center space-y-4">
                          <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
                          <p className="text-muted-foreground">Loading conversation...</p>
                        </div>
                      </div>
                    ) : chatMessages.length === 0 ? (
                      <div className="flex items-center justify-center h-96">
                        <div className="text-center space-y-4">
                          <MessageSquare className="h-16 w-16 text-muted-foreground/30 mx-auto" />
                          <div>
                            <p className="font-medium text-foreground">No conversation found</p>
                            <p className="text-sm text-muted-foreground">This session doesn't have any chat history</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <ScrollArea className="h-96">
                        <div className="p-6 space-y-6">
                          {chatMessages.map((message) => (
                            <div key={message._id} className="space-y-4">
                              {/* Customer Query */}
                              <div className="flex gap-4">
                                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
                                  <UserCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div className="flex-1 space-y-2">
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-semibold text-foreground">Customer</span>
                                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                                      <Clock className="h-3 w-3" />
                                      {formatTime(message.createdAt)}
                                    </span>
                                  </div>
                                  <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/50 dark:to-blue-900/30 rounded-xl p-4 border border-blue-200/50 dark:border-blue-800/50">
                                    <p className="text-sm leading-relaxed text-foreground">{message.query}</p>
                                  </div>
                                </div>
                              </div>

                              {/* Bot Response */}
                              <div className="flex gap-4 ml-8">
                                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-green-500/20 to-green-600/10 border border-green-500/20 flex items-center justify-center flex-shrink-0">
                                  <Bot className="h-5 w-5 text-green-600 dark:text-green-400" />
                                </div>
                                <div className="flex-1 space-y-2">
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-semibold text-foreground">AI Assistant</span>
                                    {message.isGoodResponse !== null && (
                                      <Badge 
                                        variant={message.isGoodResponse ? "default" : "destructive"} 
                                        className="text-xs"
                                      >
                                        {message.isGoodResponse ? "Helpful" : "Not Helpful"}
                                      </Badge>
                                    )}
                                  </div>
                                  <div className="bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950/50 dark:to-green-900/30 rounded-xl p-4 border border-green-200/50 dark:border-green-800/50">
                                    <p className="text-sm leading-relaxed text-foreground">{message.response}</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    )}
                  </CardContent>
                </div>
              )}

              {activeTab === "notes" && (
                <div className="h-full flex flex-col">
                  <CardHeader className="pb-3 border-b border-border/50">
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-purple-500" />
                      Case Notes
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col p-6 space-y-4">
                    {/* Add Note Form */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Plus className="h-4 w-4 text-primary" />
                        <span className="text-sm font-semibold">Add New Note</span>
                      </div>
                      <div className="space-y-3">
                        <Textarea
                          placeholder="Enter your case note here..."
                          value={newNote}
                          onChange={(e) => setNewNote(e.target.value)}
                          className="min-h-[100px] resize-none bg-background/50 border-border/50 focus:border-primary/50"
                        />
                        <div className="flex justify-end">
                          <Button
                            onClick={handleSubmitNote}
                            disabled={!newNote.trim() || submittingNote}
                            className="gap-2"
                          >
                            {submittingNote ? (
                              <div className="h-4 w-4 animate-spin border-2 border-current border-t-transparent rounded-full" />
                            ) : (
                              <Send className="h-4 w-4" />
                            )}
                            {submittingNote ? "Saving..." : "Add Note"}
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Notes List */}
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                        <History className="h-4 w-4" />
                        Previous Notes ({caseNotes.length})
                      </div>
                      {loadingNotes ? (
                        <div className="flex items-center justify-center py-12">
                          <div className="text-center space-y-4">
                            <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
                            <p className="text-sm text-muted-foreground">Loading notes...</p>
                          </div>
                        </div>
                      ) : caseNotes.length === 0 ? (
                        <div className="flex items-center justify-center py-12">
                          <div className="text-center space-y-4">
                            <FileText className="h-12 w-12 text-muted-foreground/30 mx-auto" />
                            <div>
                              <p className="font-medium text-foreground">No notes yet</p>
                              <p className="text-sm text-muted-foreground">Add the first note to track progress</p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <ScrollArea className="flex-1">
                          <div className="space-y-3 pr-4">
                            {caseNotes.map((note) => (
                              <div key={note._id} className="bg-gradient-to-br from-muted/50 to-muted/30 rounded-xl p-4 border border-border/50">
                                <div className="flex items-start justify-between mb-3">
                                  <div className="flex items-center gap-2">
                                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20 flex items-center justify-center">
                                      <User className="h-4 w-4 text-primary" />
                                    </div>
                                    <div>
                                      <p className="text-sm font-semibold text-foreground">{note.author}</p>
                                      <p className="text-xs text-muted-foreground">{formatDate(note.createdAt)}</p>
                                    </div>
                                  </div>
                                </div>
                                <p className="text-sm text-foreground leading-relaxed">{note.content}</p>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      )}
                    </div>
                  </CardContent>
                </div>
              )}

              {activeTab === "logs" && (
                <div className="h-full flex flex-col">
                  <CardHeader className="pb-3 border-b border-border/50">
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5 text-orange-500" />
                      Activity Log
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 p-6">
                    {caseLogs.length === 0 ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center space-y-4">
                          <Activity className="h-12 w-12 text-muted-foreground/30 mx-auto" />
                          <div>
                            <p className="font-medium text-foreground">No activity yet</p>
                            <p className="text-sm text-muted-foreground">Activity will appear here as actions are taken</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <ScrollArea className="h-full">
                        <div className="space-y-4 pr-4">
                          {caseLogs.map((log, index) => (
                            <div key={log._id} className="flex gap-4">
                              <div className="flex flex-col items-center">
                                <div className={cn(
                                  "h-8 w-8 rounded-full border-2 bg-background flex items-center justify-center",
                                  log.action === "Status Changed" && "border-blue-500 text-blue-500",
                                  log.action === "Case Created" && "border-green-500 text-green-500",
                                  log.action === "Note Added" && "border-purple-500 text-purple-500"
                                )}>
                                  {log.action === "Status Changed" && <Clock className="h-4 w-4" />}
                                  {log.action === "Case Created" && <Plus className="h-4 w-4" />}
                                  {log.action === "Note Added" && <FileText className="h-4 w-4" />}
                                </div>
                                {index < caseLogs.length - 1 && (
                                  <div className="w-0.5 h-12 bg-border/50 mt-2"></div>
                                )}
                              </div>
                              <div className="flex-1 pb-6">
                                <div className="bg-gradient-to-br from-muted/50 to-muted/30 rounded-xl p-4 border border-border/50">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-semibold text-foreground">{log.action}</span>
                                    <span className="text-xs text-muted-foreground">{formatTime(log.createdAt)}</span>
                                  </div>
                                  <p className="text-sm text-muted-foreground mb-2">{log.description}</p>
                                  <p className="text-xs text-muted-foreground">by {log.author}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    )}
                  </CardContent>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
