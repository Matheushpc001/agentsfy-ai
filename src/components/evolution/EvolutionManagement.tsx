
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  MessageSquare, 
  Settings, 
  Trash2,
  RefreshCw,
  Plus,
  Smartphone
} from "lucide-react";
import { useEvolutionAPI } from "@/hooks/useEvolutionAPI";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import WhatsAppQRCode from "@/components/whatsapp/WhatsAppQRCode";

interface EvolutionManagementProps {
  franchiseeId: string;
}

export default function EvolutionManagement({ franchiseeId }: EvolutionManagementProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [newInstanceName, setNewInstanceName] = useState("");
  const [selectedConfigId, setSelectedConfigId] = useState<string | null>(null);
  const [currentQrCode, setCurrentQrCode] = useState<string | null>(null);
  const [isGeneratingQr, setIsGeneratingQr] = useState(false);
  const [qrError, setQrError] = useState<string | null>(null);

  const { 
    configs, 
    globalConfigs, 
    aiAgents, 
    isLoading, 
    isCreating,
    createInstance, 
    connectInstance, 
    disconnectInstance, 
    deleteInstance,
    sendTestMessage,
    loadConfigs
  } = useEvolutionAPI(franchiseeId);

  const handleCreateInstance = async () => {
    if (!newInstanceName.trim()) {
      toast.error("Nome da instância é obrigatório");
      return;
    }

    try {
      await createInstance(newInstanceName.trim());
      setNewInstanceName("");
      setIsCreateModalOpen(false);
      toast.success("Instância criada com sucesso!");
    } catch (error) {
      console.error('Error creating instance:', error);
      toast.error("Erro ao criar instância");
    }
  };

  const handleGenerateQrCode = async (configId: string) => {
    setSelectedConfigId(configId);
    setIsGeneratingQr(true);
    setQrError(null);
    setCurrentQrCode(null);
    setIsQRModalOpen(true);

    try {
      const qrCodeData = await connectInstance(configId);
      
      if (qrCodeData) {
        let qrCodeUrl = qrCodeData;
        if (typeof qrCodeData === 'string' && !qrCodeData.startsWith('data:') && !qrCodeData.startsWith('http')) {
          qrCodeUrl = `data:image/png;base64,${qrCodeData}`;
        }
        setCurrentQrCode(qrCodeUrl);
      }
    } catch (error) {
      console.error('Error generating QR code:', error);
      setQrError("Erro ao gerar QR code");
    } finally {
      setIsGeneratingQr(false);
    }
  };

  const handleDisconnect = async (configId: string) => {
    try {
      await disconnectInstance(configId);
      toast.success("Instância desconectada");
    } catch (error) {
      console.error('Error disconnecting:', error);
      toast.error("Erro ao desconectar instância");
    }
  };

  const handleDelete = async (configId: string) => {
    if (!confirm("Tem certeza que deseja remover esta instância?")) {
      return;
    }

    try {
      await deleteInstance(configId);
      toast.success("Instância removida");
    } catch (error) {
      console.error('Error deleting instance:', error);
      toast.error("Erro ao remover instância");
    }
  };

  const handleTestMessage = async (configId: string) => {
    const phoneNumber = prompt("Digite o número de teste (com código do país):");
    if (!phoneNumber) return;

    try {
      await sendTestMessage(configId, phoneNumber, "Mensagem de teste da EvolutionAPI");
      toast.success("Mensagem de teste enviada!");
    } catch (error) {
      console.error('Error sending test message:', error);
      toast.error("Erro ao enviar mensagem de teste");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'bg-green-500';
      case 'connecting': return 'bg-yellow-500';
      case 'disconnected': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return CheckCircle;
      case 'connecting': return Clock;
      case 'disconnected': return AlertCircle;
      default: return AlertCircle;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Status da Configuração Global */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Status da EvolutionAPI
          </CardTitle>
          <CardDescription>
            Configuração global da integração EvolutionAPI
          </CardDescription>
        </CardHeader>
        <CardContent>
          {globalConfigs.length > 0 ? (
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="text-green-600 font-medium">
                EvolutionAPI configurada ({globalConfigs.length} configuração{globalConfigs.length > 1 ? 'ões' : ''})
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <span className="text-red-600 font-medium">
                EvolutionAPI não configurada. Entre em contato com o administrador.
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Instâncias */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5" />
                Instâncias WhatsApp
              </CardTitle>
              <CardDescription>
                Gerencie suas instâncias de WhatsApp via EvolutionAPI
              </CardDescription>
            </div>
            {globalConfigs.length > 0 && (
              <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Instância
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Criar Nova Instância</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="instanceName">Nome da Instância</Label>
                      <Input
                        id="instanceName"
                        value={newInstanceName}
                        onChange={(e) => setNewInstanceName(e.target.value)}
                        placeholder="Ex: whatsapp-vendas"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        onClick={handleCreateInstance}
                        disabled={isCreating}
                        className="flex-1"
                      >
                        {isCreating ? (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            Criando...
                          </>
                        ) : (
                          "Criar Instância"
                        )}
                      </Button>
                      <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                        Cancelar
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {configs.length === 0 ? (
            <div className="text-center py-8">
              <Smartphone className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {globalConfigs.length === 0 
                  ? "Configure a EvolutionAPI primeiro para criar instâncias"
                  : "Nenhuma instância criada ainda"
                }
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {configs.map((config) => {
                const StatusIcon = getStatusIcon(config.status);
                const connectedAgents = aiAgents.filter(agent => agent.evolution_config_id === config.id);
                
                return (
                  <div key={config.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(config.status)}`} />
                        <div>
                          <h3 className="font-medium">{config.instance_name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {connectedAgents.length} agente{connectedAgents.length !== 1 ? 's' : ''} conectado{connectedAgents.length !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={config.status === 'connected' ? 'default' : 'secondary'}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {config.status === 'connected' ? 'Conectado' : 
                           config.status === 'connecting' ? 'Conectando' : 'Desconectado'}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      {config.status === 'disconnected' && (
                        <Button
                          size="sm"
                          onClick={() => handleGenerateQrCode(config.id)}
                        >
                          Conectar
                        </Button>
                      )}
                      
                      {config.status === 'connected' && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleTestMessage(config.id)}
                          >
                            <MessageSquare className="h-4 w-4 mr-1" />
                            Testar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDisconnect(config.id)}
                          >
                            Desconectar
                          </Button>
                        </>
                      )}
                      
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(config.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal QR Code */}
      <Dialog open={isQRModalOpen} onOpenChange={setIsQRModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Conectar WhatsApp</DialogTitle>
          </DialogHeader>
          <WhatsAppQRCode
            isGenerating={isGeneratingQr}
            qrCodeData={currentQrCode || undefined}
            error={qrError || undefined}
            onRefresh={() => selectedConfigId && handleGenerateQrCode(selectedConfigId)}
            onConnect={() => {
              setIsQRModalOpen(false);
              toast.success("WhatsApp conectado!");
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
