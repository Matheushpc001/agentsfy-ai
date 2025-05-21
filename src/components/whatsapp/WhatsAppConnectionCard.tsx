
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QrCode, RefreshCw, CheckCircle2, AlertCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { WhatsAppQRCode } from "@/components/whatsapp/WhatsAppQRCode";
import { Agent } from "@/types";

interface WhatsAppConnectionCardProps {
  agent: Agent;
  onRefresh?: (agent: Agent) => void;
}

export default function WhatsAppConnectionCard({ agent, onRefresh }: WhatsAppConnectionCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  
  const handleGenerateQR = () => {
    setIsGenerating(true);
    // Simulate API call
    setTimeout(() => {
      setQrCodeUrl("https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=whatsapp-connection-agent-" + agent.id);
      setIsGenerating(false);
    }, 1500);
  };
  
  const handleConnect = () => {
    // Simulate a successful connection
    setTimeout(() => {
      setIsModalOpen(false);
      if (onRefresh) onRefresh(agent);
    }, 1000);
  };
  
  return (
    <>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">WhatsApp Conexão</CardTitle>
          <CardDescription>
            Status da conexão do WhatsApp com seu agente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">{agent.name}</p>
              <p className="text-sm text-muted-foreground">{agent.sector}</p>
            </div>
            
            {agent.whatsappConnected ? (
              <div className="flex items-center text-green-500">
                <CheckCircle2 className="mr-1 h-4 w-4" />
                <span className="text-sm">Conectado</span>
              </div>
            ) : (
              <div className="flex items-center text-yellow-500">
                <AlertCircle className="mr-1 h-4 w-4" />
                <span className="text-sm">Desconectado</span>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button
            variant={agent.whatsappConnected ? "outline" : "default"}
            className="w-full"
            onClick={() => setIsModalOpen(true)}
          >
            {agent.whatsappConnected ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Reconectar WhatsApp
              </>
            ) : (
              <>
                <QrCode className="mr-2 h-4 w-4" />
                Conectar WhatsApp
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
      
      {/* QR Code Dialog */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Conectar WhatsApp</DialogTitle>
            <DialogDescription>
              Escaneie o código QR abaixo com o celular da sua empresa para conectar o agente.
            </DialogDescription>
          </DialogHeader>
          
          <WhatsAppQRCode
            isGenerating={isGenerating}
            qrCodeUrl={qrCodeUrl || undefined}
            onRefresh={handleGenerateQR}
            onConnect={handleConnect}
            className="my-4"
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
