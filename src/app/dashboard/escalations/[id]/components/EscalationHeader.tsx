import React from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Check, Copy, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface EscalationHeaderProps {
  escalation: {
    caseNumber: string;
    sessionId: string;
    status: "escalated" | "pending" | "resolved";
  };
  statusColors: Record<string, string>;
  StatusIcon: React.ElementType;
  copiedCaseNumber: boolean;
  copiedSessionId: boolean;
  setCopiedCaseNumber: (v: boolean) => void;
  setCopiedSessionId: (v: boolean) => void;
  handleStatusChange: (status: string) => void;
}

export const EscalationHeader: React.FC<EscalationHeaderProps> = ({
  escalation,
  statusColors,
  StatusIcon,
  copiedCaseNumber,
  copiedSessionId,
  setCopiedCaseNumber,
  setCopiedSessionId,
  handleStatusChange,
}) => (
  <div className="border-b border-border bg-card w-full">
    <div className="px-4 py-3 md:px-6 md:py-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg md:text-2xl font-bold text-foreground tracking-tight">
                Case
              </h1>
              <h2 className="text-lg md:text-2xl font-bold text-foreground tracking-tight">
                #{escalation.caseNumber}
                <button
                  type="button"
                  className="ml-1 p-0.5 rounded hover:bg-accent"
                  title="Copy Case Number"
                  onClick={() => {
                    navigator.clipboard.writeText(escalation.caseNumber);
                    setCopiedCaseNumber(true);
                    setTimeout(() => setCopiedCaseNumber(false), 1500);
                  }}
                >
                  <span className="sr-only">Copy Case Number</span>
                  {copiedCaseNumber ? (
                    <Check className="h-3.5 w-3.5 text-green-500" />
                  ) : (
                    <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                  )}
                </button>
              </h2>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-muted-foreground text-xs md:text-sm break-all">
                Session ID: {escalation.sessionId}
              </span>
              <button
                type="button"
                className="ml-1 p-0.5 rounded hover:bg-accent"
                title="Copy Session ID"
                onClick={() => {
                  navigator.clipboard.writeText(escalation.sessionId);
                  setCopiedSessionId(true);
                  setTimeout(() => setCopiedSessionId(false), 1500);
                }}
              >
                <span className="sr-only">Copy Session ID</span>
                {copiedSessionId ? (
                  <Check className="h-3.5 w-3.5 text-green-500" />
                ) : (
                  <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                )}
              </button>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 md:gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <StatusIcon className={cn("h-4 w-4", statusColors[escalation.status])} />
                <span className="capitalize">{escalation.status}</span>
                <ChevronDown className="h-4 w-4 ml-1 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleStatusChange('escalated')}>
                <span className={cn("flex items-center gap-2", escalation.status === 'escalated' && 'font-bold')}>Escalated</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusChange('pending')}>
                <span className={cn("flex items-center gap-2", escalation.status === 'pending' && 'font-bold')}>Pending</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusChange('resolved')}>
                <span className={cn("flex items-center gap-2", escalation.status === 'resolved' && 'font-bold')}>Resolved</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  </div>
);
