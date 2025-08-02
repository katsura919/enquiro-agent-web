"use client";
import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from "react";

export interface Tab {
  id: string;
  title: string;
  type: 'overview' | 'chat' | 'escalations' | 'settings' | 'product-search' | 'case-details' | 'new-tab';
  icon?: React.ComponentType<{ className?: string }>;
  data?: any; // Additional data for the tab (e.g., chat session info, case details)
  closeable?: boolean;
  modified?: boolean; // For unsaved changes indication
}

interface TabsContextType {
  tabs: Tab[];
  activeTabId: string | null;
  setActiveTab: (id: string) => void;
  openTab: (tab: Omit<Tab, 'id'> & { id?: string }) => string;
  closeTab: (id: string) => void;
  updateTab: (id: string, updates: Partial<Tab>) => void;
  initializeDefaultTabs: () => void;
  clearAllTabs: () => void;
  refreshTab: (id: string) => void;
  closeAllTabs: () => void;
  closeOtherTabs: (keepTabId: string) => void;
  isInitialized: boolean;
}

const TabsContext = createContext<TabsContextType | undefined>(undefined);

// Storage keys
const TABS_STORAGE_KEY = 'agent-dashboard-tabs';
const ACTIVE_TAB_STORAGE_KEY = 'agent-dashboard-active-tab';

// Helper functions for localStorage
const saveTabsToStorage = (tabs: Tab[], activeTabId: string | null) => {
  try {
    localStorage.setItem(TABS_STORAGE_KEY, JSON.stringify(tabs));
    if (activeTabId) {
      localStorage.setItem(ACTIVE_TAB_STORAGE_KEY, activeTabId);
    }
  } catch (error) {
    console.warn('Failed to save tabs to localStorage:', error);
  }
};

const loadTabsFromStorage = (): { tabs: Tab[], activeTabId: string | null } => {
  try {
    const savedTabs = localStorage.getItem(TABS_STORAGE_KEY);
    const savedActiveTabId = localStorage.getItem(ACTIVE_TAB_STORAGE_KEY);
    
    if (savedTabs) {
      const tabs = JSON.parse(savedTabs);
      
      // Validate tabs structure
      const validTabs = tabs.filter((tab: any) => 
        tab && 
        typeof tab.id === 'string' && 
        typeof tab.title === 'string' && 
        typeof tab.type === 'string'
      );
      
      // Ensure we always have at least the overview tab
      const hasOverview = validTabs.some((tab: Tab) => tab.type === 'overview');
      if (!hasOverview) {
        const overviewTab: Tab = {
          id: 'overview',
          title: 'Overview',
          type: 'overview',
          closeable: false,
        };
        validTabs.unshift(overviewTab);
      }
      
      // Validate that the active tab still exists
      const activeTabId = savedActiveTabId && validTabs.find((t: Tab) => t.id === savedActiveTabId) 
        ? savedActiveTabId 
        : validTabs.length > 0 ? validTabs[0].id : null;
      
      return { tabs: validTabs, activeTabId };
    }
  } catch (error) {
    console.warn('Failed to load tabs from localStorage:', error);
  }
  
  return { tabs: [], activeTabId: null };
};

