"use client"

import * as React from "react"
import { useRouter, useParams } from "next/navigation"
import api from "@/utils/api"
import { useAuth } from "@/lib/auth"
import { ArrowLeft, FileText, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { CaseNotes } from "../components/CaseNotes"
import type { CaseNote } from '../components/CaseNotes'

interface Escalation {
  _id: string
  caseNumber: string
  customerName: string
  customerEmail: string
  concern: string
  status: "escalated" | "pending" | "resolved"
}

export default function CaseNotesPage() {
  const router = useRouter()
  const params = useParams()
  const { id } = params as { id: string }
  const { user } = useAuth()
  
  const [escalation, setEscalation] = React.useState<Escalation | null>(null)
  const [caseNotes, setCaseNotes] = React.useState<CaseNote[]>([])
  const [loading, setLoading] = React.useState(false)
  const [loadingNotes, setLoadingNotes] = React.useState(false)
  const [page, setPage] = React.useState(1)
  const [totalPages, setTotalPages] = React.useState(1)
  const [totalNotes, setTotalNotes] = React.useState(0)

  const fetchEscalation = async () => {
    if (!id) return
    setLoading(true)
    try {
      const response = await api.get(`/escalation/${id}`)
      setEscalation(response.data)
    } catch (error) {
      console.error('Error fetching escalation:', error)
      setEscalation(null)
    } finally {
      setLoading(false)
    }
  }

  const fetchNotes = async (pageNum = 1) => {
    if (!id) return
    setLoadingNotes(true)
    try {
      const response = await api.get(`/notes/escalation/${id}?page=${pageNum}&limit=10`)
      if (response.data.success && response.data.data?.notes) {
        const notes = response.data.data.notes.map((note: any) => ({
          id: note._id,
          content: note.content,
          author: note.createdBy || "Unknown User",
          createdAt: note.createdAt
        }))
        setCaseNotes(notes)
        setTotalPages(response.data.data.pagination?.totalPages || 1)
        setTotalNotes(response.data.data.pagination?.totalNotes || 0)
      } else {
        setCaseNotes([])
        setTotalPages(1)
        setTotalNotes(0)
      }
    } catch (error) {
      console.error('Error fetching notes:', error)
      setCaseNotes([])
    } finally {
      setLoadingNotes(false)
    }
  }

  React.useEffect(() => {
    fetchEscalation()
    fetchNotes(page)
  }, [id, page])

  const addCaseNote = async (content: string) => {
    if (!content.trim()) return
    try {
      const createdBy = user ? `${user.firstName} ${user.lastName}` : 'Unknown User'
      const response = await api.post(`/notes/escalation/${id}`, { 
        content,
        createdBy 
      })
      
      if (response.data.success && response.data.data) {
        // Refresh notes to show the new note
        fetchNotes(1) // Go to first page to see the latest note
        setPage(1)
      } else {
        alert('Failed to create note.')
      }
    } catch (error) {
      alert('Error adding note.')
      console.error('Error adding note:', error)
    }
  }

  const deleteNote = async (noteId: string) => {
    try {
      const response = await api.delete(`/notes/${noteId}`)
      if (response.data.success) {
        fetchNotes(page) // Refresh current page
      }
    } catch (error) {
      console.error('Error deleting note:', error)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const handleBackToEscalation = () => {
    router.push(`/dashboard/escalations/${id}`)
  }

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/3 mb-6"></div>
            <div className="space-y-4">
              <div className="h-32 bg-muted rounded"></div>
              <div className="h-24 bg-muted rounded"></div>
              <div className="h-24 bg-muted rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border/40 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleBackToEscalation}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Case
              </Button>
              <div className="flex items-center gap-3">
                <FileText className="h-6 w-6 text-indigo-500" />
                <div>
                  <h1 className="text-2xl font-bold">Case Notes</h1>
                  {escalation && (
                    <p className="text-sm text-muted-foreground">
                      {escalation.caseNumber} • {escalation.customerName}
                    </p>
                  )}
                </div>
              </div>
            </div>
            <Badge variant="outline" className="bg-card">
              {totalNotes} {totalNotes === 1 ? 'Note' : 'Notes'}
            </Badge>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto p-6">
        <div className="space-y-6">
          {/* Case Summary Card */}
          {escalation && (
            <Card className="p-4 bg-card/50">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">{escalation.concern}</h3>
                  <p className="text-sm text-muted-foreground">{escalation.customerEmail}</p>
                </div>
                <Badge 
                  variant={escalation.status === 'resolved' ? 'default' : 'secondary'}
                  className="capitalize"
                >
                  {escalation.status}
                </Badge>
              </div>
            </Card>
          )}

          {/* Notes Section */}
          <CaseNotes 
            notes={caseNotes}
            onAddNote={addCaseNote}
            onDeleteNote={deleteNote}
            formatDate={formatDate}
          />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handlePageChange(page - 1)}
                disabled={page <= 1}
              >
                Previous
              </Button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <Button
                    key={pageNum}
                    variant={pageNum === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(pageNum)}
                    className="w-8 h-8"
                  >
                    {pageNum}
                  </Button>
                ))}
              </div>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handlePageChange(page + 1)}
                disabled={page >= totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
