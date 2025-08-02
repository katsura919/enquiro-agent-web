"use client";
import { Tab } from "@/context/TabsContext";
import { EscalationWrapper } from "./EscalationWrapper";

interface EscalationsTabProps {
  tab: Tab;
}

export function EscalationsTab({ tab }: EscalationsTabProps) {
  return <EscalationWrapper />;
}
