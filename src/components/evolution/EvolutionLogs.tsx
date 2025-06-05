
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Search, 
  Filter, 
  RefreshCw, 
  Download, 
  AlertCircle, 
  CheckCircle, 
  Clock,
  MessageSquare,
  Bot,
  User,
  Zap
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface LogEntry {
  id: string;
  type: 'message' | 'ai_interaction' | 'connection' | 'error';
  timestamp: string;
  level: 'info' | 'warning' | 'error' | 'success';
  message: string;
  details?: any;
  agent_id?: string;
  conversation_id?: string;
  model_used?: string;
  tokens_used?: number;
  response_time_ms?: number;
}

interface EvolutionLogsProps {
  franchiseeId: string;
}

export default function EvolutionLogs({ franchiseeId }: EvolutionLogsProps) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    loadLogs();
    
    if (autoRefresh) {
      const interval = setInterval(loadLogs, 10000); // Atualiza a cada 10 segundos
      return () => clearInterval(interval);
    }
  }, [franchiseeId, autoRefresh]);

  const loadLogs = async () => {
    try {
      setIsLoading(true);
      
      // Buscar configurações do franqueado
      const { data: configs, error: configError } = await supabase
        .from('evolution_api_configs')
        .select('id, instance_name, status')
        .eq('franchisee_id', franchiseeId);

      if (configError) throw configError;
      
      if (!configs || configs.length === 0) {
        setLogs([]);
        return;
      }

      const configIds = configs.map(c => c.id);
      const logsData: LogEntry[] = [];

      // Buscar logs de interações IA
      const { data: aiLogs } = await supabase
        .from('ai_interaction_logs')
        .select(`
          id, 
          created_at, 
          agent_id, 
          conversation_id, 
          user_message, 
          ai_response, 
          model_used, 
          tokens_used, 
          response_time_ms
        `)
        .in('conversation_id', configIds)
        .order('created_at', { ascending: false })
        .limit(100);

      if (aiLogs) {
        aiLogs.forEach(log => {
          logsData.push({
            id: log.id,
            type: 'ai_interaction',
            timestamp: log.created_at,
            level: log.response_time_ms && log.response_time_ms > 5000 ? 'warning' : 'info',
            message: `IA respondeu em ${log.response_time_ms}ms`,
            details: {
              user_message: log.user_message,
              ai_response: log.ai_response,
              tokens: log.tokens_used
            },
            agent_id: log.agent_id,
            conversation_id: log.conversation_id,
            model_used: log.model_used,
            tokens_used: log.tokens_used,
            response_time_ms: log.response_time_ms
          });
        });
      }

      // Buscar mensagens recentes
      const { data: conversations } = await supabase
        .from('whatsapp_conversations')
        .select('id')
        .in('evolution_config_id', configIds);

      if (conversations) {
        const conversationIds = conversations.map(c => c.id);
        
        const { data: messages } = await supabase
          .from('whatsapp_messages')
          .select('id, created_at, content, sender_type, conversation_id, ai_response_generated')
          .in('conversation_id', conversationIds)
          .order('created_at', { ascending: false })
          .limit(50);

        if (messages) {
          messages.forEach(msg => {
            logsData.push({
              id: msg.id,
              type: 'message',
              timestamp: msg.created_at,
              level: 'info',
              message: msg.sender_type === 'user' 
                ? 'Mensagem recebida do usuário' 
                : 'Resposta enviada',
              details: {
                content: msg.content,
                ai_generated: msg.ai_response_generated
              },
              conversation_id: msg.conversation_id
            });
          });
        }
      }

      // Logs de conexão (simulados baseados no status)
      configs.forEach(config => {
        logsData.push({
          id: `conn_${config.id}`,
          type: 'connection',
          timestamp: new Date().toISOString(),
          level: config.status === 'connected' ? 'success' : 
                 config.status === 'error' ? 'error' : 'warning',
          message: `Instância ${config.instance_name}: ${config.status}`,
          details: { instance: config.instance_name, status: config.status }
        });
      });

      // Ordenar por timestamp (mais recente primeiro)
      logsData.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      
      setLogs(logsData.slice(0, 200)); // Limitar a 200 logs mais recentes

    } catch (error) {
      console.error('Erro ao carregar logs:', error);
      toast.error('Erro ao carregar logs');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = searchTerm === '' || 
      log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details?.content?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesLevel = levelFilter === 'all' || log.level === levelFilter;
    const matchesType = typeFilter === 'all' || log.type === typeFilter;
    
    return matchesSearch && matchesLevel && matchesType;
  });

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning': return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'error': return <AlertCircle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-blue-500" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'ai_interaction': return <Bot className="h-4 w-4" />;
      case 'message': return <MessageSquare className="h-4 w-4" />;
      case 'connection': return <Zap className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const exportLogs = () => {
    const csvContent = [
      ['Timestamp', 'Type', 'Level', 'Message', 'Details'].join(','),
      ...filteredLogs.map(log => [
        log.timestamp,
        log.type,
        log.level,
        `"${log.message}"`,
        `"${JSON.stringify(log.details || {})}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `evolution-logs-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Logs exportados com sucesso!');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Logs do Sistema</h2>
          <p className="text-muted-foreground">
            Monitoramento em tempo real das atividades da Evolution API
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={autoRefresh ? "default" : "outline"}
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <RefreshCw className={`h-4 w-4 ${autoRefresh ? 'animate-spin' : ''}`} />
            Auto-refresh
          </Button>
          <Button variant="outline" size="sm" onClick={exportLogs}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Buscar</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar nos logs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Nível</label>
              <Select value={levelFilter} onValueChange={setLevelFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os níveis" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os níveis</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="success">Sucesso</SelectItem>
                  <SelectItem value="warning">Aviso</SelectItem>
                  <SelectItem value="error">Erro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo</label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  <SelectItem value="message">Mensagens</SelectItem>
                  <SelectItem value="ai_interaction">IA</SelectItem>
                  <SelectItem value="connection">Conexão</SelectItem>
                  <SelectItem value="error">Erros</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de logs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Logs Recentes</span>
            <Badge variant="outline">{filteredLogs.length} entradas</Badge>
          </CardTitle>
          <CardDescription>
            {isLoading ? 'Carregando logs...' : 'Logs em tempo real das atividades'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px] w-full">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="h-6 w-6 animate-spin mr-2" />
                Carregando logs...
              </div>
            ) : filteredLogs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum log encontrado com os filtros aplicados
              </div>
            ) : (
              <div className="space-y-2">
                {filteredLogs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {getLevelIcon(log.level)}
                      {getTypeIcon(log.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{log.message}</span>
                        <Badge variant="outline" className="text-xs">
                          {log.type}
                        </Badge>
                        {log.model_used && (
                          <Badge variant="secondary" className="text-xs">
                            {log.model_used}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="text-xs text-muted-foreground">
                        {new Date(log.timestamp).toLocaleString()}
                        {log.response_time_ms && (
                          <span className="ml-2">• {log.response_time_ms}ms</span>
                        )}
                        {log.tokens_used && (
                          <span className="ml-2">• {log.tokens_used} tokens</span>
                        )}
                      </div>
                      
                      {log.details && (
                        <div className="mt-2 p-2 bg-muted rounded text-xs">
                          {log.details.content && (
                            <div className="truncate">{log.details.content}</div>
                          )}
                          {log.details.user_message && (
                            <div className="mt-1">
                              <span className="font-medium">User: </span>
                              <span className="truncate">{log.details.user_message}</span>
                            </div>
                          )}
                          {log.details.ai_response && (
                            <div className="mt-1">
                              <span className="font-medium">IA: </span>
                              <span className="truncate">{log.details.ai_response}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
