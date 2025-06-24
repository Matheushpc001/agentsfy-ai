
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bot, Settings, ToggleLeft, ToggleRight, AlertCircle, CheckCircle } from "lucide-react";
import { useEvolutionAPI } from "@/hooks/useEvolutionAPI";
import { toast } from "sonner";

interface EvolutionAgentsProps {
  franchiseeId: string;
}

export default function EvolutionAgents({ franchiseeId }: EvolutionAgentsProps) {
  const { aiAgents, configs, isLoading, updateAIAgent } = useEvolutionAPI(franchiseeId);
  const [updatingAgents, setUpdatingAgents] = useState<Set<string>>(new Set());

  const handleToggleAgent = async (agentId: string, currentStatus: boolean) => {
    setUpdatingAgents(prev => new Set(prev.add(agentId)));
    
    try {
      await updateAIAgent(agentId, { is_active: !currentStatus });
      toast.success(`Agente ${!currentStatus ? 'ativado' : 'desativado'} com sucesso`);
    } catch (error) {
      console.error('Error updating agent:', error);
      toast.error('Erro ao atualizar agente');
    } finally {
      setUpdatingAgents(prev => {
        const newSet = new Set(prev);
        newSet.delete(agentId);
        return newSet;
      });
    }
  };

  const getConfigStatus = (configId: string) => {
    const config = configs.find(c => c.id === configId);
    return config?.status || 'unknown';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Agentes IA WhatsApp
          </CardTitle>
          <CardDescription>
            Gerencie os agentes de IA conectados às instâncias do WhatsApp
          </CardDescription>
        </CardHeader>
        <CardContent>
          {aiAgents.length === 0 ? (
            <div className="text-center py-8">
              <Bot className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                Nenhum agente IA configurado ainda
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Agentes IA são criados automaticamente quando você cria agentes tradicionais
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {aiAgents.map((agent) => {
                const configStatus = getConfigStatus(agent.evolution_config_id);
                const isUpdating = updatingAgents.has(agent.id);
                
                return (
                  <div key={agent.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${
                          agent.is_active ? 'bg-green-500' : 'bg-gray-400'
                        }`} />
                        <div>
                          <h3 className="font-medium">Agente IA</h3>
                          <p className="text-sm text-muted-foreground">
                            Telefone: {agent.phone_number || 'Não configurado'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={agent.is_active ? 'default' : 'secondary'}>
                          {agent.is_active ? 'Ativo' : 'Inativo'}
                        </Badge>
                        <Badge variant={configStatus === 'connected' ? 'default' : 'destructive'}>
                          {configStatus === 'connected' ? (
                            <>
                              <CheckCircle className="h-3 w-3 mr-1" />
                              WhatsApp Conectado
                            </>
                          ) : (
                            <>
                              <AlertCircle className="h-3 w-3 mr-1" />
                              WhatsApp Desconectado
                            </>
                          )}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm font-medium">Modelo IA:</p>
                        <p className="text-sm text-muted-foreground">{agent.model}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Resposta Automática:</p>
                        <p className="text-sm text-muted-foreground">
                          {agent.auto_response ? 'Ativada' : 'Desativada'}
                          {agent.auto_response && agent.response_delay_seconds && 
                            ` (${agent.response_delay_seconds}s delay)`
                          }
                        </p>
                      </div>
                    </div>
                    
                    {agent.system_prompt && (
                      <div className="mb-4">
                        <p className="text-sm font-medium mb-1">Prompt do Sistema:</p>
                        <p className="text-sm text-muted-foreground bg-muted p-2 rounded text-xs max-h-20 overflow-y-auto">
                          {agent.system_prompt}
                        </p>
                      </div>
                    )}
                    
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleToggleAgent(agent.id, agent.is_active)}
                        disabled={isUpdating}
                        className="flex items-center gap-2"
                      >
                        {agent.is_active ? (
                          <>
                            <ToggleLeft className="h-4 w-4" />
                            Desativar
                          </>
                        ) : (
                          <>
                            <ToggleRight className="h-4 w-4" />
                            Ativar
                          </>
                        )}
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        disabled
                      >
                        <Settings className="h-4 w-4 mr-1" />
                        Configurar
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
