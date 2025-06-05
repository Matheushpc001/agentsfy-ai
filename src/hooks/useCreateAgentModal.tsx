
import { useEffect } from "react";
import { Agent, Customer } from "@/types";
import { Prompt } from "@/types/prompts";
import { useAgentFormData } from "./useAgentFormData";
import { useAgentFormValidation } from "./useAgentFormValidation";
import { useAgentFileHandling } from "./useAgentFileHandling";
import { useAgentTabNavigation } from "./useAgentTabNavigation";

interface UseCreateAgentModalProps {
  editing?: Agent;
  selectedPrompt?: Prompt | null;
  open: boolean;
}

export function useCreateAgentModal({ editing, selectedPrompt, open }: UseCreateAgentModalProps) {
  const {
    formData,
    customerData,
    isNewCustomer,
    selectedCustomerId,
    selectedPromptId,
    setIsNewCustomer,
    handleChange,
    handleCustomerChange,
    handleCustomerSelect,
    handleSwitchChange,
    handlePromptSelect,
  } = useAgentFormData({ editing, selectedPrompt, open });

  const { activeTab, setActiveTab, nextTab, prevTab, resetTab } = useAgentTabNavigation();

  const { validateAgentForm, validateCustomerForm } = useAgentFormValidation({
    formData,
    customerData,
    isNewCustomer,
    selectedCustomerId,
    setActiveTab,
  });

  const { knowledgeBaseFile, handleFileChange, resetFile } = useAgentFileHandling();

  // Reset tab and file when modal opens (only when it actually opens, not on every render)
  useEffect(() => {
    if (open) {
      console.log('Modal opened, resetting to agent tab');
      resetTab();
      resetFile();
    }
  }, [open]); // Remove resetTab and resetFile from dependencies to prevent infinite loops

  // Enhanced file change handler that updates form data
  const handleFileChangeWithFormUpdate = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = handleFileChange(e);
    if (file) {
      // Update form data with file name
      handleChange({ 
        target: { 
          name: 'knowledgeBase', 
          value: file.name 
        } 
      } as React.ChangeEvent<HTMLInputElement>);
    }
  };

  // Enhanced next tab function with proper validation
  const nextTabWithValidation = () => {
    console.log('nextTabWithValidation called, current tab:', activeTab);
    
    if (activeTab !== 'agent') {
      console.log('Not on agent tab, ignoring next tab call');
      return;
    }
    
    const isValid = validateAgentForm();
    console.log('Agent form validation result:', isValid);
    
    if (isValid) {
      console.log('Validation passed, moving to customer tab');
      const moved = nextTab();
      if (moved) {
        console.log('Successfully moved to customer tab');
      } else {
        console.log('Failed to move to customer tab');
      }
    } else {
      console.log('Validation failed, staying on agent tab');
    }
  };

  return {
    activeTab,
    setActiveTab,
    isNewCustomer,
    setIsNewCustomer,
    selectedCustomerId,
    formData,
    customerData,
    knowledgeBaseFile,
    selectedPromptId,
    handleChange,
    handleCustomerChange,
    handleCustomerSelect,
    handleSwitchChange,
    handleFileChange: handleFileChangeWithFormUpdate,
    handlePromptSelect,
    validateAgentForm,
    validateCustomerForm,
    nextTab: nextTabWithValidation,
    prevTab,
  };
}
