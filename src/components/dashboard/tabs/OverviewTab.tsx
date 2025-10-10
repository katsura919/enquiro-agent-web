"use client";
import { Tab } from "@/context/TabsContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTabs } from "@/context/TabsContext";
import {
  Search,
  FileText,
  Package,
  Wrench,
  HelpCircle,
  Shield,
  MessageSquare,
  AlertTriangle,
  Users,
  BarChart3,
  Clock,
  Star,
  BookOpen,
  Settings,
  Zap,
} from "lucide-react";

interface OverviewTabProps {
  tab: Tab;
}

export function OverviewTab({ tab }: OverviewTabProps) {
  const { openTab } = useTabs();

  const quickActions = [
    {
      title: "View All Cases",
      description: "Browse and manage all customer cases",
      icon: FileText,
      color: "from-blue-500 to-blue-600",
      action: () => openTab({ title: "Escalations", type: "escalations" }),
    },
    {
      title: "View All Products",
      description: "Search and explore product catalog",
      icon: Package,
      color: "from-green-500 to-green-600",
      action: () => openTab({ title: "Product Catalog", type: "product-search" }),
    },
    {
      title: "View All Services",
      description: "Manage and review service offerings",
      icon: Wrench,
      color: "from-purple-500 to-purple-600",
      action: () => openTab({ title: "Service Catalog", type: "service-search" }),
    },
    {
      title: "FAQ & Knowledge Base",
      description: "Access frequently asked questions and guides",
      icon: HelpCircle,
      color: "from-orange-500 to-orange-600",
      action: () => openTab({ title: "FAQ & Knowledge", type: "case-details", data: { viewType: "faq" } }),
    },
    {
      title: "Policies & Guidelines",
      description: "Review company policies and procedures",
      icon: Shield,
      color: "from-red-500 to-red-600",
      action: () => openTab({ title: "Policies", type: "case-details", data: { viewType: "policies" } }),
    },
    {
      title: "Customer Directory",
      description: "Search and manage customer information",
      icon: Users,
      color: "from-indigo-500 to-indigo-600",
      action: () => openTab({ title: "Customers", type: "case-details", data: { viewType: "customers" } }),
    },
  ];

  const recentActions = [
    {
      title: "Start New Chat",
      description: "Begin a new customer conversation",
      icon: MessageSquare,
      action: () => openTab({ title: "New Chat Session", type: "chat" }),
    },
    {
      title: "View Escalations",
      description: "Check urgent cases requiring attention",
      icon: AlertTriangle,
      action: () => openTab({ title: "Escalations", type: "escalations" }),
    },
    {
      title: "Analytics Dashboard",
      description: "View performance metrics and reports",
      icon: BarChart3,
      action: () => openTab({ title: "Analytics", type: "case-details", data: { viewType: "analytics" } }),
    },
    {
      title: "Recent Activity",
      description: "View your recent actions and updates",
      icon: Clock,
      action: () => openTab({ title: "Activity Log", type: "case-details", data: { viewType: "activity" } }),
    },
  ];

  const featuredTools = [
    {
      title: "Quick Search",
      description: "Search across all resources",
      icon: Search,
      action: () => {
        // Focus on the global search in top bar
        const searchInput = document.querySelector('input[placeholder*="Search"]') as HTMLInputElement;
        searchInput?.focus();
      },
    },
    {
      title: "Bookmarks",
      description: "Access your saved items",
      icon: Star,
      action: () => openTab({ title: "Bookmarks", type: "case-details", data: { viewType: "bookmarks" } }),
    },
    {
      title: "Training Materials",
      description: "Access learning resources",
      icon: BookOpen,
      action: () => openTab({ title: "Training", type: "case-details", data: { viewType: "training" } }),
    },
    {
      title: "Settings",
      description: "Customize your workspace",
      icon: Settings,
      action: () => openTab({ title: "Settings", type: "settings" }),
    },
  ];

  return (
    <div className="flex-1 overflow-auto p-6">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Main Actions Grid */}
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickActions.map((action) => {
              const IconComponent = action.icon;
              return (
                <Card
                  key={action.title}
                  className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:-translate-y-1 group border-0 bg-gradient-to-br from-background to-background/50 backdrop-blur-sm"
                  onClick={action.action}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                        <IconComponent className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                          {action.title}
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {action.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Secondary Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent & Frequent */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Recent & Frequent</h3>
            <div className="space-y-3">
              {recentActions.map((action) => {
                const IconComponent = action.icon;
                return (
                  <Card
                    key={action.title}
                    className="cursor-pointer hover:shadow-md transition-all duration-200 hover:bg-accent/50 group"
                    onClick={action.action}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                          <IconComponent className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium group-hover:text-primary transition-colors">
                            {action.title}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {action.description}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Tools & Utilities */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Tools & Utilities</h3>
            <div className="space-y-3">
              {featuredTools.map((tool) => {
                const IconComponent = tool.icon;
                return (
                  <Card
                    key={tool.title}
                    className="cursor-pointer hover:shadow-md transition-all duration-200 hover:bg-accent/50 group"
                    onClick={tool.action}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center group-hover:bg-muted/80 transition-colors">
                          <IconComponent className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium group-hover:text-primary transition-colors">
                            {tool.title}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {tool.description}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>

        {/* Quick Tips */}
        <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <Star className="w-5 h-5" />
              Pro Tips
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm">
              • Use <kbd className="px-2 py-1 text-xs bg-muted rounded">Ctrl+T</kbd> to quickly open a new tab
            </p>
            <p className="text-sm">
              • Right-click on tabs for additional options
            </p>
            <p className="text-sm">
              • Use the global search at the top to find anything quickly
            </p>
            <p className="text-sm">
              • Pin frequently used tabs for easy access
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
