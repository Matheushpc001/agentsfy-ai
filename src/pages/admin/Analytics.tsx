
import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { StatCard } from "@/components/ui/stat-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageCircle, Zap, Clock, Bot } from "lucide-react";
import { DashboardStatCard } from "@/components/ui/dashboard-stat-card";
import { BillingChart } from "@/components/analytics/BillingChart";
import { FranchiseeTable } from "@/components/analytics/FranchiseeTable";

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

const MOCK_FRANCHISEES = [
  {
    name: "João Silva",
    agents: 8,
    revenue: "R$ 1.497,00"
  },
  {
    name: "Ana Souza",
    agents: 12,
    revenue: "R$ 2.992,50"
  },
  {
    name: "Carlos Mendes",
    agents: 5,
    revenue: "R$ 1.048,70"
  },
  {
    name: "Patricia Lima",
    agents: 15,
    revenue: "R$ 3.745,20"
  },
  {
    name: "Roberto Alves",
    agents: 2,
    revenue: "R$ 297,00"
  }
];

export default function Analytics() {
  const [periodTab, setPeriodTab] = useState("7d");

  // Formatter for currency values
  const currencyFormatter = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2
  });

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

        {/* Main Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <DashboardStatCard 
            title="Faturamento" 
            value={currencyFormatter.format(50598.98)} 
            change={{
              value: 9.2,
              positive: true,
              label: "desde mês anterior"
            }} 
            chartData={MOCK_MONTHLY_REVENUE} 
            chartColor="#0EA5E9" 
          />
          
          <DashboardStatCard 
            title="Vendas Realizadas" 
            value="120" 
            change={{
              value: 10.5,
              positive: true,
              label: "desde semana anterior"
            }} 
            chartData={MOCK_DAILY_MESSAGES} 
            chartColor="#0EA5E9" 
          />
          
          <DashboardStatCard 
            title="Média por Venda" 
            value={currencyFormatter.format(421.66)} 
            change={{
              value: 2.8,
              positive: false,
              label: "desde mês anterior"
            }} 
            chartData={[...MOCK_DAILY_MESSAGES].reverse()} 
            chartColor="#0EA5E9" 
          />
        </div>

        {/* Overview stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard 
            title="Total de Mensagens" 
            value={periodTab === "7d" ? "35,620" : periodTab === "30d" ? "142,480" : "428,640"} 
            description={`Últimos ${periodTab === "7d" ? "7 dias" : periodTab === "30d" ? "30 dias" : "3 meses"}`} 
            icon={<MessageCircle size={20} />} 
            trend={{
              value: 8,
              positive: true
            }} 
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
            trend={{
              value: 12,
              positive: true
            }} 
          />
          
          <StatCard 
            title="Agentes Ativos" 
            value="42/50" 
            description="84% ativos" 
            icon={<Bot size={20} />} 
          />
        </div>

        {/* Billing Chart */}
        <BillingChart userRole="admin" />

        {/* Usage by franchisees */}
        <FranchiseeTable franchisees={MOCK_FRANCHISEES} />
      </div>
    </DashboardLayout>
  );
}
