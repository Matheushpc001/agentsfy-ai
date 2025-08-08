// ARQUIVO CORRIGIDO: src/components/evolution/EvolutionAgents.tsx

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bot, Settings, RefreshCw } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useEvolutionAPI } from "@/hooks/useEvolutionAPI";
import AIAgentSetup from "./AIAgentSetup";
import { Badge } from "@/components/ui/badge";

export default function EvolutionAgents() {
  const { user } = useAuth();
  const { aiAgents, configs, isLoading, refreshData } = useEvolutionAPI(user?.id);
  
  const [isSetupModalOpen, setIsSetupModalOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState<any | null>(null);

  // A função de criar foi removida. A criação é feita pelo fluxo principal.
  const handleOpenEditModal = (agent: any) => {
    setEditingAgent(agent);
    setIsSetupModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              <CardTitle>Agentes IA do WhatsApp</CardTitle>
            </div>
            {/* O botão "+ Novo Agente IA" foi REMOVIDO daqui */}
          </div>
          <CardDescription>
            Visualize os agentes de IA que foram criados e associados a uma instância do WhatsApp. A criação é feita na tela "Agentes Tradicionais".
          </CardDescription>
        </CardHeader>
        <CardContent>
          {aiAgents.length === 0 ? (
            <div className="text-center py-8">
              <Bot className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                Nenhum agente IA configurado ainda.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {aiAgents.map((agent) => {
                const associatedConfig = configs.find(c => c.id === agent.evolution_config_id);
                return (
                  <div key={agent.id} className="border rounded-lg p-4 flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">{agent.agent_id}</h3>
                      <p className="text-sm text-muted-foreground">
                        Instância: {associatedConfig?.instance_name || 'Desconhecida'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                       <Badge variant={agent.is_active ? 'default' : 'secondary'}>
                          {agent.is_active ? "Ativo" : "Inativo"}
                        </Badge>
                       <Button variant="outline" size="sm" onClick={() => handleOpenEditModal(agent)}>
                         <Settings className="h-4 w-4 mr-2" />
                         Editar
                       </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Este modal agora é apenas para EDIÇÃO */}
      <AIAgentSetup
          isOpen={isSetupModalOpen}
          onClose={() => setIsSetupModalOpen(false)}
          existingAgent={editingAgent}
          franchiseeId={user?.id || ''}
          onSave={() => {
            setIsSetupModalOpen(false);
            refreshData();
          }}
      />
    </div>
  );
}