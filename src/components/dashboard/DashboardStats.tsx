import { StatCard } from "@/components/ui/stat-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { RefreshCw, CircleDollarSign, Building2, Users, Bot, UserCheck } from "lucide-react";
import { Analytics, UserRole } from "@/types";
import { cn } from "@/lib/utils";
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
  const SkeletonCard = () => <div className="p-6 rounded-xl border bg-card space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-5 w-5 rounded-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-3 w-16" />
      </div>
      <Skeleton className="h-4 w-12" />
    </div>;
  return <div className="space-y-6">
      {/* Admin Results Section */}
      {userRole === "admin" && <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Resultados</h2>
            <Button onClick={onRefresh} disabled={isLoadingResults} variant="outline" size="sm" className="gap-2">
              <RefreshCw className={cn("h-4 w-4", isLoadingResults && "animate-spin")} />
              Atualizar
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {isLoadingResults ? <>
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </> : <>
                <StatCard title="Faturamento Mensal" value={`R$ ${analytics.monthlyRevenue?.toLocaleString('pt-BR', {
            minimumFractionDigits: 2
          })}`} icon={<CircleDollarSign size={20} />} trend={{
            value: 12,
            positive: true
          }} />
                
                <StatCard title="Franqueados" value={analytics.franchiseeCount?.toString() || "0"} icon={<Building2 size={20} />} />
                
                <StatCard title="Clientes" value={analytics.customerCount?.toString() || "0"} icon={<Users size={20} />} />
              </>}
          </div>
        </section>}

      {/* Franchisee Results Section */}
      {userRole === "franchisee" && <>
          <section>
            <div className="flex items-center justify-between mb-4 mx-0 my-[10px]">
              <h2 className="text-xl font-semibold">Resultado com agentes</h2>
              <Button onClick={onRefresh} disabled={isLoadingResults} variant="outline" size="sm" className="gap-2">
                <RefreshCw className={cn("h-4 w-4", isLoadingResults && "animate-spin")} />
                Atualizar
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {isLoadingResults ? <>
                  <SkeletonCard />
                  <SkeletonCard />
                </> : <>
                  <StatCard title="Instalação" value={`R$ ${analytics.installationRevenue?.toLocaleString('pt-BR', {
              minimumFractionDigits: 2
            })}`} icon={<Bot size={20} />} />
                  
                  <StatCard title="Faturamento Mensal" value={`R$ ${analytics.monthlyRevenue?.toLocaleString('pt-BR', {
              minimumFractionDigits: 2
            })}`} icon={<CircleDollarSign size={20} />} trend={{
              value: 8,
              positive: true
            }} />
                </>}
            </div>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-4">Total Clientes</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {isLoadingResults ? <>
                  <SkeletonCard />
                  <SkeletonCard />
                </> : <>
                  <StatCard title="Nº de Clientes" value={analytics.customerCount?.toString() || "0"} icon={<Users size={20} />} />
                  
                  <StatCard title="Status" value={`${analytics.activeCustomers} ativos`} icon={<UserCheck size={20} />} />
                </>}
            </div>
          </section>
        </>}
    </div>;
}