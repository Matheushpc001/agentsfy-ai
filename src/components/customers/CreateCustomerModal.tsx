// src/components/customers/CreateCustomerModal.tsx

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Customer } from "@/types";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

interface CreateCustomerModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (newCustomer: Customer) => void; // Callback para notificar sobre o sucesso
}

export default function CreateCustomerModal({ open, onClose, onSuccess }: CreateCustomerModalProps) {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    businessName: "",
    name: "",
    email: "",
    document: "",
    contactPhone: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || user.role !== 'franchisee') {
      toast.error("Ação não permitida.");
      return;
    }

    setIsSubmitting(true);
    const loadingToast = toast.loading("Criando cliente e enviando convite...");

    try {
      const { data, error } = await supabase.functions.invoke('create-customer', {
        body: {
          franchiseeId: user.id,
          customerData: formData
        }
      });

      if (error) throw error;
      
      toast.dismiss(loadingToast);
      toast.success("Cliente criado com sucesso! Um email de convite foi enviado para ele definir a senha.");
      
      onSuccess(data.customer); // Notifica o componente pai
      onClose(); // Fecha o modal
      setFormData({ businessName: "", name: "", email: "", document: "", contactPhone: "" }); // Reseta o form

    } catch (error: any) {
      toast.dismiss(loadingToast);
      console.error("Erro ao criar cliente:", error);
      toast.error(error.message || "Falha ao criar o cliente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Novo Cliente</DialogTitle>
          <DialogDescription>
            Insira os dados do cliente. Ele receberá um email para definir a senha de acesso ao portal.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {/* ... campos do formulário ... */}
          {/* O resto do formulário (Inputs para businessName, name, email, etc.) permanece igual */}
          <div className="space-y-2">
              <Label htmlFor="businessName">Nome da Empresa *</Label>
              <Input id="businessName" name="businessName" value={formData.businessName} onChange={handleChange} required />
          </div>
          <div className="space-y-2">
              <Label htmlFor="name">Nome do Responsável *</Label>
              <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
          </div>
          <div className="space-y-2">
              <Label htmlFor="email">Email de Acesso *</Label>
              <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required />
          </div>
          <div className="space-y-2">
              <Label htmlFor="document">CNPJ/CPF</Label>
              <Input id="document" name="document" value={formData.document} onChange={handleChange} />
          </div>
          <div className="space-y-2">
              <Label htmlFor="contactPhone">WhatsApp para Contato</Label>
              <Input id="contactPhone" name="contactPhone" value={formData.contactPhone} onChange={handleChange} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>Cancelar</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Salvando..." : "Salvar e Enviar Convite"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}