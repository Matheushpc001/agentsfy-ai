
import { useAuth } from "@/context/AuthContext";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { DashboardMainStats } from "@/components/dashboard/DashboardMainStats";
import { DashboardCharts } from "@/components/dashboard/DashboardCharts";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useEffect } from "react";

export default function Dashboard() {
  const { user } = useAuth();
  const {
    analytics,
    topAgents,
    topFranchisees,
    weeklyMessages,
    isLoadingResults,
    isInitialLoading,
    handleRefreshResults
  } = useDashboardData();

  // Força re-renderização quando necessário para preservar layout
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Re-força o layout quando a página volta a ficar visível
        setTimeout(() => {
          window.dispatchEvent(new Event('resize'));
        }, 100);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Show loading only during initial load
  if (!user || isInitialLoading) {
    return (
      <DashboardLayout title="Dashboard">
        <div className="flex items-center justify-center h-64 bg-background">
          <div className="animate-pulse text-primary">Carregando...</div>
        </div>
      </DashboardLayout>
    );
  }

  // Ensure analytics is available before rendering
  if (!analytics) {
    return (
      <DashboardLayout title="Dashboard">
        <div className="flex items-center justify-center h-64 bg-background">
          <div className="animate-pulse text-primary">Carregando dados...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Dashboard">
      <div className="space-y-6 min-h-full bg-background" translate="no">
        <DashboardStats 
          userRole={user.role}
          analytics={analytics}
          isLoadingResults={isLoadingResults}
          onRefresh={handleRefreshResults}
        />
        
        <DashboardMainStats 
          analytics={analytics}
          isLoadingResults={isLoadingResults}
        />
        
        <DashboardCharts 
          userRole={user.role}
          topAgents={topAgents}
          topFranchisees={topFranchisees}
          weeklyMessages={weeklyMessages}
          isLoadingResults={isLoadingResults}
        />
      </div>
    </DashboardLayout>
  );
}
