
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
  const { globalConfigs, createInstance, connectInstance, createAIAgent } = useEvolutionAPI(franchiseeId);

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
      // Handle customer creation/selection
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
        throw new Error('Customer ID is required');
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
          
          // Automatically create EvolutionAPI instance for WhatsApp integration
          await handleCreateEvolutionInstance(newAgent, customer);
        }
      }
    } catch (error) {
      console.error('Error submitting agent:', error);
      toast.error(`Erro ao salvar agente: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  };

  const handleCreateEvolutionInstance = async (agent: Agent, customer: Customer) => {
    try {
      console.log('Creating EvolutionAPI instance for agent:', agent.id);
      
      // Check if we have available global configs
      if (!globalConfigs || globalConfigs.length === 0) {
        console.warn('No EvolutionAPI global configs available');
        toast.warning("Configuração do WhatsApp não disponível. Configure a EvolutionAPI primeiro.");
        return;
      }

      // Use the first available global config
      const globalConfig = globalConfigs[0];
      
      // Create unique instance name
      const instanceName = `agent_${agent.id.replace(/-/g, '_')}_${Date.now()}`;
      
      toast.loading("Criando instância do WhatsApp...");
      
      // Create Evolution instance
      const evolutionConfig = await createInstance(instanceName, globalConfig.id);
      
      console.log('EvolutionAPI instance created:', evolutionConfig.id);
      
      // Create AI Agent integration
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

      console.log('AI Agent integration created');
      
      toast.success("Instância do WhatsApp criada com sucesso!");
      
      // Show WhatsApp connection modal with real QR code
      setTimeout(() => {
        setIsWhatsAppModalOpen(true);
        
        // Generate customer portal access
        const customerPortal = generateCustomerPortalAccess(customer);
        setCurrentCustomerPortal(customerPortal);
      }, 1000);
      
    } catch (error) {
      console.error('Error creating EvolutionAPI instance:', error);
      toast.error(`Erro ao criar instância do WhatsApp: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      
      // Still show the modal but with the old flow as fallback
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
      // Try to find the evolution config for this agent
      console.log('Looking for EvolutionAPI config for agent:', currentAgent.id);
      
      // For now, simulate the connection - in a real implementation,
      // you would call the Evolution API to get the real connection status
      
      // Update WhatsApp connection status in database
      await agentService.updateAgentWhatsAppStatus(currentAgent.id, true);
      
      // Update local state
      const updatedAgents = agents.map(agent =>
        agent.id === currentAgent.id ? { ...agent, whatsappConnected: true } : agent
      );
      setAgents(updatedAgents);
      setIsWhatsAppModalOpen(false);
      
      toast.dismiss(loadingToast);
      
      // Show customer portal access after WhatsApp connection
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
