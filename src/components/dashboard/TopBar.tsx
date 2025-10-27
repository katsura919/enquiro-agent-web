"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
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
  Trash2,
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
    <div className="h-14 border-b border-border bg-card backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="flex h-full items-center justify-between px-4 bg-card border-muted-gray">
        {/* Left side - Brand and New Tab */}
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden">
              <Image 
                src="/logo.png" 
                alt="Enquiro Logo" 
                width={32} 
                height={32}
                className="w-full h-full object-contain"
              />
            </div>
            <span className="font-semibold text-lg">Enquiro</span>
          </Link>
        </div>



        {/* Right side - Actions and User */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            className="h-8 w-8 p-0 cursor-pointer"
          >
            {theme === "light" ? (
              <Moon className="w-4 h-4" />
            ) : (
              <Sun className="w-4 h-4" />
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
              <Button variant="ghost" className="h-8 px-2 flex items-center gap-2 cursor-pointer">
                <Avatar className="h-6 w-6">
                  <AvatarImage src="" alt={user?.name || "Agent"} />
                  <AvatarFallback className="text-xs">
                    {user?.name?.charAt(0) || "A"}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium hidden sm:block">
                  {user?.name || "Agent"}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {user?.name || "Agent"}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email || "agent@enquiro.com"}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => openTab({ title: 'Profile', type: 'profile' })}
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
                <Trash2 className="mr-2 h-4 w-4" />
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
