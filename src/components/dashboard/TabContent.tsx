"use client";
import { useTabs } from "@/context/TabsContext";
import { OverviewTab } from "./tabs/OverviewTab";
import { ChatTab } from "./tabs/ChatTab";
import { EscalationsTab } from "./tabs/EscalationsTab";
import { SettingsTab } from "./tabs/SettingsTab";
import { ProductSearchTab } from "./tabs/ProductSearchTab";
import { CaseDetailsTab } from "./tabs/CaseDetailsTab";
import { NewTabPage } from "./tabs/NewTabPage";

export function TabContent() {
  const { tabs, activeTabId } = useTabs();
  const activeTab = tabs.find(tab => tab.id === activeTabId);

  if (!activeTab) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        <div className="text-center">
          <p className="text-lg font-medium">No tab selected</p>
          <p className="text-sm">Open a new tab to get started</p>
        </div>
      </div>
    );
  }

  const renderTabContent = () => {
    switch (activeTab.type) {
      case 'overview':
        return <OverviewTab tab={activeTab} />;
      case 'chat':
        return <ChatTab tab={activeTab} />;
      case 'escalations':
        return <EscalationsTab tab={activeTab} />;
      case 'settings':
        return <SettingsTab tab={activeTab} />;
      case 'product-search':
        return <ProductSearchTab tab={activeTab} />;
      case 'case-details':
        return <CaseDetailsTab tab={activeTab} />;
      case 'new-tab':
        return <NewTabPage tab={activeTab} />;
      default:
        return (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <p className="text-lg font-medium">Unknown tab type</p>
              <p className="text-sm">Tab type "{activeTab.type}" is not supported</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {renderTabContent()}
    </div>
  );
}
