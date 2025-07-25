// src/pages/admin/EvolutionConfig.tsx

// --- INÍCIO DAS MODIFICAÇÕES ---
import { useAuth } from "@/context/AuthContext";
import DashboardLayout from "@/components/layout/DashboardLayout"; // ADICIONADO: Para consistência de UI
import { Button } from "@/components/ui/button"; // ADICIONADO: Para o botão de voltar
import { ArrowLeft } from "lucide-react"; // ADICIONADO: Ícone para o botão
import { useNavigate } from "react-router-dom"; // ADICIONADO: Hook para navegação
import GlobalEvolutionConfig from "@/components/evolution/GlobalEvolutionConfig";
import EvolutionAnalytics from "@/components/evolution/EvolutionAnalytics";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// --- FIM DAS MODIFICAÇÕES ---

export default function EvolutionConfig() {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user || user.role !== 'admin') {
    return <div>Acesso negado</div>;
  }


  const handleGoBack = () => {
    navigate('/admin/analytics');
  };

  return (
   
    <DashboardLayout title="Configuração Evolution API">
      <div className="space-y-6">
        
        <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Configuração da Evolution API</h1>
            <p className="text-muted-foreground mt-1">
              Configure as instâncias globais da Evolution API para os franqueados.
            </p>
          </div>
          <Button onClick={handleGoBack} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para Analytics
          </Button>
        </div>

        <Tabs defaultValue="global-config" className="space-y-6">
          <TabsList>
            <TabsTrigger value="global-config">Configuração Global</TabsTrigger>
            <TabsTrigger value="analytics">Analytics Global</TabsTrigger>
          </TabsList>

          <TabsContent value="global-config">
            <GlobalEvolutionConfig />
          </TabsContent>

          <TabsContent value="analytics">
            <EvolutionAnalytics />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}