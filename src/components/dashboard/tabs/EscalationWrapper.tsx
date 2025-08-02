"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { EscalationTable, Escalation } from "@/app/dashboard/escalations/components/EscalationTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useAuth } from "@/lib/auth";
import { useTabs } from "@/context/TabsContext";
import api from "@/utils/api";

export function EscalationWrapper() {
  const { openTab } = useTabs();
  const { user } = useAuth();
  const [escalations, setEscalations] = React.useState<Escalation[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [status, setStatus] = React.useState<"all" | "escalated" | "pending" | "resolved">("escalated");
  const [page, setPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);
  const [search, setSearch] = React.useState("");
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  const businessId = user?.businessId;

  React.useEffect(() => {
    if (!businessId) {
      console.log("Missing businessId, skipping fetch");
      return;
    }
    
    console.log("Fetching escalations...");
    setLoading(true);
    api.get(`/escalation/business/${businessId}?status=${status}&page=${page}&limit=10`)
      .then((res: any) => {
        console.log("API Response:", res.data);
        // Transform the data to match the EscalationTable interface
        const transformed = res.data.escalations.map((e: any) => ({
          _id: e._id,
          caseNumber: e.caseNumber,
          customerName: e.customerName,
          customerEmail: e.customerEmail,
          concern: e.concern,
          status: e.status,
          createdAt: e.createdAt,
        }));
        console.log("Transformed escalations:", transformed);
        setEscalations(transformed);
        setTotalPages(res.data.totalPages);
      })
      .catch((error: any) => {
        console.error("Error fetching escalations:", error);
        setEscalations([]);
      })
      .finally(() => setLoading(false));
  }, [businessId, status, page]);

  const handleRowClick = (id: string) => {
    // Open the escalation details in a new tab instead of navigating
    const escalation = escalations.find(e => e._id === id);
    if (escalation) {
      openTab({
        title: `Case ${escalation.caseNumber}`,
        type: "case-details",
        data: { 
          escalationId: id, 
          caseId: escalation.caseNumber, 
          type: "escalation",
          customerName: escalation.customerName,
          concern: escalation.concern
        },
      });
    }
  };

  console.log("Rendering with escalations:", escalations);
  
  return (
    <div className="flex-1 overflow-auto p-6">
      <div className="flex items-center gap-4 mb-6 justify-between">
        <Input
          placeholder="Search by customer, case #, or concern..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="max-w-md flex-1"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              {status.charAt(0).toUpperCase() + status.slice(1)}
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setStatus("all")}>All</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatus("escalated")}>Escalated</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatus("pending")}>Pending</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatus("resolved")}>Resolved</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <EscalationTable
        escalations={escalations.filter(e =>
          e.customerName.toLowerCase().includes(search.toLowerCase()) ||
          e.caseNumber.toLowerCase().includes(search.toLowerCase()) ||
          e.concern.toLowerCase().includes(search.toLowerCase())
        )}
        onRowClick={handleRowClick}
        loading={loading}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
      />
      
      <div className="flex justify-end gap-2 mt-4">
        <Button 
          disabled={page <= 1} 
          onClick={() => setPage(p => p - 1)} 
          variant="outline"
        >
          Previous
        </Button>
        <span className="px-2 text-muted-foreground">
          Page {page} of {totalPages}
        </span>
        <Button 
          disabled={page >= totalPages} 
          onClick={() => setPage(p => p + 1)} 
          variant="outline"
        >
          Next
        </Button>
      </div>
    </div>
  );
}
