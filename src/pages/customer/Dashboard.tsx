
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { MessageCircle, Clock, Bot, Users, Phone, Calendar } from "lucide-react";
import { Message } from "@/types";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

// Mock data for demonstration
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

// Mock hourly activity data
const MOCK_HOURLY_ACTIVITY = [
  { hour: '08-10', count: 12 },
  { hour: '10-12', count: 24 },
  { hour: '12-14', count: 18 },
  { hour: '14-16', count: 32 },
  { hour: '16-18', count: 28 },
  { hour: '18-20', count: 14 },
];

export default function CustomerDashboard() {
  const [recentMessages, setRecentMessages] = useState<Message[]>([]);
  
  useEffect(() => {
    // Simulate API call to get recent messages
    setRecentMessages(MOCK_MESSAGES);
  }, []);

  const formatDateTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  // Calculate max value for chart
  const maxCount = Math.max(...MOCK_HOURLY_ACTIVITY.map(item => item.count));

  return (
    <DashboardLayout title="Dashboard do Cliente">
      <div className="space-y-6">
        {/* Client Header */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow border">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center">
              <div className="w-16 h-16 rounded-lg overflow-hidden bg-primary/10 flex items-center justify-center">
                <span className="text-2xl font-bold text-primary">EA</span>
              </div>
              <div className="ml-4">
                <h2 className="text-xl font-semibold">Empresa A</h2>
                <p className="text-muted-foreground">Painel de Controle</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 md:gap-4">
              <Badge className="bg-primary/10 hover:bg-primary/10 text-primary border-primary/10 px-3 py-1.5">
                <Bot className="w-3.5 h-3.5 mr-1" /> 2 Agentes Ativos
              </Badge>
              <Badge className="bg-green-100 hover:bg-green-100 text-green-800 border-green-200 px-3 py-1.5">
                <Phone className="w-3.5 h-3.5 mr-1" /> WhatsApp Conectado
              </Badge>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard
            title="Total de Mensagens"
            value="876"
            description="Últimos 30 dias"
            icon={<MessageCircle size={20} />}
            trend={{ value: 12, positive: true }}
          />
          
          <StatCard
            title="Tempo de Resposta"
            value="1.9s"
            description="Média"
            icon={<Clock size={20} />}
          />
          
          <StatCard
            title="Agentes"
            value="2/2"
            description="100% ativos"
            icon={<Bot size={20} />}
          />
          
          <StatCard
            title="Visitantes Únicos"
            value="124"
            description="Este mês"
            icon={<Users size={20} />}
          />
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
                            Agente IA
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
              </div>
            </CardContent>
          </Card>
          
          {/* Activity Chart */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-medium">Horários de Movimento</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[220px] flex items-end justify-between mt-4">
                {MOCK_HOURLY_ACTIVITY.map((item, index) => (
                  <div key={index} className="flex flex-col items-center w-full">
                    <div 
                      className="w-4/5 bg-primary/80 hover:bg-primary rounded-t-md transition-all"
                      style={{ height: `${(item.count / maxCount) * 180}px` }}
                    />
                    <div className="text-xs text-muted-foreground mt-2">{item.hour}h</div>
                    <div className="text-xs font-medium mt-1">{item.count}</div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6">
                <div className="flex justify-between items-center pb-2 border-b">
                  <span className="text-sm">Horário de pico</span>
                  <span className="text-sm font-medium">14h - 16h</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-sm">Média de mensagens/hora</span>
                  <span className="text-sm font-medium">21</span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-sm">Data da análise</span>
                  <span className="text-sm font-medium flex items-center">
                    <Calendar className="h-3.5 w-3.5 mr-1" />
                    {new Date().toLocaleDateString("pt-BR")}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Token Usage Section */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-medium">Uso de Tokens</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm">Consumo Total</span>
                <span className="text-sm font-medium">98.421 tokens (aprox. 59%)</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                <div className="bg-primary h-2.5 rounded-full" style={{ width: '59%' }}></div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Baseado no uso deste mês. Última atualização: {new Date().toLocaleDateString("pt-BR")}
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg border bg-muted/50">
                <div className="flex justify-between">
                  <span className="text-sm">Agente: Atendente Virtual</span>
                  <span className="text-sm font-medium">61.348 tokens</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-2">
                  <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: '62%' }}></div>
                </div>
              </div>
              <div className="p-4 rounded-lg border bg-muted/50">
                <div className="flex justify-between">
                  <span className="text-sm">Agente: Vendedor Virtual</span>
                  <span className="text-sm font-medium">37.073 tokens</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-2">
                  <div className="bg-green-500 h-1.5 rounded-full" style={{ width: '38%' }}></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
