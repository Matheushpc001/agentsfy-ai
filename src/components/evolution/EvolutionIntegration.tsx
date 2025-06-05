
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bot, Settings, Zap, AlertCircle, BarChart3, FileText, Brain } from "lucide-react";
import { useEvolutionAPI } from "@/hooks/useEvolutionAPI";
import EvolutionAPISetup from "./EvolutionAPISetup";
import EvolutionInstanceCard from "./EvolutionInstanceCard";
import AIAgentSetup from "./AIAgentSetup";
import EvolutionAnalytics from "./EvolutionAnalytics";
import EvolutionLogs from "./EvolutionLogs";
import AdvancedAIConfig from "./AdvancedAIConfig";

interface EvolutionIntegrationProps {
  franchiseeId: string;
}

export default function EvolutionIntegration({ franchiseeId }: EvolutionIntegrationProps) {
  const [activeTab, setActiveTab] = useState("setup");
  const [selectedAgent, setSelectedAgent] = useState<any>(null);
  
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

  // Transform EvolutionConfig to EvolutionInstance format
  const transformedConfigs = configs.map(config => ({
    id: config.id,
    instance_name: config.instance_name,
    api_url: config.global_config?.api_url || '',
    status: config.status,
    qr_code: config.qr_code,
    qr_code_expires_at: config.qr_code_expires_at,
    created_at: config.created_at
  }));

  const handleAdvancedConfigOpen = (agent: any) => {
    setSelectedAgent(agent);
    setActiveTab("advanced-config");
  };

  return (
    <div className="space-y-6">
      {/* Header com informações importantes */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Integração Evolution API - Versão Avançada
          </CardTitle>
          <CardDescription>
            Sistema completo de WhatsApp com IA. Configure instâncias, conecte ao WhatsApp, crie agentes inteligentes e monitore performance em tempo real.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Estatísticas principais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Configurações Globais
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{globalConfigs.length}</div>
            <p className="text-xs text-muted-foreground">Servidores disponíveis</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Instâncias Conectadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{connectedConfigs.length}</div>
            <p className="text-xs text-muted-foreground">De {configs.length} total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Agentes IA Ativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{activeAIAgents}</div>
            <p className="text-xs text-muted-foreground">De {totalAIAgents} total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Status Geral
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {connectedConfigs.length > 0 ? (
                <>
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium text-green-600">Operacional</span>
                </>
              ) : (
                <>
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="text-sm font-medium text-red-600">Inativo</span>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
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
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="logs" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Logs
          </TabsTrigger>
          <TabsTrigger value="advanced-config" className="flex items-center gap-2" disabled={!selectedAgent}>
            <Brain className="h-4 w-4" />
            Config. Avançada
          </TabsTrigger>
        </TabsList>

        <TabsContent value="setup" className="space-y-6">
          {globalConfigs.length === 0 ? (
            <Card className="border-orange-200 bg-orange-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-800">
                  <AlertCircle className="h-5 w-5" />
                  Configuração Pendente
                </CardTitle>
                <CardDescription className="text-orange-700">
                  Nenhuma configuração global disponível. Entre em contato com o administrador para configurar os servidores Evolution API.
                </CardDescription>
              </CardHeader>
            </Card>
          ) : (
            <EvolutionAPISetup
              globalConfigs={globalConfigs}
              onTestConnection={testConnection}
              onCreateInstance={createInstance}
              isCreating={isCreating}
            />
          )}
        </TabsContent>

        <TabsContent value="instances" className="space-y-6">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-muted-foreground">Carregando instâncias...</p>
            </div>
          ) : transformedConfigs.length === 0 ? (
            <Card>
              <CardHeader className="text-center">
                <CardTitle>Nenhuma instância configurada</CardTitle>
                <CardDescription>
                  Configure sua primeira instância na aba "Configuração" para começar a usar o WhatsApp com IA
                </CardDescription>
              </CardHeader>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {transformedConfigs.map((instance) => (
                <EvolutionInstanceCard
                  key={instance.id}
                  instance={instance}
                  onConnect={() => connectInstance(instance.id)}
                  onDisconnect={() => disconnectInstance(instance.id)}
                  onDelete={() => deleteInstance(instance.id)}
                  aiAgents={aiAgents.filter(agent => agent.evolution_config_id === instance.id)}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="ai-agents" className="space-y-6">
          {connectedConfigs.length === 0 ? (
            <Card className="border-blue-200 bg-blue-50">
              <CardHeader className="text-center">
                <CardTitle className="text-blue-800">Conecte uma instância primeiro</CardTitle>
                <CardDescription className="text-blue-700">
                  Você precisa ter pelo menos uma instância do WhatsApp conectada para configurar agentes IA.
                  Vá para a aba "Instâncias" e conecte uma instância.
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
                  <Card key={config.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            {config.instance_name}
                            <Badge variant="default" className="text-xs">
                              {configAgents.length} agente(s)
                            </Badge>
                          </CardTitle>
                          <CardDescription>
                            Configure agentes IA para responder automaticamente no WhatsApp
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-sm text-green-600 font-medium">Conectado</span>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent>
                      <AIAgentSetup
                        evolutionConfigId={config.id}
                        onCreateAgent={createAIAgent}
                        onUpdateAgent={updateAIAgent}
                        agents={configAgents}
                      />

                      {configAgents.length > 0 && (
                        <div className="mt-6 space-y-3">
                          <h4 className="font-medium text-sm">Agentes Ativos:</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {configAgents.map((agent) => (
                              <Card key={agent.id} className="border-l-4 border-l-blue-500">
                                <CardContent className="pt-4">
                                  <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                      <span className="font-medium text-sm">{agent.agent_id}</span>
                                      <div className="flex gap-1">
                                        <Badge variant={agent.is_active ? "default" : "secondary"} className="text-xs">
                                          {agent.is_active ? "Ativo" : "Inativo"}
                                        </Badge>
                                      </div>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                      📱 {agent.phone_number}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      🤖 {agent.model} • Delay: {agent.response_delay_seconds}s
                                    </p>
                                    <div className="flex gap-2 pt-2">
                                      <button
                                        onClick={() => handleAdvancedConfigOpen(agent)}
                                        className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                                      >
                                        Config. Avançada
                                      </button>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <EvolutionAnalytics franchiseeId={franchiseeId} />
        </TabsContent>

        <TabsContent value="logs" className="space-y-6">
          <EvolutionLogs franchiseeId={franchiseeId} />
        </TabsContent>

        <TabsContent value="advanced-config" className="space-y-6">
          {selectedAgent ? (
            <AdvancedAIConfig 
              agent={selectedAgent} 
              onUpdate={async (updates) => {
                await updateAIAgent(selectedAgent.id, updates);
                setSelectedAgent({ ...selectedAgent, ...updates });
              }}
            />
          ) : (
            <Card>
              <CardHeader className="text-center">
                <CardTitle>Selecione um Agente IA</CardTitle>
                <CardDescription>
                  Para acessar as configurações avançadas, selecione um agente na aba "Agentes IA"
                </CardDescription>
              </CardHeader>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
