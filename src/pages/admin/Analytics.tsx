
import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, MessageCircle, Zap, Clock, Bot, User, Users } from "lucide-react";
import { ChartContainer } from "@/components/ui/chart";
import { useIsMobile } from "@/hooks/use-mobile";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { cn } from "@/lib/utils";

// Mock data for analytics
const MOCK_DAILY_MESSAGES = [
  { day: "dom", value: 4580 },
  { day: "seg", value: 5240 },
  { day: "ter", value: 4920 },
  { day: "qua", value: 5100 },
  { day: "qui", value: 4800 }, 
  { day: "sex", value: 5300 },
  { day: "sab", value: 5680 }
];

const MOCK_MONTHLY_REVENUE = [
  { month: "jan", value: 8740 },
  { month: "fev", value: 9450 },
  { month: "mar", value: 10200 },
  { month: "abr", value: 11980 }
];

export default function Analytics() {
  const [periodTab, setPeriodTab] = useState("7d");
  const isMobile = useIsMobile();

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
              <div className="h-[300px]">
                <ChartContainer 
                  config={{
                    messages: {
                      color: "hsl(var(--primary))"
                    }
                  }}
                >
                  <BarChart data={MOCK_DAILY_MESSAGES} margin={{ top: 10, right: 10, left: isMobile ? 0 : 20, bottom: 20 }}>
                    <XAxis 
                      dataKey="day" 
                      tick={{ fontSize: 12 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis 
                      hide={isMobile} 
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip 
                      cursor={false}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="rounded-lg border bg-background p-2 shadow-md">
                              <p className="text-xs">{`${payload[0].value.toLocaleString()} mensagens`}</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar 
                      dataKey="value" 
                      fill="currentColor" 
                      radius={[4, 4, 0, 0]}
                      className="fill-primary/80 hover:fill-primary"
                      barSize={isMobile ? 25 : 40}
                    />
                  </BarChart>
                </ChartContainer>
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
              <div className="h-[300px]">
                <ChartContainer 
                  config={{
                    revenue: {
                      color: "hsl(var(--secondary))"
                    }
                  }}
                >
                  <BarChart data={MOCK_MONTHLY_REVENUE} margin={{ top: 10, right: 10, left: isMobile ? 0 : 20, bottom: 20 }}>
                    <XAxis 
                      dataKey="month" 
                      tick={{ fontSize: 12 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis 
                      hide={isMobile}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip 
                      cursor={false}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="rounded-lg border bg-background p-2 shadow-md">
                              <p className="text-xs">{`R$ ${payload[0].value.toLocaleString()}`}</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar 
                      dataKey="value" 
                      fill="currentColor" 
                      radius={[4, 4, 0, 0]}
                      className="fill-secondary/80 hover:fill-secondary"
                      barSize={isMobile ? 25 : 40}
                    />
                  </BarChart>
                </ChartContainer>
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
