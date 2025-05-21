import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, QrCode, MoreVertical, RefreshCw, Smartphone, Trash2, Phone, MessageSquare, Check, X, Settings, Copy } from "lucide-react";
import AgentCard from "@/components/agents/AgentCard";
import CreateAgentModal from "@/components/agents/CreateAgentModal";
import { Agent, Customer, WhatsAppConnectionStatus, CustomerPortalAccess } from "@/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { getPlanById } from "@/constants/plans";
import WhatsAppQRCode from "@/components/whatsapp/WhatsAppQRCode";

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
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const [isCustomerPortalModalOpen, setIsCustomerPortalModalOpen] = useState(false);
  const [isPlanLimitModalOpen, setIsPlanLimitModalOpen] = useState(false);
  const [currentAgent, setCurrentAgent] = useState<Agent | null>(null);
  const [isGeneratingQr, setIsGeneratingQr] = useState(false);
  const [currentQrCode, setCurrentQrCode] = useState<string | null>(null);
  const [currentCustomerPortal, setCurrentCustomerPortal] = useState<CustomerPortalAccess | null>(null);
  const [currentCustomer, setCurrentCustomer] = useState<Customer | null>(null);
  const navigate = useNavigate();
  
  // Get current plan details from the mock franchisee data
  const currentPlanId = MOCK_FRANCHISEE.planId;
  const currentPlan = currentPlanId ? getPlanById(currentPlanId) : null;
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value.toLowerCase());
  };

  const filteredAgents = agents.filter(agent => 
    agent.name.toLowerCase().includes(searchTerm) ||
    agent.sector.toLowerCase().includes(searchTerm)
  );

  const handleViewAgent = (agent: Agent) => {
    toast.info(`Visualizando estatísticas do agente ${agent.name}`);
  };

  const handleEditAgent = (agent: Agent) => {
    setCurrentAgent(agent);
    setIsEditModalOpen(true);
  };

  const handleConnectAgent = (agent: Agent) => {
    setCurrentAgent(agent);
    setIsWhatsAppModalOpen(true);
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

  const handleGenerateQrCode = () => {
    setIsGeneratingQr(true);
    // Simulate API call delay
    setTimeout(() => {
      setCurrentQrCode("https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=whatsapp-connection-code-" + Date.now());
      setIsGeneratingQr(false);
    }, 1500);
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

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copiado para a área de transferência!");
  };

  const handleUpgradePlan = () => {
    setIsPlanLimitModalOpen(false);
    navigate("/franchisee/plans");
  };

  const handleClosePortalModal = () => {
    setIsCustomerPortalModalOpen(false);
    setCurrentCustomerPortal(null);
    setCurrentAgent(null);
    toast.success("Agente criado e conectado com sucesso!");
  };

  const totalAgents = agents.length;
  const agentLimit = currentPlan?.agentLimit || 3; // Default to 3 if no plan is found
  const availableAgents = agentLimit - totalAgents;

  return (
    <DashboardLayout title="Agentes">
      <div className="space-y-6">
        {/* Stats and search bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm border flex items-center gap-2">
              <Bot className="text-primary h-5 w-5" />
              <div>
                <p className="text-sm text-muted-foreground">Agentes</p>
                <p className="font-medium">
                  {totalAgents} <span className="text-xs text-muted-foreground">/ {agentLimit}</span>
                </p>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm border flex items-center gap-2">
              <QrCode className="text-green-500 h-5 w-5" />
              <div>
                <p className="text-sm text-muted-foreground">Conectados</p>
                <p className="font-medium">
                  {agents.filter(agent => agent.whatsappConnected).length} <span className="text-xs text-muted-foreground">/ {totalAgents}</span>
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar agentes..."
                className="w-full sm:w-[250px] pl-8"
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>
            <Button 
              onClick={handleCreateAgentClick}
              disabled={availableAgents <= 0}
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
          <div className="bg-white dark:bg-gray-800 border rounded-lg p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="font-medium">Plano atual: {currentPlan.name}</h3>
              <p className="text-sm text-muted-foreground">
                Limite de {currentPlan.agentLimit} agentes • {currentPlan.billingCycle === "monthly" ? "Mensal" : "Anual"}
              </p>
              <div className="mt-2 w-full sm:max-w-xs">
                <div className="flex justify-between text-xs mb-1">
                  <span>{totalAgents} agentes usados</span>
                  <span>{agentLimit} total</span>
                </div>
                <div className="w-full bg-muted rounded-full h-1.5">
                  <div 
                    className="bg-primary h-1.5 rounded-full" 
                    style={{ width: `${(totalAgents / agentLimit) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="shrink-0"
              onClick={() => navigate("/franchisee/plans")}
            >
              Gerenciar Plano
            </Button>
          </div>
        )}

        {/* Agents grid */}
        {filteredAgents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAgents.map(agent => (
              <AgentCard 
                key={agent.id} 
                agent={agent} 
                onView={handleViewAgent}
                onEdit={handleEditAgent}
                onConnect={handleConnectAgent}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64">
            <Bot size={48} className="text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground mb-2">Nenhum agente encontrado.</p>
            {searchTerm && (
              <Button variant="link" onClick={() => setSearchTerm("")}>
                Limpar busca
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Create/Edit Agent Modal */}
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

      {/* WhatsApp Connection Modal */}
      <Dialog open={isWhatsAppModalOpen} onOpenChange={setIsWhatsAppModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Conectar Agente ao WhatsApp</DialogTitle>
            <DialogDescription>
              Escaneie o código QR com o WhatsApp para conectar o agente.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col items-center py-2">
            <WhatsAppQRCode
              isGenerating={isGeneratingQr}
              qrCodeUrl={currentQrCode || undefined}
              onRefresh={handleGenerateQrCode}
              onConnect={handleConnectWhatsApp}
              className="mb-4"
            />
            
            <div className="mt-2 text-center">
              <p className="text-sm text-muted-foreground">
                Cliente: <span className="font-medium text-foreground">{currentCustomer?.businessName}</span>
              </p>
              <p className="text-sm text-muted-foreground">
                Agente: <span className="font-medium text-foreground">{currentAgent?.name}</span>
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsWhatsAppModalOpen(false)}>
              Configurar depois
            </Button>
            {currentQrCode && (
              <Button onClick={handleConnectWhatsApp}>
                Simular Conexão
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Customer Portal Access Modal */}
      <Dialog open={isCustomerPortalModalOpen} onOpenChange={setIsCustomerPortalModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Acesso ao Portal do Cliente</DialogTitle>
            <DialogDescription>
              O portal do cliente foi criado com sucesso. Compartilhe estas informações com o cliente.
            </DialogDescription>
          </DialogHeader>
          
          {currentCustomerPortal && (
            <div className="space-y-6 py-4">
              <div className="bg-muted p-4 rounded-lg text-center">
                <Check size={40} className="mx-auto text-green-500 mb-2" />
                <h3 className="text-lg font-medium">Cliente e Agente criados com sucesso!</h3>
                <p className="text-sm text-muted-foreground">
                  O cliente já pode acessar seu portal e configurar seu WhatsApp
                </p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium mb-1">URL do Portal</p>
                  <div className="flex">
                    <Input readOnly value={currentCustomerPortal.url} className="flex-1" />
                    <Button 
                      variant="outline" 
                      className="ml-2" 
                      size="icon"
                      onClick={() => handleCopyToClipboard(currentCustomerPortal.url)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium mb-1">Usuário</p>
                    <div className="flex">
                      <Input readOnly value={currentCustomerPortal.username} />
                      <Button 
                        variant="outline" 
                        className="ml-2" 
                        size="icon"
                        onClick={() => handleCopyToClipboard(currentCustomerPortal.username)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-1">Senha</p>
                    <div className="flex">
                      <Input readOnly value={currentCustomerPortal.password} type="text" />
                      <Button 
                        variant="outline" 
                        className="ml-2" 
                        size="icon"
                        onClick={() => handleCopyToClipboard(currentCustomerPortal.password)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={handleClosePortalModal}>
              Fechar
            </Button>
            <Button onClick={() => {
              toast.success("Email com instruções enviado ao cliente!");
              handleClosePortalModal();
            }}>
              Enviar credenciais por Email
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Plan limit modal */}
      <Dialog open={isPlanLimitModalOpen} onOpenChange={setIsPlanLimitModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Limite de Agentes Atingido</DialogTitle>
            <DialogDescription>
              Você atingiu o limite de agentes do seu plano atual.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 text-center space-y-4">
            <div className="bg-muted p-4 rounded-lg inline-block mx-auto">
              <Bot size={36} className="text-muted-foreground mx-auto mb-2" />
              <p className="text-lg font-medium">{agentLimit}/{agentLimit} Agentes</p>
              <p className="text-sm text-muted-foreground">Limite máximo atingido</p>
            </div>
            
            <p>
              Para criar mais agentes, você precisa fazer upgrade para um plano com maior capacidade.
            </p>
          </div>
          
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setIsPlanLimitModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleUpgradePlan}>
              Ver planos disponíveis
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
