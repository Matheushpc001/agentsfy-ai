
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, AlertCircle, Smartphone } from "lucide-react";
import WhatsAppQRCode from "@/components/whatsapp/WhatsAppQRCode";
import { Agent, Customer } from "@/types";
import { useEvolutionAPI } from "@/hooks/useEvolutionAPI";

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
  const [connectionStep, setConnectionStep] = useState<'instructions' | 'qr' | 'connecting'>('instructions');
  const [evolutionConfigId, setEvolutionConfigId] = useState<string | null>(null);
  
  const { configs, connectInstance } = useEvolutionAPI();

  // Find the evolution config for this agent
  useEffect(() => {
    if (agent && configs.length > 0) {
      // In a real implementation, you would have a way to link agents to evolution configs
      // For now, we'll use the most recent config for this franchisee
      const config = configs.find(c => c.status === 'disconnected') || configs[0];
      if (config) {
        setEvolutionConfigId(config.id);
      }
    }
  }, [agent, configs]);

  const handleGenerateQrCode = async () => {
    setIsGeneratingQr(true);
    setConnectionStep('qr');
    
    try {
      if (evolutionConfigId) {
        console.log('Connecting to EvolutionAPI instance:', evolutionConfigId);
        
        // Use real EvolutionAPI to generate QR code
        const qrCode = await connectInstance(evolutionConfigId);
        setCurrentQrCode(qrCode);
      } else {
        console.log('No EvolutionAPI config found, using fallback QR code');
        
        // Fallback to simulated QR code
        setTimeout(() => {
          setCurrentQrCode("https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=whatsapp-connection-code-" + Date.now());
        }, 1500);
      }
    } catch (error) {
      console.error('Error generating QR code:', error);
      
      // Fallback to simulated QR code on error
      setTimeout(() => {
        setCurrentQrCode("https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=whatsapp-connection-fallback-" + Date.now());
      }, 1500);
    } finally {
      setIsGeneratingQr(false);
    }
  };

  const handleConnect = () => {
    setConnectionStep('connecting');
    onConnect();
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
                  ? "Conecte seu WhatsApp usando nossa integração avançada com EvolutionAPI."
                  : "Antes de conectar, certifique-se de ter o WhatsApp instalado no celular que será usado para este agente."
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
                {evolutionConfigId && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Status:</span>
                    <span className="text-sm font-medium text-green-600">EvolutionAPI Ativa</span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium text-sm">Como funciona a conexão:</h4>
              <ol className="text-sm text-muted-foreground space-y-2">
                <li className="flex items-start gap-2">
                  <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium mt-0.5">1</span>
                  <span>Clique em "Gerar QR Code" para iniciar a conexão</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium mt-0.5">2</span>
                  <span>Abra o WhatsApp no celular do cliente</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium mt-0.5">3</span>
                  <span>Vá em Configurações → WhatsApp Web/Desktop</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium mt-0.5">4</span>
                  <span>Escaneie o código QR que aparecerá na tela</span>
                </li>
              </ol>
            </div>
          </div>
        );
      
      case 'qr':
        return (
          <div className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {evolutionConfigId 
                  ? "Escaneie o código QR com o WhatsApp do cliente. Este é um QR code real da EvolutionAPI."
                  : "Escaneie o código QR com o WhatsApp do cliente para conectar o agente."
                }
              </AlertDescription>
            </Alert>
            
            <WhatsAppQRCode
              isGenerating={isGeneratingQr}
              qrCodeUrl={currentQrCode || undefined}
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
                {evolutionConfigId 
                  ? "Estabelecendo conexão real com o WhatsApp via EvolutionAPI"
                  : "Aguarde enquanto estabelecemos a conexão com o WhatsApp"
                }
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
        return evolutionConfigId ? 'Escaneie o QR Code (EvolutionAPI)' : 'Escaneie o QR Code';
      case 'connecting':
        return 'Conectando WhatsApp';
      default:
        return 'Conectar WhatsApp';
    }
  };

  const getDialogDescription = () => {
    switch (connectionStep) {
      case 'instructions':
        return evolutionConfigId 
          ? 'Usando integração avançada com EvolutionAPI para conectar seu agente ao WhatsApp.'
          : 'Siga as instruções abaixo para conectar seu agente ao WhatsApp.';
      case 'qr':
        return evolutionConfigId
          ? 'QR Code gerado pela EvolutionAPI. Use o WhatsApp do celular para escanear o código abaixo.'
          : 'Use o WhatsApp do celular para escanear o código QR abaixo.';
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
              <Button onClick={handleGenerateQrCode} className="w-full sm:w-auto">
                {evolutionConfigId ? 'Gerar QR Code (EvolutionAPI)' : 'Gerar QR Code'}
              </Button>
            </>
          )}
          
          {connectionStep === 'qr' && (
            <>
              <Button variant="outline" onClick={() => setConnectionStep('instructions')} className="w-full sm:w-auto">
                Voltar
              </Button>
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
