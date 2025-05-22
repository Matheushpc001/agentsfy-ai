import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { Agent, Customer, CustomerPortalAccess, Message } from "@/types";
import { toast } from "sonner";
import { getPlanById } from "@/constants/plans";
import AgentsList from "@/components/agents/AgentsList";
import AgentStats from "@/components/agents/AgentStats";
import PlanInfoCard from "@/components/agents/PlanInfoCard";
import CreateAgentModal from "@/components/agents/CreateAgentModal";
import WhatsAppConnectionModal from "@/components/agents/WhatsAppConnectionModal";
import CustomerPortalModal from "@/components/agents/CustomerPortalModal";
import PlanLimitModal from "@/components/agents/PlanLimitModal";

// Mock data for the current franchisee with plan info
const MOCK_FRANCHISEE = {
  id: "franchisee1",
  name: "João Silva",
  email: "joao@exemplo.com",
  role: "franchisee" as const,
  agentCount: 2,
  revenue: 1500,
  isActive: true,
  createdAt: "2023-01-15",
  customerCount: 5,
  planId: "starter-monthly",
  planType: "monthly" as const,
  planExpiresAt: "2023-12-31"
};

// Mock agents data
const MOCK_AGENTS: Agent[] = [
  {
    id: "agent1",
    name: "Atendente Virtual",
    sector: "Atendimento ao Cliente",
    prompt: "Você é um atendente virtual especializado em responder dúvidas sobre produtos e serviços da empresa.",
    isActive: true,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    customerId: "customer1",
    franchiseeId: "franchisee1",
    openAiKey: "sk-xxxxxxxxxxxxxxxxxxxx",
    whatsappConnected: true,
    messageCount: 2540,
    phoneNumber: "+5511999999999",
    responseTime: 2.3,
    demoUrl: "https://demo.whatsapp.com/agent1"
  },
  {
    id: "agent2",
    name: "Vendedor Virtual",
    sector: "Vendas",
    prompt: "Você é um vendedor virtual especializado em oferecer produtos e serviços da empresa.",
    isActive: true,
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    customerId: "customer2",
    franchiseeId: "franchisee1",
    openAiKey: "sk-xxxxxxxxxxxxxxxxxxxx",
    whatsappConnected: true,
    messageCount: 1820,
    phoneNumber: "+5511888888888",
    responseTime: 1.8,
    demoUrl: "https://demo.whatsapp.com/agent2"
  }
];

// Mock customers data
const MOCK_CUSTOMERS: Customer[] = [
  {
    id: "customer1",
    name: "Cliente Empresa A",
    email: "contato@empresaa.com",
    businessName: "Empresa A",
    role: "customer",
    franchiseeId: "franchisee1",
    agentCount: 2,
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    logo: "https://ui-avatars.com/api/?name=Empresa+A&background=0D8ABC&color=fff",
    document: "12.345.678/0001-90",
    contactPhone: "+5511977777777",
    portalUrl: "https://cliente.plataforma.com/customer1"
  },
  {
    id: "customer2",
    name: "Cliente Empresa B",
    email: "contato@empresab.com",
    businessName: "Empresa B",
    role: "customer",
    franchiseeId: "franchisee1",
    agentCount: 1,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    document: "98.765.432/0001-21",
    contactPhone: "+5511966666666"
  }
];

export default function Agents() {
  const [agents, setAgents] = useState<Agent[]>(MOCK_AGENTS);
  const [customers, setCustomers] = useState<Customer[]>(MOCK_CUSTOMERS);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const [isCustomerPortalModalOpen, setIsCustomerPortalModalOpen] = useState(false);
  const [isPlanLimitModalOpen, setIsPlanLimitModalOpen] = useState(false);
  const [currentAgent, setCurrentAgent] = useState<Agent | null>(null);
  const [currentCustomer, setCurrentCustomer] = useState<Customer | null>(null);
  const [currentCustomerPortal, setCurrentCustomerPortal] = useState<CustomerPortalAccess | null>(null);
  
  // Get current plan details from the mock franchisee data
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
    const customer = MOCK_CUSTOMERS.find(c => c.id === agent.customerId);
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

  const handleCreateAgentClick = () => {
    if (currentPlan && agents.length >= currentPlan.agentLimit) {
      setIsPlanLimitModalOpen(true);
    } else {
      setIsCreateModalOpen(true);
    }
  };

  const generateRandomId = () => `id${Math.floor(Math.random() * 10000)}`;
  const generateRandomPassword = () => Math.random().toString(36).slice(-8);

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
      const newCustomer: Customer = {
        id: `customer${Date.now()}`,
        name: customerData.name || "",
        email: customerData.email || "",
        businessName: customerData.businessName || "",
        role: "customer",
        franchiseeId: "franchisee1", // Would come from current user in a real app
        agentCount: 1,
        createdAt: new Date().toISOString(),
        document: customerData.document,
        contactPhone: customerData.contactPhone,
        portalUrl: `https://cliente.plataforma.com/c/${generateRandomId()}`,
        password: generateRandomPassword()
      };
      
      setCustomers([...customers, newCustomer]);
      customerId = newCustomer.id;
      customer = newCustomer;
      
      // Update franchisee customer count
      MOCK_FRANCHISEE.customerCount += 1;
      
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
      const newAgent: Agent = {
        id: `agent${Date.now()}`,
        name: agentData.name!,
        sector: agentData.sector!,
        prompt: agentData.prompt || "",
        isActive: true,
        createdAt: new Date().toISOString(),
        customerId: customerId,
        franchiseeId: "franchisee1", // Would come from current user in a real app
        openAiKey: agentData.openAiKey!,
        whatsappConnected: false,
        messageCount: 0,
        responseTime: 0
      };
      
      setAgents([...agents, newAgent]);
      setCurrentAgent(newAgent);
      setIsCreateModalOpen(false);
      
      if (customer) {
        setCurrentCustomer(customer);
        
        // Show WhatsApp connection modal after agent creation
        setIsWhatsAppModalOpen(true);
        
        // Generate customer portal access
        const customerPortal: CustomerPortalAccess = {
          url: customer.portalUrl || `https://cliente.plataforma.com/c/${customer.id}`,
          username: customer.email,
          password: customer.password || generateRandomPassword(),
          customerId: customer.id,
        };
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
  const availableAgents = agentLimit - totalAgents;
  const connectedAgents = agents.filter(agent => agent.whatsappConnected).length;

  return (
    <DashboardLayout title="Agentes">
      <div className="space-y-6">
        {/* Stats and create button */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <AgentStats 
            totalAgents={totalAgents} 
            agentLimit={agentLimit} 
            connectedAgents={connectedAgents}
          />
          
          <div className="flex w-full md:w-auto">
            <Button 
              onClick={handleCreateAgentClick}
              disabled={availableAgents <= 0}
              className="w-full md:w-auto"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Novo Agente
              {availableAgents > 0 && (
                <span className="ml-2 text-xs bg-white/20 px-1.5 py-0.5 rounded-full">
                  {availableAgents} disponível
                </span>
              )}
            </Button>
          </div>
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
        />
      </div>

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
    </DashboardLayout>
  );
}
