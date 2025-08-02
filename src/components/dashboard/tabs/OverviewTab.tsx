"use client";
import { Tab } from "@/context/TabsContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTabs } from "@/context/TabsContext";
import {
  MessageSquare,
  AlertTriangle,
  Search,
  FileText,
  TrendingUp,
  Clock,
  Users,
  CheckCircle,
} from "lucide-react";
import { TabContextMenuDemo } from "../TabContextMenuDemo";
import { TabFeaturesDemo } from "../TabFeaturesDemo";

interface OverviewTabProps {
  tab: Tab;
}

export function OverviewTab({ tab }: OverviewTabProps) {
  const { openTab } = useTabs();

  const stats = [
    { label: "Active Chats", value: "12", icon: MessageSquare, color: "text-blue-600" },
    { label: "Pending Cases", value: "8", icon: Clock, color: "text-orange-600" },
    { label: "Escalations", value: "3", icon: AlertTriangle, color: "text-red-600" },
    { label: "Resolved Today", value: "24", icon: CheckCircle, color: "text-green-600" },
  ];

  const quickActions = [
    {
      title: "Start New Chat",
      description: "Begin a new customer conversation",
      icon: MessageSquare,
      action: () => openTab({ title: "New Chat Session", type: "chat" }),
    },
    {
      title: "Search Products",
      description: "Find product information quickly",
      icon: Search,
      action: () => openTab({ title: "Product Search", type: "product-search" }),
    },
    {
      title: "View Escalations",
      description: "Manage escalated cases",
      icon: AlertTriangle,
      action: () => openTab({ title: "Escalations", type: "escalations" }),
    },
    {
      title: "Case Details",
      description: "Open a specific case",
      icon: FileText,
      action: () => openTab({ title: "Case Details", type: "case-details" }),
    },
  ];

  const recentActivity = [
    { id: 1, action: "Resolved case #12345", time: "2 minutes ago" },
    { id: 2, action: "Escalated case #12344", time: "15 minutes ago" },
    { id: 3, action: "Started chat with John Doe", time: "1 hour ago" },
    { id: 4, action: "Updated product information", time: "2 hours ago" },
  ];

  return (
    <div className="flex-1 overflow-auto p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">Agent Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's an overview of your current workload.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => {
            const IconComponent = stat.icon;
            return (
              <Card key={stat.label}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        {stat.label}
                      </p>
                      <p className="text-2xl font-bold">{stat.value}</p>
                    </div>
                    <IconComponent className={`w-8 h-8 ${stat.color}`} />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Quick Actions
              </CardTitle>
              <CardDescription>
                Common tasks to help you get started quickly
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {quickActions.map((action) => {
                const IconComponent = action.icon;
                return (
                  <Button
                    key={action.title}
                    variant="outline"
                    className="w-full justify-start h-auto p-4"
                    onClick={action.action}
                  >
                    <div className="flex items-center gap-3">
                      <IconComponent className="w-5 h-5 text-primary" />
                      <div className="text-left">
                        <div className="font-medium">{action.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {action.description}
                        </div>
                      </div>
                    </div>
                  </Button>
                );
              })}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Recent Activity
              </CardTitle>
              <CardDescription>
                Your latest actions and updates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center justify-between py-2 border-b border-border last:border-0"
                  >
                    <div className="font-medium text-sm">{activity.action}</div>
                    <div className="text-xs text-muted-foreground">
                      {activity.time}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Tab Context Menu Demo */}
          <div>
            <TabContextMenuDemo />
          </div>
        </div>

        {/* Tab Features Demo - Full width */}
        <div className="w-full flex justify-center">
          <TabFeaturesDemo />
        </div>
      </div>
    </div>
  );
}
