"use client";
import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Bell,
  Settings,
  LogOut,
  User,
  Moon,
  Sun,
  Search,
  Plus,
  HelpCircle,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useTabs } from "@/context/TabsContext";
import { cn } from "@/lib/utils";

export function TopBar() {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const { openTab, clearAllTabs, isInitialized } = useTabs();
  const [notifications] = useState(3); // Mock notification count
  const [showResetDialog, setShowResetDialog] = useState(false);

  const handleNewTab = () => {
    // Open a quick actions menu or default to overview
    openTab({
      title: 'Quick Actions',
      type: 'overview',
    });
  };

  const handleSearch = () => {
    openTab({
      title: 'Product Search',
      type: 'product-search',
    });
  };

  return (
    <>
    <div className="h-14 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="flex h-full items-center justify-between px-4">
        {/* Left side - Brand and New Tab */}
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">E</span>
            </div>
            <span className="font-semibold text-lg">Enquiro</span>
          </Link>
        </div>

        {/* Center - Global Search */}
        <div className="flex-1 max-w-md mx-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <input
              type="text"
              placeholder="Search cases, products, or customers..."
              className="w-full h-9 pl-10 pr-4 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
              onFocus={handleSearch}
            />
          </div>
        </div>

        {/* Right side - Actions and User */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            className="h-8 w-8 p-0"
          >
            {theme === "light" ? (
              <Moon className="w-4 h-4" />
            ) : (
              <Sun className="w-4 h-4" />
            )}
          </Button>

          {/* Notifications */}
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 relative">
            <Bell className="w-4 h-4" />
            {notifications > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 h-5 w-5 text-xs p-0 flex items-center justify-center"
              >
                {notifications > 9 ? "9+" : notifications}
              </Badge>
            )}
          </Button>

          {/* Help */}
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <HelpCircle className="w-4 h-4" />
          </Button>

          {/* Tab Status Indicator */}
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <div className={cn(
              "w-2 h-2 rounded-full",
              isInitialized ? "bg-green-500" : "bg-yellow-500"
            )} />
            <span className="hidden sm:inline">
              {isInitialized ? "Tabs saved" : "Loading..."}
            </span>
          </div>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 px-2 flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src="" alt={`${user?.firstName} ${user?.lastName}` || "Agent"} />
                  <AvatarFallback className="text-xs">
                    {user?.firstName?.charAt(0) || "A"}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium hidden sm:block">
                  {user ? `${user.firstName} ${user.lastName}` : "Agent"}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {user ? `${user.firstName} ${user.lastName}` : "Agent"}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email || "agent@enquiro.com"}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => openTab({ title: 'Profile', type: 'settings' })}
              >
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => openTab({ title: 'Settings', type: 'settings' })}
              >
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setShowResetDialog(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Reset Tabs
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>

    {/* Reset Tabs Confirmation Dialog */}
    <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Reset All Tabs?</AlertDialogTitle>
          <AlertDialogDescription>
            This will close all tabs and reset to the default Overview tab. 
            Any unsaved work may be lost. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              clearAllTabs();
              setShowResetDialog(false);
            }}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Reset Tabs
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
}
