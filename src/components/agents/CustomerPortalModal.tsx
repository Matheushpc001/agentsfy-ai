
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";
import { CustomerPortalAccess } from "@/types";

interface CustomerPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  portalAccess: CustomerPortalAccess | null;
  onSendEmail: () => void;
}

export default function CustomerPortalModal({
  isOpen,
  onClose,
  portalAccess,
  onSendEmail
}: CustomerPortalModalProps) {
  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copiado para a área de transferência!");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Acesso ao Portal do Cliente</DialogTitle>
          <DialogDescription>
            O portal do cliente foi criado com sucesso. Compartilhe estas informações com o cliente.
          </DialogDescription>
        </DialogHeader>
        
        {portalAccess && (
          <div className="space-y-6 py-4">
            <div className="bg-muted p-4 rounded-lg text-center">
              <Check size={40} className="mx-auto text-green-500 mb-2" />
              <h3 className="text-lg font-medium">Cliente e Agente criados com sucesso!</h3>
              <p className="text-sm text-muted-foreground">
                O cliente já pode acessar seu portal e configurar seu WhatsApp
              </p>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-1">URL do Portal</p>
                <div className="flex">
                  <Input readOnly value={portalAccess.url} className="flex-1" />
                  <Button 
                    variant="outline" 
                    className="ml-2" 
                    size="icon"
                    onClick={() => handleCopyToClipboard(portalAccess.url)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium mb-1">Usuário</p>
                  <div className="flex">
                    <Input readOnly value={portalAccess.username} />
                    <Button 
                      variant="outline" 
                      className="ml-2" 
                      size="icon"
                      onClick={() => handleCopyToClipboard(portalAccess.username)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Senha</p>
                  <div className="flex">
                    <Input readOnly value={portalAccess.password} type="text" />
                    <Button 
                      variant="outline" 
                      className="ml-2" 
                      size="icon"
                      onClick={() => handleCopyToClipboard(portalAccess.password)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
          <Button onClick={onSendEmail}>
            Enviar credenciais por Email
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
