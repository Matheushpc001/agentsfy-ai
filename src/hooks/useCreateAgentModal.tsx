
import { useState, useEffect } from "react";
import { Agent, Customer } from "@/types";
import { Prompt } from "@/types/prompts";
import { toast } from "sonner";

interface UseCreateAgentModalProps {
  editing?: Agent;
  selectedPrompt?: Prompt | null;
  open: boolean;
}

export function useCreateAgentModal({ editing, selectedPrompt, open }: UseCreateAgentModalProps) {
  const [activeTab, setActiveTab] = useState<string>("agent");
  const [isNewCustomer, setIsNewCustomer] = useState(true);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");
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

  const [knowledgeBaseFile, setKnowledgeBaseFile] = useState<File | null>(null);
  const [selectedPromptId, setSelectedPromptId] = useState<string>("");

  // Reset form when modal opens/closes or editing changes
  useEffect(() => {
    if (open) {
      setActiveTab("agent");
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
      setKnowledgeBaseFile(null);
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setKnowledgeBaseFile(file);
      
      // Store the file name or URL in formData
      setFormData((prev) => ({
        ...prev,
        knowledgeBase: file.name,
      }));
    }
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

  const validateAgentForm = () => {
    if (!formData.name || !formData.sector) {
      toast.error("Por favor, preencha todos os campos obrigatórios do agente");
      return false;
    }

    if (!formData.openAiKey || !formData.openAiKey.startsWith("sk-")) {
      toast.error("Por favor, forneça uma chave válida da OpenAI");
      return false;
    }

    return true;
  };

  const validateCustomerForm = () => {
    if (isNewCustomer) {
      if (!customerData.businessName || !customerData.name || !customerData.email) {
        setActiveTab("customer");
        toast.error("Por favor, preencha os dados obrigatórios do cliente");
        return false;
      }
    } else if (!selectedCustomerId) {
      setActiveTab("customer");
      toast.error("Por favor, selecione um cliente existente");
      return false;
    }
    return true;
  };

  const nextTab = () => {
    if (!validateAgentForm()) {
      return;
    }
    setActiveTab("customer");
  };

  const prevTab = () => {
    setActiveTab("agent");
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
    handleFileChange,
    handlePromptSelect,
    validateAgentForm,
    validateCustomerForm,
    nextTab,
    prevTab,
  };
}
