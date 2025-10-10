import { AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface IssueDetailsProps {
  concern: string;
  description?: string;
  status: "escalated" | "pending" | "resolved";
}

export function IssueDetails({ concern, description, status }: IssueDetailsProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-orange-500" />
          <h2 className="text-lg font-semibold">Issue Details</h2>
        </div>
        <Badge 
          className={cn(
            "capitalize",
            status === "escalated" && "bg-orange-500/10 text-orange-500 hover:bg-orange-500/20",
            status === "pending" && "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20",
            status === "resolved" && "bg-green-500/10 text-green-500 hover:bg-green-500/20"
          )}
        >
          {status}
        </Badge>
      </div>
      <Card className="p-4 overflow-hidden shadow-sm border-border/40">
        <div className="space-y-3">
          <div>
            <h4 className="font-medium text-foreground mb-2">Concern</h4>
            <p className="text-muted-foreground leading-relaxed">{concern}</p>
          </div>
          {description && (
            <div>
              <h4 className="font-medium text-foreground mb-2">Additional Description</h4>
              <p className="text-muted-foreground leading-relaxed">{description}</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
