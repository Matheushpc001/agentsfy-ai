
import { Agent, Customer } from "@/types";
import { toast } from "sonner";
import { useCallback } from "react";

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
  const validateAgentForm = useCallback(() => {
    console.log('=== INICIANDO VALIDAÇÃO DO AGENTE ===');
    console.log('FormData completo:', JSON.stringify(formData, null, 2));
    
    // Verificar nome
    console.log('Verificando nome:', formData.name);
    if (!formData.name?.trim()) {
      const msg = "Por favor, preencha o nome do agente";
      console.error('❌ Erro de validação - Nome:', msg);
      toast.error(msg);
      return false;
    }
    console.log('✅ Nome válido:', formData.name);

    // Verificar setor
    console.log('Verificando setor:', formData.sector);
    if (!formData.sector?.trim()) {
      const msg = "Por favor, preencha o setor do agente";
      console.error('❌ Erro de validação - Setor:', msg);
      toast.error(msg);
      return false;
    }
    console.log('✅ Setor válido:', formData.sector);

    // Verificar chave OpenAI
    console.log('Verificando chave OpenAI:', formData.openAiKey ? 'PRESENTE' : 'AUSENTE');
    if (!formData.openAiKey?.trim()) {
      const msg = "Por favor, forneça uma chave da OpenAI";
      console.error('❌ Erro de validação - Chave OpenAI ausente:', msg);
      toast.error(msg);
      return false;
    }

    console.log('Verificando formato da chave OpenAI...');
    if (!formData.openAiKey.startsWith("sk-")) {
      const msg = "A chave da OpenAI deve começar com 'sk-'";
      console.error('❌ Erro de validação - Formato da chave inválido:', msg);
      toast.error(msg);
      return false;
    }
    console.log('✅ Chave OpenAI válida');

    console.log('✅ VALIDAÇÃO COMPLETA - SUCESSO!');
    return true;
  }, [formData]);

  const validateCustomerForm = useCallback(() => {
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
  }, [isNewCustomer, customerData, selectedCustomerId]);

  return {
    validateAgentForm,
    validateCustomerForm,
  };
}
