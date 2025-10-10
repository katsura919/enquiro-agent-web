"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { useAuth } from "@/lib/auth"

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

const API_URL = process.env.NEXT_PUBLIC_API_URL

export default function EscalationsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user } = useAuth()
  const [escalations, setEscalations] = useState<Escalation[]>([])
  const [selectedEscalationId, setSelectedEscalationId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
  const businessId = user?.businessId
  const status = "escalated" // or whatever status you want to filter by
  const page = 1 // or use state to manage pagination
  const limit = 10 // or whatever limit you want

  // Fetch escalations for the business
  useEffect(() => {
    if (!businessId || !token) return

    const fetchEscalations = async () => {
      setLoading(true)
      try {
        const response = await axios.get(`${API_URL}/escalation/business/${businessId}?status=${status}&page=${page}&limit=${limit}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        // The API returns { escalations, total, page, limit, totalPages }
        // Transform the data to match the frontend interface
        const transformedEscalations = response.data.escalations.map((escalation: any) => ({
          _id: escalation._id,
          sessionId: escalation.sessionId,
          businessId: escalation.businessId,
          caseNumber: escalation.caseNumber,
          customerDetails: {
            name: escalation.customerName,
            email: escalation.customerEmail,
            phoneNumber: escalation.customerPhone || ''
          },
          concern: escalation.concern,
          description: escalation.description,
          status: escalation.status,
          assignedTo: undefined,
          createdAt: escalation.createdAt,
          updatedAt: escalation.updatedAt
        }))
        setEscalations(transformedEscalations)
        // Optionally, you can store total, page, limit, totalPages in state if needed
      } catch (error) {
        console.error('Error fetching escalations:', error)
        setEscalations([])
      } finally {
        setLoading(false)
      }
    }

    fetchEscalations()
  }, [businessId, token, status, page, limit])

  const selectedEscalation = escalations.find(esc => esc._id === selectedEscalationId)

  const handleUpdateStatus = async (escalationId: string, newStatus: string) => {
    try {
      // TODO: Replace with actual API call
      // await axios.patch(`${API_URL}/escalations/${escalationId}`, 
      //   { status: newStatus },
      //   { headers: { Authorization: `Bearer ${token}` } }
      // )
      
      // Update local state
      setEscalations(prev => prev.map(esc => 
        esc._id === escalationId 
          ? { ...esc, status: newStatus as any, updatedAt: new Date().toISOString() }
          : esc
      ))    } catch (error) {
      console.error('Error updating escalation status:', error)
    }
  }
  
  return (
    <div className="h-full w-full bg-background">
      {children}
    </div>
  )
}
