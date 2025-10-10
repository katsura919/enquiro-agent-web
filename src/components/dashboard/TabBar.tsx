"use client";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
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
import { cn } from "@/lib/utils";
import { useTabs } from "@/context/TabsContext";
import {
  X,
  MoreHorizontal,
  Plus,
  LayoutDashboard,
  MessageSquare,
  AlertTriangle,
  Settings,
  Search,
  Wrench,
  FileText,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  XCircle,
  Trash2,
} from "lucide-react";

const tabIcons = {
  overview: LayoutDashboard,
  chat: MessageSquare,
  escalations: AlertTriangle,
  settings: Settings,
  'product-search': Search,
  'service-search': Wrench,
  'case-details': FileText,
  'new-tab': Plus,
};

export function TabBar() {
  const { tabs, activeTabId, setActiveTab, closeTab, openTab, refreshTab, closeAllTabs, closeOtherTabs } = useTabs();
  const [showScrollButtons, setShowScrollButtons] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [showCloseAllDialog, setShowCloseAllDialog] = useState(false);
  const tabsContainerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Check if scrolling is needed
  const checkScroll = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const { scrollLeft, scrollWidth, clientWidth } = container;
    setShowScrollButtons(scrollWidth > clientWidth);
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth);
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [tabs]);

  const scrollTabs = (direction: 'left' | 'right') => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const scrollAmount = 200;
    container.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  const handleNewTab = () => {
    openTab({
      title: 'New Tab',
      type: 'new-tab',
    });
  };

  const quickActions = [
    { label: 'New Chat Session', type: 'chat' as const, icon: MessageSquare },
    { label: 'Search Products', type: 'product-search' as const, icon: Search },
    { label: 'Search Services', type: 'service-search' as const, icon: Wrench },
    { label: 'View Escalations', type: 'escalations' as const, icon: AlertTriangle },
    { label: 'Case Details', type: 'case-details' as const, icon: FileText },
  ];

  return (
    <>
    <div className="h-10 border-b border-border bg-muted/30 flex items-center">
      {/* Scroll Left Button */}
      {showScrollButtons && canScrollLeft && (
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 shrink-0"
          onClick={() => scrollTabs('left')}
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
      )}

      {/* Tabs Container */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-x-auto scrollbar-hide"
        onScroll={checkScroll}
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <div ref={tabsContainerRef} className="flex items-center h-full min-w-max">
          {tabs.map((tab) => {
            const IconComponent = tabIcons[tab.type] || LayoutDashboard;
            const isActive = activeTabId === tab.id;

            return (
              <ContextMenu key={tab.id}>
                <ContextMenuTrigger asChild>
                  <div
                    className={cn(
                      "group relative flex items-center h-8 px-3 border-r border-border cursor-pointer transition-all duration-200 hover:bg-accent/50 min-w-0 max-w-48",
                      isActive
                        ? "bg-background border-b-2 border-b-primary"
                        : "hover:bg-accent/30"
                    )}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    {/* Tab Content */}
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <IconComponent className="w-3 h-3 shrink-0 text-muted-foreground" />
                      <span className="text-xs font-medium truncate">
                        {tab.title}
                      </span>
                      {tab.modified && (
                        <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                      )}
                    </div>

                    {/* Close Button */}
                    {tab.closeable !== false && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 ml-1 shrink-0 opacity-0 group-hover:opacity-100 hover:bg-destructive/20 hover:text-destructive transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation();
                          closeTab(tab.id);
                        }}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                </ContextMenuTrigger>
                
                <ContextMenuContent className="w-56">
                  <ContextMenuItem 
                    onClick={() => refreshTab(tab.id)}
                    className="cursor-pointer"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Refresh Tab
                  </ContextMenuItem>
                  
                  <ContextMenuSeparator />
                  
                  {tab.closeable !== false && (
                    <ContextMenuItem 
                      onClick={() => closeTab(tab.id)}
                      className="cursor-pointer"
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      Close Tab
                    </ContextMenuItem>
                  )}
                  
                  {tabs.length > 1 && (
                    <ContextMenuItem 
                      onClick={() => closeOtherTabs(tab.id)}
                      className="cursor-pointer"
                    >
                      <X className="mr-2 h-4 w-4" />
                      Close Other Tabs
                    </ContextMenuItem>
                  )}
                  
                  {tabs.length > 1 && (
                    <>
                      <ContextMenuSeparator />
                      <ContextMenuItem 
                        onClick={() => setShowCloseAllDialog(true)}
                        className="cursor-pointer text-destructive focus:text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Close All Tabs
                      </ContextMenuItem>
                    </>
                  )}
                </ContextMenuContent>
              </ContextMenu>
            );
          })}
          
          {/* New Tab Button - placed after tabs */}
          <div className="shrink-0">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 border-r border-border rounded-none hover:bg-accent/30"
              onClick={handleNewTab}
            >
              <Plus className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </div>

      {/* Scroll Right Button */}
      {showScrollButtons && canScrollRight && (
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 shrink-0"
          onClick={() => scrollTabs('right')}
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      )}

      {/* Quick Actions Dropdown */}
      <div className="shrink-0 border-l border-border">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 rounded-none"
            >
              <MoreHorizontal className="w-3 h-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {quickActions.map((action) => {
              const IconComponent = action.icon;
              return (
                <DropdownMenuItem
                  key={action.type}
                  onClick={() => openTab({ title: action.label, type: action.type })}
                  className="cursor-pointer"
                >
                  <IconComponent className="mr-2 h-4 w-4" />
                  {action.label}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>

    {/* Close All Tabs Confirmation Dialog */}
    <AlertDialog open={showCloseAllDialog} onOpenChange={setShowCloseAllDialog}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Close All Tabs?</AlertDialogTitle>
          <AlertDialogDescription>
            This will close all tabs except the Overview tab. Any unsaved work may be lost. 
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              closeAllTabs();
              setShowCloseAllDialog(false);
            }}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Close All Tabs
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </>
  );
}
