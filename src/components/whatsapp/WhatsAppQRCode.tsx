
import { useState, useEffect } from "react";
import { QrCode, RefreshCw, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WhatsAppQRCodeProps {
  onConnect?: () => void;
  onRefresh?: () => void;
  isGenerating?: boolean;
  qrCodeUrl?: string;
  className?: string;
}

export default function WhatsAppQRCode({ 
  onConnect, 
  onRefresh,
  isGenerating = false,
  qrCodeUrl,
  className = ""
}: WhatsAppQRCodeProps) {
  const [countdown, setCountdown] = useState(60);
  const [expired, setExpired] = useState(false);
  
  // Simulando contagem regressiva para expiração do QR code
  useEffect(() => {
    if (!qrCodeUrl || expired) return;
    
    let timer: NodeJS.Timeout;
    
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else {
      setExpired(true);
    }
    
    return () => clearTimeout(timer);
  }, [countdown, qrCodeUrl, expired]);
  
  // Reset da contagem regressiva quando um novo QR code é gerado
  useEffect(() => {
    if (qrCodeUrl) {
      setCountdown(60);
      setExpired(false);
    }
  }, [qrCodeUrl]);
  
  const handleRefresh = () => {
    if (onRefresh) onRefresh();
    setExpired(false);
    setCountdown(60);
  };
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  return (
    <div className={`flex flex-col items-center space-y-4 ${className}`}>
      {/* Timer display - positioned above QR code */}
      {qrCodeUrl && !expired && !isGenerating && (
        <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg">
          <Clock className="h-4 w-4 text-blue-600" />
          <span className="text-sm font-medium text-blue-800">
            Expira em {formatTime(countdown)}
          </span>
        </div>
      )}

      {/* QR Code Container - clean and unobstructed */}
      <div className="w-64 h-64 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-white relative">
        {isGenerating ? (
          // Loading state
          <div className="text-center">
            <QrCode size={80} className="mx-auto text-gray-400 mb-2 animate-pulse" />
            <p className="text-sm text-muted-foreground">
              Gerando código QR...
            </p>
          </div>
        ) : qrCodeUrl ? (
          // QR Code display - no overlays for clean scanning
          <div className="w-full h-full p-4 flex items-center justify-center">
            <img
              src={qrCodeUrl}
              alt="WhatsApp QR Code"
              className="w-full h-full object-contain"
            />
          </div>
        ) : expired ? (
          // Expired state
          <div className="text-center p-4">
            <QrCode size={60} className="mx-auto text-red-300 mb-2" />
            <p className="text-sm text-red-600 font-medium">QR Code expirado</p>
          </div>
        ) : (
          // Default state
          <div className="text-center">
            <QrCode size={60} className="mx-auto text-gray-400 mb-2" />
            <p className="text-sm text-muted-foreground">
              Clique em Gerar QR Code
            </p>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="text-center max-w-sm">
        <p className="text-sm text-muted-foreground leading-relaxed">
          Abra o WhatsApp no seu celular, acesse <span className="font-medium">Configurações</span> → 
          <span className="font-medium"> WhatsApp Web</span> e escaneie o código QR.
        </p>
      </div>
      
      {/* Action buttons */}
      <div className="flex flex-col items-center gap-3">
        {!qrCodeUrl && !isGenerating && !expired && (
          <Button onClick={onRefresh} className="min-w-[180px]">
            <QrCode className="mr-2 h-4 w-4" />
            Gerar QR Code
          </Button>
        )}
        
        {expired && (
          <Button onClick={handleRefresh} variant="outline" className="min-w-[180px]">
            <RefreshCw className="mr-2 h-4 w-4" />
            Gerar novo QR Code
          </Button>
        )}
        
        {qrCodeUrl && !expired && onConnect && (
          <Button 
            variant="default" 
            onClick={onConnect}
            className="min-w-[180px]"
          >
            Simular Conexão
          </Button>
        )}
      </div>
    </div>
  );
}
