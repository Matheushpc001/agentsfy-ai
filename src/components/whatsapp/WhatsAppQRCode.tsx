
import { useState, useEffect } from "react";
import { QrCode, RefreshCw } from "lucide-react";
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
  
  return (
    <div className={`flex flex-col items-center ${className}`}>
      {/* Container do QR Code */}
      <div className="w-64 h-64 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center mb-4 relative">
        {isGenerating ? (
          // Carregando QR Code
          <div className="text-center">
            <QrCode size={80} className="mx-auto text-gray-400 mb-2" />
            <p className="text-sm text-muted-foreground animate-pulse">
              Gerando código QR...
            </p>
          </div>
        ) : qrCodeUrl ? (
          // QR Code gerado
          <>
            <img
              src={qrCodeUrl}
              alt="WhatsApp QR Code"
              className="w-full h-full object-contain p-2"
            />
            
            {/* Contador de expiração */}
            <div className="absolute bottom-2 right-2 bg-background/80 backdrop-blur-sm rounded-full px-2 py-1 text-xs font-medium">
              Expira em {countdown}s
            </div>
          </>
        ) : expired ? (
          // QR Code expirado
          <div className="text-center p-4">
            <QrCode size={60} className="mx-auto text-gray-300 mb-2" />
            <p className="text-sm text-muted-foreground">QR Code expirado</p>
            <Button 
              size="sm" 
              variant="outline" 
              className="mt-4" 
              onClick={handleRefresh}
            >
              <RefreshCw className="mr-1 h-3 w-3" />
              Gerar novo
            </Button>
          </div>
        ) : (
          // Estado padrão
          <div className="text-center">
            <QrCode size={60} className="mx-auto text-gray-400 mb-2" />
            <p className="text-sm text-muted-foreground">
              Clique em Gerar QR Code
            </p>
          </div>
        )}
      </div>
      
      <p className="text-sm text-center text-muted-foreground mt-2 mb-4">
        Abra o WhatsApp no seu celular, acesse Configurações &gt; WhatsApp Web e escaneie o código QR.
      </p>
      
      {!qrCodeUrl && !isGenerating && !expired && (
        <Button onClick={onRefresh}>
          <QrCode className="mr-2 h-4 w-4" />
          Gerar QR Code
        </Button>
      )}
      
      {expired && (
        <Button onClick={handleRefresh}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Gerar novo QR Code
        </Button>
      )}
      
      {qrCodeUrl && !expired && (
        <Button 
          variant="default" 
          onClick={onConnect}
          className="mt-2"
        >
          Simular Conexão
        </Button>
      )}
    </div>
  );
}
