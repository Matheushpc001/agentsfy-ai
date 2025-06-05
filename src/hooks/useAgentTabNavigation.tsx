
import { useState, useCallback } from "react";

export function useAgentTabNavigation() {
  const [activeTab, setActiveTab] = useState("agent");

  const nextTab = useCallback((validateCurrentTab?: () => boolean) => {
    console.log('nextTab called, current tab:', activeTab);
    
    if (validateCurrentTab && !validateCurrentTab()) {
      console.log('Validation failed, staying on current tab');
      return false;
    }
    
    if (activeTab === "agent") {
      console.log('Moving from agent tab to customer tab');
      setActiveTab("customer");
      return true;
    }
    
    return false;
  }, [activeTab]);

  const prevTab = useCallback(() => {
    console.log('prevTab called, current tab:', activeTab);
    
    if (activeTab === "customer") {
      console.log('Moving from customer tab to agent tab');
      setActiveTab("agent");
      return true;
    }
    
    return false;
  }, [activeTab]);

  const resetTab = useCallback(() => {
    console.log('Resetting tab to agent');
    setActiveTab("agent");
  }, []);

  return {
    activeTab,
    setActiveTab,
    nextTab,
    prevTab,
    resetTab,
  };
}
