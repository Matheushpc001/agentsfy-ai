
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import WhatsAppQRCode from "@/components/whatsapp/WhatsAppQRCode";
import { Agent, Customer } from "@/types";

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

  const handleGenerateQrCode = () => {
    setIsGeneratingQr(true);
    // Simulate API call delay
    setTimeout(() => {
      setCurrentQrCode("https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=whatsapp-connection-code-" + Date.now());
      setIsGeneratingQr(false);
    }, 1500);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Conectar Agente ao WhatsApp</DialogTitle>
          <DialogDescription>
            Escaneie o código QR com o WhatsApp para conectar o agente.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col items-center py-2">
          <WhatsAppQRCode
            isGenerating={isGeneratingQr}
            qrCodeUrl={currentQrCode || undefined}
            onRefresh={handleGenerateQrCode}
            onConnect={onConnect}
            className="mb-4"
          />
          
          <div className="mt-2 text-center">
            <p className="text-sm text-muted-foreground">
              Cliente: <span className="font-medium text-foreground">{customer?.businessName}</span>
            </p>
            <p className="text-sm text-muted-foreground">
              Agente: <span className="font-medium text-foreground">{agent?.name}</span>
            </p>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Configurar depois
          </Button>
          {currentQrCode && (
            <Button onClick={onConnect}>
              Simular Conexão
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
