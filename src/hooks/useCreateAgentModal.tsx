
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

  // Reset tab and file when modal opens
  useEffect(() => {
    if (open) {
      resetTab();
      resetFile();
    }
  }, [open, resetTab, resetFile]);

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

  // Enhanced next tab function
  const nextTabWithValidation = () => {
    nextTab(validateAgentForm);
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
