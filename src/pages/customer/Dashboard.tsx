
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { MessageCircle, Clock, Bot, Users, Phone, Calendar } from "lucide-react";
import { Message } from "@/types";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const isMobile = useIsMobile();
  
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
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 md:p-6 shadow border">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center">
              <div className="w-12 h-12 md:w-16 md:h-16 rounded-lg overflow-hidden bg-primary/10 flex items-center justify-center">
                <span className="text-xl md:text-2xl font-bold text-primary">EA</span>
              </div>
              <div className="ml-4">
                <h2 className="text-lg md:text-xl font-semibold">Empresa A</h2>
                <p className="text-muted-foreground">Painel de Controle</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 md:gap-4 w-full md:w-auto justify-center md:justify-start">
              <Badge className="bg-primary/10 hover:bg-primary/10 text-primary border-primary/10 px-2 md:px-3 py-1 md:py-1.5 text-xs">
                <Bot className="w-3 h-3 md:w-3.5 md:h-3.5 mr-1" /> 2 Agentes Ativos
              </Badge>
              <Badge className="bg-green-100 hover:bg-green-100 text-green-800 border-green-200 px-2 md:px-3 py-1 md:py-1.5 text-xs">
                <Phone className="w-3 h-3 md:w-3.5 md:h-3.5 mr-1" /> WhatsApp Conectado
              </Badge>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <StatCard
            title="Total de Mensagens"
            value="876"
            description="Últimos 30 dias"
            icon={<MessageCircle size={18} />}
            trend={{ value: 12, positive: true }}
            className="p-3 md:p-6"
          />
          
          <StatCard
            title="Tempo de Resposta"
            value="1.9s"
            description="Média"
            icon={<Clock size={18} />}
            className="p-3 md:p-6"
          />
          
          <StatCard
            title="Agentes"
            value="2/2"
            description="100% ativos"
            icon={<Bot size={18} />}
            className="p-3 md:p-6"
          />
          
          <StatCard
            title="Visitantes"
            value="124"
            description="Este mês"
            icon={<Users size={18} />}
            className="p-3 md:p-6"
          />
        </section>
        
        {/* Main Content Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Messages */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-2 md:pb-3">
              <CardTitle className="text-base md:text-lg font-medium">Mensagens Recentes</CardTitle>
            </CardHeader>
            <CardContent className="px-0 max-h-[450px] overflow-y-auto">
              <div className="space-y-3 md:space-y-4">
                {recentMessages.map(message => (
                  <div 
                    key={message.id} 
                    className={cn(
                      "px-3 md:px-4 py-2 md:py-3 rounded-lg mx-3 md:mx-4",
                      message.isAi 
                        ? "bg-primary/5 border border-primary/10" 
                        : "bg-gray-50 dark:bg-gray-800"
                    )}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <div className="font-medium text-xs md:text-sm truncate max-w-[70%]">
                        {message.sender}
                        {message.isAi && (
                          <span className="ml-1 md:ml-2 text-[10px] md:text-xs px-1 md:px-2 py-0.5 bg-primary/10 text-primary rounded-full">
                            Agente IA
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] md:text-xs text-muted-foreground">
                        {formatDateTime(message.timestamp)}
                      </div>
                    </div>
                    <p className="text-xs md:text-sm text-gray-700 dark:text-gray-300 break-words">
                      {message.content}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          {/* Activity Chart */}
          <Card>
            <CardHeader className="pb-2 md:pb-3">
              <CardTitle className="text-base md:text-lg font-medium">Horários de Movimento</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[180px] md:h-[220px] flex items-end justify-between mt-2 md:mt-4">
                {MOCK_HOURLY_ACTIVITY.map((item, index) => (
                  <div key={index} className="flex flex-col items-center w-full">
                    <div 
                      className="w-4/5 bg-primary/80 hover:bg-primary rounded-t-md transition-all"
                      style={{ height: `${(item.count / maxCount) * (isMobile ? 140 : 180)}px` }}
                    />
                    <div className="text-[10px] md:text-xs text-muted-foreground mt-1 md:mt-2">{item.hour}h</div>
                    <div className="text-[10px] md:text-xs font-medium mt-0.5 md:mt-1">{item.count}</div>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 md:mt-6 text-xs md:text-sm">
                <div className="flex justify-between items-center pb-2 border-b">
                  <span>Horário de pico</span>
                  <span className="font-medium">14h - 16h</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span>Média de mensagens/hora</span>
                  <span className="font-medium">21</span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span>Data da análise</span>
                  <span className="font-medium flex items-center">
                    <Calendar className="h-3 w-3 md:h-3.5 md:w-3.5 mr-1" />
                    {new Date().toLocaleDateString("pt-BR")}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Token Usage Section */}
        <Card>
          <CardHeader className="pb-2 md:pb-3">
            <CardTitle className="text-base md:text-lg font-medium">Uso de Tokens</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 md:space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1 text-xs md:text-sm">
                <span>Consumo Total</span>
                <span className="font-medium">98.421 tokens (59%)</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 md:h-2.5">
                <div className="bg-primary h-2 md:h-2.5 rounded-full" style={{ width: '59%' }}></div>
              </div>
              <p className="text-[10px] md:text-xs text-muted-foreground mt-1">
                Baseado no uso deste mês. Última atualização: {new Date().toLocaleDateString("pt-BR")}
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              <div className="p-3 md:p-4 rounded-lg border bg-muted/50">
                <div className="flex justify-between text-xs md:text-sm">
                  <span>Agente: Atendente Virtual</span>
                  <span className="font-medium">61.348</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-2">
                  <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: '62%' }}></div>
                </div>
              </div>
              <div className="p-3 md:p-4 rounded-lg border bg-muted/50">
                <div className="flex justify-between text-xs md:text-sm">
                  <span>Agente: Vendedor Virtual</span>
                  <span className="font-medium">37.073</span>
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
