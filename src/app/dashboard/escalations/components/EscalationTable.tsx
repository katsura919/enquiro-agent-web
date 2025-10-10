"use client"

import * as React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import { 
  Edit, 
  Trash2, 
  Eye,
  ArrowUpDown,
  Calendar,
  User,
  Mail
} from "lucide-react"

export interface Escalation {
  _id: string
  caseNumber: string
  customerName: string
  customerEmail: string
  concern: string
  status: "escalated" | "pending" | "resolved"
  createdAt: string
  caseOwner?: {
    _id: string
    name: string
  } | null
}

interface EscalationTableProps {
  escalations: Escalation[]
  onRowClick: (id: string) => void
  loading: boolean
  selectedIds?: string[]
  onSelectionChange?: (selectedIds: string[]) => void
  onEdit?: (escalation: Escalation) => void
  onDelete?: (id: string) => void
}

type SortField = 'caseNumber' | 'customerName' | 'customerEmail' | 'concern' | 'status' | 'createdAt' | 'caseOwner'
type SortDirection = 'asc' | 'desc'

const statusColors = {
  escalated: "destructive" as const,
  pending: "secondary" as const,
  resolved: "default" as const,
}

export function EscalationTable({ 
  escalations, 
  onRowClick, 
  loading, 
  selectedIds = [], 
  onSelectionChange,
  onEdit,
  onDelete
}: EscalationTableProps) {

  // Show all escalations by default (no status filter)
  const [sortField, setSortField] = useState<SortField>('createdAt')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const options: Intl.DateTimeFormatOptions = { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    }
    return date.toLocaleDateString('en-US', options)
  }

  const getStatusInfo = (status: Escalation['status']) => {
    switch (status) {
      case 'escalated':
        return { 
          text: 'Escalated', 
          className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 border-red-200 dark:border-red-800' 
        }
      case 'pending':
        return { 
          text: 'Pending', 
          className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 border-yellow-200 dark:border-yellow-800' 
        }
      case 'resolved':
        return { 
          text: 'Resolved', 
          className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border-green-200 dark:border-green-800' 
        }
      default:
        return { 
          text: status, 
          className: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200 border-gray-200 dark:border-gray-800' 
        }
    }
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const sortedEscalations = [...escalations].sort((a, b) => {
    let aValue: any = a[sortField]
    let bValue: any = b[sortField]

    if (sortField === 'createdAt') {
      aValue = new Date(a.createdAt).getTime()
      bValue = new Date(b.createdAt).getTime()
    }

    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase()
      bValue = bValue.toLowerCase()
    }

    if (sortDirection === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
    }
  })

  const SortableHeader = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <TableHead 
      className="cursor-pointer hover:bg-muted/50 select-none"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center gap-2">
        {children}
        <ArrowUpDown className="h-4 w-4" />
      </div>
    </TableHead>
  )

  const isAllSelected = escalations.length > 0 && selectedIds.length === escalations.length
  const isIndeterminate = selectedIds.length > 0 && selectedIds.length < escalations.length

  const handleSelectAll = () => {
    if (isAllSelected) {
      onSelectionChange?.([])
    } else {
      onSelectionChange?.(escalations.map(e => e._id))
    }
  }

  const handleSelectItem = (id: string) => {
    if (selectedIds.includes(id)) {
      onSelectionChange?.(selectedIds.filter(selectedId => selectedId !== id))
    } else {
      onSelectionChange?.([...selectedIds, id])
    }
  }
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[549px] p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <TooltipProvider>
      <div className="bg-card border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <SortableHeader field="caseNumber">Case #</SortableHeader>
              <SortableHeader field="customerName">Customer</SortableHeader>
              <SortableHeader field="customerEmail">Email</SortableHeader>
              <SortableHeader field="concern">Concern</SortableHeader>
              <SortableHeader field="caseOwner">Case Owner</SortableHeader>
              <SortableHeader field="status">Status</SortableHeader>
              <SortableHeader field="createdAt">Created</SortableHeader>
            </TableRow>
          </TableHeader>
          <TableBody>
            {escalations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-[500px]">
                  <div className="flex flex-col items-center justify-center text-center">
                    <div className="rounded-full bg-muted p-6 mb-4">
                      <Mail className="h-12 w-12 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">No Escalations Found</h3>
                    <p className="text-muted-foreground max-w-md">
                      There are currently no escalations to display.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              sortedEscalations.map((escalation, index) => {
              const statusInfo = getStatusInfo(escalation.status)
              return (
                <ContextMenu key={escalation._id}>
                  <ContextMenuTrigger asChild>
                    <TableRow 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => onRowClick(escalation._id)}
                    >
                      <TableCell className="font-mono text-sm font-medium">
                        {escalation.caseNumber}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{escalation.customerName}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">{escalation.customerEmail}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-[300px] truncate">
                          <span className="font-medium">{escalation.concern}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {escalation.caseOwner?.name || "Unassigned"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${statusInfo.className}`}>
                          {statusInfo.text}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{formatDate(escalation.createdAt)}</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  </ContextMenuTrigger>
                  <ContextMenuContent className="w-48">
                    <ContextMenuItem onClick={() => onRowClick(escalation._id)}>
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </ContextMenuItem>
                  </ContextMenuContent>
                </ContextMenu>
              )
            }))}
          </TableBody>
        </Table>
      </div>
    </TooltipProvider>
  )
}
