
import { WhatsAppConnection } from "@/types/whatsapp";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface ConnectionSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  connection: WhatsAppConnection | null;
  onDeleteConnection: (connectionId: string) => void;
}

export default function ConnectionSettings({
  isOpen,
  onClose,
  connection,
  onDeleteConnection
}: ConnectionSettingsProps) {
  if (!connection) return null;
  
  const handleDelete = () => {
    onDeleteConnection(connection.id);
    onClose();
  };
  
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Configurações da Conexão</SheetTitle>
          <SheetDescription>
            {connection.name} - {connection.customerName}
          </SheetDescription>
        </SheetHeader>
        
        <div className="py-6 space-y-6">
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Informações da Conexão</h3>
            <div className="grid gap-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Status:</span>
                <span className="text-sm font-medium">
                  {connection.status === "connected" ? (
                    <span className="text-green-600">Conectado</span>
                  ) : connection.status === "pending" ? (
                    <span className="text-yellow-600">Pendente</span>
                  ) : (
                    <span className="text-red-600">Desconectado</span>
                  )}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Número:</span>
                <span className="text-sm font-medium">{connection.phoneNumber}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Mensagens:</span>
                <span className="text-sm font-medium">{connection.messageCount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Última atividade:</span>
                <span className="text-sm font-medium">
                  {connection.lastActive ? new Date(connection.lastActive).toLocaleDateString() : "-"}
                </span>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Configurações</h3>
            <div className="space-y-2">
              <label htmlFor="conn-name" className="text-sm">Nome da conexão</label>
              <Input 
                id="conn-name"
                defaultValue={connection.name}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="font-medium text-sm">Receber notificações</span>
                <span className="text-xs text-muted-foreground">Alertas sobre desconexões</span>
              </div>
              <div>
                {/* Aqui seria implementado um switch/toggle */}
                <button className="bg-primary h-5 w-10 rounded-full relative">
                  <span className="absolute right-1 top-1 h-3 w-3 rounded-full bg-white"></span>
                </button>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="font-medium text-sm">Resposta automática</span>
                <span className="text-xs text-muted-foreground">Usar IA para responder mensagens</span>
              </div>
              <div>
                {/* Aqui seria implementado um switch/toggle */}
                <button className="bg-muted h-5 w-10 rounded-full relative">
                  <span className="absolute left-1 top-1 h-3 w-3 rounded-full bg-white"></span>
                </button>
              </div>
            </div>
          </div>
          
          <div className="pt-4">
            <Button variant="outline" className="w-full" onClick={onClose}>
              Salvar Configurações
            </Button>
          </div>
          
          <div className="pt-2">
            <Button 
              variant="destructive" 
              className="w-full"
              onClick={handleDelete}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Remover Conexão
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
