
import { useState } from "react";
import { Agent, Customer, CustomerPortalAccess } from "@/types";
import { toast } from "sonner";
import { 
  createNewAgent, 
  createNewCustomer, 
  generateCustomerPortalAccess 
} from "@/utils/agentHelpers";

export default function useAgentManagement(
  initialAgents: Agent[],
  initialCustomers: Customer[],
  franchiseeId: string
) {
  const [agents, setAgents] = useState<Agent[]>(initialAgents);
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const [isCustomerPortalModalOpen, setIsCustomerPortalModalOpen] = useState(false);
  const [isPlanLimitModalOpen, setIsPlanLimitModalOpen] = useState(false);
  const [currentAgent, setCurrentAgent] = useState<Agent | null>(null);
  const [currentCustomer, setCurrentCustomer] = useState<Customer | null>(null);
  const [currentCustomerPortal, setCurrentCustomerPortal] = useState<CustomerPortalAccess | null>(null);
  
  const handleViewAgent = (agent: Agent) => {
    toast.info(`Visualizando estatísticas do agente ${agent.name}`);
  };

  const handleEditAgent = (agent: Agent) => {
    setCurrentAgent(agent);
    setIsEditModalOpen(true);
  };

  const handleConnectAgent = (agent: Agent) => {
    setCurrentAgent(agent);
    // Find associated customer
    const customer = customers.find(c => c.id === agent.customerId);
    if (customer) {
      setCurrentCustomer(customer);
    }
    setIsWhatsAppModalOpen(true);
    
    // Show notification
    toast.info(
      <div className="flex flex-col gap-1">
        <p className="font-medium">Conectar WhatsApp</p>
        <p className="text-sm">Agente {agent.name} precisa ser conectado ao WhatsApp</p>
      </div>
    );
  };
  
  const handleTestAgent = (agent: Agent) => {
    setCurrentAgent(agent);
  };

  const handleCreateAgentClick = (agentLimit: number) => {
    if (agents.length >= agentLimit) {
      setIsPlanLimitModalOpen(true);
    } else {
      setIsCreateModalOpen(true);
    }
  };

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
  
  // Calculate stats
  const totalAgents = agents.length;
  const connectedAgents = agents.filter(agent => agent.whatsappConnected).length;

  return {
    agents,
    customers,
    currentAgent,
    currentCustomer,
    currentCustomerPortal,
    isCreateModalOpen,
    isEditModalOpen,
    isWhatsAppModalOpen,
    isCustomerPortalModalOpen,
    isPlanLimitModalOpen,
    totalAgents,
    connectedAgents,
    setIsCreateModalOpen,
    setIsEditModalOpen,
    setIsWhatsAppModalOpen,
    setIsPlanLimitModalOpen,
    setIsCustomerPortalModalOpen,
    setCurrentAgent,
    handleViewAgent,
    handleEditAgent,
    handleConnectAgent,
    handleTestAgent,
    handleCreateAgentClick,
    handleSubmitAgent,
    handleConnectWhatsApp,
    handleClosePortalModal,
    handleSendCredentialsEmail
  };
}
