import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle, Bot, Clock, Zap, Users, CircleDollarSign, BarChart3, BriefcaseBusiness, Building2, UserCheck } from "lucide-react";
import { Analytics, Agent, Message, UserRole } from "@/types";
import { cn } from "@/lib/utils";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { useIsMobile } from "@/hooks/use-mobile";
import { AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

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
    revenue: 11980.50,
    monthlyRevenue: 45600.75
  },
  franchisee: {
    messageCount: 3245,
    activeAgents: 8,
    totalAgents: 10,
    responseTime: 2.1,
    tokensUsed: 387429,
    customerCount: 5,
    activeCustomers: 4,
    installationRevenue: 2500.00,
    monthlyRevenue: 4800.50
  },
  customer: {
    messageCount: 876,
    activeAgents: 2,
    totalAgents: 2,
    responseTime: 1.9,
    tokensUsed: 98421
  }
};

// Data for charts
const MOCK_WEEKLY_MESSAGES = [
  { day: "Dom", count: 345 },
  { day: "Seg", count: 456 },
  { day: "Ter", count: 523 },
  { day: "Qua", count: 578 },
  { day: "Qui", count: 498 },
  { day: "Sex", count: 467 },
  { day: "Sáb", count: 389 }
];

const MOCK_CHANNEL_DISTRIBUTION = [
  { name: "WhatsApp", value: 68, color: "#25D366" },
  { name: "Web", value: 22, color: "#0EA5E9" },
  { name: "Email", value: 10, color: "#6366F1" }
];

