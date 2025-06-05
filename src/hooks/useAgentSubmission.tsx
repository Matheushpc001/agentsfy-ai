
import { Agent, Customer, CustomerPortalAccess } from "@/types";
import { toast } from "sonner";
import { 
  createNewAgent, 
  createNewCustomer, 
  generateCustomerPortalAccess 
} from "@/utils/agentHelpers";

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
  const handleSubmitAgent = (
    agentData: Partial<Agent>, 
    customerData?: Partial<Customer>, 
    isNewCustomer?: boolean
  ) => {
    // Handle existing customer case
    let customerId = "";
    let customer: Customer | undefined;

    if (isNewCustomer && customerData) {
      // Create new customer
      const newCustomer = createNewCustomer(customerData, franchiseeId);
      setCustomers([...customers, newCustomer]);
      customerId = newCustomer.id;
      customer = newCustomer;
    } else if (agentData.customerId) {
      // Use existing customer
      customerId = agentData.customerId;
      customer = customers.find(c => c.id === customerId);
      
      // Update customer's agent count
      if (customer) {
        const updatedCustomers = customers.map(c => 
          c.id === customerId ? { ...c, agentCount: c.agentCount + 1 } : c
        );
        setCustomers(updatedCustomers);
      }
    }
    
    if (isEditModalOpen && currentAgent) {
      // Edit existing agent
      const updatedAgents = agents.map(agent =>
        agent.id === currentAgent.id ? { ...agent, ...agentData } : agent
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
      // Create new agent
      const newAgent = createNewAgent(agentData, customerId, franchiseeId);
      setAgents([...agents, newAgent]);
      setCurrentAgent(newAgent);
      setIsCreateModalOpen(false);
      
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
  };

  const handleConnectWhatsApp = () => {
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
    
    // Simulate connecting the agent to WhatsApp
    setTimeout(() => {
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
    }, 2000);
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
