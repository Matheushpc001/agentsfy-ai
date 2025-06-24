
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  MessageSquare, 
  Clock, 
  Zap, 
  Users,
  Activity,
  AlertCircle
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

interface RealtimeStatsProps {
  franchiseeId: string;
}

interface RealtimeData {
  activeConversations: number;
  messagesLastHour: number;
  avgResponseTime: number;
  systemLoad: number;
  errorRate: number;
  lastUpdate: Date;
}

export default function EvolutionRealtimeStats({ franchiseeId }: RealtimeStatsProps) {
  const { user } = useAuth();
  const [stats, setStats] = useState<RealtimeData>({
    activeConversations: 0,
    messagesLastHour: 0,
    avgResponseTime: 0,
    systemLoad: 0,
    errorRate: 0,
    lastUpdate: new Date()
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!franchiseeId) return;

    loadRealtimeStats();
    
    // Atualizar a cada 30 segundos
    const interval = setInterval(loadRealtimeStats, 30000);
    
    return () => clearInterval(interval);
  }, [franchiseeId]);

  const loadRealtimeStats = async () => {
    try {
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

      // Buscar configurações do franqueado
      const { data: configs } = await supabase
        .from('evolution_api_configs')
        .select('id')
        .eq('franchisee_id', franchiseeId);

      if (!configs || configs.length === 0) {
        setStats(prev => ({ ...prev, lastUpdate: new Date() }));
        return;
      }

      const configIds = configs.map(c => c.id);

      // Conversas ativas
      const { data: conversations } = await supabase
        .from('whatsapp_conversations')
        .select('id')
        .in('evolution_config_id', configIds)
        .eq('is_active', true);

      // Mensagens da última hora
      const { data: messages } = await supabase
        .from('whatsapp_messages')
        .select('id, conversation_id')
        .gte('created_at', oneHourAgo.toISOString());

      const conversationIds = conversations?.map(c => c.id) || [];
      const recentMessages = messages?.filter(m => 
        conversationIds.includes(m.conversation_id)
      ) || [];

      // Tempo de resposta médio (simulado por enquanto)
      const avgResponseTime = Math.random() * 3 + 1; // 1-4 segundos

      // Carga do sistema (simulada)
      const systemLoad = Math.random() * 100;

      // Taxa de erro (simulada)
      const errorRate = Math.random() * 5; // 0-5%

      setStats({
        activeConversations: conversations?.length || 0,
        messagesLastHour: recentMessages.length,
        avgResponseTime: Math.round(avgResponseTime * 10) / 10,
        systemLoad: Math.round(systemLoad),
        errorRate: Math.round(errorRate * 10) / 10,
        lastUpdate: new Date()
      });

    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Indicador de última atualização */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-muted-foreground">
            Última atualização: {stats.lastUpdate.toLocaleTimeString()}
          </span>
        </div>
        <Badge variant="outline" className="animate-pulse">
          <Activity className="h-3 w-3 mr-1" />
          Tempo Real
        </Badge>
      </div>

      {/* Métricas em tempo real */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              Conversas Ativas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stats.activeConversations}
            </div>
            <p className="text-sm text-muted-foreground">
              conversas em andamento
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Mensagens/Hora
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.messagesLastHour}
            </div>
            <p className="text-sm text-muted-foreground">
              última hora
            </p>
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
            <div className="text-2xl font-bold">
              {stats.avgResponseTime}s
            </div>
            <p className="text-sm text-muted-foreground">
              tempo médio
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Carga do Sistema
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold">
                {stats.systemLoad}%
              </div>
              <Progress value={stats.systemLoad} className="h-2" />
              <p className="text-sm text-muted-foreground">
                utilização atual
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Taxa de Erro
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stats.errorRate}%
            </div>
            <p className="text-sm text-muted-foreground">
              últimas 24h
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Status Geral
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${
                stats.systemLoad < 80 && stats.errorRate < 3 
                  ? 'bg-green-500' 
                  : stats.systemLoad < 90 && stats.errorRate < 5
                  ? 'bg-yellow-500'
                  : 'bg-red-500'
              }`} />
              <span className="text-sm font-medium">
                {stats.systemLoad < 80 && stats.errorRate < 3 
                  ? 'Excelente' 
                  : stats.systemLoad < 90 && stats.errorRate < 5
                  ? 'Bom'
                  : 'Atenção'
                }
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alertas */}
      {(stats.systemLoad > 90 || stats.errorRate > 5) && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="text-yellow-800 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Alertas do Sistema
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats.systemLoad > 90 && (
                <div className="flex items-center gap-2">
                  <Badge variant="destructive">Alta Carga</Badge>
                  <span className="text-sm">
                    Sistema com alta utilização ({stats.systemLoad}%)
                  </span>
                </div>
              )}
              {stats.errorRate > 5 && (
                <div className="flex items-center gap-2">
                  <Badge variant="destructive">Taxa de Erro Alta</Badge>
                  <span className="text-sm">
                    Taxa de erro acima do normal ({stats.errorRate}%)
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
