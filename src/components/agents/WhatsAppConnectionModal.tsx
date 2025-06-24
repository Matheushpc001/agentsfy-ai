
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, AlertCircle, Smartphone, Wifi, Clock } from "lucide-react";
import WhatsAppQRCode from "@/components/whatsapp/WhatsAppQRCode";
import { Agent, Customer } from "@/types";
import { useEvolutionAPI } from "@/hooks/useEvolutionAPI";
import { toast } from "sonner";

interface WhatsAppConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: () => void;
  agent: Agent | null;
  customer: Customer | null;
}

export default function WhatsAppConnectionModal({
  isOpen,
  onClose,
  onConnect,
  agent,
  customer
}: WhatsAppConnectionModalProps) {
  const [isGeneratingQr, setIsGeneratingQr] = useState(false);
  const [currentQrCode, setCurrentQrCode] = useState<string | null>(null);
  const [qrError, setQrError] = useState<string | null>(null);
  const [connectionStep, setConnectionStep] = useState<'loading' | 'instructions' | 'qr' | 'connecting' | 'error'>('loading');
  const [evolutionConfigId, setEvolutionConfigId] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  
  const { configs, aiAgents, connectInstance, globalConfigs } = useEvolutionAPI();

  // Inicializar configuração da EvolutionAPI
  useEffect(() => {
    if (isOpen && agent) {
      initializeEvolutionConfig();
    }
  }, [isOpen, agent, configs, aiAgents]);

  const initializeEvolutionConfig = async () => {
    setConnectionStep('loading');
    setQrError(null);
    
    try {
      // Verificar se há configuração global
      if (globalConfigs.length === 0) {
        setQrError('EvolutionAPI não configurada. Entre em contato com o administrador.');
        setConnectionStep('error');
        return;
      }

      // Encontrar configuração AI Agent para este agente
      const aiAgent = aiAgents.find(ai => ai.agent_id === agent!.id);
      
      if (aiAgent && aiAgent.evolution_config_id) {
        console.log('Found existing AI agent config:', aiAgent.evolution_config_id);
        setEvolutionConfigId(aiAgent.evolution_config_id);
        setConnectionStep('instructions');
      } else {
        // Procurar por qualquer configuração disponível
        const availableConfig = configs.find(c => c.status === 'disconnected') || configs[0];
        
        if (availableConfig) {
          console.log('Using available config:', availableConfig.id);
          setEvolutionConfigId(availableConfig.id);
          setConnectionStep('instructions');
        } else {
          setQrError('Nenhuma instância EvolutionAPI encontrada. A integração pode não ter sido configurada corretamente.');
          setConnectionStep('error');
        }
      }
    } catch (error) {
      console.error('Error initializing Evolution config:', error);
      setQrError('Erro ao inicializar configuração EvolutionAPI');
      setConnectionStep('error');
    }
  };

  const handleGenerateQrCode = async () => {
    if (!evolutionConfigId) {
      setQrError('Configuração EvolutionAPI não encontrada');
      return;
    }

    setIsGeneratingQr(true);
    setConnectionStep('qr');
    setQrError(null);
    setCurrentQrCode(null);
    
    try {
      console.log('Generating QR code with EvolutionAPI for config:', evolutionConfigId);
      
      const qrCodeData = await connectInstance(evolutionConfigId);
      
      if (qrCodeData) {
        // Tratar diferentes formatos de QR code da EvolutionAPI
        let qrCodeUrl = qrCodeData;
        
        // Se for base64, converter para data URL
        if (typeof qrCodeData === 'string' && !qrCodeData.startsWith('data:') && !qrCodeData.startsWith('http')) {
          qrCodeUrl = `data:image/png;base64,${qrCodeData}`;
        }
        
        setCurrentQrCode(qrCodeUrl);
        setRetryCount(0);
        console.log('QR code generated successfully');
      } else {
        throw new Error('QR code não foi retornado pela EvolutionAPI');
      }
    } catch (error) {
      console.error('Error generating QR code:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      setQrError(`Erro ao gerar QR code: ${errorMessage}`);
      setRetryCount(prev => prev + 1);
      
      if (retryCount < 3) {
        toast.error('Erro ao conectar. Tentando novamente...');
        setTimeout(() => {
          handleGenerateQrCode();
        }, 2000);
      } else {
        toast.error('Erro ao conectar com EvolutionAPI após várias tentativas');
      }
    } finally {
      setIsGeneratingQr(false);
    }
  };

  const handleConnect = () => {
    setConnectionStep('connecting');
    onConnect();
  };

  const handleRetryConnection = () => {
    setQrError(null);
    setCurrentQrCode(null);
    setRetryCount(0);
    initializeEvolutionConfig();
  };

  const renderStepContent = () => {
    switch (connectionStep) {
      case 'loading':
        return (
          <div className="space-y-4 text-center">
            <Clock className="h-12 w-12 text-blue-500 mx-auto animate-spin" />
            <div>
              <h4 className="font-medium">Inicializando...</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Verificando configuração da EvolutionAPI
              </p>
            </div>
          </div>
        );

      case 'error':
        return (
          <div className="space-y-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {qrError}
              </AlertDescription>
            </Alert>
            
            <div className="space-y-3">
              <h4 className="font-medium text-sm">Informações do Agente:</h4>
              <div className="bg-muted p-3 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Cliente:</span>
                  <span className="text-sm font-medium">{customer?.businessName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Agente:</span>
                  <span className="text-sm font-medium">{agent?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Status:</span>
                  <span className="text-sm font-medium text-red-600">Erro na Configuração</span>
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'instructions':
        return (
          <div className="space-y-4">
            <Alert>
              <Smartphone className="h-4 w-4" />
              <AlertDescription>
                Conecte seu WhatsApp usando nossa integração com EvolutionAPI.
              </AlertDescription>
            </Alert>
            
            <div className="space-y-3">
              <h4 className="font-medium text-sm">Informações do Agente:</h4>
              <div className="bg-muted p-3 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Cliente:</span>
                  <span className="text-sm font-medium">{customer?.businessName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Agente:</span>
                  <span className="text-sm font-medium">{agent?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Setor:</span>
                  <span className="text-sm font-medium">{agent?.sector}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Status API:</span>
                  <span className="text-sm font-medium text-green-600">Configurada</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium text-sm">Como conectar:</h4>
              <ol className="text-sm text-muted-foreground space-y-2">
                <li className="flex items-start gap-2">
                  <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium mt-0.5">1</span>
                  <span>Clique em "Conectar WhatsApp" para gerar o QR code</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium mt-0.5">2</span>
                  <span>Abra o WhatsApp no celular</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium mt-0.5">3</span>
                  <span>Vá em Configurações → WhatsApp Web/Desktop</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium mt-0.5">4</span>
                  <span>Escaneie o código QR real da EvolutionAPI</span>
                </li>
              </ol>
            </div>
          </div>
        );
      
      case 'qr':
        return (
          <div className="space-y-4">
            <Alert>
              <Wifi className="h-4 w-4" />
              <AlertDescription>
                {qrError 
                  ? "Erro ao conectar com EvolutionAPI. Verifique a configuração."
                  : "Escaneie o código QR real da EvolutionAPI com o WhatsApp."
                }
              </AlertDescription>
            </Alert>
            
            <WhatsAppQRCode
              isGenerating={isGeneratingQr}
              qrCodeUrl={currentQrCode || undefined}
              error={qrError || undefined}
              onRefresh={handleGenerateQrCode}
              onConnect={handleConnect}
              className="flex justify-center"
            />
          </div>
        );
      
      case 'connecting':
        return (
          <div className="space-y-4 text-center">
            <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto animate-pulse" />
            <div>
              <h4 className="font-medium">Conectando...</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Estabelecendo conexão com o WhatsApp via EvolutionAPI
              </p>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  const getDialogTitle = () => {
    switch (connectionStep) {
      case 'loading':
        return 'Inicializando Conexão';
      case 'error':
        return 'Erro na Configuração';
      case 'instructions':
        return 'Conectar Agente ao WhatsApp';
      case 'qr':
        return 'Escaneie o QR Code (EvolutionAPI)';
      case 'connecting':
        return 'Conectando WhatsApp';
      default:
        return 'Conectar WhatsApp';
    }
  };

  const getDialogDescription = () => {
    switch (connectionStep) {
      case 'loading':
        return 'Verificando configuração da EvolutionAPI...';
      case 'error':
        return 'Erro na configuração. Verifique se a EvolutionAPI está configurada corretamente.';
      case 'instructions':
        return 'Usando integração automática com EvolutionAPI para conectar seu agente ao WhatsApp.';
      case 'qr':
        return 'QR Code real gerado pela EvolutionAPI. Use o WhatsApp do celular para escanear.';
      case 'connecting':
        return 'Estabelecendo conexão com o WhatsApp...';
      default:
        return '';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{getDialogTitle()}</DialogTitle>
          <DialogDescription>
            {getDialogDescription()}
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          {renderStepContent()}
        </div>
        
        <DialogFooter className="flex-col sm:flex-row gap-2">
          {connectionStep === 'error' && (
            <>
              <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
                Fechar
              </Button>
              <Button onClick={handleRetryConnection} className="w-full sm:w-auto">
                Tentar Novamente
              </Button>
            </>
          )}

          {connectionStep === 'instructions' && (
            <>
              <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
                Configurar depois
              </Button>
              <Button onClick={handleGenerateQrCode} className="w-full sm:w-auto">
                Conectar WhatsApp
              </Button>
            </>
          )}
          
          {connectionStep === 'qr' && (
            <>
              <Button variant="outline" onClick={() => setConnectionStep('instructions')} className="w-full sm:w-auto">
                Voltar
              </Button>
              {qrError && (
                <Button onClick={handleRetryConnection} className="w-full sm:w-auto">
                  Tentar Novamente
                </Button>
              )}
              <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
                Configurar depois
              </Button>
            </>
          )}
          
          {connectionStep === 'connecting' && (
            <Button variant="outline" onClick={onClose} disabled className="w-full sm:w-auto">
              Conectando...
            </Button>
          )}

          {connectionStep === 'loading' && (
            <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
              Cancelar
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
