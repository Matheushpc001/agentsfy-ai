// ARQUIVO MODIFICADO: src/components/evolution/EvolutionIntegration.tsx

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, MessageSquare, Settings, BarChart3 } from "lucide-react";
import EvolutionManagement from "./EvolutionManagement";
import EvolutionMessages from "./EvolutionMessages";
import EvolutionDashboard from "./EvolutionDashboard";

interface EvolutionIntegrationProps {
  franchiseeId: string;
}

export default function EvolutionIntegration({ franchiseeId }: EvolutionIntegrationProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-6 w-6" />
            Integração EvolutionAPI
          </CardTitle>
          <CardDescription>
            Gerencie a integração completa com EvolutionAPI para automação de WhatsApp com IA
          </CardDescription>
        </CardHeader>
      </Card>

      {/* ### MODIFICAÇÃO APLICADA AQUI: REMOÇÃO DA ABA "AGENTES IA" ### */}
      {/* O gerenciamento de agentes agora é feito na tela principal de agentes. */}
      {/* A configuração da IA é feita na edição da instância. */}
      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="management" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Gerenciamento
          </TabsTrigger>
          <TabsTrigger value="messages" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Mensagens
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <EvolutionDashboard franchiseeId={franchiseeId} />
        </TabsContent>

        <TabsContent value="management">
          <EvolutionManagement franchiseeId={franchiseeId} />
        </TabsContent>

        <TabsContent value="messages">
          <EvolutionMessages franchiseeId={franchiseeId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}