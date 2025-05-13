
import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, MessageCircle, Zap, Clock, Bot, User, Users } from "lucide-react";

// Mock data for analytics
const MOCK_DAILY_MESSAGES = [4580, 5240, 4920, 5100, 4800, 5300, 5680];
const MOCK_MONTHLY_REVENUE = [8740, 9450, 10200, 11980];

export default function Analytics() {
  const [periodTab, setPeriodTab] = useState("7d");

  return (
    <DashboardLayout title="Estatísticas">
      <div className="space-y-6">
        {/* Period selector tabs */}
        <Tabs defaultValue="7d" value={periodTab} onValueChange={setPeriodTab} className="w-full">
          <TabsList>
            <TabsTrigger value="7d">7 dias</TabsTrigger>
            <TabsTrigger value="30d">30 dias</TabsTrigger>
            <TabsTrigger value="90d">90 dias</TabsTrigger>
            <TabsTrigger value="12m">12 meses</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Overview stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total de Mensagens"
            value={periodTab === "7d" ? "35,620" : periodTab === "30d" ? "142,480" : "428,640"}
            description={`Últimos ${periodTab === "7d" ? "7 dias" : periodTab === "30d" ? "30 dias" : "3 meses"}`}
            icon={<MessageCircle size={20} />}
            trend={{ value: 8, positive: true }}
          />
          
          <StatCard
            title="Tokens Consumidos"
            value={periodTab === "7d" ? "489k" : periodTab === "30d" ? "1.8M" : "5.4M"}
            description="Total"
            icon={<Zap size={20} />}
          />
          
          <StatCard
            title="Tempo de Resposta"
            value="2.1s"
            description="Média geral"
            icon={<Clock size={20} />}
            trend={{ value: 12, positive: true }}
          />
          
          <StatCard
            title="Agentes Ativos"
            value="42/50"
            description="84% ativos"
            icon={<Bot size={20} />}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Message volume chart */}
          <Card>
            <CardHeader>
              <CardTitle>Volume de Mensagens</CardTitle>
              <CardDescription>
                Total de mensagens trocadas por dia
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="h-[300px] w-full flex items-end justify-between px-2">
                {MOCK_DAILY_MESSAGES.map((value, index) => (
                  <div key={index} className="relative h-full flex flex-col justify-end items-center">
                    <div 
                      className="w-12 bg-primary/80 hover:bg-primary rounded-t-md transition-all"
                      style={{ height: `${(value / 6000) * 100}%` }}
                    />
                    <span className="absolute bottom-[-24px] text-xs text-muted-foreground">
                      {new Date(Date.now() - (6 - index) * 24 * 60 * 60 * 1000)
                        .toLocaleDateString("pt-BR", { weekday: "short" })}
                    </span>
                    <span className="absolute bottom-[-40px] text-[10px] text-muted-foreground">
                      {value.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Revenue chart */}
          <Card>
            <CardHeader>
              <CardTitle>Faturamento</CardTitle>
              <CardDescription>
                Total faturado por mês (R$)
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="h-[300px] w-full flex items-end justify-between px-2">
                {MOCK_MONTHLY_REVENUE.map((value, index) => (
                  <div key={index} className="relative h-full flex flex-col justify-end items-center">
                    <div 
                      className="w-16 bg-secondary/80 hover:bg-secondary rounded-t-md transition-all"
                      style={{ height: `${(value / 12000) * 100}%` }}
                    />
                    <span className="absolute bottom-[-24px] text-xs text-muted-foreground">
                      {new Date(Date.now() - (3 - index) * 30 * 24 * 60 * 60 * 1000)
                        .toLocaleDateString("pt-BR", { month: "short" })}
                    </span>
                    <span className="absolute bottom-[-40px] text-[10px] text-muted-foreground">
                      {value.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Usage by franchisees */}
        <Card>
          <CardHeader>
            <CardTitle>Uso por Franqueados</CardTitle>
            <CardDescription>
              Detalhamento de atividade por franqueado
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs uppercase bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th scope="col" className="px-6 py-3">Franqueado</th>
                    <th scope="col" className="px-6 py-3">Agentes</th>
                    <th scope="col" className="px-6 py-3">Mensagens</th>
                    <th scope="col" className="px-6 py-3">Tempo Médio</th>
                    <th scope="col" className="px-6 py-3">Tokens</th>
                    <th scope="col" className="px-6 py-3">Faturamento</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { name: "João Silva", agents: 8, messages: 12480, responseTime: "2.3s", tokens: "589k", revenue: "R$ 1.497,00" },
                    { name: "Ana Souza", agents: 12, messages: 18920, responseTime: "1.9s", tokens: "712k", revenue: "R$ 2.992,50" },
                    { name: "Carlos Mendes", agents: 5, messages: 8640, responseTime: "2.1s", tokens: "345k", revenue: "R$ 1.048,70" },
                    { name: "Patricia Lima", agents: 15, messages: 22340, responseTime: "2.4s", tokens: "892k", revenue: "R$ 3.745,20" },
                    { name: "Roberto Alves", agents: 2, messages: 1240, responseTime: "2.8s", tokens: "62k", revenue: "R$ 297,00" }
                  ].map((franchisee, index) => (
                    <tr key={index} className="bg-white border-b dark:bg-gray-900 dark:border-gray-700">
                      <td className="px-6 py-4 font-medium">{franchisee.name}</td>
                      <td className="px-6 py-4">{franchisee.agents}</td>
                      <td className="px-6 py-4">{franchisee.messages.toLocaleString()}</td>
                      <td className="px-6 py-4">{franchisee.responseTime}</td>
                      <td className="px-6 py-4">{franchisee.tokens}</td>
                      <td className="px-6 py-4">{franchisee.revenue}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
