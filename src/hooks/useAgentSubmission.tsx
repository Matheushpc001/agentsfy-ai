import { Agent, Customer, CustomerPortalAccess } from "@/types";
import { toast } from "sonner";
import { generateCustomerPortalAccess } from "@/utils/agentHelpers";
import { agentService, customerService, CreateAgentRequest, CreateCustomerRequest } from "@/services/agentService";

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
        // Create new customer
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
        // Use existing customer
        customerId = agentData.customerId;
        customer = customers.find(c => c.id === customerId);
        console.log('Using existing customer:', customerId);
      }

      if (!customerId) {
        throw new Error('Customer ID is required');
      }

      if (isEditModalOpen && currentAgent) {
        console.log('Updating existing agent...');
        // Edit existing agent
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
        
        toast.success(
          <div className="flex flex-col gap-1">
            <p className="font-medium">Agente atualizado!</p>
            <p className="text-sm text-muted-foreground">
              {agentData.name} foi atualizado com sucesso.
            </p>
          </div>
        );
        setIsEditModalOpen(false);
        setCurrentAgent(null);
      } else {
        console.log('Creating new agent...');
        // Create new agent
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
          
          // Enhanced success message for new agent
          toast.success(
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <p className="font-medium">Agente criado com sucesso!</p>
              </div>
              <p className="text-sm text-muted-foreground">
                <strong>{agentData.name}</strong> está pronto para ser configurado.
              </p>
              <p className="text-xs text-muted-foreground">
                Próximo passo: Conectar ao WhatsApp
              </p>
            </div>,
            {
              duration: 4000,
            }
          );
          
          // Show WhatsApp connection modal after agent creation with a slight delay
          setTimeout(() => {
            setIsWhatsAppModalOpen(true);
            
            // Generate customer portal access
            const customerPortal = generateCustomerPortalAccess(customer);
            setCurrentCustomerPortal(customerPortal);
          }, 1000);
        }
      }
    } catch (error) {
      console.error('Error submitting agent:', error);
      toast.error(
        <div className="flex flex-col gap-1">
          <p className="font-medium">Erro ao salvar agente</p>
          <p className="text-sm text-muted-foreground">
            {error instanceof Error ? error.message : 'Erro desconhecido'}
          </p>
        </div>
      );
    }
  };

  const handleConnectWhatsApp = async () => {
    if (!currentAgent) return;
    
    // Enhanced loading toast
    const loadingToast = toast.loading(
      <div className="flex flex-col gap-1">
        <p className="font-medium">Conectando ao WhatsApp...</p>
        <p className="text-sm text-muted-foreground">
          Estabelecendo conexão para {currentAgent.name}
        </p>
      </div>
    );
    
    try {
      // Update WhatsApp connection status in database
      await agentService.updateAgentWhatsAppStatus(currentAgent.id, true);
      
      // Update local state
      const updatedAgents = agents.map(agent =>
        agent.id === currentAgent.id ? { ...agent, whatsappConnected: true } : agent
      );
      setAgents(updatedAgents);
      setIsWhatsAppModalOpen(false);
      
      // Dismiss loading toast
      toast.dismiss(loadingToast);
      
      // Show customer portal access after WhatsApp connection
      setIsCustomerPortalModalOpen(true);
      
      // Enhanced success message
      toast.success(
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            <p className="font-medium">WhatsApp conectado!</p>
          </div>
          <p className="text-sm text-muted-foreground">
            <strong>{currentAgent.name}</strong> está pronto para atender clientes.
          </p>
          <p className="text-xs text-muted-foreground">
            Agora você pode enviar as credenciais para o cliente.
          </p>
        </div>,
        {
          duration: 5000,
        }
      );
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
    
    toast.success(
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full" />
          <p className="font-medium">Configuração concluída!</p>
        </div>
        <p className="text-sm text-muted-foreground">
          Agente criado e conectado com sucesso. O cliente pode começar a usar o sistema.
        </p>
      </div>,
      {
        duration: 4000,
      }
    );
  };

  const handleSendCredentialsEmail = () => {
    const loadingToast = toast.loading("Enviando email com instruções...");
    
    setTimeout(() => {
      toast.dismiss(loadingToast);
      toast.success(
        <div className="flex flex-col gap-1">
          <p className="font-medium">Email enviado!</p>
          <p className="text-sm text-muted-foreground">
            Instruções de acesso foram enviadas para o cliente.
          </p>
        </div>
      );
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
