
import { useState, useEffect } from "react";
import { Agent, Customer } from "@/types";
import { Prompt } from "@/types/prompts";

interface UseAgentFormDataProps {
  editing?: Agent;
  selectedPrompt?: Prompt | null;
  open: boolean;
}

export function useAgentFormData({ editing, selectedPrompt, open }: UseAgentFormDataProps) {
  const [formData, setFormData] = useState<Partial<Agent>>(
    editing || {
      name: "",
      sector: "",
      prompt: "",
      openAiKey: "",
      enableVoiceRecognition: false,
      knowledgeBase: "",
    }
  );
  
  const [customerData, setCustomerData] = useState<Partial<Customer>>({
    businessName: "",
    name: "",
    email: "",
    document: "",
    contactPhone: "",
  });

  const [isNewCustomer, setIsNewCustomer] = useState(true);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");
  const [selectedPromptId, setSelectedPromptId] = useState<string>("");

  // Reset form when modal opens/closes or editing changes
  useEffect(() => {
    if (open) {
      if (editing) {
        setFormData({...editing});
        setIsNewCustomer(false);
        if (editing.customerId) {
          setSelectedCustomerId(editing.customerId);
        }
      } else {
        setFormData({
          name: "",
          sector: "",
          prompt: "",
          openAiKey: "",
          enableVoiceRecognition: false,
          knowledgeBase: "",
        });
        setCustomerData({
          businessName: "",
          name: "",
          email: "",
          document: "",
          contactPhone: "",
        });
        setIsNewCustomer(true);
        setSelectedCustomerId("");
      }
      setSelectedPromptId("");
    }
  }, [open, editing]);

  // Update the prompt field when a prompt is selected from the library
  useEffect(() => {
    if (selectedPrompt) {
      setFormData(prev => ({
        ...prev,
        prompt: selectedPrompt.text
      }));
      setSelectedPromptId(selectedPrompt.id);
    }
  }, [selectedPrompt]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCustomerChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCustomerData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCustomerSelect = (value: string) => {
    setSelectedCustomerId(value);
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      enableVoiceRecognition: checked,
    }));
  };

  const handlePromptSelect = (value: string) => {
    setSelectedPromptId(value);
    
    if (value) {
      const prompts = []; // This will be passed from the parent component
      const selectedPrompt = prompts.find(p => p.id === value);
      if (selectedPrompt) {
        setFormData((prev) => ({
          ...prev,
          prompt: selectedPrompt.text
        }));
      }
    }
  };

  return {
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
  };
}
