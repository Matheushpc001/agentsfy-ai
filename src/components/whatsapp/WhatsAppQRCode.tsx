// src/components/whatsapp/WhatsAppQRCode.tsx

import { useState, useEffect } from "react";
import { QrCode, RefreshCw, Clock, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface WhatsAppQRCodeProps {
  onConnect?: () => void;
  onRefresh?: () => void;
  isGenerating?: boolean;
  qrCodeData?: string; // Alterado de qrCodeUrl para qrCodeData
  className?: string;
  error?: string;
}

export default function WhatsAppQRCode({ 
  onConnect, 
  onRefresh,
  isGenerating = false,
  qrCodeData, // Prop atualizada
  error,
  className = ""
}: WhatsAppQRCodeProps) {
  const [countdown, setCountdown] = useState(120);
  const [expired, setExpired] = useState(false);
  
  // ==================== INÍCIO DA CORREÇÃO ====================
  // Função para determinar o 'src' da tag <img>.
  // Ela verifica se o dado recebido é uma URL, uma data URL formatada,
  // ou uma string Base64 pura, e a formata corretamente.
  const getQrCodeSrc = () => {
    if (!qrCodeData) {
      return undefined;
    }
    // Se já for uma data URL (formato correto para Base64 em HTML), usa diretamente.
    if (qrCodeData.startsWith('data:image')) {
      return qrCodeData;
    }
    // Se for uma URL HTTP (usado em testes ou cenários de fallback), usa diretamente.
    if (qrCodeData.startsWith('http')) {
      return qrCodeData;
    }
    // Se for apenas a string Base64, formata como uma data URL.
    // Este é o caso mais comum vindo da sua API.
    return `data:image/png;base64,${qrCodeData}`;
  };

  // Chama a função para obter a fonte da imagem pronta para ser usada.
  const qrCodeSrc = getQrCodeSrc();
  // ===================== FIM DA CORREÇÃO ======================

  useEffect(() => {
    // A lógica do timer agora depende de qrCodeData
    if (!qrCodeData || expired || error) return;
    
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else {
      setExpired(true);
    }
    
    return () => clearTimeout(timer);
  }, [countdown, qrCodeData, expired, error]);
  
  useEffect(() => {
    // Reseta o timer quando um novo qrCodeData é recebido
    if (qrCodeData && !error) {
      setCountdown(120);
      setExpired(false);
    }
  }, [qrCodeData, error]);
  
  const handleRefresh = () => {
    if (onRefresh) onRefresh();
    setExpired(false);
    setCountdown(120);
  };
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  return (
    <div className={`flex flex-col items-center space-y-4 ${className}`}>
      {error && (
        <Alert variant="destructive" className="w-full max-w-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {qrCodeData && !expired && !isGenerating && !error && (
        <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg">
          <Clock className="h-4 w-4 text-blue-600" />
          <span className="text-sm font-medium text-blue-800">
            Expira em {formatTime(countdown)}
          </span>
        </div>
      )}

      <div className="w-64 h-64 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-white relative">
        {isGenerating ? (
          <div className="text-center">
            <QrCode size={80} className="mx-auto text-gray-400 mb-2 animate-pulse" />
            <p className="text-sm text-muted-foreground">
              Conectando com EvolutionAPI...
            </p>
          </div>
        ) : error ? (
          <div className="text-center p-4">
            <AlertTriangle size={60} className="mx-auto text-red-400 mb-2" />
            <p className="text-sm text-red-600 font-medium">Erro ao gerar QR Code</p>
            <p className="text-xs text-red-500 mt-1">Verifique a configuração da API</p>
          </div>
        ) : qrCodeSrc ? ( // MODIFICADO para usar a variável qrCodeSrc
          <div className="w-full h-full p-4 flex items-center justify-center">
            <img
              src={qrCodeSrc} // MODIFICADO para usar a variável qrCodeSrc
              alt="WhatsApp QR Code da EvolutionAPI"
              className="w-full h-full object-contain"
              onError={() => {
                console.error('Falha ao carregar a imagem do QR code. Verifique o formato do base64.');
              }}
            />
          </div>
        ) : expired ? (
          <div className="text-center p-4">
            <QrCode size={60} className="mx-auto text-red-300 mb-2" />
            <p className="text-sm text-red-600 font-medium">QR Code expirado</p>
          </div>
        ) : (
          <div className="text-center">
            <QrCode size={60} className="mx-auto text-gray-400 mb-2" />
            <p className="text-sm text-muted-foreground">
              Clique em Conectar para gerar QR Code
            </p>
          </div>
        )}
      </div>

      <div className="text-center max-w-sm">
        <p className="text-sm text-muted-foreground leading-relaxed">
          {error ? (
            "Verifique a configuração da EvolutionAPI e tente novamente."
          ) : (
            <>
              Abra o WhatsApp no seu celular, acesse <span className="font-medium">Configurações</span> → 
              <span className="font-medium"> Aparelhos Conectados</span> e escaneie o código QR.
            </>
          )}
        </p>
      </div>
      
      <div className="flex flex-col items-center gap-3">
        {(!qrCodeData && !isGenerating) || error ? (
          <Button 
            onClick={handleRefresh} 
            className="min-w-[180px]"
            disabled={isGenerating}
          >
            <QrCode className="mr-2 h-4 w-4" />
            {error ? 'Tentar Novamente' : 'Conectar WhatsApp'}
          </Button>
        ) : null}
        
        {expired && !error && (
          <Button onClick={handleRefresh} variant="outline" className="min-w-[180px]">
            <RefreshCw className="mr-2 h-4 w-4" />
            Gerar novo QR Code
          </Button>
        )}
        
        {qrCodeData && !expired && !error && onConnect && (
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