
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Activity, 
  MessageSquare, 
  Bot, 
  Clock, 
  TrendingUp,
  Zap,
  AlertTriangle,
  CheckCircle,
  RefreshCw
} from "lucide-react";
import { useEvolutionAPI } from "@/hooks/useEvolutionAPI";
import { toast } from "sonner";
import EvolutionAnalytics from "./EvolutionAnalytics";
import EvolutionRealtimeStats from "./EvolutionRealtimeStats";
import EvolutionPerformanceCharts from "./EvolutionPerformanceCharts";

interface EvolutionDashboardProps {
  franchiseeId: string;
}

export default function EvolutionDashboard({ franchiseeId }: EvolutionDashboardProps) {
  const { configs, aiAgents, isLoading, refreshData } = useEvolutionAPI(franchiseeId);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshData();
      toast.success("Dashboard atualizado com sucesso");
    } catch (error) {
      console.error('Erro ao atualizar dashboard:', error);
      toast.error("Erro ao atualizar dashboard");
    } finally {
      setIsRefreshing(false);
    }
  };

  const activeConfigs = configs.filter(c => c.status === 'connected');
  const activeAgents = aiAgents.filter(a => a.is_active);
  const totalMessages = 0; // Implementar depois com dados reais

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Dashboard de Monitoramento</h2>
          <p className="text-muted-foreground">
            Monitoramento em tempo real da integração EvolutionAPI
          </p>
        </div>
        <Button onClick={handleRefresh} disabled={isRefreshing} variant="outline">
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Instâncias Ativas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {activeConfigs.length}
            </div>
            <p className="text-sm text-muted-foreground">
              de {configs.length} total
            </p>
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
            <div className="text-2xl font-bold text-blue-600">
              {activeAgents.length}
            </div>
            <p className="text-sm text-muted-foreground">
              agentes ativos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Mensagens Hoje
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalMessages.toLocaleString()}
            </div>
            <p className="text-sm text-muted-foreground">
              últimas 24h
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Status Geral
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {activeConfigs.length > 0 ? (
                <>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-sm font-medium text-green-600">Operacional</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  <span className="text-sm font-medium text-yellow-600">Desconectado</span>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs do Dashboard */}
      <Tabs defaultValue="realtime" className="space-y-4">
        <TabsList>
          <TabsTrigger value="realtime">Tempo Real</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="realtime" className="space-y-4">
          <EvolutionRealtimeStats franchiseeId={franchiseeId} />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <EvolutionAnalytics franchiseeId={franchiseeId} />
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <EvolutionPerformanceCharts franchiseeId={franchiseeId} />
        </TabsContent>
      </Tabs>

      {/* Status das Instâncias */}
      <Card>
        <CardHeader>
          <CardTitle>Status das Instâncias</CardTitle>
          <CardDescription>
            Monitoramento em tempo real das instâncias EvolutionAPI
          </CardDescription>
        </CardHeader>
        <CardContent>
          {configs.length === 0 ? (
            <div className="text-center py-8">
              <Bot className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                Nenhuma instância configurada
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {configs.map((config) => (
                <div key={config.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      config.status === 'connected' ? 'bg-green-500' : 'bg-red-500'
                    }`} />
                    <div>
                      <h4 className="font-medium">{config.instance_name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {config.status === 'connected' ? 'Conectado' : 'Desconectado'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={config.status === 'connected' ? 'default' : 'destructive'}>
                      {config.status === 'connected' ? 'Online' : 'Offline'}
                    </Badge>
                    <div className="text-sm text-muted-foreground">
                      {aiAgents.filter(a => a.evolution_config_id === config.id && a.is_active).length} agentes
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
