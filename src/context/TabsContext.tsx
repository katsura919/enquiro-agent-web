"use client";
import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect, useRef } from "react";
import { getSocket } from "@/utils/socket";

export interface Tab {
  id: string;
  title: string;
  type: 'overview' | 'chat' | 'escalations' | 'settings' | 'product-search' | 'service-search' | 'case-details' | 'new-tab';
  icon?: React.ComponentType<{ className?: string }>;
  data?: any; // Additional data for the tab (e.g., chat session info, case details)
  closeable?: boolean;
  modified?: boolean; // For unsaved changes indication
}

export interface ChatWindowState {
  visible: boolean;
  escalationId?: string;
  customerName?: string;
  sessionId?: string;
  businessId?: string;
  connected?: boolean;
  messages?: any[];
  disconnected?: boolean; // Flag to prevent reconnection
}

interface TabsContextType {
  tabs: Tab[];
  activeTabId: string | null;
  chatWindowState: ChatWindowState;
  setActiveTab: (id: string) => void;
  openTab: (tab: Omit<Tab, 'id'> & { id?: string }) => string;
  closeTab: (id: string) => void;
  updateTab: (id: string, updates: Partial<Tab>) => void;
  initializeDefaultTabs: () => void;
  clearAllTabs: () => void;
  refreshTab: (id: string) => void;
  closeAllTabs: () => void;
  closeOtherTabs: (keepTabId: string) => void;
  setChatWindowState: (state: Partial<ChatWindowState>) => void;
  connectToChat: (escalationId: string, sessionId: string, businessId: string, customerName: string, agentId: string) => void;
  disconnectFromChat: (agentId: string) => void;
  addChatMessage: (message: any) => void;
  isInitialized: boolean;
}

const TabsContext = createContext<TabsContextType | undefined>(undefined);

// Storage keys
const TABS_STORAGE_KEY = 'agent-dashboard-tabs';
const ACTIVE_TAB_STORAGE_KEY = 'agent-dashboard-active-tab';
const CHAT_WINDOW_STORAGE_KEY = 'agent-dashboard-chat-window';

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

const saveChatWindowToStorage = (chatWindowState: ChatWindowState) => {
  try {
    localStorage.setItem(CHAT_WINDOW_STORAGE_KEY, JSON.stringify(chatWindowState));
  } catch (error) {
    console.warn('Failed to save chat window state to localStorage:', error);
  }
};

