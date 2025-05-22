
import { useState } from "react";
import { Agent, Customer, CustomerPortalAccess } from "@/types";
import { toast } from "sonner";
import { getPlanById } from "@/constants/plans";
import AgentsList from "@/components/agents/AgentsList";
import AgentStats from "@/components/agents/AgentStats";
import PlanInfoCard from "@/components/agents/PlanInfoCard";
import CreateAgentModal from "@/components/agents/CreateAgentModal";
import WhatsAppConnectionModal from "@/components/agents/WhatsAppConnectionModal";
import CustomerPortalModal from "@/components/agents/CustomerPortalModal";
import PlanLimitModal from "@/components/agents/PlanLimitModal";
import AgentActionButtons from "@/components/agents/AgentActionButtons";
import { 
  createNewAgent, 
  createNewCustomer, 
  generateCustomerPortalAccess 
} from "@/utils/agentHelpers";
import { MOCK_FRANCHISEE } from "@/mocks/franchiseeMockData";

interface AgentsContainerProps {
  initialAgents: Agent[];
  initialCustomers: Customer[];
}

export default function AgentsContainer({ 
  initialAgents, 
  initialCustomers 
}: AgentsContainerProps) {
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
  
  // Get current plan details from the franchisee data
  const currentPlanId = MOCK_FRANCHISEE.planId;
  const currentPlan = currentPlanId ? getPlanById(currentPlanId) : null;
  
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

  const handleCreateAgentClick = () => {
    if (currentPlan && agents.length >= currentPlan.agentLimit) {
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
      const newCustomer = createNewCustomer(customerData, MOCK_FRANCHISEE.id);
      setCustomers([...customers, newCustomer]);
      customerId = newCustomer.id;
      customer = newCustomer;
      
      // Update franchisee customer count in a real app
      // MOCK_FRANCHISEE.customerCount += 1;
      
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
      const newAgent = createNewAgent(agentData, customerId, MOCK_FRANCHISEE.id);
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

  const totalAgents = agents.length;
  const agentLimit = currentPlan?.agentLimit || 3; // Default to 3 if no plan is found
  const connectedAgents = agents.filter(agent => agent.whatsappConnected).length;

  return (
    <div className="space-y-6">
      {/* Stats and create button */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <AgentStats 
          totalAgents={totalAgents} 
          agentLimit={agentLimit} 
          connectedAgents={connectedAgents}
        />
        
        <AgentActionButtons
          totalAgents={totalAgents}
          agentLimit={agentLimit}
          onCreateClick={handleCreateAgentClick}
        />
      </div>

      {/* Plan info card */}
      {currentPlan && (
        <PlanInfoCard 
          planName={currentPlan.name}
          agentLimit={agentLimit}
          billingCycle={currentPlan.billingCycle}
          totalAgents={totalAgents}
        />
      )}

      {/* Agents list */}
      <AgentsList 
        agents={agents} 
        onViewAgent={handleViewAgent}
        onEditAgent={handleEditAgent}
        onConnectAgent={handleConnectAgent}
        onTest={handleTestAgent}
      />

      {/* Modals */}
      <CreateAgentModal
        open={isCreateModalOpen || isEditModalOpen}
        onClose={() => {
          isCreateModalOpen ? setIsCreateModalOpen(false) : setIsEditModalOpen(false);
          setCurrentAgent(null);
        }}
        onSubmit={handleSubmitAgent}
        editing={isEditModalOpen ? currentAgent! : undefined}
        existingCustomers={customers}
      />

      <WhatsAppConnectionModal
        isOpen={isWhatsAppModalOpen}
        onClose={() => setIsWhatsAppModalOpen(false)}
        onConnect={handleConnectWhatsApp}
        agent={currentAgent}
        customer={currentCustomer}
      />

      <CustomerPortalModal
        isOpen={isCustomerPortalModalOpen}
        onClose={handleClosePortalModal}
        portalAccess={currentCustomerPortal}
        onSendEmail={handleSendCredentialsEmail}
      />

      <PlanLimitModal
        isOpen={isPlanLimitModalOpen}
        onClose={() => setIsPlanLimitModalOpen(false)}
        agentLimit={agentLimit}
      />
    </div>
  );
}
