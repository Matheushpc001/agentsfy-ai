
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bot, Settings, Zap } from "lucide-react";
import { useEvolutionAPI } from "@/hooks/useEvolutionAPI";
import EvolutionAPISetup from "./EvolutionAPISetup";
import EvolutionInstanceCard from "./EvolutionInstanceCard";
import AIAgentSetup from "./AIAgentSetup";

interface EvolutionIntegrationProps {
  franchiseeId: string;
}

export default function EvolutionIntegration({ franchiseeId }: EvolutionIntegrationProps) {
  const [activeTab, setActiveTab] = useState("setup");
  
  const {
    configs,
    globalConfigs,
    aiAgents,
    isLoading,
    isCreating,
    testConnection,
    createInstance,
    connectInstance,
    disconnectInstance,
    createAIAgent,
    updateAIAgent,
    sendTestMessage,
    deleteInstance
  } = useEvolutionAPI(franchiseeId);

  const connectedConfigs = configs.filter(config => config.status === 'connected');
  const totalAIAgents = aiAgents.length;
  const activeAIAgents = aiAgents.filter(agent => agent.is_active).length;

  return (
    <div className="space-y-6">
      {/* Header com estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Instâncias Conectadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{connectedConfigs.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Agentes IA Ativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeAIAgents}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Agentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAIAgents}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="setup" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Configuração
          </TabsTrigger>
          <TabsTrigger value="instances" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Instâncias
          </TabsTrigger>
          <TabsTrigger value="ai-agents" className="flex items-center gap-2">
            <Bot className="h-4 w-4" />
            Agentes IA
          </TabsTrigger>
        </TabsList>

        <TabsContent value="setup" className="space-y-6">
          <EvolutionAPISetup
            globalConfigs={globalConfigs}
            onTestConnection={testConnection}
            onCreateInstance={createInstance}
            isCreating={isCreating}
          />
        </TabsContent>

        <TabsContent value="instances" className="space-y-6">
          {isLoading ? (
            <div className="text-center py-8">Carregando instâncias...</div>
          ) : configs.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Nenhuma instância configurada</CardTitle>
                <CardDescription>
                  Configure sua primeira instância na aba "Configuração"
                </CardDescription>
              </CardHeader>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {configs.map((config) => (
                <EvolutionInstanceCard
                  key={config.id}
                  instance={config}
                  onConnect={() => connectInstance(config.id)}
                  onDisconnect={() => disconnectInstance(config.id)}
                  onDelete={() => deleteInstance(config.id)}
                  aiAgents={aiAgents.filter(agent => agent.evolution_config_id === config.id)}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="ai-agents" className="space-y-6">
          {connectedConfigs.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Conecte uma instância primeiro</CardTitle>
                <CardDescription>
                  Você precisa ter pelo menos uma instância conectada para configurar agentes IA
                </CardDescription>
              </CardHeader>
            </Card>
          ) : (
            <div className="space-y-6">
              {connectedConfigs.map((config) => {
                const configAgents = aiAgents.filter(
                  agent => agent.evolution_config_id === config.id
                );

                return (
                  <div key={config.id} className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        {config.instance_name}
                        <Badge variant="secondary">
                          {configAgents.length} agente(s)
                        </Badge>
                      </h3>
                    </div>

                    <AIAgentSetup
                      evolutionConfigId={config.id}
                      onCreateAgent={createAIAgent}
                      onUpdateAgent={updateAIAgent}
                      agents={configAgents}
                    />

                    {configAgents.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-medium">Agentes Configurados:</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {configAgents.map((agent) => (
                            <Card key={agent.id}>
                              <CardContent className="pt-4">
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between">
                                    <span className="font-medium">{agent.agent_id}</span>
                                    <Badge variant={agent.is_active ? "default" : "secondary"}>
                                      {agent.is_active ? "Ativo" : "Inativo"}
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-muted-foreground">
                                    {agent.phone_number}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    Modelo: {agent.model}
                                  </p>
                                  <div className="pt-2">
                                    <AIAgentSetup
                                      evolutionConfigId={config.id}
                                      onCreateAgent={createAIAgent}
                                      onUpdateAgent={updateAIAgent}
                                      existingAgent={agent}
                                      agents={configAgents}
                                    />
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
