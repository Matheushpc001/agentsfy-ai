
import { useAuth } from "@/context/AuthContext";
import GlobalEvolutionConfig from "@/components/evolution/GlobalEvolutionConfig";
import EvolutionAnalytics from "@/components/evolution/EvolutionAnalytics";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function EvolutionConfig() {
  const { user } = useAuth();

  if (!user || user.role !== 'admin') {
    return <div>Acesso negado</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Configuração Evolution API</h1>
        <p className="text-muted-foreground">
          Configure as instâncias globais da Evolution API para os franqueados
        </p>
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
  );
}
