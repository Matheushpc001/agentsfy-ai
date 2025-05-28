
import { Button } from "@/components/ui/button";
import { RefreshCw, CircleDollarSign, Building2, Users, Bot, UserCheck } from "lucide-react";
import { Analytics, UserRole } from "@/types";
import { cn } from "@/lib/utils";
import { EnhancedStatCard } from "@/components/ui/enhanced-stat-card";
import { StatCardSkeleton } from "@/components/ui/enhanced-skeleton";
import { DashboardSection } from "@/components/ui/dashboard-section";
import { memo, useMemo } from "react";

interface DashboardStatsProps {
  userRole: UserRole;
  analytics: Analytics;
  isLoadingResults: boolean;
  onRefresh: () => void;
}

export const DashboardStats = memo(function DashboardStats({
  userRole,
  analytics,
  isLoadingResults,
  onRefresh
}: DashboardStatsProps) {
  const refreshButton = useMemo(() => (
    <Button 
      onClick={onRefresh} 
      disabled={isLoadingResults} 
      variant="outline" 
      size="sm" 
      className="gap-2 hover:scale-105 transition-transform duration-200"
    >
      <RefreshCw className={cn("h-4 w-4", isLoadingResults && "animate-spin")} />
      Atualizar
    </Button>
  ), [onRefresh, isLoadingResults]);

  const formatCurrency = useMemo(() => (value: number) => 
    `R$ ${value?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, []);

  const renderLoadingSkeletons = (count: number) => (
    Array.from({ length: count }, (_, i) => <StatCardSkeleton key={i} />)
  );

  if (userRole === "admin") {
    return (
      <div className="space-y-3">
        <DashboardSection 
          title="Resultados" 
          headerAction={refreshButton}
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {isLoadingResults ? renderLoadingSkeletons(3) : (
              <>
                <EnhancedStatCard 
                  title="Faturamento Mensal" 
                  value={formatCurrency(analytics.monthlyRevenue)}
                  icon={<CircleDollarSign size={20} />} 
                  trend={{ value: 12, positive: true }}
                  variant="default"
                />
                
                <EnhancedStatCard 
                  title="Franqueados" 
                  value={analytics.franchiseeCount?.toString() || "0"} 
                  icon={<Building2 size={20} />}
                  variant="default"
                />
                
                <EnhancedStatCard 
                  title="Clientes" 
                  value={analytics.customerCount?.toString() || "0"} 
                  icon={<Users size={20} />}
                  variant="default"
                />
              </>
            )}
          </div>
        </DashboardSection>
      </div>
    );
  }

  if (userRole === "franchisee") {
    return (
      <div className="space-y-3">
        <DashboardSection 
          title="Resultado com agentes" 
          headerAction={refreshButton}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {isLoadingResults ? renderLoadingSkeletons(2) : (
              <>
                <EnhancedStatCard 
                  title="Instalação" 
                  value={formatCurrency(analytics.installationRevenue)}
                  icon={<Bot size={20} />}
                  variant="default"
                />
                
                <EnhancedStatCard 
                  title="Faturamento Mensal" 
                  value={formatCurrency(analytics.monthlyRevenue)}
                  icon={<CircleDollarSign size={20} />} 
                  trend={{ value: 8, positive: true }}
                  variant="default"
                />
              </>
            )}
          </div>
        </DashboardSection>
        
        <DashboardSection title="Total Clientes">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {isLoadingResults ? renderLoadingSkeletons(2) : (
              <>
                <EnhancedStatCard 
                  title="Nº de Clientes" 
                  value={analytics.customerCount?.toString() || "0"} 
                  icon={<Users size={20} />}
                  variant="default"
                />
                
                <EnhancedStatCard 
                  title="Status" 
                  value={`${analytics.activeCustomers} ativos`} 
                  icon={<UserCheck size={20} />}
                  variant="default"
                />
              </>
            )}
          </div>
        </DashboardSection>
      </div>
    );
  }

  return null;
});
