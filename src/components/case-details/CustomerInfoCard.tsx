import { Card } from "@/components/ui/card";
import { Mail, Phone, UserCircle } from "lucide-react";

interface CustomerInfoProps {
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
}

export function CustomerInfoCard({ customerName, customerEmail, customerPhone }: CustomerInfoProps) {
  return (
    <Card className="p-4 bg-background/50">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex items-center gap-3 text-sm">
          <div className="h-8 w-8 rounded-md bg-primary/5 flex items-center justify-center">
            <UserCircle className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-muted-foreground">Name</p>
            <p className="font-medium">{customerName}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <div className="h-8 w-8 rounded-md bg-primary/5 flex items-center justify-center">
            <Mail className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-muted-foreground">Email</p>
            <p className="font-medium break-all">{customerEmail}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <div className="h-8 w-8 rounded-md bg-primary/5 flex items-center justify-center">
            <Phone className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-muted-foreground">Phone</p>
            <p className="font-medium">{customerPhone || 'Not provided'}</p>
          </div>
        </div>
      </div>
    </Card>
  );
}
