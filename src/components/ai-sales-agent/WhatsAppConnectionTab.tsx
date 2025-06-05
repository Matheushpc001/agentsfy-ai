
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, AlertCircle, Info } from "lucide-react";
import WhatsAppQRCode from "@/components/whatsapp/WhatsAppQRCode";
import { useEvolutionAPI } from "@/hooks/useEvolutionAPI";
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
  const [qrError, setQrError] = useState<string | null>(null);

  const { globalConfigs, testConnection } = useEvolutionAPI();

  const connectWhatsApp = () => {
    setTimeout(() => {
      setIsWhatsAppConnected(true);
      toast.success("WhatsApp conectado com sucesso!");
      setActiveTab("agent");
    }, 2000);
  };

  const disconnectWhatsApp = () => {
    setIsWhatsAppConnected(false);
    setQrCodeUrl(null);
    toast.info("WhatsApp desconectado.");
  };

  const handleTestConnection = async () => {
    setIsGeneratingQr(true);
    setQrError(null);
    
    try {
      await testConnection();
      setQrCodeUrl("https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=whatsapp-connection-test-" + Date.now());
      toast.success("Conexão testada com sucesso!");
    } catch (error) {
      setQrError("Erro ao testar conexão com EvolutionAPI");
      toast.error("Erro ao testar conexão");
    } finally {
      setIsGeneratingQr(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Conexão do WhatsApp via EvolutionAPI</CardTitle>
        <CardDescription>
          Sistema automático de WhatsApp com IA. A configuração é gerenciada automaticamente.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Status da configuração global */}
        {globalConfigs.length === 0 ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              EvolutionAPI não configurada. Entre em contato com o administrador para ativar a integração.
            </AlertDescription>
          </Alert>
        ) : (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              EvolutionAPI configurada e pronta para uso. As instâncias são criadas automaticamente.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className={`h-3 w-3 rounded-full ${isWhatsAppConnected ? 'bg-green-500' : 'bg-red-500'}`} />
              <p className="text-sm font-medium">
                Status: {isWhatsAppConnected ? 'Conectado' : 'Desconectado'}
              </p>
            </div>
            
            {globalConfigs.length > 0 && (
              <>
                <Button 
                  onClick={isWhatsAppConnected ? disconnectWhatsApp : connectWhatsApp}
                  variant={isWhatsAppConnected ? "outline" : "default"}
                >
                  {isWhatsAppConnected ? 'Desconectar' : 'Conectar WhatsApp'}
                </Button>
                
                <Button 
                  onClick={handleTestConnection}
                  variant="outline"
                  disabled={isGeneratingQr}
                >
                  Testar Conexão EvolutionAPI
                </Button>
              </>
            )}
            
            <div className="mt-6">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  {globalConfigs.length === 0 
                    ? "Configure a EvolutionAPI primeiro para usar WhatsApp com IA." 
                    : isWhatsAppConnected 
                      ? "Seu WhatsApp está conectado via EvolutionAPI e pronto para uso." 
                      : "As instâncias WhatsApp são criadas automaticamente quando você cria agentes."}
                </AlertDescription>
              </Alert>
            </div>
          </div>
          
          <div className="flex items-center justify-center">
            {globalConfigs.length > 0 ? (
              <WhatsAppQRCode 
                onConnect={connectWhatsApp}
                onRefresh={handleTestConnection}
                isGenerating={isGeneratingQr}
                qrCodeUrl={qrCodeUrl || undefined}
                error={qrError || undefined}
              />
            ) : (
              <div className="text-center text-muted-foreground">
                <p className="text-sm">EvolutionAPI não configurada</p>
                <p className="text-xs mt-1">Entre em contato com o administrador</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
