
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

  return {
    validateAgentForm,
    validateCustomerForm,
  };
}
