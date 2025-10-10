"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  Search, 
  AlertTriangle, 
  CheckCircle, 
  User, 
  Clock,
  Filter,
  FileText
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
  status: "escalated" | "resolved"
  assignedTo?: string
  createdAt: string
  updatedAt: string
}

interface EscalationListProps {
  escalations: Escalation[]
  selectedEscalationId: string | null
  onSelectEscalation: (id: string) => void
  loading: boolean
}

const statusIcons = {
  escalated: AlertTriangle,
  resolved: CheckCircle
}

const statusColors = {
  escalated: "text-orange-400 bg-orange-50 border-orange-200",
  resolved: "text-green-400 bg-green-50 border-green-200"
}

const statusLabels = {
  escalated: "Escalated",
  resolved: "Resolved"
}

export default function EscalationList({
  escalations,
  selectedEscalationId,
  onSelectEscalation,
  loading
}: EscalationListProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  const filteredEscalations = escalations.filter(escalation => {
    const matchesSearch = 
      escalation.customerDetails.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      escalation.concern.toLowerCase().includes(searchTerm.toLowerCase()) ||
      escalation.customerDetails.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      escalation.caseNumber.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || escalation.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMs = now.getTime() - date.getTime()
    const diffInHours = diffInMs / (1000 * 60 * 60)
    
    if (diffInHours < 1) {
      return "Just now"
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`
    } else {
      return `${Math.floor(diffInHours / 24)}d ago`
    }
  }

  if (loading) {
    return (
      <div className="h-full bg-card border-r border-border">
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="h-5 w-5 text-primary" />
            <h2 className="font-semibold text-foreground">Escalations</h2>
          </div>
        </div>
        <div className="p-4">
          <div className="animate-pulse space-y-4">
            <div className="h-10 bg-muted rounded-lg"></div>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="p-4 bg-muted rounded-lg space-y-3">
                <div className="h-4 bg-muted-foreground/20 rounded w-3/4"></div>
                <div className="h-3 bg-muted-foreground/20 rounded w-1/2"></div>
                <div className="h-3 bg-muted-foreground/20 rounded w-full"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full bg-card border-r border-border flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="h-5 w-5 text-primary" />
          <h2 className="font-semibold text-foreground">Escalations</h2>
          <Badge variant="secondary" className="text-xs ml-auto">
            {filteredEscalations.length}
          </Badge>
        </div>
        
        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 h-4 w-4 text-muted-foreground transform -translate-y-1/2" />
          <Input
            placeholder="Search escalations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-background/50 border-border text-foreground placeholder-muted-foreground focus:bg-background transition-colors"
          />
        </div>
        
        {/* Filter */}
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 h-4 w-4 text-muted-foreground transform -translate-y-1/2" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-background/50 border border-border rounded-md text-foreground text-sm focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors appearance-none"
          >
            <option value="all">All Statuses</option>
            <option value="escalated">Escalated</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
      </div>

      {/* Escalation List */}
      <ScrollArea className="flex-1">
        {filteredEscalations.length === 0 ? (
          <div className="p-6 text-center">
            <div className="mx-auto w-24 h-24 bg-muted/50 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="h-8 w-8 text-muted-foreground/50" />
            </div>
            <h3 className="text-sm font-medium text-foreground mb-2">No escalations found</h3>
            <p className="text-xs text-muted-foreground">
              {searchTerm || statusFilter !== "all" 
                ? "Try adjusting your search or filter criteria" 
                : "No escalations have been created yet"
              }
            </p>
          </div>
        ) : (
          <div className="p-2">
            {filteredEscalations.map((escalation) => {
              const StatusIcon = statusIcons[escalation.status]
              const isSelected = selectedEscalationId === escalation._id
              
              return (
                <div
                  key={escalation._id}
                  onClick={() => onSelectEscalation(escalation._id)}
                  className={cn(
                    "group p-4 rounded-lg cursor-pointer transition-all duration-200 mb-2 border",
                    "hover:bg-accent/50 hover:border-primary/20",
                    isSelected && "bg-primary/5 border-primary/30 shadow-sm"
                  )}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <div className={cn(
                        "h-8 w-8 rounded-full flex items-center justify-center border",
                        statusColors[escalation.status]
                      )}>
                        <StatusIcon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-medium text-foreground text-sm truncate">
                          {escalation.customerDetails.name}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          Case #{escalation.caseNumber}
                        </p>
                      </div>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={cn(
                        "text-xs border shrink-0",
                        escalation.status === "escalated" 
                          ? "border-orange-200 text-orange-600 bg-orange-50" 
                          : "border-green-200 text-green-600 bg-green-50"
                      )}
                    >
                      {statusLabels[escalation.status]}
                    </Badge>
                  </div>
                  
                  {/* Concern */}
                  <div className="mb-3">
                    <p className="text-muted-foreground text-sm line-clamp-2 leading-relaxed">
                      {escalation.concern}
                    </p>
                  </div>
                    {/* Footer */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{formatDate(escalation.createdAt)}</span>
                    </div>
                  </div>
                  
                  {/* Selection Indicator */}
                  {isSelected && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full"></div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}
