
import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle, Search, QrCode, Bot } from "lucide-react";
import AgentCard from "@/components/agents/AgentCard";
import CreateAgentModal from "@/components/agents/CreateAgentModal";
import { Agent } from "@/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";

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
  },
  {
    id: "agent3",
    name: "Suporte Técnico",
    sector: "Suporte",
    prompt: "Você é um agente de suporte técnico especializado em resolver problemas técnicos.",
    isActive: true,
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    customerId: "customer3",
    franchiseeId: "franchisee1",
    openAiKey: "sk-xxxxxxxxxxxxxxxxxxxx",
    whatsappConnected: false,
    messageCount: 980,
    responseTime: 2.5
  }
];

export default function Agents() {
  const [agents, setAgents] = useState<Agent[]>(MOCK_AGENTS);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [currentAgent, setCurrentAgent] = useState<Agent | null>(null);

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

  const totalAgents = agents.length;
  const connectedAgents = agents.filter(agent => agent.whatsappConnected).length;
  const availableAgents = 3 - totalAgents; // Basic plan includes 3 agents

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
                  {totalAgents} <span className="text-xs text-muted-foreground">/ Plano: 3</span>
                </p>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm border flex items-center gap-2">
              <QrCode className="text-green-500 h-5 w-5" />
              <div>
                <p className="text-sm text-muted-foreground">Conectados</p>
                <p className="font-medium">
                  {connectedAgents} <span className="text-xs text-muted-foreground">/ {totalAgents}</span>
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
              onClick={() => setIsCreateModalOpen(true)}
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

        {/* Plan alert */}
        {availableAgents <= 0 && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-lg p-4 flex items-start">
            <div className="mr-3 mt-0.5">⚠️</div>
            <div>
              <p className="font-medium">Limite de agentes do plano atingido</p>
              <p className="text-sm">Seu plano atual inclui até 3 agentes. Para adicionar mais agentes, você pode adquiri-los por R$ 100/mês cada.</p>
              <Button variant="outline" className="mt-2 bg-amber-100 hover:bg-amber-200 border-amber-200">
                Adquirir agente adicional
              </Button>
            </div>
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
    </DashboardLayout>
  );
}
