
import { Button } from "@/components/ui/button";
import { RefreshCw, CircleDollarSign, Building2, Users, Bot, UserCheck } from "lucide-react";
import { Analytics, UserRole } from "@/types";
import { cn } from "@/lib/utils";
import { EnhancedStatCard } from "@/components/ui/enhanced-stat-card";
import { StatCardSkeleton } from "@/components/ui/enhanced-skeleton";
import { DashboardSection } from "@/components/ui/dashboard-section";

interface DashboardStatsProps {
  userRole: UserRole;
  analytics: Analytics;
  isLoadingResults: boolean;
  onRefresh: () => void;
}

export function DashboardStats({
  userRole,
  analytics,
  isLoadingResults,
  onRefresh
}: DashboardStatsProps) {
  const refreshButton = (
    <Button 
      onClick={onRefresh} 
      disabled={isLoadingResults} 
      variant="outline" 
      size="sm" 
      className="gap-2"
    >
      <RefreshCw className={cn("h-4 w-4", isLoadingResults && "animate-spin")} />
      Atualizar
    </Button>
  );

  return (
    <div className="space-y-3">
      {/* Admin Results Section */}
      {userRole === "admin" && (
        <DashboardSection 
          title="Resultados" 
          headerAction={refreshButton}
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {isLoadingResults ? (
              <>
                <StatCardSkeleton />
                <StatCardSkeleton />
                <StatCardSkeleton />
              </>
            ) : (
              <>
                <EnhancedStatCard 
                  title="Faturamento Mensal" 
                  value={`R$ ${analytics.monthlyRevenue?.toLocaleString('pt-BR', {
                    minimumFractionDigits: 2
                  })}`}
                  icon={<CircleDollarSign size={20} />} 
                  trend={{
                    value: 12,
                    positive: true
                  }}
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
      )}

      {/* Franchisee Results Section */}
      {userRole === "franchisee" && (
        <>
          <DashboardSection 
            title="Resultado com agentes" 
            headerAction={refreshButton}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {isLoadingResults ? (
                <>
                  <StatCardSkeleton />
                  <StatCardSkeleton />
                </>
              ) : (
                <>
                  <EnhancedStatCard 
                    title="Instalação" 
                    value={`R$ ${analytics.installationRevenue?.toLocaleString('pt-BR', {
                      minimumFractionDigits: 2
                    })}`}
                    icon={<Bot size={20} />}
                    variant="default"
                  />
                  
                  <EnhancedStatCard 
                    title="Faturamento Mensal" 
                    value={`R$ ${analytics.monthlyRevenue?.toLocaleString('pt-BR', {
                      minimumFractionDigits: 2
                    })}`}
                    icon={<CircleDollarSign size={20} />} 
                    trend={{
                      value: 8,
                      positive: true
                    }}
                    variant="default"
                  />
                </>
              )}
            </div>
          </DashboardSection>
          
          <DashboardSection 
            title="Total Clientes"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {isLoadingResults ? (
                <>
                  <StatCardSkeleton />
                  <StatCardSkeleton />
                </>
              ) : (
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
        </>
      )}
    </div>
  );
}
