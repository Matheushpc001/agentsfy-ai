
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, MessageSquare, Settings, Smartphone, BarChart3 } from "lucide-react";
import EvolutionManagement from "./EvolutionManagement";
import EvolutionAgents from "./EvolutionAgents";
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

      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="management" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Gerenciamento
          </TabsTrigger>
          <TabsTrigger value="agents" className="flex items-center gap-2">
            <Smartphone className="h-4 w-4" />
            Agentes IA
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

        <TabsContent value="agents">
          <EvolutionAgents franchiseeId={franchiseeId} />
        </TabsContent>

        <TabsContent value="messages">
          <EvolutionMessages franchiseeId={franchiseeId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
