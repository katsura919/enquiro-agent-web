import React from "react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { ActivityIcon, FileText, RefreshCw, X, Box, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ActivityItem } from "./ActivityFeed";

interface ViewAllActivitiesProps {
  activities: ActivityItem[];
  formatDate: (dateString: string) => string;
}

export function ViewAllActivities({ activities, formatDate }: ViewAllActivitiesProps) {
  return (
    <Drawer direction="right">
      <DrawerTrigger asChild>
        <Button variant="outline" size="sm" className="w-full">
          View All Activities
        </Button>
      </DrawerTrigger>
      <DrawerContent className="w-full h-full sm:max-w-md">
        <DrawerHeader className="border-b px-4 py-4">
          <div className="flex items-center justify-between">            <div className="flex items-center gap-2">
              <ActivityIcon className="h-5 w-5 text-blue-500" />
              <DrawerTitle>All Activities</DrawerTitle>
            </div>
            <DrawerClose asChild>
              <Button variant="ghost" size="icon">
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </Button>
            </DrawerClose>
          </div>
          <DrawerDescription>Complete activity history for this case.</DrawerDescription>
        </DrawerHeader>        <ScrollArea className="h-[calc(100vh-7rem)]">
          <div className="space-y-6 p-4 pb-6">
            {activities.map((activity) => (
              <div key={activity.id} className="flex gap-4 items-start border-b pb-4 border-border/30 last:border-0 pl-1">
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
        </ScrollArea>
      </DrawerContent>
    </Drawer>
  );
}
