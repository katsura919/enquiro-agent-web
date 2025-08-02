"use client";
import { useTabs } from "@/context/TabsContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FolderOpen, Save, RotateCcw, RefreshCw } from "lucide-react";

export function TabsPersistenceDemo() {
  const { tabs, activeTabId, clearAllTabs, initializeDefaultTabs, isInitialized } = useTabs();

  const handleTestPersistence = () => {
    alert(
      `Current tabs will be saved automatically!\n\n` +
      `Try refreshing the page - your tabs will remain.\n\n` +
      `Active tabs: ${tabs.length}\n` +
      `Active tab: ${tabs.find(t => t.id === activeTabId)?.title || 'None'}`
    );
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FolderOpen className="w-5 h-5" />
          Tab Persistence
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Status:</span>
            <Badge variant={isInitialized ? "default" : "secondary"}>
              {isInitialized ? "Initialized" : "Loading"}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Open tabs:</span>
            <Badge variant="outline">{tabs.length}</Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Active tab:</span>
            <Badge variant="secondary" className="text-xs">
              {tabs.find(t => t.id === activeTabId)?.title || 'None'}
            </Badge>
          </div>
        </div>

        <div className="space-y-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleTestPersistence}
            className="w-full"
          >
            <Save className="w-4 h-4 mr-2" />
            Test Persistence
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => {
              if (confirm('Reset all tabs to default?')) {
                clearAllTabs();
              }
            }}
            className="w-full"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset Tabs
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => window.location.reload()}
            className="w-full"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Test Refresh
          </Button>
        </div>

        <div className="text-xs text-muted-foreground">
          <p>✅ Tabs automatically save to localStorage</p>
          <p>✅ Tabs persist across page refreshes</p>
          <p>✅ Active tab is remembered</p>
          <p>✅ Invalid tabs are filtered out</p>
        </div>
      </CardContent>
    </Card>
  );
}
