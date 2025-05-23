
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import WhatsAppQRCode from "@/components/whatsapp/WhatsAppQRCode";
import { toast } from "sonner";

interface WhatsAppConnectionTabProps {
  isWhatsAppConnected: boolean;
  setIsWhatsAppConnected: (isConnected: boolean) => void;
  setActiveTab: (tab: string) => void;
}

export default function WhatsAppConnectionTab({
  isWhatsAppConnected,
  setIsWhatsAppConnected,
  setActiveTab
}: WhatsAppConnectionTabProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [isGeneratingQr, setIsGeneratingQr] = useState(false);

  const connectWhatsApp = () => {
    // In a real implementation, this would connect to the WhatsApp API
    setTimeout(() => {
      setIsWhatsAppConnected(true);
      toast.success("WhatsApp conectado com sucesso!");
      setActiveTab("agent");
    }, 2000);
  };

  const disconnectWhatsApp = () => {
    // In a real implementation, this would disconnect from the WhatsApp API
    setIsWhatsAppConnected(false);
    setQrCodeUrl(null);
    toast.info("WhatsApp desconectado.");
  };

  const handleGenerateQrCode = () => {
    setIsGeneratingQr(true);
    // Simulate API call delay
    setTimeout(() => {
      setQrCodeUrl("https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=whatsapp-connection-code-" + Date.now());
      setIsGeneratingQr(false);
    }, 1500);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Conexão do WhatsApp</CardTitle>
        <CardDescription>
          Conecte seu WhatsApp para usar o disparador de mensagens e o agente IA.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className={`h-3 w-3 rounded-full ${isWhatsAppConnected ? 'bg-green-500' : 'bg-red-500'}`} />
              <p className="text-sm font-medium">
                Status: {isWhatsAppConnected ? 'Conectado' : 'Desconectado'}
              </p>
            </div>
            
            <Button 
              onClick={isWhatsAppConnected ? disconnectWhatsApp : connectWhatsApp}
              variant={isWhatsAppConnected ? "outline" : "default"}
            >
              {isWhatsAppConnected ? 'Desconectar' : 'Conectar WhatsApp'}
            </Button>
            
            <div className="mt-6">
              <p className="text-sm text-muted-foreground">
                {isWhatsAppConnected 
                  ? "Seu WhatsApp está conectado e pronto para uso." 
                  : "Escaneie o QR Code ao lado com seu WhatsApp para conectar."}
              </p>
            </div>
          </div>
          
          <div className="flex items-center justify-center">
            <WhatsAppQRCode 
              onConnect={connectWhatsApp}
              onRefresh={handleGenerateQrCode}
              isGenerating={isGeneratingQr}
              qrCodeUrl={qrCodeUrl || undefined}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