const MOCK_MESSAGES: Message[] = [{
  id: "1",
  sender: "+5511999999999",
  content: "Olá, gostaria de saber mais sobre os serviços oferecidos.",
  timestamp: new Date(Date.now() - 25 * 60000).toISOString(),
  agentId: "agent1",
  isAi: false
}, {
  id: "2",
  sender: "Agente IA",
  content: "Olá! Claro, posso ajudar. Nossa empresa oferece diversos serviços incluindo consultoria, desenvolvimento de software e suporte técnico. Em qual serviço você tem interesse?",
  timestamp: new Date(Date.now() - 24 * 60000).toISOString(),
  agentId: "agent1",
  isAi: true
}, {
  id: "3",
  sender: "+5511999999999",
  content: "Estou interessado em desenvolvimento de software. Vocês desenvolvem aplicativos para iOS?",
  timestamp: new Date(Date.now() - 10 * 60000).toISOString(),
  agentId: "agent1",
  isAi: false
}, {
  id: "4",
  sender: "Agente IA",
  content: "Sim, desenvolvemos aplicativos para iOS, Android e também web apps. Posso explicar nossas metodologias de desenvolvimento, prazos e orçamentos. Você já tem alguma ideia específica para o aplicativo que gostaria de desenvolver?",
  timestamp: new Date(Date.now() - 9 * 60000).toISOString(),
  agentId: "agent1",
  isAi: true
}, {
  id: "5",
  sender: "+5511999999999",
  content: "Tenho sim. Preciso de um app para gerenciar meu pequeno negócio.",
  timestamp: new Date(Date.now() - 2 * 60000).toISOString(),
  agentId: "agent1",
  isAi: false
}];
const MOCK_AGENTS: Agent[] = [{
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
}, {
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
}];
export default function Dashboard() {
  const {
    user
  } = useAuth();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [recentMessages, setRecentMessages] = useState<Message[]>([]);
  const [topAgents, setTopAgents] = useState<Agent[]>([]);
  const isMobile = useIsMobile();
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
    return <DashboardLayout title="Dashboard">
        <div className="flex items-center justify-center h-64">
          <div className="animate-pulse text-primary">Carregando...</div>
        </div>
      </DashboardLayout>;
  }
  const formatDateTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit"
    });
  };
  // Formatter for currency values
  const currencyFormatter = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2
  });
  return <DashboardLayout title="Dashboard">
      <div className="space-y-6">
        {/* Admin Results Section */}
        {user.role === "admin" && <section>
            <h2 className="text-xl font-semibold mb-4">Resultados</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <StatCard title="Faturamento Mensal" value={`R$ ${analytics.monthlyRevenue?.toLocaleString('pt-BR', {
            minimumFractionDigits: 2
          })}`} icon={<CircleDollarSign size={20} />} trend={{
            value: 12,
            positive: true
          }} />
              
              <StatCard title="Franqueados" value={analytics.franchiseeCount?.toString() || "0"} icon={<Building2 size={20} />} />
              
              <StatCard title="Clientes" value={analytics.customerCount?.toString() || "0"} icon={<Users size={20} />} />
            </div>
          </section>}

        {/* Franchisee Results Section */}
        {user.role === "franchisee" && <>
            <section>
              <h2 className="text-xl font-semibold mb-4">Resultado com agentes</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <StatCard title="Instalação" value={`R$ ${analytics.installationRevenue?.toLocaleString('pt-BR', {
              minimumFractionDigits: 2
            })}`} icon={<Bot size={20} />} />
                
                <StatCard title="Faturamento Mensal" value={`R$ ${analytics.monthlyRevenue?.toLocaleString('pt-BR', {
              minimumFractionDigits: 2
            })}`} icon={<CircleDollarSign size={20} />} trend={{
              value: 8,
              positive: true
            }} />
              </div>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-4">Total Clientes</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <StatCard title="Nº de Clientes" value={analytics.customerCount?.toString() || "0"} icon={<Users size={20} />} />
                
                <StatCard title="Status" value={`${analytics.activeCustomers} ativos`} icon={<UserCheck size={20} />} />
              </div>
            </section>
          </>}
        
        {/* Stats Section */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total de Mensagens" value={analytics.messageCount.toLocaleString()} description="Últimos 30 dias" icon={<MessageCircle size={20} />} trend={{
          value: 12,
          positive: true
        }} />
          
          <StatCard title="Agentes Ativos" value={`${analytics.activeAgents}/${analytics.totalAgents}`} description="Agentes conectados" icon={<Bot size={20} />} />
          
          <StatCard title="Tempo de Resposta" value={`${analytics.responseTime}s`} description="Média" icon={<Clock size={20} />} trend={{
          value: 5,
          positive: true
        }} />
          
          <StatCard title="Tokens Usados" value={analytics.tokensUsed.toLocaleString()} description="Últimos 30 dias" icon={<Zap size={20} />} />
        </section>
        
        {/* Main Content Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Messages */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-medium">
                Mensagens Recentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] overflow-hidden">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={MOCK_WEEKLY_MESSAGES}
                    margin={{ top: 20, right: 20, left: isMobile ? 0 : 20, bottom: 20 }}
                  >
                    <defs>
                      <linearGradient id="colorMessages" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0EA5E9" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#0EA5E9" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis 
                      dataKey="day" 
                      tick={{ fontSize: 12 }} 
                      tickLine={false} 
                      axisLine={{ stroke: 'rgba(255,255,255,0.2)' }}
                    />
                    <YAxis 
                      width={isMobile ? 30 : 40}
                      tickFormatter={(value) => value.toString()}
                      tick={{ fontSize: 12 }}
                      tickLine={false}
                      axisLine={{ stroke: 'rgba(255,255,255,0.2)' }}
                    />
                    <Tooltip
                      contentStyle={{ 
                        backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '8px',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                      }}
                      itemStyle={{ color: '#fff' }}
                      formatter={(value) => [`${value} mensagens`, 'Quantidade']}
                      labelFormatter={(label) => `${label}`}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="count" 
                      stroke="#0EA5E9" 
                      strokeWidth={2}
                      fillOpacity={1} 
                      fill="url(#colorMessages)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          {/* Stats/Charts */}
          <Card className="h-fit">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-medium">
                {user.role === "admin" ? "Desempenho" : user.role === "franchisee" ? "Principais Agentes" : "Análise de Uso"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AspectRatio ratio={isMobile ? 16 / 12 : 16 / 9} className="overflow-hidden">
                {user.role === "admin" && <div className="space-y-4 h-full">
                    <div className="flex justify-between items-center pb-2 border-b border-border/50">
                      <span className="text-sm">Agentes</span>
                      <span className="text-sm font-medium">{analytics.totalAgents}</span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b border-border/50">
                      <span className="text-sm">Taxa de Resposta</span>
                      <span className="text-sm font-medium">98.5%</span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b border-border/50">
                      <span className="text-sm">Satisfação</span>
                      <span className="text-sm font-medium">4.8/5</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Conversões</span>
                      <span className="text-sm font-medium">16%</span>
                    </div>
                    
                    <div className="mt-4 h-24">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={MOCK_CHANNEL_DISTRIBUTION}
                            cx="50%"
                            cy="50%"
                            innerRadius={20}
                            outerRadius={40}
                            paddingAngle={2}
                            dataKey="value"
                          >
                            {MOCK_CHANNEL_DISTRIBUTION.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{ 
                              backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                              border: '1px solid rgba(255,255,255,0.2)',
                              borderRadius: '8px'
                            }}
                            itemStyle={{ color: '#fff' }}
                            formatter={(value) => [`${value}%`, 'Porcentagem']}
                            labelFormatter={(name) => `${name}`}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>}
                
                {user.role === "franchisee" && <div className="space-y-3 h-full">
                    {topAgents.map(agent => <div key={agent.id} className="flex items-center p-2 rounded-lg border bg-gray-50 dark:bg-gray-800">
                        <div className="mr-3 h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Bot size={20} className="text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{agent.name}</p>
                          <p className="text-xs text-muted-foreground">{agent.messageCount} mensagens</p>
                        </div>
                        <div className={cn("h-2.5 w-2.5 rounded-full", agent.isActive ? "bg-green-500" : "bg-gray-300")}></div>
                      </div>)}

                    {topAgents.length === 0 && <div className="text-center py-8 text-muted-foreground h-full flex flex-col items-center justify-center">
                        <Bot className="h-12 w-12 text-muted-foreground/50 mb-2" />
                        <p>Nenhum agente cadastrado</p>
                      </div>}
                  </div>}
                
                {user.role === "customer" && <div className="space-y-4 h-full">
                    <div className="flex justify-between items-center pb-2 border-b border-border/50">
                      <span className="text-sm">Conversas Hoje</span>
                      <span className="text-sm font-medium">24</span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b border-border/50">
                      <span className="text-sm">Tempo Médio</span>
                      <span className="text-sm font-medium">2:45 min</span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b border-border/50">
                      <span className="text-sm">Horário de Pico</span>
                      <span className="text-sm font-medium">14h - 16h</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Tokens Restantes</span>
                      <span className="text-sm font-medium">41%</span>
                    </div>
                    
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mt-2">
                      <div className="bg-primary h-2.5 rounded-full" style={{
                    width: '41%'
                  }}></div>
                    </div>
                    
                    <div className="mt-2 h-24">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={MOCK_WEEKLY_MESSAGES}>
                          <Line 
                            type="monotone" 
                            dataKey="count" 
                            stroke="#0EA5E9" 
                            strokeWidth={2}
                            dot={false}
                          />
                          <Tooltip
                            contentStyle={{ 
                              backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                              border: '1px solid rgba(255,255,255,0.2)',
                              borderRadius: '8px'
                            }}
                            itemStyle={{ color: '#fff' }}
                            formatter={(value) => [`${value} msgs`, '']}
                            labelFormatter={(label) => `${label}`}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>}
              </AspectRatio>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>;
}
