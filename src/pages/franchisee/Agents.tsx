
import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle, Search, QrCode, Bot, ArrowRight } from "lucide-react";
import AgentCard from "@/components/agents/AgentCard";
import CreateAgentModal from "@/components/agents/CreateAgentModal";
import { Agent, Plan } from "@/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { getPlanById } from "@/constants/plans";

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

export default function Agents() {
  const [agents, setAgents] = useState<Agent[]>(MOCK_AGENTS);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [isPlanLimitModalOpen, setIsPlanLimitModalOpen] = useState(false);
  const [currentAgent, setCurrentAgent] = useState<Agent | null>(null);
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
    setIsConnectModalOpen(true);
  };

  const handleCreateAgentClick = () => {
    if (currentPlan && agents.length >= currentPlan.agentLimit) {
      setIsPlanLimitModalOpen(true);
    } else {
      setIsCreateModalOpen(true);
    }
  };

  const handleSubmitAgent = (agentData: Partial<Agent>) => {
    if (isEditModalOpen && currentAgent) {
      // Edit existing agent
      const updatedAgents = agents.map(agent =>
        agent.id === currentAgent.id ? { ...agent, ...agentData } : agent
      );
      setAgents(updatedAgents);
      toast.success(`Agente ${agentData.name} atualizado com sucesso!`);
      setIsEditModalOpen(false);
    } else {
      // Create new agent
      const newAgent: Agent = {
        id: `agent${Date.now()}`,
        name: agentData.name!,
        sector: agentData.sector!,
        prompt: agentData.prompt || "",
        isActive: true,
        createdAt: new Date().toISOString(),
        customerId: "customer1", // Would come from selection in a real app
        franchiseeId: "franchisee1", // Would come from current user in a real app
        openAiKey: agentData.openAiKey!,
        whatsappConnected: false,
        messageCount: 0,
        responseTime: 0
      };
      
      setAgents([...agents, newAgent]);
      toast.success(`Agente ${agentData.name} criado com sucesso!`);
      setIsCreateModalOpen(false);
    }
    
    setCurrentAgent(null);
  };

  const handleConnectQrCode = () => {
    if (!currentAgent) return;
    
    // Simulate connecting the agent to WhatsApp
    setTimeout(() => {
      const updatedAgents = agents.map(agent =>
        agent.id === currentAgent.id ? { ...agent, whatsappConnected: true } : agent
      );
      setAgents(updatedAgents);
      setIsConnectModalOpen(false);
      setCurrentAgent(null);
      toast.success("Agente conectado ao WhatsApp com sucesso!");
    }, 2000);
  };

  const handleUpgradePlan = () => {
    setIsPlanLimitModalOpen(false);
    navigate("/franchisee/plans");
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
      />

      {/* Connect WhatsApp Modal */}
      <Dialog open={isConnectModalOpen} onOpenChange={setIsConnectModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Conectar Agente ao WhatsApp</DialogTitle>
            <DialogDescription>
              Escaneie o código QR com o WhatsApp para conectar o agente.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col items-center py-6">
            {/* Placeholder for QR code */}
            <div className="w-64 h-64 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center mb-4">
              <div className="text-center">
                <QrCode size={80} className="mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-muted-foreground animate-pulse">Gerando código QR...</p>
              </div>
            </div>
            
            <p className="text-sm text-center text-muted-foreground mt-4">
              Abra o WhatsApp no seu celular, acesse Configurações &gt; WhatsApp Web e escaneie o código QR.
            </p>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConnectModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleConnectQrCode}>
              Simular Conexão
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
