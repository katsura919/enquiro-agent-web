"use client";
import { useTabs } from "@/context/TabsContext";
import { OverviewTab } from "./tabs/OverviewTab";
import { ChatTab } from "./tabs/ChatTab";
import { EscalationsTab } from "./tabs/EscalationsTab";
import { SettingsTab } from "./tabs/SettingsTab";
import ViewProducts from "./tabs/ViewProductsTab";
import ViewServices from "./tabs/ViewServicesTab";
import ViewFAQTab from "./tabs/ViewFAQTab";
import { CaseDetailsTab } from "./tabs/CaseDetailsTab";
import { NewTabPage } from "./tabs/NewTabPage";

export function TabContent() {
  const { tabs, activeTabId } = useTabs();

  if (tabs.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        <div className="text-center">
          <p className="text-lg font-medium">No tab selected</p>
          <p className="text-sm">Open a new tab to get started</p>
        </div>
      </div>
    );
  }

  const renderTabContent = (tab: any) => {
    switch (tab.type) {
      case 'overview':
        return <OverviewTab tab={tab} />;
      case 'chat':
        return <ChatTab tab={tab} />;
      case 'escalations':
        return <EscalationsTab tab={tab} />;
      case 'settings':
        return <SettingsTab tab={tab} />;
      case 'product-search':
        return <ViewProducts />;
      case 'service-search':
        return <ViewServices />;
      case 'faq-search':
        return <ViewFAQTab />;
      case 'case-details':
        return <CaseDetailsTab tab={tab} />;
      case 'new-tab':
        return <NewTabPage tab={tab} />;
      default:
        return (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <p className="text-lg font-medium">Unknown tab type</p>
              <p className="text-sm">Tab type "{tab.type}" is not supported</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Render all tabs but only show the active one */}
      {tabs.map((tab) => (
        <div
          key={tab.id}
          className={`flex-1 flex flex-col overflow-hidden ${
            tab.id === activeTabId ? 'block' : 'hidden'
          }`}
        >
          {renderTabContent(tab)}
        </div>
      ))}
    </div>
  );
}
