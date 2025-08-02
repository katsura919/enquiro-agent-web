"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MousePointer, Menu } from "lucide-react";

export function TabContextMenuDemo() {
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MousePointer className="w-5 h-5" />
          Tab Context Menu
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant="outline">Right-click</Badge>
            <span className="text-sm text-muted-foreground">on any tab</span>
          </div>
        </div>

        <div className="space-y-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            <span>🔄 Refresh Tab - Reload tab content</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-orange-500" />
            <span>❌ Close Tab - Close current tab</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-yellow-500" />
            <span>📋 Close Other Tabs - Keep only this tab</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <span>🗑️ Close All Tabs - Reset to overview only</span>
          </div>
        </div>

        <div className="bg-accent/50 p-3 rounded-lg text-xs">
          <p className="font-medium mb-1">💡 Pro Tip:</p>
          <p className="text-muted-foreground">
            Right-click on any tab to access quick actions. The Overview tab cannot be closed to ensure you always have a home base.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
