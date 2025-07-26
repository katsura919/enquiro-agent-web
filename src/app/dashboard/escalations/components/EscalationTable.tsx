"use client";
import * as React from "react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";

export interface Escalation {
  _id: string;
  caseNumber: string;
  customerName: string;
  customerEmail: string;
  concern: string;
  status: string;
  createdAt: string;
}

interface EscalationTableProps {
  escalations: Escalation[];
  onRowClick: (id: string) => void;
  loading?: boolean;
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
}

export function EscalationTable({ escalations, onRowClick, loading, selectedIds, onSelectionChange }: EscalationTableProps) {
  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      onSelectionChange(selectedIds.filter(sid => sid !== id));
    } else {
      onSelectionChange([...selectedIds, id]);
    }
  };
  const allSelected = escalations.length > 0 && selectedIds.length === escalations.length;
  const toggleSelectAll = () => {
    if (allSelected) {
      onSelectionChange([]);
    } else {
      onSelectionChange(escalations.map(e => e._id));
    }
  };

  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10">
              <Checkbox checked={allSelected} onCheckedChange={toggleSelectAll} aria-label="Select all" />
            </TableHead>
            <TableHead>Case #</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Concern</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Loading...</TableCell>
            </TableRow>
          ) : escalations.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No escalations found.</TableCell>
            </TableRow>
          ) : (
            escalations.map(e => (
              <TableRow key={e._id} className="cursor-pointer hover:bg-accent transition" onClick={() => onRowClick(e._id)}>
                <TableCell onClick={ev => ev.stopPropagation()}>
                  <Checkbox checked={selectedIds.includes(e._id)} onCheckedChange={() => toggleSelect(e._id)} aria-label={`Select escalation ${e.caseNumber}`} />
                </TableCell>
                <TableCell className="font-mono font-semibold">{e.caseNumber}</TableCell>
                <TableCell>{e.customerName}</TableCell>
                <TableCell className="truncate max-w-[160px]">{e.customerEmail}</TableCell>
                <TableCell className="truncate max-w-[200px]">{e.concern}</TableCell>
                <TableCell>
                  <span className="inline-block px-2 py-1 rounded text-xs font-medium bg-muted text-foreground">
                    {e.status.charAt(0).toUpperCase() + e.status.slice(1)}
                  </span>
                </TableCell>
                <TableCell>{new Date(e.createdAt).toLocaleDateString()}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
