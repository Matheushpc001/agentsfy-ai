
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
      toast.success(`Agente ${agentData.name} atualizado com sucesso!`);
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
        
        // Show WhatsApp connection modal after agent creation
        setIsWhatsAppModalOpen(true);
        
        // Generate customer portal access
        const customerPortal = generateCustomerPortalAccess(customer);
        setCurrentCustomerPortal(customerPortal);
      }
    }
  };

  const handleConnectWhatsApp = () => {
    if (!currentAgent) return;
    
    // Simulate connecting the agent to WhatsApp
    setTimeout(() => {
      const updatedAgents = agents.map(agent =>
        agent.id === currentAgent.id ? { ...agent, whatsappConnected: true } : agent
      );
      setAgents(updatedAgents);
      setIsWhatsAppModalOpen(false);
      
      // Show customer portal access after WhatsApp connection
      setIsCustomerPortalModalOpen(true);
      
      toast.success("Agente conectado ao WhatsApp com sucesso!");
    }, 1000);
  };

  const handleClosePortalModal = () => {
    setIsCustomerPortalModalOpen(false);
    setCurrentCustomerPortal(null);
    setCurrentAgent(null);
    toast.success("Agente criado e conectado com sucesso!");
  };

  const handleSendCredentialsEmail = () => {
    toast.success("Email com instruções enviado ao cliente!");
    handleClosePortalModal();
  };

  return {
    handleSubmitAgent,
    handleConnectWhatsApp,
    handleClosePortalModal,
    handleSendCredentialsEmail,
  };
}
