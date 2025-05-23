
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { QrCode } from "lucide-react";

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: () => void;
}

export default function QRCodeModal({ isOpen, onClose, onConnect }: QRCodeModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Conectar ao WhatsApp</DialogTitle>
          <DialogDescription>
            Escaneie o código QR abaixo com seu WhatsApp para estabelecer a conexão.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col items-center py-6">
          {/* Placeholder para QR code */}
          <div className="w-64 h-64 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center mb-4">
            <div className="text-center">
              <QrCode size={80} className="mx-auto text-gray-400 mb-2" />
              <p className="text-sm text-muted-foreground animate-pulse">Gerando código QR...</p>
            </div>
          </div>
          
          <p className="text-sm text-center text-muted-foreground mt-4">
            Abra o WhatsApp no seu celular, acesse Configurações &gt; WhatsApp Web e escaneie o código QR.
          </p>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={onConnect}>
            Simular Conexão
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
