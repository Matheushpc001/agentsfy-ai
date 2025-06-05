
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { QrCode, Smartphone } from 'lucide-react';

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
  const isExpired = expiresAt && new Date(expiresAt) < new Date();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            Conectar WhatsApp - {instanceName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Alert>
            <Smartphone className="h-4 w-4" />
            <AlertDescription>
              Abra o WhatsApp no seu celular, vá em <strong>Configurações → WhatsApp Web</strong> e escaneie o código QR abaixo.
            </AlertDescription>
          </Alert>

          <div className="flex justify-center p-4">
            {qrCode && !isExpired ? (
              <div className="bg-white p-4 rounded-lg border">
                <img 
                  src={`data:image/png;base64,${qrCode}`} 
                  alt="QR Code para WhatsApp"
                  className="w-64 h-64 object-contain"
                />
              </div>
            ) : (
              <div className="w-64 h-64 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <QrCode className="h-12 w-12 mx-auto mb-2" />
                  <p className="text-sm">
                    {isExpired ? 'QR Code expirado' : 'QR Code não disponível'}
                  </p>
                  <p className="text-xs mt-1">
                    Tente conectar novamente
                  </p>
                </div>
              </div>
            )}
          </div>

          {expiresAt && !isExpired && (
            <div className="text-center text-sm text-muted-foreground">
              Expira em: {new Date(expiresAt).toLocaleString('pt-BR')}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
