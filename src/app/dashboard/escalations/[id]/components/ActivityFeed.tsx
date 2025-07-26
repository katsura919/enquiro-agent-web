import { ActivityIcon, FileText, RefreshCw, Box, Truck } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ViewAllActivities } from "./ViewAllActivities";

export interface ActivityItem {
  id: string
  action: string
  timestamp: string
  details?: string
}

interface ActivityFeedProps {
  activities: ActivityItem[];
  formatDate: (dateString: string) => string;
}

export function ActivityFeed({ activities, formatDate }: ActivityFeedProps) {
  // Get only the 3 most recent activities
  const recentActivities = activities.slice(0, 3);
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ActivityIcon className="h-5 w-5 text-blue-500" />
          <h2 className="text-lg font-semibold">Recent Activity</h2>
        </div>
      </div>
      
      <Card className="bg-card p-4 overflow-hidden shadow-sm border-border/40">
        <div className="relative">
          {activities.length === 0 ? (
            <div className="p-8 text-center">
              <ActivityIcon className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
              <p className="text-muted-foreground">No recent activity</p>
            </div>          ) : (
            <>              
              <div className="space-y-2 relative">
                {recentActivities.map((activity, index) => (
                  <div key={activity.id} className="flex gap-4 items-start pl-1">
                    <div className="h-7 w-7 rounded-full bg-blue-500 flex items-center justify-center z-10 flex-shrink-0">
                      {activity.action.includes("Status") ? (
                        <RefreshCw className="h-3.5 w-3.5 text-white" />
                      ) : activity.action.includes("Note") ? (
                        <FileText className="h-3.5 w-3.5 text-white" />
                      ) : activity.action.includes("Delivering") ? (
                        <Truck className="h-3.5 w-3.5 text-white" />
                      ) : activity.action.includes("Shipment") ? (
                        <Box className="h-3.5 w-3.5 text-white" />
                      ) : (
                        <ActivityIcon className="h-3.5 w-3.5 text-white" />
                      )}
                    </div>
                    <div className="flex-1 pb-2">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{activity.action}</span>
                        {activity.details && (
                          <span className="text-xs text-muted-foreground">
                            {activity.details}
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground block mt-1">
                        {formatDate(activity.timestamp)}
                      </span>
                    </div>
                  </div>
                ))}              
                </div>
              
              {activities.length > 3 && (
                <div className="pt-3 mt-2 relative z-10 border-border/30">
                  <ViewAllActivities 
                    activities={activities} 
                    formatDate={formatDate}
                  />
                </div>
              )}
            </>
          )}
        </div>      </Card>
    </div>
  );
}
