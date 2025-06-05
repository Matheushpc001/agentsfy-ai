
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RefreshCw, Copy, CheckCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

interface QRCodeDisplayProps {
  isOpen: boolean;
  onClose: () => void;
  qrCode?: string;
  instanceName: string;
  expiresAt?: string;
}

export default function QRCodeDisplay({ 
  isOpen, 
  onClose, 
  qrCode, 
  instanceName,
  expiresAt 
}: QRCodeDisplayProps) {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (!expiresAt) return;

    const updateTimer = () => {
      const now = new Date().getTime();
      const expiry = new Date(expiresAt).getTime();
      const diff = expiry - now;

      if (diff <= 0) {
        setIsExpired(true);
        setTimeLeft(0);
      } else {
        setIsExpired(false);
        setTimeLeft(Math.floor(diff / 1000));
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [expiresAt]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const copyToClipboard = () => {
    if (qrCode) {
      navigator.clipboard.writeText(qrCode);
      toast.success('QR Code copiado para a área de transferência');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>QR Code - {instanceName}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {qrCode ? (
            <>
              <div className="flex justify-center p-4 border rounded-lg bg-white">
                <img 
                  src={`data:image/png;base64,${qrCode}`} 
                  alt="QR Code para conexão WhatsApp"
                  className="w-64 h-64"
                />
              </div>
              
              {timeLeft > 0 && (
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <RefreshCw className="h-4 w-4" />
                  Expira em: {formatTime(timeLeft)}
                </div>
              )}
              
              {isExpired && (
                <div className="flex items-center justify-center gap-2 text-sm text-red-600">
                  <RefreshCw className="h-4 w-4" />
                  QR Code expirado. Gere um novo.
                </div>
              )}

              <div className="text-sm text-center text-muted-foreground">
                1. Abra o WhatsApp no seu celular<br/>
                2. Toque em Configurações → Aparelhos conectados<br/>
                3. Toque em "Conectar um aparelho"<br/>
                4. Escaneie este código QR
              </div>

              <Button 
                onClick={copyToClipboard}
                variant="outline"
                className="w-full"
              >
                <Copy className="h-4 w-4 mr-2" />
                Copiar código
              </Button>
            </>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              QR Code não disponível. Tente conectar a instância novamente.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
