
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Customer } from "@/types/whatsapp";

interface NewConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateConnection: (connection: {
    name: string;
    phoneNumber: string;
    customerId: string;
  }) => void;
  customers: Customer[];
}

export default function NewConnectionModal({
  isOpen,
  onClose,
  onCreateConnection,
  customers
}: NewConnectionModalProps) {
  const [newConnection, setNewConnection] = useState({
    name: "",
    phoneNumber: "",
    customerId: ""
  });

  const handleCreateConnection = () => {
    onCreateConnection(newConnection);
    setNewConnection({ name: "", phoneNumber: "", customerId: "" });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nova Conexão WhatsApp</DialogTitle>
          <DialogDescription>
            Crie uma nova conexão WhatsApp para um cliente. Depois de criar, será necessário conectar via QR Code.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              Nome da conexão
            </label>
            <Input
              id="name"
              placeholder="Ex: Atendimento Principal"
              value={newConnection.name}
              onChange={(e) => setNewConnection({...newConnection, name: e.target.value})}
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="customer" className="text-sm font-medium">
              Cliente
            </label>
            <select
              id="customer"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              value={newConnection.customerId}
              onChange={(e) => setNewConnection({...newConnection, customerId: e.target.value})}
            >
              <option value="">Selecione um cliente</option>
              {customers.map(customer => (
                <option key={customer.id} value={customer.id}>{customer.name}</option>
              ))}
            </select>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="phone" className="text-sm font-medium">
              Número de telefone (opcional)
            </label>
            <Input
              id="phone"
              placeholder="Ex: +55 11 99999-9999"
              value={newConnection.phoneNumber}
              onChange={(e) => setNewConnection({...newConnection, phoneNumber: e.target.value})}
            />
            <p className="text-xs text-muted-foreground">
              O número será confirmado após conexão com WhatsApp.
            </p>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleCreateConnection}>
            Criar Conexão
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
