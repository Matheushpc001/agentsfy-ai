
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle, Bot, Clock, Zap, Users, CircleDollarSign, BarChart3, BriefcaseBusiness } from "lucide-react";
import { Analytics, Agent, Message } from "@/types";
import { cn } from "@/lib/utils";

// Mock data for demonstration
const MOCK_ANALYTICS: Record<UserRole, Analytics> = {
  admin: {
    messageCount: 12548,
    activeAgents: 42,
    totalAgents: 50,
    responseTime: 2.4,
    tokensUsed: 1458962,
    franchiseeCount: 8,
    customerCount: 24,
    revenue: 11980.50
  },
  franchisee: {
    messageCount: 3245,
    activeAgents: 8,
    totalAgents: 10,
    responseTime: 2.1,
    tokensUsed: 387429,
    customerCount: 5
  },
  customer: {
    messageCount: 876,
    activeAgents: 2,
    totalAgents: 2,
    responseTime: 1.9,
    tokensUsed: 98421
  }
};

const MOCK_MESSAGES: Message[] = [
  { 
    id: "1", 
    sender: "+5511999999999", 
    content: "Olá, gostaria de saber mais sobre os serviços oferecidos.", 
    timestamp: new Date(Date.now() - 25 * 60000).toISOString(), 
    agentId: "agent1",
    isAi: false
  },
  { 
    id: "2", 
    sender: "Agente IA", 
    content: "Olá! Claro, posso ajudar. Nossa empresa oferece diversos serviços incluindo consultoria, desenvolvimento de software e suporte técnico. Em qual serviço você tem interesse?", 
    timestamp: new Date(Date.now() - 24 * 60000).toISOString(), 
    agentId: "agent1",
    isAi: true
  },
  { 
    id: "3", 
    sender: "+5511999999999", 
    content: "Estou interessado em desenvolvimento de software. Vocês desenvolvem aplicativos para iOS?", 
    timestamp: new Date(Date.now() - 10 * 60000).toISOString(), 
    agentId: "agent1",
    isAi: false
  },
  { 
    id: "4", 
    sender: "Agente IA", 
    content: "Sim, desenvolvemos aplicativos para iOS, Android e também web apps. Posso explicar nossas metodologias de desenvolvimento, prazos e orçamentos. Você já tem alguma ideia específica para o aplicativo que gostaria de desenvolver?", 
    timestamp: new Date(Date.now() - 9 * 60000).toISOString(), 
    agentId: "agent1",
    isAi: true
  },
  { 
    id: "5", 
    sender: "+5511999999999", 
    content: "Tenho sim. Preciso de um app para gerenciar meu pequeno negócio.", 
    timestamp: new Date(Date.now() - 2 * 60000).toISOString(), 
    agentId: "agent1",
    isAi: false
  }
];

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
    messageCount: 450,
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
    messageCount: 230,
    phoneNumber: "+5511888888888",
    responseTime: 1.8,
    demoUrl: "https://demo.whatsapp.com/agent2"
  }
];

