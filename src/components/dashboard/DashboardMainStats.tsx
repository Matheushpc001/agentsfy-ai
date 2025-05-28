
import { MessageCircle, Bot, Clock, Zap } from "lucide-react";
import { Analytics } from "@/types";
import { EnhancedStatCard } from "@/components/ui/enhanced-stat-card";
import { StatCardSkeleton } from "@/components/ui/enhanced-skeleton";

interface DashboardMainStatsProps {
  analytics: Analytics;
  isLoadingResults: boolean;
}

export function DashboardMainStats({ analytics, isLoadingResults }: DashboardMainStatsProps) {
  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {isLoadingResults ? (
        <>
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
        </>
      ) : (
        <>
          <EnhancedStatCard 
            title="Total de Mensagens" 
            value={analytics.messageCount.toLocaleString()} 
            description="Últimos 30 dias" 
            icon={<MessageCircle size={20} />} 
            trend={{
              value: 12,
              positive: true
            }}
            variant="default"
          />
          
          <EnhancedStatCard 
            title="Agentes Ativos" 
            value={`${analytics.activeAgents}/${analytics.totalAgents}`} 
            description="Agentes conectados" 
            icon={<Bot size={20} />}
            variant="success"
          />
          
          <EnhancedStatCard 
            title="Tempo de Resposta" 
            value={`${analytics.responseTime}s`} 
            description="Média" 
            icon={<Clock size={20} />} 
            trend={{
              value: 5,
              positive: true
            }}
            variant="warning"
          />
          
          <EnhancedStatCard 
            title="Tokens Usados" 
            value={analytics.tokensUsed.toLocaleString()} 
            description="Últimos 30 dias" 
            icon={<Zap size={20} />}
            variant="default"
          />
        </>
      )}
    </section>
  );
}
