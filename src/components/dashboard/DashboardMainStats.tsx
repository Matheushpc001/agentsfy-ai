
import { MetricCard } from "@/components/ui/metric-card";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { MessageCircle, Bot, Clock, Zap } from "lucide-react";
import { Analytics } from "@/types";

interface DashboardMainStatsProps {
  analytics: Analytics;
  isLoadingResults: boolean;
}

export function DashboardMainStats({ analytics, isLoadingResults }: DashboardMainStatsProps) {
  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {isLoadingResults ? (
        <LoadingSkeleton variant="stat" count={4} />
      ) : (
        <>
          <MetricCard 
            title="Total de Mensagens" 
            value={analytics.messageCount.toLocaleString()} 
            subtitle="Últimos 30 dias" 
            icon={<MessageCircle size={20} />} 
            trend={{
              value: 12,
              positive: true
            }} 
          />
          
          <MetricCard 
            title="Agentes Ativos" 
            value={`${analytics.activeAgents}/${analytics.totalAgents}`} 
            subtitle="Agentes conectados" 
            icon={<Bot size={20} />} 
          />
          
          <MetricCard 
            title="Tempo de Resposta" 
            value={`${analytics.responseTime}s`} 
            subtitle="Média" 
            icon={<Clock size={20} />} 
            trend={{
              value: 5,
              positive: true
            }} 
          />
          
          <MetricCard 
            title="Tokens Usados" 
            value={analytics.tokensUsed.toLocaleString()} 
            subtitle="Últimos 30 dias" 
            icon={<Zap size={20} />} 
          />
        </>
      )}
    </section>
  );
}
