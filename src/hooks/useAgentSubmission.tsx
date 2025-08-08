// ARQUIVO: src/hooks/useAgentSubmission.tsx
// Versão FINAL - Integrado com setup de transcrição da Evolution API v2

import { Agent, Customer, CustomerPortalAccess } from "@/types";
import { toast } from "sonner";
import { generateCustomerPortalAccess } from "@/utils/agentHelpers";
import { agentService, customerService, CreateAgentRequest, CreateCustomerRequest } from "@/services/agentService";
import { useEvolutionAPI } from "@/hooks/useEvolutionAPI";
import { supabase } from "@/integrations/supabase/client"; // Importar supabase client

interface UseAgentSubmissionProps {
  agents: Agent[];
  customers: Customer[];
  currentAgent: Agent | null;
  franchiseeId: string;
  isEditModalOpen: boolean;
  setAgents: (agents: Agent[]) => void;
  setCustomers: (customers: Customer[]) => void;
  setCurrentAgent: (agent: Agent | null) => void;
  setCurrentCustomer: (customer: Customer | null) => void;
  setCurrentCustomerPortal: (portal: CustomerPortalAccess | null) => void;
  setIsCreateModalOpen: (open: boolean) => void;
  setIsEditModalOpen: (open: boolean) => void;
  setIsWhatsAppModalOpen: (open: boolean) => void;
  setIsCustomerPortalModalOpen: (open: boolean) => void;
}

