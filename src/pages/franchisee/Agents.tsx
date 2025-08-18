
import DashboardLayout from "@/components/layout/DashboardLayout";
import AgentsContainer from "@/components/agents/AgentsContainer";
import { useAuthCheck } from "@/hooks/useAuthCheck";
import { Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Customer } from "@/types";

export default function Agents() {
  const { user, loading } = useAuthCheck();
  const [customers, setCustomers] = useState<Customer[]>([]);

  useEffect(() => {
    async function fetchCustomers() {
      if (!user) return;
      try {
        const { data, error } = await supabase
          .from('customers')
          .select('*')
          .eq('franchisee_id', user.id);
        if (error) throw error;
        const mappedCustomers = data.map(c => ({ ...c, businessName: c.business_name })) as Customer[];
        setCustomers(mappedCustomers || []);
      } catch (error) {
        console.error("Error fetching customers:", error);
      }
    }
    fetchCustomers();
  }, [user]);

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
    return <Navigate to="/login" replace />;
  }

  return (
    <DashboardLayout title="Agentes">
      <AgentsContainer 
        initialAgents={[]}
        initialCustomers={customers} // Passa a lista de clientes carregada
        franchiseeId={user.id}
      />
    </DashboardLayout>
  );
}
