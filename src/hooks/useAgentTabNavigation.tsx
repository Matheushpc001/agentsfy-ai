
import { useState } from "react";

export function useAgentTabNavigation() {
  const [activeTab, setActiveTab] = useState<string>("agent");

  const nextTab = (validateAgentForm: () => boolean) => {
    if (!validateAgentForm()) {
      return;
    }
    setActiveTab("customer");
  };

  const prevTab = () => {
    setActiveTab("agent");
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
