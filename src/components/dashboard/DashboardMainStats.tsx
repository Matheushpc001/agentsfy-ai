
import { StatCard } from "@/components/ui/stat-card";
import { Skeleton } from "@/components/ui/skeleton";
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
        <>
          <div className="p-6 rounded-xl border bg-card space-y-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-5 w-5 rounded-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-3 w-16" />
            </div>
            <Skeleton className="h-4 w-12" />
          </div>
          <div className="p-6 rounded-xl border bg-card space-y-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-5 w-5 rounded-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
          <div className="p-6 rounded-xl border bg-card space-y-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-5 w-5 rounded-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-8 w-12" />
              <Skeleton className="h-3 w-14" />
            </div>
            <Skeleton className="h-4 w-10" />
          </div>
          <div className="p-6 rounded-xl border bg-card space-y-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-5 w-5 rounded-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-3 w-18" />
            </div>
          </div>
        </>
      ) : (
        <>
          <StatCard 
            title="Total de Mensagens" 
            value={analytics.messageCount.toLocaleString()} 
            description="Últimos 30 dias" 
            icon={<MessageCircle size={20} />} 
            trend={{
              value: 12,
              positive: true
            }} 
          />
          
          <StatCard 
            title="Agentes Ativos" 
            value={`${analytics.activeAgents}/${analytics.totalAgents}`} 
            description="Agentes conectados" 
            icon={<Bot size={20} />} 
          />
          
          <StatCard 
            title="Tempo de Resposta" 
            value={`${analytics.responseTime}s`} 
            description="Média" 
            icon={<Clock size={20} />} 
            trend={{
              value: 5,
              positive: true
            }} 
          />
          
          <StatCard 
            title="Tokens Usados" 
            value={analytics.tokensUsed.toLocaleString()} 
            description="Últimos 30 dias" 
            icon={<Zap size={20} />} 
          />
        </>
      )}
    </section>
  );
}
