
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Send, RefreshCw, Search, Filter } from "lucide-react";
import { useEvolutionAPI } from "@/hooks/useEvolutionAPI";
import { toast } from "sonner";

interface EvolutionMessagesProps {
  franchiseeId: string;
}

interface Message {
  id: string;
  from: string;
  to: string;
  content: string;
  timestamp: string;
  type: 'sent' | 'received';
  configId: string;
}

export default function EvolutionMessages({ franchiseeId }: EvolutionMessagesProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [filteredMessages, setFilteredMessages] = useState<Message[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedConfig, setSelectedConfig] = useState<string>("all");
  const [testNumber, setTestNumber] = useState("");
  const [testMessage, setTestMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  
  const { configs, sendTestMessage } = useEvolutionAPI(franchiseeId);

  // Simular mensagens para demonstração
  useEffect(() => {
    const mockMessages: Message[] = [
      {
        id: '1',
        from: '5511999999999',
        to: 'agent',
        content: 'Olá, gostaria de saber sobre seus produtos',
        timestamp: new Date().toISOString(),
        type: 'received',
        configId: configs[0]?.id || 'mock'
      },
      {
        id: '2',
        from: 'agent',
        to: '5511999999999',
        content: 'Olá! Posso ajudá-lo com informações sobre nossos produtos. O que você gostaria de saber?',
        timestamp: new Date().toISOString(),
        type: 'sent',
        configId: configs[0]?.id || 'mock'
      }
    ];
    
    setMessages(mockMessages);
    setFilteredMessages(mockMessages);
  }, [configs]);

  // Filtrar mensagens
  useEffect(() => {
    let filtered = messages;
    
    if (searchTerm) {
      filtered = filtered.filter(msg => 
        msg.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        msg.from.includes(searchTerm) ||
        msg.to.includes(searchTerm)
      );
    }
    
    if (selectedConfig !== 'all') {
      filtered = filtered.filter(msg => msg.configId === selectedConfig);
    }
    
    setFilteredMessages(filtered);
  }, [messages, searchTerm, selectedConfig]);

  const handleSendTestMessage = async () => {
    if (!testNumber || !testMessage) {
      toast.error("Preencha o número e mensagem");
      return;
    }

    const connectedConfig = configs.find(c => c.status === 'connected');
    if (!connectedConfig) {
      toast.error("Nenhuma instância conectada encontrada");
      return;
    }

    setIsSending(true);
    try {
      await sendTestMessage(connectedConfig.id, testNumber, testMessage);
      
      // Adicionar mensagem à lista
      const newMessage: Message = {
        id: Date.now().toString(),
        from: 'agent',
        to: testNumber,
        content: testMessage,
        timestamp: new Date().toISOString(),
        type: 'sent',
        configId: connectedConfig.id
      };
      
      setMessages(prev => [...prev, newMessage]);
      setTestNumber("");
      setTestMessage("");
      toast.success("Mensagem enviada com sucesso!");
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error("Erro ao enviar mensagem");
    } finally {
      setIsSending(false);
    }
  };

  const formatPhoneNumber = (phone: string) => {
    // Formatar número de telefone para exibição
    if (phone.length > 10) {
      return `${phone.slice(0, 2)} ${phone.slice(2, 7)}-${phone.slice(7)}`;
    }
    return phone;
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('pt-BR');
  };

  return (
    <div className="space-y-6">
      {/* Envio de mensagem de teste */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Enviar Mensagem de Teste
          </CardTitle>
          <CardDescription>
            Envie uma mensagem de teste para verificar a integração
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Número de Telefone (com código do país)
              </label>
              <Input
                placeholder="Ex: 5511999999999"
                value={testNumber}
                onChange={(e) => setTestNumber(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">
                Mensagem
              </label>
              <Input
                placeholder="Digite sua mensagem de teste"
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
              />
            </div>
          </div>
          <Button
            onClick={handleSendTestMessage}
            disabled={isSending || configs.filter(c => c.status === 'connected').length === 0}
            className="mt-4"
          >
            {isSending ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Enviar Teste
              </>
            )}
          </Button>
          {configs.filter(c => c.status === 'connected').length === 0 && (
            <p className="text-sm text-muted-foreground mt-2">
              Conecte uma instância do WhatsApp primeiro
            </p>
          )}
        </CardContent>
      </Card>

      {/* Histórico de mensagens */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Histórico de Mensagens
          </CardTitle>
          <CardDescription>
            Visualize as mensagens enviadas e recebidas
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filtros */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar mensagens..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <select
                value={selectedConfig}
                onChange={(e) => setSelectedConfig(e.target.value)}
                className="px-3 py-2 border rounded-md text-sm"
              >
                <option value="all">Todas as instâncias</option>
                {configs.map(config => (
                  <option key={config.id} value={config.id}>
                    {config.instance_name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Lista de mensagens */}
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {filteredMessages.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  {searchTerm || selectedConfig !== 'all' 
                    ? "Nenhuma mensagem encontrada com os filtros aplicados"
                    : "Nenhuma mensagem ainda"
                  }
                </p>
              </div>
            ) : (
              filteredMessages.map((message) => (
                <div
                  key={message.id}
                  className={`p-4 rounded-lg border ${
                    message.type === 'sent' 
                      ? 'bg-blue-50 border-blue-200 ml-8' 
                      : 'bg-gray-50 border-gray-200 mr-8'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant={message.type === 'sent' ? 'default' : 'secondary'}>
                        {message.type === 'sent' ? 'Enviada' : 'Recebida'}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {message.type === 'sent' 
                          ? `Para: ${formatPhoneNumber(message.to)}`
                          : `De: ${formatPhoneNumber(message.from)}`
                        }
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatTimestamp(message.timestamp)}
                    </span>
                  </div>
                  <p className="text-sm">{message.content}</p>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
