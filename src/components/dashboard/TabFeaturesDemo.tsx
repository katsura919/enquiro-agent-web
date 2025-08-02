"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useTabs } from "@/context/TabsContext";
import { 
  Trash2, 
  RefreshCw, 
  MousePointer, 
  Zap,
  CheckCircle,
  AlertTriangle
} from "lucide-react";

export function TabFeaturesDemo() {
  const { tabs, clearAllTabs, refreshTab, closeAllTabs } = useTabs();
  const [showDemoDialog, setShowDemoDialog] = useState(false);

  const features = [
    {
      title: "Tab Persistence",
      description: "Tabs automatically save and restore on page refresh",
      icon: RefreshCw,
      status: "active",
      color: "text-green-600"
    },
    {
      title: "Right-Click Context Menu",
      description: "Right-click any tab for quick actions",
      icon: MousePointer,
      status: "active", 
      color: "text-blue-600"
    },
    {
      title: "Alert Dialog Confirmations",
      description: "Elegant confirmation dialogs for destructive actions",
      icon: AlertTriangle,
      status: "active",
      color: "text-orange-600"
    },
    {
      title: "Tab Management",
      description: "Close, refresh, and organize tabs efficiently",
      icon: Zap,
      status: "active",
      color: "text-purple-600"
    }
  ];

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-600" />
          Tab System Features
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Features List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                <IconComponent className={`w-5 h-5 mt-0.5 ${feature.color}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-sm">{feature.title}</h4>
                    <Badge variant="outline" className="text-xs">
                      {feature.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Quick Actions</h4>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refreshTab(tabs[0]?.id)}
              disabled={tabs.length === 0}
            >
              <RefreshCw className="w-3 h-3 mr-2" />
              Refresh Current Tab
            </Button>

            {/* Demo Alert Dialog */}
            <AlertDialog open={showDemoDialog} onOpenChange={setShowDemoDialog}>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <AlertTriangle className="w-3 h-3 mr-2" />
                  Demo Alert Dialog
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Demo Alert Dialog</AlertDialogTitle>
                  <AlertDialogDescription>
                    This is an example of the shadcn AlertDialog component we're using 
                    throughout the application for confirmation dialogs. It provides a 
                    much better user experience than browser confirm dialogs.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => setShowDemoDialog(false)}
                  >
                    Understood
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            {tabs.length > 1 && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Trash2 className="w-3 h-3 mr-2" />
                    Close All Tabs
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Close All Tabs?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will close all tabs except the Overview tab. This is the same 
                      dialog you'll see when using the context menu option.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={closeAllTabs}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Close All Tabs
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>

        {/* Usage Instructions */}
        <div className="bg-accent/50 p-4 rounded-lg space-y-2">
          <h4 className="font-medium text-sm flex items-center gap-2">
            <MousePointer className="w-4 h-4" />
            How to Use
          </h4>
          <div className="space-y-1 text-xs text-muted-foreground">
            <p>• <strong>Right-click</strong> on any tab to see context menu options</p>
            <p>• <strong>Refresh</strong> tabs will reload their content</p>
            <p>• <strong>Close Other Tabs</strong> keeps only the selected tab</p>
            <p>• <strong>Close All Tabs</strong> resets to Overview only</p>
            <p>• All destructive actions show confirmation dialogs</p>
            <p>• Tab state persists across page refreshes</p>
          </div>
        </div>

        {/* Current Tab Status */}
        <div className="pt-2 border-t">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Current tabs: {tabs.length}</span>
            <span>Features: All Active ✅</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
