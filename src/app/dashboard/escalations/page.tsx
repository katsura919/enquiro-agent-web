"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { EscalationTable, Escalation } from "./components/EscalationTable"
import { EscalationCountCards } from "./components/EscalationCountCards"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Filter } from "lucide-react"
import { useAuth } from "@/lib/auth"
import api from "@/utils/api"

export default function EscalationsPage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const [escalations, setEscalations] = React.useState<Escalation[]>([])
  const [initialLoading, setInitialLoading] = React.useState(true) // For first load
  const [paginationLoading, setPaginationLoading] = React.useState(false) // For pagination
  const [status, setStatus] = React.useState<"all" | "escalated" | "pending" | "resolved">("all")
  const [page, setPage] = React.useState(1)
  const [totalPages, setTotalPages] = React.useState(1)
  const [search, setSearch] = React.useState("")
  const [debouncedSearch, setDebouncedSearch] = React.useState("")
  const [selectedIds, setSelectedIds] = React.useState<string[]>([])
  const [isMobile, setIsMobile] = React.useState(false)
  const businessId = user?.businessId
  
  // Debug logging
  React.useEffect(() => {
    console.log("=== ESCALATIONS PAGE DEBUG ===")
    console.log("Auth Loading:", authLoading)
    console.log("User Object:", user)
    console.log("Business ID:", businessId)
    console.log("==============================")
  }, [authLoading, user, businessId])

  // Debounce search input
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
      setPage(1) // Reset to first page when search changes
    }, 500) // 500ms delay

    return () => clearTimeout(timer)
  }, [search])

  // Check if mobile on mount and resize
  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])


  React.useEffect(() => {
    if (!businessId) {
      console.log("Missing businessId, skipping fetch")
      return
    }
    
    // Determine which loading state to use
    const isFirstLoad = escalations.length === 0
    if (isFirstLoad) {
      setInitialLoading(true)
    } else {
      setPaginationLoading(true)
    }

    // Build query parameters
    const queryParams = new URLSearchParams({
      status: status,
      page: page.toString(),
      limit: '13'
    })
    
    // Add search parameter if it exists
    if (debouncedSearch.trim()) {
      queryParams.append('search', debouncedSearch.trim())
    }

    api.get(`/escalation/business/${businessId}?${queryParams.toString()}`)
      .then((res: any) => {
        console.log("API Response:", res.data)
        // Transform the data to match the EscalationTable interface
        const transformed = res.data.escalations.map((e: any) => ({
          _id: e._id,
          caseNumber: e.caseNumber,
          customerName: e.customerName,
          customerEmail: e.customerEmail,
          concern: e.concern,
          status: e.status,
          createdAt: e.createdAt,
          caseOwner: e.caseOwner,
        }))
        console.log("Transformed escalations:", transformed)
        setEscalations(transformed)
        setTotalPages(res.data.totalPages)
      })
      .catch((error: any) => {
        console.error("Error fetching escalations:", error)
        setEscalations([])
      })
      .finally(() => {
        setInitialLoading(false)
        setPaginationLoading(false)
      })
  }, [businessId, status, page, debouncedSearch])

  const handleRowClick = (id: string) => {
    router.push(`/dashboard/escalations/${id}`)
  }

  const handleCountCardClick = (selectedStatus: "all" | "escalated" | "pending" | "resolved") => {
    setStatus(selectedStatus)
    setPage(1) // Reset to first page when changing filter
  }

  console.log("Rendering with escalations:", escalations)
  
  // Show loading state while auth is loading
  if (authLoading) {
    return (
      <div className="p-6 w-full flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-lg text-muted-foreground">Loading...</div>
        </div>
      </div>
    )
  }

  // Show error if no user or businessId after auth loads
  if (!user || !businessId) {
    return (
      <div className="p-6 w-full flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-lg text-destructive">Unable to load user data. Please try logging in again.</div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 w-full">

      {/* Count Cards */}
      <EscalationCountCards
        businessId={businessId}
        onCountClick={handleCountCardClick}
        activeStatus={status}
      />

      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <Input
          placeholder="Search by customer, case #, or concern..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="bg-card shadow-none max-w-md flex-1 sm:flex-none"
        />
        <Select value={status} onValueChange={(value) => handleCountCardClick(value as "all" | "escalated" | "pending" | "resolved")}>
          <SelectTrigger className="bg-card min-w-[180px]">
            <Filter className="w-4 h-4" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent align="end">
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="escalated">Escalated</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Escalation Table */}
      <EscalationTable
        escalations={escalations}
        onRowClick={handleRowClick}
        loading={paginationLoading}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
      />
      
      {/* Pagination */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6">
        <div className="text-sm text-muted-foreground">
          Showing {escalations.length} of {totalPages * 14} total escalations
        </div>
        <div className="flex items-center gap-2">
          <Button 
            className="bg-card"
            disabled={page <= 1} 
            onClick={() => setPage(p => p - 1)} 
            variant="outline"
          >
            Previous
          </Button>
          <span className="px-3 py-1 text-sm text-muted-foreground rounded">
            Page {page} of {totalPages}
          </span>
          <Button 
            className="bg-card"
            disabled={page >= totalPages} 
            onClick={() => setPage(p => p + 1)} 
            variant="outline"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
