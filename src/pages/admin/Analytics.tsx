
import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { StatCard } from "@/components/ui/stat-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageCircle, Zap, Clock, Bot } from "lucide-react";
import { DashboardStatCard } from "@/components/ui/dashboard-stat-card";
import { BillingChart } from "@/components/analytics/BillingChart";
import { FranchiseeTable } from "@/components/analytics/FranchiseeTable";
import { useAnalyticsData } from "@/hooks/useAnalyticsData";
import { Skeleton } from "@/components/ui/skeleton";

// Removed mock data - now using real data from useAnalyticsData hook

export default function Analytics() {
  const [periodTab, setPeriodTab] = useState("7d");
  const { data: analyticsData, isLoading, error } = useAnalyticsData(periodTab);

  // Formatter for currency values
  const currencyFormatter = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2
  });

  if (isLoading) {
    return (
      <DashboardLayout title="Estatísticas">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-[200px] rounded-lg" />
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-[120px] rounded-lg" />
            ))}
          </div>
          <Skeleton className="h-[400px] rounded-lg" />
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="Estatísticas">
        <div className="text-center py-10 text-destructive bg-destructive/10 border border-destructive/20 rounded-lg">
          <p className="font-semibold">Erro ao carregar estatísticas</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!analyticsData) return null;

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
            value={currencyFormatter.format(analyticsData.totalRevenue)} 
            change={{
              value: 9.2,
              positive: true,
              label: "desde mês anterior"
            }} 
            chartData={analyticsData.monthlyRevenue} 
            chartColor="#0EA5E9" 
          />
          
          <DashboardStatCard 
            title="Vendas Realizadas" 
            value={analyticsData.totalSales.toString()} 
            change={{
              value: 10.5,
              positive: true,
              label: "desde semana anterior"
            }} 
            chartData={analyticsData.dailyMessages} 
            chartColor="#0EA5E9" 
          />
          
          <DashboardStatCard 
            title="Média por Venda" 
            value={currencyFormatter.format(analyticsData.averageRevenuePerSale)} 
            change={{
              value: 2.8,
              positive: false,
              label: "desde mês anterior"
            }} 
            chartData={[...analyticsData.dailyMessages].reverse()} 
            chartColor="#0EA5E9" 
          />
        </div>

        {/* Overview stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard 
            title="Total de Mensagens" 
            value={analyticsData.totalMessages.toLocaleString('pt-BR')} 
            description={`Últimos ${periodTab === "7d" ? "7 dias" : periodTab === "30d" ? "30 dias" : periodTab === "90d" ? "90 dias" : "12 meses"}`} 
            icon={<MessageCircle size={20} />} 
            trend={{
              value: 8,
              positive: true
            }} 
          />
          
          <StatCard 
            title="Tokens Consumidos" 
            value={analyticsData.tokensConsumed} 
            description="Total" 
            icon={<Zap size={20} />} 
          />
          
          <StatCard 
            title="Tempo de Resposta" 
            value={analyticsData.averageResponseTime} 
            description="Média geral" 
            icon={<Clock size={20} />} 
            trend={{
              value: 12,
              positive: true
            }} 
          />
          
          <StatCard 
            title="Agentes Ativos" 
            value={`${analyticsData.activeAgents.active}/${analyticsData.activeAgents.total}`} 
            description={`${analyticsData.activeAgents.percentage}% ativos`} 
            icon={<Bot size={20} />} 
          />
        </div>

        {/* Billing Chart */}
        <BillingChart userRole="admin" />

        {/* Usage by franchisees */}
        <FranchiseeTable franchisees={analyticsData.franchiseeData} />
      </div>
    </DashboardLayout>
  );
}
