import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageCircle, Zap, Clock, Bot, User, Users, ChartPie } from "lucide-react";
import { ChartContainer } from "@/components/ui/chart";
import { useIsMobile } from "@/hooks/use-mobile";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { cn } from "@/lib/utils";
import { DashboardStatCard } from "@/components/ui/dashboard-stat-card";

// Mock data for analytics
const MOCK_DAILY_MESSAGES = [{
  day: "dom",
  value: 4580
}, {
  day: "seg",
  value: 5240
}, {
  day: "ter",
  value: 4920
}, {
  day: "qua",
  value: 5100
}, {
  day: "qui",
  value: 4800
}, {
  day: "sex",
  value: 5300
}, {
  day: "sab",
  value: 5680
}];
const MOCK_MONTHLY_REVENUE = [{
  month: "jan",
  value: 8740
}, {
  month: "fev",
  value: 9450
}, {
  month: "mar",
  value: 10200
}, {
  month: "abr",
  value: 11980
}];

// Mock data for pie charts
const MOCK_CHANNEL_DISTRIBUTION = [{
  name: "WhatsApp",
  value: 67,
  color: "#25D366"
}, {
  name: "Web Chat",
  value: 23,
  color: "#0099FF"
}, {
  name: "Messenger",
  value: 10,
  color: "#006AFF"
}];
const MOCK_MARKET_DISTRIBUTION = [{
  name: "Atendimento",
  value: 45,
  color: "#4264FB"
}, {
  name: "Vendas",
  value: 35,
  color: "#00C48C"
}, {
  name: "Suporte",
  value: 20,
  color: "#FFB946"
}];
export default function Analytics() {
  const [periodTab, setPeriodTab] = useState("7d");
  const isMobile = useIsMobile();

  // Formatter for currency values
  const currencyFormatter = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2
  });
  return <DashboardLayout title="Estatísticas">
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

        {/* Main Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <DashboardStatCard title="Faturamento" value={currencyFormatter.format(50598.98)} change={{
          value: 9.2,
          positive: true,
          label: "desde mês anterior"
        }} chartData={MOCK_MONTHLY_REVENUE} chartColor="#0EA5E9" />
          
          <DashboardStatCard title="Vendas Realizadas" value="120" change={{
          value: 10.5,
          positive: true,
          label: "desde semana anterior"
        }} chartData={MOCK_DAILY_MESSAGES} chartColor="#0EA5E9" />
          
          <DashboardStatCard title="Média por Venda" value={currencyFormatter.format(421.66)} change={{
          value: 2.8,
          positive: false,
          label: "desde mês anterior"
        }} chartData={[...MOCK_DAILY_MESSAGES].reverse()} chartColor="#0EA5E9" />
        </div>

        {/* Overview stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total de Mensagens" value={periodTab === "7d" ? "35,620" : periodTab === "30d" ? "142,480" : "428,640"} description={`Últimos ${periodTab === "7d" ? "7 dias" : periodTab === "30d" ? "30 dias" : "3 meses"}`} icon={<MessageCircle size={20} />} trend={{
          value: 8,
          positive: true
        }} />
          
          <StatCard title="Tokens Consumidos" value={periodTab === "7d" ? "489k" : periodTab === "30d" ? "1.8M" : "5.4M"} description="Total" icon={<Zap size={20} />} />
          
          <StatCard title="Tempo de Resposta" value="2.1s" description="Média geral" icon={<Clock size={20} />} trend={{
          value: 12,
          positive: true
        }} />
          
          <StatCard title="Agentes Ativos" value="42/50" description="84% ativos" icon={<Bot size={20} />} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Message volume chart */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Volume de Mensagens</CardTitle>
              <CardDescription>
                Total de mensagens trocadas por dia
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="h-[300px]">
                <ChartContainer config={{
                messages: {
                  color: "hsl(var(--chart-blue))"
                }
              }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={MOCK_DAILY_MESSAGES} margin={{
                    top: 20,
                    right: 10,
                    left: isMobile ? 0 : 20,
                    bottom: 20
                  }}>
                      <XAxis dataKey="day" tick={{
                      fontSize: 12
                    }} tickLine={false} axisLine={false} />
                      <YAxis hide={isMobile} tickLine={false} axisLine={false} />
                      <Tooltip cursor={{
                      fill: 'rgba(0, 0, 0, 0.1)'
                    }} content={({
                      active,
                      payload
                    }) => {
                      if (active && payload && payload.length) {
                        return <div className="rounded-lg border bg-background p-2 shadow-md">
                                <p className="text-xs font-semibold">{`${payload[0].payload.day}`}</p>
                                <p className="text-sm">{`${payload[0].value.toLocaleString()} mensagens`}</p>
                              </div>;
                      }
                      return null;
                    }} />
                      <Bar dataKey="value" fill="currentColor" radius={[4, 4, 0, 0]} className="fill-[#0EA5E9] hover:fill-[#0284C7]" barSize={isMobile ? 25 : 40} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>

          {/* Revenue chart */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Faturamento</CardTitle>
              <CardDescription>
                Total faturado por mês (R$)
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="h-[300px]">
                <ChartContainer config={{
                revenue: {
                  color: "hsl(var(--chart-green))"
                }
              }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={MOCK_MONTHLY_REVENUE} margin={{
                    top: 20,
                    right: 10,
                    left: isMobile ? 0 : 20,
                    bottom: 20
                  }}>
                      <XAxis dataKey="month" tick={{
                      fontSize: 12
                    }} tickLine={false} axisLine={false} />
                      <YAxis hide={isMobile} tickLine={false} axisLine={false} />
                      <Tooltip cursor={false} content={({
                      active,
                      payload
                    }) => {
                      if (active && payload && payload.length) {
                        return <div className="rounded-lg border bg-background p-2 shadow-md">
                                <p className="text-xs font-semibold">{`${payload[0].payload.month}`}</p>
                                <p className="text-sm">{`R$ ${payload[0].value.toLocaleString()}`}</p>
                              </div>;
                      }
                      return null;
                    }} />
                      <Line type="monotone" dataKey="value" stroke="#10B981" strokeWidth={3} dot={{
                      r: 4,
                      strokeWidth: 2,
                      fill: "#fff"
                    }} activeDot={{
                      r: 6,
                      strokeWidth: 2
                    }} />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Distribution Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Channel Distribution */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Distribuição por Canal</CardTitle>
              <CardDescription>
                Porcentagem de uso por canal de comunicação
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-[300px]">
                <div className="w-full max-w-[300px]">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie data={MOCK_CHANNEL_DISTRIBUTION} cx="50%" cy="50%" labelLine={false} outerRadius={100} innerRadius={60} paddingAngle={3} dataKey="value" label={({
                      name,
                      percent
                    }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                        {MOCK_CHANNEL_DISTRIBUTION.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                      </Pie>
                      <Tooltip content={({
                      active,
                      payload
                    }) => {
                      if (active && payload && payload.length) {
                        return <div className="rounded-lg border bg-background p-2 shadow-md">
                                <p className="text-xs font-semibold" style={{
                            color: payload[0].payload.color
                          }}>{payload[0].name}</p>
                                <p className="text-sm">{`${payload[0].value}%`}</p>
                              </div>;
                      }
                      return null;
                    }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Market Distribution */}
          <Card>
            
            
          </Card>
        </div>

        {/* Usage by franchisees */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-medium">Uso por Franqueados</CardTitle>
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
                  {[{
                  name: "João Silva",
                  agents: 8,
                  messages: 12480,
                  responseTime: "2.3s",
                  tokens: "589k",
                  revenue: "R$ 1.497,00"
                }, {
                  name: "Ana Souza",
                  agents: 12,
                  messages: 18920,
                  responseTime: "1.9s",
                  tokens: "712k",
                  revenue: "R$ 2.992,50"
                }, {
                  name: "Carlos Mendes",
                  agents: 5,
                  messages: 8640,
                  responseTime: "2.1s",
                  tokens: "345k",
                  revenue: "R$ 1.048,70"
                }, {
                  name: "Patricia Lima",
                  agents: 15,
                  messages: 22340,
                  responseTime: "2.4s",
                  tokens: "892k",
                  revenue: "R$ 3.745,20"
                }, {
                  name: "Roberto Alves",
                  agents: 2,
                  messages: 1240,
                  responseTime: "2.8s",
                  tokens: "62k",
                  revenue: "R$ 297,00"
                }].map((franchisee, index) => <tr key={index} className="bg-white border-b dark:bg-gray-900 dark:border-gray-700">
                      <td className="px-6 py-4 font-medium">{franchisee.name}</td>
                      <td className="px-6 py-4">{franchisee.agents}</td>
                      <td className="px-6 py-4">{franchisee.messages.toLocaleString()}</td>
                      <td className="px-6 py-4">{franchisee.responseTime}</td>
                      <td className="px-6 py-4">{franchisee.tokens}</td>
                      <td className="px-6 py-4">{franchisee.revenue}</td>
                    </tr>)}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>;
}