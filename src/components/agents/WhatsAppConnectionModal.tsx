
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, AlertCircle, Smartphone, Wifi } from "lucide-react";
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
  const [connectionStep, setConnectionStep] = useState<'instructions' | 'qr' | 'connecting'>('instructions');
  const [evolutionConfigId, setEvolutionConfigId] = useState<string | null>(null);
  
  const { configs, aiAgents, connectInstance } = useEvolutionAPI();

  useEffect(() => {
    if (agent && configs.length > 0) {
      // Find the AI agent configuration for this agent
      const aiAgent = aiAgents.find(ai => ai.agent_id === agent.id);
      if (aiAgent && aiAgent.evolution_config_id) {
        setEvolutionConfigId(aiAgent.evolution_config_id);
      } else {
        // Find any available config for this franchisee
        const config = configs.find(c => c.status === 'disconnected') || configs[0];
        if (config) {
          setEvolutionConfigId(config.id);
        }
      }
    }
  }, [agent, configs, aiAgents]);

  const handleGenerateQrCode = async () => {
    if (!evolutionConfigId) {
      setQrError('Nenhuma configuração da EvolutionAPI encontrada. Configure primeiro uma instância.');
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
        // Handle different QR code formats from EvolutionAPI
        let qrCodeUrl = qrCodeData;
        
        // If it's base64, convert to data URL
        if (typeof qrCodeData === 'string' && !qrCodeData.startsWith('data:') && !qrCodeData.startsWith('http')) {
          qrCodeUrl = `data:image/png;base64,${qrCodeData}`;
        }
        
        setCurrentQrCode(qrCodeUrl);
        console.log('QR code generated successfully');
      } else {
        throw new Error('QR code não foi retornado pela EvolutionAPI');
      }
    } catch (error) {
      console.error('Error generating QR code:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      setQrError(`Erro ao gerar QR code: ${errorMessage}`);
      toast.error('Erro ao conectar com EvolutionAPI');
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
    setConnectionStep('instructions');
  };

  const renderStepContent = () => {
    switch (connectionStep) {
      case 'instructions':
        return (
          <div className="space-y-4">
            <Alert>
              <Smartphone className="h-4 w-4" />
              <AlertDescription>
                {evolutionConfigId 
                  ? "Conecte seu WhatsApp usando nossa integração com EvolutionAPI."
                  : "Configure primeiro uma instância da EvolutionAPI para conectar o WhatsApp."
                }
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
                  <span className={`text-sm font-medium ${evolutionConfigId ? 'text-green-600' : 'text-red-600'}`}>
                    {evolutionConfigId ? 'Configurada' : 'Não Configurada'}
                  </span>
                </div>
              </div>
            </div>

            {evolutionConfigId && (
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
                    <span>Escaneie o código QR</span>
                  </li>
                </ol>
              </div>
            )}
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
                  : "Escaneie o código QR gerado pela EvolutionAPI com o WhatsApp."
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
      case 'instructions':
        return 'Usando integração com EvolutionAPI para conectar seu agente ao WhatsApp.';
      case 'qr':
        return 'QR Code gerado pela EvolutionAPI. Use o WhatsApp do celular para escanear.';
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
          {connectionStep === 'instructions' && (
            <>
              <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
                Configurar depois
              </Button>
              {evolutionConfigId && (
                <Button onClick={handleGenerateQrCode} className="w-full sm:w-auto">
                  Conectar WhatsApp
                </Button>
              )}
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
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