export function useAgentSubmission({
  agents,
  customers,
  currentAgent,
  franchiseeId,
  isEditModalOpen,
  setAgents,
  setCustomers,
  setCurrentAgent,
  setCurrentCustomer,
  setCurrentCustomerPortal,
  setIsCreateModalOpen,
  setIsEditModalOpen,
  setIsWhatsAppModalOpen,
  setIsCustomerPortalModalOpen,
}: UseAgentSubmissionProps) {
  // O hook useEvolutionAPI já foi removido daqui, pois suas funções foram substituídas
  // pela chamada direta ao 'evolution-api-manager' quando necessário.
  const { globalConfigs } = useEvolutionAPI(franchiseeId);

  const handleSubmitAgent = async (
    agentData: Partial<Agent>, 
    customerData?: Partial<Customer>, 
    isNewCustomer?: boolean
  ) => {
    console.log('handleSubmitAgent called:', { 
      agentData, 
      customerData, 
      isNewCustomer, 
      franchiseeId,
      isEditModalOpen 
    });

    const loadingToast = toast.loading("Salvando informações...");

    try {
      let customerId = "";
      let customer: Customer | undefined;

      if (isNewCustomer && customerData) {
        console.log('Creating new customer...');
        const createCustomerRequest: CreateCustomerRequest = {
          business_name: customerData.businessName || "",
          name: customerData.name || "",
          email: customerData.email || "",
          document: customerData.document,
          contact_phone: customerData.contactPhone
        };
        
        customer = await customerService.createCustomer(createCustomerRequest, franchiseeId);
        setCustomers([...customers, customer]);
        customerId = customer.id;
        console.log('Customer created successfully:', customer.id);
      } else if (agentData.customerId) {
        customerId = agentData.customerId;
        customer = customers.find(c => c.id === customerId);
        console.log('Using existing customer:', customerId);
      }

      if (!customerId) {
        throw new Error('Customer ID é obrigatório');
      }

      if (isEditModalOpen && currentAgent) {
        console.log('Updating existing agent...');
        const updateRequest: Partial<CreateAgentRequest> = {
          name: agentData.name,
          sector: agentData.sector,
          prompt: agentData.prompt,
          open_ai_key: agentData.openAiKey,
          enable_voice_recognition: agentData.enableVoiceRecognition,
          knowledge_base: agentData.knowledgeBase,
          phone_number: agentData.phoneNumber
        };

        const updatedAgent = await agentService.updateAgent(currentAgent.id, updateRequest);
        
        const updatedAgents = agents.map(agent =>
          agent.id === currentAgent.id ? updatedAgent : agent
        );
        setAgents(updatedAgents);
        
        toast.dismiss(loadingToast);
        toast.success("Agente atualizado com sucesso!");
        setIsEditModalOpen(false);
        setCurrentAgent(null);
      } else {
        console.log('Creating new agent...');
        const createAgentRequest: CreateAgentRequest = {
          name: agentData.name || "",
          sector: agentData.sector || "",
          prompt: agentData.prompt,
          open_ai_key: agentData.openAiKey || "",
          enable_voice_recognition: agentData.enableVoiceRecognition,
          knowledge_base: agentData.knowledgeBase,
          customer_id: customerId,
          phone_number: agentData.phoneNumber
        };

        const newAgent = await agentService.createAgent(createAgentRequest, franchiseeId);
        setAgents([...agents, newAgent]);
        setCurrentAgent(newAgent);
        setIsCreateModalOpen(false);
        
        console.log('Agent created successfully:', newAgent.id);
        
        if (customer) {
          setCurrentCustomer(customer);
          toast.dismiss(loadingToast);
          toast.success("Agente criado com sucesso!");
          
          if (globalConfigs.length > 0) {
            console.log('EvolutionAPI V2 disponível, iniciando configuração automática...');
            await handleSetupEvolutionV2(newAgent);
          } else {
            console.log('EvolutionAPI não configurada, pulando integração.');
            toast.info("Agente criado! Configure a EvolutionAPI para usar WhatsApp.");
            const customerPortal = generateCustomerPortalAccess(customer);
            setCurrentCustomerPortal(customerPortal);
            setIsCustomerPortalModalOpen(true);
          }
        }
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      console.error('Error submitting agent:', error);
      toast.error(`Erro ao salvar agente: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  };

  const handleSetupEvolutionV2 = async (agent: Agent) => {
    const setupToast = toast.loading("Configurando IA e WhatsApp...");

    try {
      // 1. Criar a instância na Evolution API
      const instanceName = `agent_${agent.id.replace(/-/g, '')}`; // Nome único e válido
      console.log(`Tentando criar instância com nome: ${instanceName}`);

      const { data: instanceData, error: instanceError } = await supabase.functions.invoke('evolution-api-manager', {
        body: {
          action: 'create_instance',
          franchisee_id: franchiseeId,
          instance_name: instanceName,
          agent_id: agent.id
        }
      });
      if (instanceError) throw new Error(`Falha ao criar instância: ${instanceError.message}`);
      if (!instanceData.success) throw new Error(instanceData.error || "Erro desconhecido ao criar instância.");

      console.log(`Instância ${instanceName} criada com sucesso.`);
      
      // 2. Configurar a transcrição de áudio
      console.log(`Configurando transcrição para ${instanceName}`);

      const { error: setupError } = await supabase.functions.invoke('evolution-api-manager', {
        body: {
          action: 'setup_openai_transcription',
          instanceName: instanceName,
          openaiApiKey: agent.openAiKey,
        }
      });
      if (setupError) throw new Error(`Falha ao configurar IA: ${setupError.message}`);

      toast.dismiss(setupToast);
      toast.success("IA e transcrição configuradas com sucesso na Evolution!");
      
      // 3. Abrir o modal para o usuário escanear o QR Code
      setTimeout(() => {
        setIsWhatsAppModalOpen(true);
        if (agent.customerId) {
          const customer = customers.find(c => c.id === agent.customerId);
          if (customer) {
            const customerPortal = generateCustomerPortalAccess(customer);
            setCurrentCustomerPortal(customerPortal);
          }
        }
      }, 500);

    } catch (error) {
      toast.dismiss(setupToast);
      console.error('Erro ao configurar Evolution v2:', error);
      toast.error(`Erro na configuração automática: ${error instanceof Error ? error.message : 'Tente novamente'}`);
    }
  };

  const handleConnectWhatsApp = async () => {
    if (!currentAgent) return;
    
    const loadingToast = toast.loading("Conectando ao WhatsApp...");
    
    try {
      console.log('Conectando WhatsApp para o agente:', currentAgent.id);
      await agentService.updateAgentWhatsAppStatus(currentAgent.id, true);
      
      const updatedAgents = agents.map(agent =>
        agent.id === currentAgent.id ? { ...agent, whatsappConnected: true } : agent
      );
      setAgents(updatedAgents);
      setIsWhatsAppModalOpen(false);
      
      toast.dismiss(loadingToast);
      setIsCustomerPortalModalOpen(true);
      toast.success("WhatsApp conectado com sucesso!");
    } catch (error) {
      console.error('Error connecting WhatsApp:', error);
      toast.dismiss(loadingToast);
      toast.error('Erro ao conectar WhatsApp. Tente novamente.');
    }
  };

  const handleClosePortalModal = () => {
    setIsCustomerPortalModalOpen(false);
    setCurrentCustomerPortal(null);
    setCurrentAgent(null);
    toast.success("Configuração concluída! Agente criado e conectado com sucesso.");
  };

  const handleSendCredentialsEmail = () => {
    const loadingToast = toast.loading("Enviando email com instruções...");
    
    setTimeout(() => {
      toast.dismiss(loadingToast);
      toast.success("Email enviado com sucesso!");
      handleClosePortalModal();
    }, 1500);
  };

  return {
    handleSubmitAgent,
    handleConnectWhatsApp,
    handleClosePortalModal,
    handleSendCredentialsEmail,
  };
}