export default function Dashboard() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [recentMessages, setRecentMessages] = useState<Message[]>([]);
  const [topAgents, setTopAgents] = useState<Agent[]>([]);

  useEffect(() => {
    if (user) {
      // Simulate API call to get analytics data
      setAnalytics(MOCK_ANALYTICS[user.role]);
      
      // Set recent messages
      setRecentMessages(MOCK_MESSAGES);
      
      // Set top agents
      setTopAgents(MOCK_AGENTS.slice(0, 3));
    }
  }, [user]);

  if (!user || !analytics) {
    return (
      <DashboardLayout title="Dashboard">
        <div className="flex items-center justify-center h-64">
          <div className="animate-pulse text-primary">Carregando...</div>
        </div>
      </DashboardLayout>
    );
  }

  const formatDateTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <DashboardLayout title="Dashboard">
      <div className="space-y-6">
        {/* Stats Section */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total de Mensagens"
            value={analytics.messageCount.toLocaleString()}
            description="Últimos 30 dias"
            icon={<MessageCircle size={20} />}
            trend={{ value: 12, positive: true }}
          />
          
          <StatCard
            title="Agentes Ativos"
            value={`${analytics.activeAgents}/${analytics.totalAgents}`}
            description="Agentes conectados"
            icon={<Bot size={20} />}
          />
          
          <StatCard
            title="Tempo de Resposta"
            value={`${analytics.responseTime}s`}
            description="Média"
            icon={<Clock size={20} />}
            trend={{ value: 5, positive: true }}
          />
          
          <StatCard
            title="Tokens Usados"
            value={analytics.tokensUsed.toLocaleString()}
            description="Últimos 30 dias"
            icon={<Zap size={20} />}
          />

          {user.role === "admin" && (
            <>
              <StatCard
                title="Franqueados"
                value={analytics.franchiseeCount?.toString() || "0"}
                icon={<Users size={20} />}
              />
              
              <StatCard
                title="Clientes"
                value={analytics.customerCount?.toString() || "0"}
                icon={<BriefcaseBusiness size={20} />}
              />
              
              <StatCard
                title="Faturamento"
                value={`R$ ${analytics.revenue?.toLocaleString() || "0"}`}
                description="Este mês"
                icon={<CircleDollarSign size={20} />}
                trend={{ value: 8, positive: true }}
              />
            </>
          )}

          {user.role === "franchisee" && (
            <StatCard
              title="Clientes"
              value={analytics.customerCount?.toString() || "0"}
              icon={<BriefcaseBusiness size={20} />}
            />
          )}
        </section>
        
        {/* Main Content Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Messages */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-medium">Mensagens Recentes</CardTitle>
            </CardHeader>
            <CardContent className="px-0">
              <div className="space-y-4">
                {recentMessages.map(message => (
                  <div 
                    key={message.id} 
                    className={cn(
                      "px-4 py-3 rounded-lg mx-4",
                      message.isAi 
                        ? "bg-primary/5 border border-primary/10" 
                        : "bg-gray-50 dark:bg-gray-800"
                    )}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <div className="font-medium text-sm">
                        {message.sender}
                        {message.isAi && (
                          <span className="ml-2 text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full">
                            IA
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatDateTime(message.timestamp)}
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {message.content}
                    </p>
                  </div>
                ))}
                
                {recentMessages.length === 0 && (
                  <div className="text-center py-6 text-muted-foreground">
                    Nenhuma mensagem recente
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* Stats/Charts */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-medium">
                {user.role === "admin" 
                  ? "Desempenho" 
                  : user.role === "franchisee" 
                    ? "Principais Agentes" 
                    : "Análise de Uso"
                }
              </CardTitle>
            </CardHeader>
            <CardContent>
              {user.role === "admin" && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b">
                    <span className="text-sm">Agentes</span>
                    <span className="text-sm font-medium">{analytics.totalAgents}</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b">
                    <span className="text-sm">Taxa de Resposta</span>
                    <span className="text-sm font-medium">98.5%</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b">
                    <span className="text-sm">Satisfação</span>
                    <span className="text-sm font-medium">4.8/5</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Conversões</span>
                    <span className="text-sm font-medium">16%</span>
                  </div>
                  
                  <div className="text-center pt-4">
                    <BarChart3 className="mx-auto h-20 w-20 text-primary opacity-50" />
                    <p className="text-sm text-muted-foreground mt-2">
                      Dados completos no painel de estatísticas
                    </p>
                  </div>
                </div>
              )}
              
              {user.role === "franchisee" && (
                <div className="space-y-3">
                  {topAgents.map(agent => (
                    <div key={agent.id} className="flex items-center p-2 rounded-lg border bg-gray-50 dark:bg-gray-800">
                      <div className="mr-3 h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Bot size={20} className="text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{agent.name}</p>
                        <p className="text-xs text-muted-foreground">{agent.messageCount} mensagens</p>
                      </div>
                      <div className={cn(
                        "h-2.5 w-2.5 rounded-full",
                        agent.isActive ? "bg-green-500" : "bg-gray-300" 
                      )}></div>
                    </div>
                  ))}

                  {topAgents.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Bot className="mx-auto h-12 w-12 text-muted-foreground/50 mb-2" />
                      <p>Nenhum agente cadastrado</p>
                    </div>
                  )}
                </div>
              )}
              
              {user.role === "customer" && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b">
                    <span className="text-sm">Conversas Hoje</span>
                    <span className="text-sm font-medium">24</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b">
                    <span className="text-sm">Tempo Médio</span>
                    <span className="text-sm font-medium">2:45 min</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b">
                    <span className="text-sm">Horário de Pico</span>
                    <span className="text-sm font-medium">14h - 16h</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Tokens Restantes</span>
                    <span className="text-sm font-medium">41%</span>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                    <div className="bg-primary h-2.5 rounded-full" style={{ width: '41%' }}></div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