export function TabsProvider({ children }: { children: ReactNode }) {
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load tabs from localStorage on mount
  useEffect(() => {
    const { tabs: savedTabs, activeTabId: savedActiveTabId } = loadTabsFromStorage();
    
    if (savedTabs.length > 0) {
      setTabs(savedTabs);
      setActiveTabId(savedActiveTabId);
    } else {
      // Initialize with default tabs if nothing is saved
      initializeDefaultTabsInternal();
    }
    
    setIsInitialized(true);
  }, []);

  // Save tabs to localStorage whenever they change (but only after initialization)
  useEffect(() => {
    if (isInitialized) {
      saveTabsToStorage(tabs, activeTabId);
    }
  }, [tabs, activeTabId, isInitialized]);

  const setActiveTab = useCallback((id: string) => {
    setActiveTabId(id);
  }, []);

  const openTab = useCallback((tabData: Omit<Tab, 'id'> & { id?: string }) => {
    const id = tabData.id || `${tabData.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    setTabs((prev) => {
      // Check if tab already exists
      const existingTab = prev.find(t => t.id === id);
      if (existingTab) {
        setActiveTabId(id);
        return prev;
      }
      
      // Add new tab
      const newTab: Tab = {
        ...tabData,
        id,
        closeable: tabData.closeable !== false, // Default to true
      };
      
      const newTabs = [...prev, newTab];
      setActiveTabId(id);
      return newTabs;
    });
    
    return id;
  }, []);

  const closeTab = useCallback((id: string) => {
    setTabs((prev) => {
      const newTabs = prev.filter(t => t.id !== id);
      
      // If closing active tab, switch to another tab
      if (activeTabId === id) {
        const currentIndex = prev.findIndex(t => t.id === id);
        if (newTabs.length > 0) {
          // Try to activate the tab to the right, then left, then first
          const nextTab = newTabs[currentIndex] || newTabs[currentIndex - 1] || newTabs[0];
          setActiveTabId(nextTab.id);
        } else {
          setActiveTabId(null);
        }
      }
      
      return newTabs;
    });
  }, [activeTabId]);

  const updateTab = useCallback((id: string, updates: Partial<Tab>) => {
    setTabs((prev) => prev.map(tab => 
      tab.id === id ? { ...tab, ...updates } : tab
    ));
  }, []);

  // Internal function that doesn't trigger storage save
  const initializeDefaultTabsInternal = useCallback(() => {
    const overviewTab: Tab = {
      id: 'overview',
      title: 'Overview',
      type: 'overview',
      closeable: false,
    };
    
    setTabs([overviewTab]);
    setActiveTabId('overview');
  }, []);

  // Public function that can be called to reset tabs
  const initializeDefaultTabs = useCallback(() => {
    const overviewTab: Tab = {
      id: 'overview',
      title: 'Overview',
      type: 'overview',
      closeable: false,
    };
    
    setTabs([overviewTab]);
    setActiveTabId('overview');
  }, []);

  // Function to clear all tabs and reset to default
  const clearAllTabs = useCallback(() => {
    try {
      localStorage.removeItem(TABS_STORAGE_KEY);
      localStorage.removeItem(ACTIVE_TAB_STORAGE_KEY);
    } catch (error) {
      console.warn('Failed to clear tabs from localStorage:', error);
    }
    initializeDefaultTabs();
  }, [initializeDefaultTabs]);

  // Function to refresh a specific tab (can be customized per tab type)
  const refreshTab = useCallback((id: string) => {
    const tab = tabs.find(t => t.id === id);
    if (!tab) return;

    // Trigger a refresh by updating the tab's data or timestamp
    updateTab(id, { 
      data: { 
        ...tab.data, 
        lastRefresh: Date.now() 
      } 
    });

    // You can add specific refresh logic here based on tab type
    // For example, for escalation tabs, you might want to refetch data
    if (tab.type === 'escalations') {
      // Trigger escalation data refresh
      updateTab(id, { modified: false });
    }
  }, [tabs, updateTab]);

  // Function to close all tabs except the overview tab
  const closeAllTabs = useCallback(() => {
    const overviewTab = tabs.find(t => t.type === 'overview');
    if (overviewTab) {
      setTabs([overviewTab]);
      setActiveTabId(overviewTab.id);
    } else {
      initializeDefaultTabs();
    }
  }, [tabs, initializeDefaultTabs]);

  // Function to close all tabs except the specified one
  const closeOtherTabs = useCallback((keepTabId: string) => {
    const keepTab = tabs.find(t => t.id === keepTabId);
    const overviewTab = tabs.find(t => t.type === 'overview');
    
    if (!keepTab) return;

    // Always keep the overview tab and the specified tab
    const tabsToKeep = [keepTab];
    if (overviewTab && overviewTab.id !== keepTabId) {
      tabsToKeep.unshift(overviewTab);
    }

    setTabs(tabsToKeep);
    setActiveTabId(keepTabId);
  }, [tabs]);

  return (
    <TabsContext.Provider value={{
      tabs,
      activeTabId,
      setActiveTab,
      openTab,
      closeTab,
      updateTab,
      initializeDefaultTabs,
      clearAllTabs,
      refreshTab,
      closeAllTabs,
      closeOtherTabs,
      isInitialized,
    }}>
      {children}
    </TabsContext.Provider>
  );
}

export function useTabs() {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error('useTabs must be used within a TabsProvider');
  }
  return context;
}
