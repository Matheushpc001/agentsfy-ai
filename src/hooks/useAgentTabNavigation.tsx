
import { useState } from "react";

export function useAgentTabNavigation() {
  const [activeTab, setActiveTab] = useState("agent");

  const nextTab = (validateCurrentTab?: () => boolean) => {
    if (validateCurrentTab && !validateCurrentTab()) {
      return;
    }
    
    if (activeTab === "agent") {
      setActiveTab("customer");
    }
  };

  const prevTab = () => {
    if (activeTab === "customer") {
      setActiveTab("agent");
    }
  };

  const resetTab = () => {
    setActiveTab("agent");
  };

  return {
    activeTab,
    setActiveTab,
    nextTab,
    prevTab,
    resetTab,
  };
}