const loadChatWindowFromStorage = (): ChatWindowState => {
  try {
    const saved = localStorage.getItem(CHAT_WINDOW_STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.warn('Failed to load chat window state from localStorage:', error);
  }
  return { visible: false };
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
  const [chatWindowState, setChatWindowStateInternal] = useState<ChatWindowState>({ visible: false });
  const [isInitialized, setIsInitialized] = useState(false);

  // Load tabs from localStorage on mount
  useEffect(() => {
    const { tabs: savedTabs, activeTabId: savedActiveTabId } = loadTabsFromStorage();
    const savedChatWindow = loadChatWindowFromStorage();
    
    if (savedTabs.length > 0) {
      setTabs(savedTabs);
      setActiveTabId(savedActiveTabId);
    } else {
      // Initialize with default tabs if nothing is saved
      initializeDefaultTabsInternal();
    }
    
    setChatWindowStateInternal(savedChatWindow);
    setIsInitialized(true);
  }, []);

  // Save tabs to localStorage whenever they change (but only after initialization)
  useEffect(() => {
    if (isInitialized) {
      saveTabsToStorage(tabs, activeTabId);
    }
  }, [tabs, activeTabId, isInitialized]);

  // Save chat window state to localStorage whenever it changes (but only after initialization)
  useEffect(() => {
    if (isInitialized) {
      saveChatWindowToStorage(chatWindowState);
    }
  }, [chatWindowState, isInitialized]);

  // Persistent socket connection management for chat
  useEffect(() => {
    if (!isInitialized || 
        !chatWindowState.escalationId || 
        !chatWindowState.sessionId || 
        chatWindowState.disconnected) {
      // Don't set up socket listeners if chat is permanently disconnected
      if (chatWindowState.disconnected) {
        console.log('[TabsContext] Chat is disconnected, not setting up socket listeners');
      }
      return;
    }

    const socket = getSocket();
    const chatRoom = `chat_${chatWindowState.escalationId}`;
    
    console.log('[TabsContext] Setting up persistent socket listeners for:', {
      escalationId: chatWindowState.escalationId,
      sessionId: chatWindowState.sessionId,
      chatRoom
    });

    // Load messages if we don't have them yet
    if (!chatWindowState.messages || chatWindowState.messages.length === 0) {
      import('@/utils/api').then(({ default: api }) => {
        api.get(`/chat/session/${chatWindowState.sessionId}`)
          .then(res => {
            setChatWindowStateInternal(prev => ({
              ...prev,
              messages: res.data || []
            }));
          })
          .catch(err => {
            console.error('[TabsContext] Failed to load messages:', err);
          });
      });
    }

    // Listen for chat started event (from backend assignment)
    const handleChatStarted = (data: any) => {
      console.log('[TabsContext] Chat started event:', data);
      if (data.escalationId === chatWindowState.escalationId) {
        // Now we can join the room as the chat has officially started
        socket.emit('join_chat_room', { 
          room: data.room || chatRoom, 
          agentId: data.agentId,
          escalationId: data.escalationId 
        });
        
        setChatWindowStateInternal(prev => ({
          ...prev,
          connected: true
        }));
      }
    };

    // Listen for agent joined confirmation
    const handleAgentJoined = (data: any) => {
      console.log('[TabsContext] Agent joined confirmation:', data);
      if (data.escalationId === chatWindowState.escalationId) {
        setChatWindowStateInternal(prev => ({
          ...prev,
          connected: true
        }));
      }
    };

    // Listen for new messages
    const handleNewMessage = (msg: any) => {
      console.log('[TabsContext] New message received:', msg);
      if (msg.sessionId === chatWindowState.sessionId || 
          msg.escalationId === chatWindowState.escalationId || 
          (msg.escalationId && msg.escalationId.toString() === chatWindowState.escalationId)) {
        
        setChatWindowStateInternal(prev => {
          const existingMessages = prev.messages || [];
          // Avoid duplicates
          if (existingMessages.find(m => m._id === msg._id)) return prev;
          return {
            ...prev,
            messages: [...existingMessages, msg]
          };
        });
      }
    };

    // Listen for typing indicators
    const handleCustomerTyping = (data: any) => {
      console.log('[TabsContext] Customer typing event:', data);
      // Handle typing indicator in the chat window state if needed
    };

    // Listen for chat ended
    const handleChatEnded = (data: any) => {
      console.log('[TabsContext] Chat ended event:', data);
      if (data.escalationId === chatWindowState.escalationId) {
        setChatWindowStateInternal(prev => ({
          ...prev,
          connected: false,
          disconnected: true // Prevent reconnection
        }));
      }
    };

    // Listen for agent disconnection during chat
    const handleAgentDisconnectedDuringChat = (data: any) => {
      console.log('[TabsContext] Agent disconnected during chat event:', data);
      if (data.escalationId === chatWindowState.escalationId) {
        setChatWindowStateInternal(prev => ({
          ...prev,
          connected: false,
          disconnected: true // Prevent reconnection
        }));
      }
    };

    // Listen for system messages
    const handleSystemMessage = (msg: any) => {
      console.log('[TabsContext] System message received:', msg);
      if (msg.sessionId === chatWindowState.sessionId || 
          msg.escalationId === chatWindowState.escalationId || 
          (msg.escalationId && msg.escalationId.toString() === chatWindowState.escalationId)) {
        
        setChatWindowStateInternal(prev => {
          const existingMessages = prev.messages || [];
          // Avoid duplicates
          if (existingMessages.find(m => m._id === msg._id)) return prev;
          return {
            ...prev,
            messages: [...existingMessages, msg]
          };
        });
      }
    };

    socket.on("chat_started", handleChatStarted);
    socket.on("agent_joined", handleAgentJoined);
    socket.on("new_message", handleNewMessage);
    socket.on("customer_typing", handleCustomerTyping);
    socket.on("chat_ended", handleChatEnded);
    socket.on("agent_disconnected_during_chat", handleAgentDisconnectedDuringChat);
    socket.on("system_message", handleSystemMessage);

    return () => {
      console.log('[TabsContext] Cleaning up persistent socket listeners for:', chatRoom);
      socket.off("chat_started", handleChatStarted);
      socket.off("agent_joined", handleAgentJoined);
      socket.off("new_message", handleNewMessage);
      socket.off("customer_typing", handleCustomerTyping);
      socket.off("chat_ended", handleChatEnded);
      socket.off("agent_disconnected_during_chat", handleAgentDisconnectedDuringChat);
      socket.off("system_message", handleSystemMessage);
      
      // Don't leave room on cleanup - only when explicitly disconnecting
    };
  }, [isInitialized, chatWindowState.escalationId, chatWindowState.sessionId, chatWindowState.disconnected]);

  const setChatWindowState = useCallback((updates: Partial<ChatWindowState>) => {
    setChatWindowStateInternal(prev => ({ ...prev, ...updates }));
  }, []);

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

    // Force refresh by updating a refresh key that components can watch
    const refreshKey = Date.now();
    updateTab(id, { 
      data: { 
        ...tab.data, 
        refreshKey,
        lastRefresh: refreshKey
      } 
    });

    // You can add specific refresh logic here based on tab type
    if (tab.type === 'escalations') {
      // Trigger escalation data refresh
      updateTab(id, { modified: false });
    }
    
    console.log(`Tab refreshed: ${tab.title} (${id}) with refreshKey: ${refreshKey}`);
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

  // Function to connect to a chat and manage persistent socket connection
  const connectToChat = useCallback((escalationId: string, sessionId: string, businessId: string, customerName: string, agentId: string) => {
    console.log('[TabsContext] Setting up persistent chat connection for:', { escalationId, sessionId, businessId, customerName, agentId });
    
    // Only set up the persistent state - don't join room yet
    // The socket connection will be managed by the socket effect when needed
    setChatWindowStateInternal(prev => ({
      ...prev,
      visible: true,
      escalationId,
      sessionId,
      businessId,
      customerName,
      connected: false, // Will be set to true when socket events confirm connection
      disconnected: false, // Reset disconnected flag for new chat
      messages: [] // Start with empty messages, will be loaded
    }));
  }, []);

  // Function to disconnect from chat completely
  const disconnectFromChat = useCallback((agentId: string) => {
    console.log('[TabsContext] Disconnecting from chat permanently');
    
    if (chatWindowState.escalationId) {
      const socket = getSocket();
      const chatRoom = `chat_${chatWindowState.escalationId}`;
      socket.emit('leave_chat_room', { room: chatRoom, agentId });
      socket.emit('end_chat', { 
        escalationId: chatWindowState.escalationId, 
        agentId
      });
    }

    setChatWindowStateInternal({
      visible: false,
      connected: false,
      disconnected: true, // Prevent any future reconnection
      messages: []
    });
  }, [chatWindowState.escalationId]);

  // Function to add a message to the chat state
  const addChatMessage = useCallback((message: any) => {
    setChatWindowStateInternal(prev => {
      const existingMessages = prev.messages || [];
      // Avoid duplicates
      if (existingMessages.find(m => m._id === message._id)) return prev;
      return {
        ...prev,
        messages: [...existingMessages, message]
      };
    });
  }, []);

  return (
    <TabsContext.Provider value={{
      tabs,
      activeTabId,
      chatWindowState,
      setActiveTab,
      openTab,
      closeTab,
      updateTab,
      initializeDefaultTabs,
      clearAllTabs,
      refreshTab,
      closeAllTabs,
      closeOtherTabs,
      setChatWindowState,
      connectToChat,
      disconnectFromChat,
      addChatMessage,
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
