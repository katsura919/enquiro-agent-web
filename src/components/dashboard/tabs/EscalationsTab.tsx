"use client";
import { Tab } from "@/context/TabsContext";
import { EscalationWrapper } from "./EscalationWrapper";

interface EscalationsTabProps {
  tab: Tab;
}

export function EscalationsTab({ tab }: EscalationsTabProps) {
  // Watch for refresh signals from the tab context
  const refreshKey = tab.data?.refreshKey;
  
  return (
    <EscalationWrapper 
      key={refreshKey} // Force re-mount on refresh
    />
  );
}
