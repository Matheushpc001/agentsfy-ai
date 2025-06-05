
import DashboardLayout from "@/components/layout/DashboardLayout";
import AgentsContainer from "@/components/agents/AgentsContainer";
import { useAuthCheck } from "@/hooks/useAuthCheck";
import { Navigate } from "react-router-dom";

export default function Agents() {
  const { user, loading } = useAuthCheck();

  console.log('Agents page - Auth state:', { user: user?.id, loading });

  if (loading) {
    return (
      <DashboardLayout title="Agentes">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!user) {
    console.log('No user found, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  console.log('User authenticated, rendering agents page for:', user.id);

  // Use the authenticated user's ID as franchiseeId
  return (
    <DashboardLayout title="Agentes">
      <AgentsContainer 
        initialAgents={[]}
        initialCustomers={[]}
        franchiseeId={user.id}
      />
    </DashboardLayout>
  );
}
