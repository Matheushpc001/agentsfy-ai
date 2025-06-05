
import { Agent, Customer } from "@/types";
import { toast } from "sonner";

interface UseAgentFormValidationProps {
  formData: Partial<Agent>;
  customerData: Partial<Customer>;
  isNewCustomer: boolean;
  selectedCustomerId: string;
  setActiveTab: (tab: string) => void;
}

export function useAgentFormValidation({
  formData,
  customerData,
  isNewCustomer,
  selectedCustomerId,
  setActiveTab,
}: UseAgentFormValidationProps) {
  const validateAgentForm = () => {
    console.log('Validating agent form:', formData);
    
    if (!formData.name?.trim()) {
      toast.error("Por favor, preencha o nome do agente");
      return false;
    }

    if (!formData.sector?.trim()) {
      toast.error("Por favor, preencha o setor do agente");
      return false;
    }

    if (!formData.openAiKey?.trim()) {
      toast.error("Por favor, forneça uma chave da OpenAI");
      return false;
    }

    if (!formData.openAiKey.startsWith("sk-")) {
      toast.error("A chave da OpenAI deve começar com 'sk-'");
      return false;
    }

    console.log('Agent form validation passed');
    return true;
  };

  const validateCustomerForm = () => {
    console.log('Validating customer form:', { isNewCustomer, customerData, selectedCustomerId });
    
    if (isNewCustomer) {
      if (!customerData.businessName?.trim()) {
        toast.error("Por favor, preencha o nome da empresa");
        return false;
      }

      if (!customerData.name?.trim()) {
        toast.error("Por favor, preencha o nome do responsável");
        return false;
      }

      if (!customerData.email?.trim()) {
        toast.error("Por favor, preencha o email do responsável");
        return false;
      }

      // Validação básica de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(customerData.email)) {
        toast.error("Por favor, forneça um email válido");
        return false;
      }
    } else {
      if (!selectedCustomerId) {
        toast.error("Por favor, selecione um cliente existente");
        return false;
      }
    }
    
    console.log('Customer form validation passed');
    return true;
  };

  return {
    validateAgentForm,
    validateCustomerForm,
  };
}
