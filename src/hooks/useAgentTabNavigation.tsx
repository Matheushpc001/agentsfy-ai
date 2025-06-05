
import { useState } from "react";

export function useAgentTabNavigation() {
  const [activeTab, setActiveTab] = useState("agent");

  const nextTab = (validateCurrentTab?: () => boolean) => {
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
  };

  const prevTab = () => {
    console.log('prevTab called, current tab:', activeTab);
    
    if (activeTab === "customer") {
      console.log('Moving from customer tab to agent tab');
      setActiveTab("agent");
      return true;
    }
    
    return false;
  };

  const resetTab = () => {
    console.log('Resetting tab to agent');
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
