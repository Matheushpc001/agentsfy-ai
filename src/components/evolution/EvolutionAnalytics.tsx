
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart3, 
  MessageSquare, 
  Clock, 
  Zap, 
  TrendingUp,
  Activity,
  Bot,
  RefreshCw,
  AlertTriangle
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AnalyticsData {
  totalMessages: number;
  aiResponses: number;
  responseTime: number;
  activeAgents: number;
  conversationsToday: number;
  errorRate: number;
  topModels: Array<{ model: string; count: number; avgTime: number }>;
  hourlyStats: Array<{ hour: number; messages: number; responses: number }>;
}

interface EvolutionAnalyticsProps {
  franchiseeId: string;
}

export default function EvolutionAnalytics({ franchiseeId }: EvolutionAnalyticsProps) {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('24h');

  useEffect(() => {
    loadAnalytics();
    const interval = setInterval(loadAnalytics, 30000); // Atualiza a cada 30 segundos
    return () => clearInterval(interval);
  }, [franchiseeId, selectedPeriod]);

  const loadAnalytics = async () => {
    try {
      setIsLoading(true);
      
      // Buscar configurações ativas
      const { data: configs, error: configError } = await supabase
        .from('evolution_api_configs')
        .select('id')
        .eq('franchisee_id', franchiseeId);

      if (configError) throw configError;
      
      if (!configs || configs.length === 0) {
        setAnalytics({
          totalMessages: 0,
          aiResponses: 0,
          responseTime: 0,
          activeAgents: 0,
          conversationsToday: 0,
          errorRate: 0,
          topModels: [],
          hourlyStats: []
        });
        return;
      }

      const configIds = configs.map(c => c.id);

      // Calcular período
      const now = new Date();
      let startDate = new Date();
      
      switch (selectedPeriod) {
        case '1h':
          startDate.setHours(now.getHours() - 1);
          break;
        case '24h':
          startDate.setDate(now.getDate() - 1);
          break;
        case '7d':
          startDate.setDate(now.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(now.getDate() - 30);
          break;
      }

      // Buscar conversas
      const { data: conversations } = await supabase
        .from('whatsapp_conversations')
        .select('id, created_at')
        .in('evolution_config_id', configIds)
        .gte('created_at', startDate.toISOString());

      const conversationIds = conversations?.map(c => c.id) || [];

      // Buscar mensagens
      const { data: messages } = await supabase
        .from('whatsapp_messages')
        .select('id, sender_type, ai_response_generated, created_at')
        .in('conversation_id', conversationIds)
        .gte('created_at', startDate.toISOString());

      // Buscar logs de IA
      const { data: aiLogs } = await supabase
        .from('ai_interaction_logs')
        .select('model_used, response_time_ms, tokens_used, created_at')
        .in('conversation_id', conversationIds)
        .gte('created_at', startDate.toISOString());

      // Buscar agentes ativos
      const { data: activeAgents } = await supabase
        .from('ai_whatsapp_agents')
        .select('id, model')
        .in('evolution_config_id', configIds)
        .eq('is_active', true);

      // Calcular métricas
      const totalMessages = messages?.length || 0;
      const aiResponses = messages?.filter(m => m.ai_response_generated)?.length || 0;
      const avgResponseTime = aiLogs?.length 
        ? aiLogs.reduce((sum, log) => sum + (log.response_time_ms || 0), 0) / aiLogs.length
        : 0;

      // Estatísticas por modelo
      const modelStats = aiLogs?.reduce((acc, log) => {
        const model = log.model_used || 'unknown';
        if (!acc[model]) {
          acc[model] = { count: 0, totalTime: 0 };
        }
        acc[model].count++;
        acc[model].totalTime += log.response_time_ms || 0;
        return acc;
      }, {} as Record<string, { count: number; totalTime: number }>) || {};

      const topModels = Object.entries(modelStats)
        .map(([model, stats]) => ({
          model,
          count: stats.count,
          avgTime: stats.count > 0 ? stats.totalTime / stats.count : 0
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Estatísticas por hora (últimas 24h)
      const hourlyStats = Array.from({ length: 24 }, (_, i) => {
        const hour = new Date(now.getTime() - (23 - i) * 60 * 60 * 1000).getHours();
        const hourMessages = messages?.filter(m => 
          new Date(m.created_at).getHours() === hour &&
          new Date(m.created_at) >= new Date(now.getTime() - 24 * 60 * 60 * 1000)
        ) || [];
        
        return {
          hour,
          messages: hourMessages.length,
          responses: hourMessages.filter(m => m.ai_response_generated).length
        };
      });

      setAnalytics({
        totalMessages,
        aiResponses,
        responseTime: Math.round(avgResponseTime),
        activeAgents: activeAgents?.length || 0,
        conversationsToday: conversations?.filter(c => 
          new Date(c.created_at) >= new Date(now.setHours(0, 0, 0, 0))
        )?.length || 0,
        errorRate: 0, // Implementar depois
        topModels,
        hourlyStats
      });

    } catch (error) {
      console.error('Erro ao carregar analytics:', error);
      toast.error('Erro ao carregar estatísticas');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <RefreshCw className="h-6 w-6 animate-spin mr-2" />
            Carregando estatísticas...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analytics) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
          <p>Nenhuma estatística disponível</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Analytics Evolution API</h2>
        <div className="flex gap-2">
          {['1h', '24h', '7d', '30d'].map((period) => (
            <Button
              key={period}
              variant={selectedPeriod === period ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedPeriod(period)}
            >
              {period}
            </Button>
          ))}
          <Button variant="outline" size="sm" onClick={loadAnalytics}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Métricas principais */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Mensagens Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalMessages}</div>
            <Badge variant="secondary" className="text-xs mt-1">
              {analytics.aiResponses} respostas IA
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Tempo Resposta
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.responseTime}ms</div>
            <p className="text-xs text-muted-foreground mt-1">Tempo médio</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Bot className="h-4 w-4" />
              Agentes Ativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{analytics.activeAgents}</div>
            <p className="text-xs text-muted-foreground mt-1">Em funcionamento</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Conversas Hoje
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.conversationsToday}</div>
            <p className="text-xs text-muted-foreground mt-1">Novas conversas</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="models" className="space-y-4">
        <TabsList>
          <TabsTrigger value="models">Modelos IA</TabsTrigger>
          <TabsTrigger value="hourly">Atividade por Hora</TabsTrigger>
        </TabsList>

        <TabsContent value="models" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Modelos IA</CardTitle>
              <CardDescription>
                Modelos mais utilizados e sua performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              {analytics.topModels.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">
                  Nenhum modelo utilizado ainda
                </p>
              ) : (
                <div className="space-y-3">
                  {analytics.topModels.map((model, index) => (
                    <div key={model.model} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">#{index + 1}</Badge>
                        <div>
                          <div className="font-medium">{model.model}</div>
                          <div className="text-sm text-muted-foreground">
                            {model.count} interações
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{Math.round(model.avgTime)}ms</div>
                        <div className="text-sm text-muted-foreground">tempo médio</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hourly" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Atividade por Hora (24h)</CardTitle>
              <CardDescription>
                Volume de mensagens e respostas nas últimas 24 horas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {analytics.hourlyStats.map((stat) => (
                  <div key={stat.hour} className="flex items-center gap-4 p-2 border rounded">
                    <div className="w-12 text-sm font-mono">
                      {stat.hour.toString().padStart(2, '0')}:00
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full" 
                            style={{ width: `${Math.max(5, (stat.messages / Math.max(...analytics.hourlyStats.map(s => s.messages)) * 100))}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium w-8">{stat.messages}</span>
                      </div>
                      {stat.responses > 0 && (
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex-1 bg-gray-200 rounded-full h-1">
                            <div 
                              className="bg-green-500 h-1 rounded-full" 
                              style={{ width: `${Math.max(5, (stat.responses / Math.max(...analytics.hourlyStats.map(s => s.responses)) * 100))}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground w-8">{stat.responses}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
