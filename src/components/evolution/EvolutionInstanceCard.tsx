
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  QrCode, 
  Smartphone, 
  MessageSquare, 
  Settings, 
  Trash2,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import QRCodeDisplay from './QRCodeDisplay';
import AIAgentConfig from './AIAgentConfig';

interface EvolutionInstance {
  id: string;
  instance_name: string;
  api_url: string;
  status: 'connected' | 'disconnected' | 'connecting' | 'error';
  qr_code?: string;
  qr_code_expires_at?: string;
  created_at: string;
}

interface EvolutionInstanceCardProps {
  instance: EvolutionInstance;
  onConnect: (configId: string) => void;
  onDisconnect: (configId: string) => void;
  onDelete?: (configId: string) => void;
  aiAgents?: any[];
}

export default function EvolutionInstanceCard({ 
  instance, 
  onConnect, 
  onDisconnect, 
  onDelete,
  aiAgents = []
}: EvolutionInstanceCardProps) {
  const [showQRCode, setShowQRCode] = useState(false);
  const [showAIConfig, setShowAIConfig] = useState(false);

  const getStatusIcon = () => {
    switch (instance.status) {
      case 'connected':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'connecting':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <XCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusText = () => {
    switch (instance.status) {
      case 'connected':
        return 'Conectado';
      case 'connecting':
        return 'Conectando';
      case 'error':
        return 'Erro';
      default:
        return 'Desconectado';
    }
  };

  const getStatusVariant = () => {
    switch (instance.status) {
      case 'connected':
        return 'default' as const;
      case 'connecting':
        return 'secondary' as const;
      case 'error':
        return 'destructive' as const;
      default:
        return 'outline' as const;
    }
  };

  const handleConnect = async () => {
    try {
      await onConnect(instance.id);
      setShowQRCode(true);
    } catch (error) {
      // Error handled in parent
    }
  };

  const activeAgents = aiAgents.filter(agent => 
    agent.evolution_config_id === instance.id && agent.is_active
  );

  return (
    <>
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">{instance.instance_name}</CardTitle>
            <Badge variant={getStatusVariant()} className="flex items-center gap-1">
              {getStatusIcon()}
              {getStatusText()}
            </Badge>
          </div>
          <div className="text-sm text-muted-foreground">
            API: {instance.api_url}
          </div>
          {activeAgents.length > 0 && (
            <div className="text-sm text-muted-foreground">
              {activeAgents.length} agente(s) IA ativo(s)
            </div>
          )}
        </CardHeader>

        <CardContent className="pt-0">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {instance.status === 'connected' ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAIConfig(true)}
                  className="flex items-center gap-1"
                >
                  <Settings className="h-3 w-3" />
                  IA
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDisconnect(instance.id)}
                  className="flex items-center gap-1"
                >
                  <Smartphone className="h-3 w-3" />
                  Desconectar
                </Button>
              </>
            ) : (
              <Button
                variant="default"
                size="sm"
                onClick={handleConnect}
                className="flex items-center gap-1"
              >
                <QrCode className="h-3 w-3" />
                Conectar
              </Button>
            )}
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowQRCode(true)}
              disabled={!instance.qr_code}
              className="flex items-center gap-1"
            >
              <QrCode className="h-3 w-3" />
              QR Code
            </Button>
            
            {onDelete && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDelete(instance.id)}
                className="flex items-center gap-1 text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-3 w-3" />
                Excluir
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <QRCodeDisplay
        isOpen={showQRCode}
        onClose={() => setShowQRCode(false)}
        qrCode={instance.qr_code}
        instanceName={instance.instance_name}
        expiresAt={instance.qr_code_expires_at}
      />

      <AIAgentConfig
        isOpen={showAIConfig}
        onClose={() => setShowAIConfig(false)}
        evolutionConfigId={instance.id}
        instanceName={instance.instance_name}
        aiAgents={aiAgents}
      />
    </>
  );
}
