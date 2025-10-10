import { Calendar } from "lucide-react";
import { Card } from "@/components/ui/card";

interface TimelineProps {
  createdAt: string;
  updatedAt: string;
  formatDate: (dateString: string) => string;
}

export function Timeline({ createdAt, updatedAt, formatDate }: TimelineProps) {
  return (
    <div className="grid grid-cols-1 gap-6">
      <Card className="p-4 shadow-sm border-border/40">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center">
              <Calendar className="h-4 w-4 text-primary" />
            </div>
            <h3 className="font-semibold">Timeline</h3>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>Created: {formatDate(createdAt)}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>Updated: {formatDate(updatedAt)}</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
