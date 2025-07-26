import { Card } from "@/components/ui/card";
import { Mail, Phone, UserCircle, AlertTriangle, Clock, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface CustomerIssueCardProps {
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  concern: string;
  description?: string;
  status: "escalated" | "pending" | "resolved";
}

export function CustomerIssueCard({ 
  customerName, 
  customerEmail, 
  customerPhone,
  concern,
  description,
  status
}: CustomerIssueCardProps) {
  const statusColors = {
    escalated: "text-orange-400",
    pending: "text-yellow-400",
    resolved: "text-green-400"
  };

  const StatusIcon = status === 'escalated' ? AlertTriangle : status === 'pending' ? Clock : CheckCircle;

  return (
    <Card className="bg-card overflow-hidden shadow-sm border-border/40">
      <div className="p-6">


        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Customer Information */}
          <div className="space-y-4">
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-md bg-primary/5 flex items-center justify-center">
                  <UserCircle className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">{customerName}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-md bg-primary/5 flex items-center justify-center">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium break-all">{customerEmail}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-md bg-primary/5 flex items-center justify-center">
                  <Phone className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{customerPhone || 'Not provided'}</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Issue Details */}
          <div className="space-y-4">
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Concern</p>
                <p className="leading-relaxed">{concern}</p>
              </div>
              
              {description && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Additional Description</p>
                  <p className="leading-relaxed whitespace-pre-wrap">{description}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
