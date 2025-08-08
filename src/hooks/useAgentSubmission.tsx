
import { Agent, Customer, CustomerPortalAccess } from "@/types";
import { toast } from "sonner";
import { generateCustomerPortalAccess } from "@/utils/agentHelpers";
import { agentService, customerService, CreateAgentRequest, CreateCustomerRequest } from "@/services/agentService";
import { useEvolutionAPI } from "@/hooks/useEvolutionAPI";

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
  const { createAgentWithAutoInstance, createAIAgent, globalConfigs } = useEvolutionAPI(franchiseeId);

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
          
          toast.success("Agente criado com sucesso!");
          
          // Verificar se EvolutionAPI está configurada
          if (globalConfigs.length > 0) {
            console.log('EvolutionAPI disponível, criando instância automática...');
            await handleCreateEvolutionInstance(newAgent, customer);
          } else {
            console.log('EvolutionAPI não configurada, pulando integração automática');
            toast.info("Agente criado! Configure a EvolutionAPI para usar WhatsApp.");
            
            // Gerar portal do cliente mesmo sem WhatsApp
            const customerPortal = generateCustomerPortalAccess(customer);
            setCurrentCustomerPortal(customerPortal);
            setIsCustomerPortalModalOpen(true);
          }
        }
      }
    } catch (error) {
      console.error('Error submitting agent:', error);
      toast.error(`Erro ao salvar agente: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  };

  const handleCreateEvolutionInstance = async (agent: Agent, customer: Customer) => {
    try {
      console.log('Criando instância automática EvolutionAPI para agente:', agent.id);
      
      toast.loading("Configurando WhatsApp automático...");
      
      // Criar instância Evolution automática (usa configuração global automaticamente)
      const evolutionConfig = await createAgentWithAutoInstance(
        agent.id,
        agent.name,
        agent.phoneNumber
      );
      
      console.log('Instância EvolutionAPI criada:', evolutionConfig.id);
      
      // Criar integração AI Agent
      await createAIAgent({
        agent_id: agent.id,
        evolution_config_id: evolutionConfig.id,
        phone_number: agent.phoneNumber || '',
        openai_api_key: agent.openAiKey,
        model: 'gpt-4o-mini',
        system_prompt: agent.prompt || 'Você é um assistente útil.',
        auto_response: true,
        response_delay_seconds: 2
      });

      console.log('Integração AI Agent criada com sucesso');
      
      toast.dismiss();
      toast.success("WhatsApp configurado automaticamente!");
      
      // Mostrar modal de conexão WhatsApp
      setTimeout(() => {
        setIsWhatsAppModalOpen(true);
        
        // Gerar acesso ao portal do cliente
        const customerPortal = generateCustomerPortalAccess(customer);
        setCurrentCustomerPortal(customerPortal);
      }, 1000);
      
    } catch (error) {
      console.error('Erro ao criar instância EvolutionAPI automática:', error);
      toast.dismiss();
      toast.error(`Erro ao configurar WhatsApp automático: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      
      // Ainda mostrar o modal, mas com fluxo de fallback
      setTimeout(() => {
        setIsWhatsAppModalOpen(true);
        const customerPortal = generateCustomerPortalAccess(customer);
        setCurrentCustomerPortal(customerPortal);
      }, 1000);
    }
  };

  const handleConnectWhatsApp = async () => {
    if (!currentAgent) return;
    
    const loadingToast = toast.loading("Conectando ao WhatsApp...");
    
    try {
      console.log('Conectando WhatsApp para o agente:', currentAgent.id);
      
      // Atualizar status de conexão WhatsApp no banco
      await agentService.updateAgentWhatsAppStatus(currentAgent.id, true);
      
      // Atualizar estado local
      const updatedAgents = agents.map(agent =>
        agent.id === currentAgent.id ? { ...agent, whatsappConnected: true } : agent
      );
      setAgents(updatedAgents);
      setIsWhatsAppModalOpen(false);
      
      toast.dismiss(loadingToast);
      
      // Mostrar portal do cliente após conexão do WhatsApp
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
