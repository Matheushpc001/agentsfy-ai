
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Bot, MessageSquare, Settings, Zap } from 'lucide-react';
import { useEvolutionAPI } from '@/hooks/useEvolutionAPI';
import EvolutionAPISetup from './EvolutionAPISetup';
import EvolutionInstanceCard from './EvolutionInstanceCard';

interface EvolutionIntegrationProps {
  franchiseeId: string;
}

export default function EvolutionIntegration({ franchiseeId }: EvolutionIntegrationProps) {
  const { 
    configs, 
    aiAgents, 
    isLoading, 
    connectInstance, 
    disconnectInstance,
    loadConfigs 
  } = useEvolutionAPI(franchiseeId);

  const [activeTab, setActiveTab] = useState('overview');

  const connectedInstances = configs.filter(config => config.status === 'connected').length;
  const totalAIAgents = aiAgents.length;
  const activeAIAgents = aiAgents.filter(agent => agent.is_active).length;

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-muted-foreground">Carregando integração...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Integração EvolutionAPI + IA
          </CardTitle>
          <CardDescription>
            Configure agentes de IA para responder automaticamente mensagens do WhatsApp
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="instances">Instâncias</TabsTrigger>
          <TabsTrigger value="agents">Agentes IA</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Instâncias
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{connectedInstances}/{configs.length}</div>
                <p className="text-xs text-muted-foreground">Conectadas</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Bot className="h-4 w-4" />
                  Agentes IA
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{activeAIAgents}/{totalAIAgents}</div>
                <p className="text-xs text-muted-foreground">Ativos</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {connectedInstances > 0 && activeAIAgents > 0 ? 'Ativo' : 'Inativo'}
                </div>
                <p className="text-xs text-muted-foreground">Sistema</p>
              </CardContent>
            </Card>
          </div>

          <Alert>
            <Bot className="h-4 w-4" />
            <AlertDescription>
              <strong>Como funciona:</strong> Configure instâncias da EvolutionAPI e associe agentes de IA a elas. 
              Quando uma mensagem for recebida no WhatsApp, o agente IA processará automaticamente e responderá.
            </AlertDescription>
          </Alert>
        </TabsContent>

        <TabsContent value="instances" className="space-y-4">
          {configs.length === 0 ? (
            <EvolutionAPISetup 
              franchiseeId={franchiseeId}
              onConfigCreated={loadConfigs}
            />
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {configs.map((config) => (
                  <EvolutionInstanceCard
                    key={config.id}
                    instance={config}
                    onConnect={connectInstance}
                    onDisconnect={disconnectInstance}
                    aiAgents={aiAgents}
                  />
                ))}
              </div>
              
              <EvolutionAPISetup 
                franchiseeId={franchiseeId}
                onConfigCreated={loadConfigs}
              />
            </div>
          )}
        </TabsContent>

        <TabsContent value="agents" className="space-y-4">
          {totalAIAgents === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Bot className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Nenhum agente IA configurado</h3>
                <p className="text-muted-foreground mb-4">
                  Configure primeiro uma instância da EvolutionAPI na aba "Instâncias"
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {aiAgents.map((agent) => {
                const instance = configs.find(c => c.id === agent.evolution_config_id);
                return (
                  <Card key={agent.id}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center justify-between">
                        Agente {agent.agent_id}
                        <Badge variant={agent.is_active ? 'default' : 'secondary'}>
                          {agent.is_active ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </CardTitle>
                      <CardDescription>
                        Instância: {instance?.instance_name || 'N/A'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Telefone:</span>
                          <span>{agent.phone_number}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Modelo:</span>
                          <span>{agent.model}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Status:</span>
                          <span className={agent.is_active ? 'text-green-600' : 'text-gray-500'}>
                            {agent.is_active ? 'Respondendo' : 'Pausado'}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
