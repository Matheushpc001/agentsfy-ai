
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RefreshCw, Copy, CheckCircle, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

interface QRCodeGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: () => void;
  instanceName: string;
  agentName?: string;
}

export default function QRCodeGeneratorModal({ 
  isOpen, 
  onClose, 
  onConnect,
  instanceName,
  agentName 
}: QRCodeGeneratorModalProps) {
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(120); // 2 minutos
  const [isExpired, setIsExpired] = useState(false);

  // Gerar QR code automaticamente quando o modal abre
  useEffect(() => {
    if (isOpen && !qrCode) {
      generateQRCode();
    }
  }, [isOpen]);

  // Timer para expiração do QR code
  useEffect(() => {
    if (!qrCode || isExpired) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsExpired(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [qrCode, isExpired]);

  const generateQRCode = async () => {
    setIsGenerating(true);
    setIsExpired(false);
    setTimeLeft(120);

    try {
      // Simular chamada para API do Evolution
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Gerar QR code usando um serviço público para demonstração
      const qrData = `whatsapp-connection-${instanceName}-${Date.now()}`;
      const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrData)}`;
      
      setQrCode(qrCodeUrl);
      toast.success("QR Code gerado com sucesso!");
    } catch (error) {
      toast.error("Erro ao gerar QR Code. Tente novamente.");
      console.error('Erro ao gerar QR code:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    if (qrCode) {
      navigator.clipboard.writeText(qrCode);
      toast.success('Link do QR Code copiado!');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleConnect = () => {
    toast.success("Conectando ao WhatsApp...");
    setTimeout(() => {
      onConnect();
      toast.success("WhatsApp conectado com sucesso!");
    }, 1500);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">
            Conectar WhatsApp
            {agentName && <div className="text-sm font-normal text-muted-foreground mt-1">{agentName}</div>}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* QR Code Display */}
          <div className="flex justify-center p-4 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50">
            {isGenerating ? (
              <div className="flex flex-col items-center space-y-3">
                <RefreshCw className="h-12 w-12 animate-spin text-blue-500" />
                <p className="text-sm text-muted-foreground">Gerando QR Code...</p>
              </div>
            ) : qrCode && !isExpired ? (
              <div className="flex flex-col items-center space-y-3">
                <img 
                  src={qrCode} 
                  alt="QR Code para conexão WhatsApp"
                  className="w-64 h-64 border rounded"
                />
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  Expira em: {formatTime(timeLeft)}
                </div>
              </div>
            ) : isExpired ? (
              <div className="flex flex-col items-center space-y-3">
                <AlertCircle className="h-12 w-12 text-red-500" />
                <p className="text-sm text-red-600">QR Code expirado</p>
                <Button onClick={generateQRCode} size="sm">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Gerar Novo
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-3">
                <div className="w-64 h-64 border-2 border-dashed border-gray-300 rounded flex items-center justify-center">
                  <p className="text-sm text-muted-foreground">QR Code não disponível</p>
                </div>
                <Button onClick={generateQRCode} size="sm">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Gerar QR Code
                </Button>
              </div>
            )}
          </div>

          {/* Instruções */}
          <div className="text-sm text-center text-muted-foreground space-y-2">
            <p className="font-medium">Como conectar:</p>
            <ol className="text-left space-y-1">
              <li>1. Abra o WhatsApp no seu celular</li>
              <li>2. Toque em Configurações → Aparelhos conectados</li>
              <li>3. Toque em "Conectar um aparelho"</li>
              <li>4. Escaneie o código QR acima</li>
            </ol>
          </div>

          {/* Botões de ação */}
          <div className="flex flex-col gap-2">
            {qrCode && !isExpired && (
              <>
                <Button onClick={handleConnect} className="w-full">
                  Simular Conexão
                </Button>
                <Button onClick={copyToClipboard} variant="outline" className="w-full">
                  <Copy className="h-4 w-4 mr-2" />
                  Copiar Link
                </Button>
              </>
            )}
            <Button onClick={onClose} variant="outline" className="w-full">
              Cancelar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
