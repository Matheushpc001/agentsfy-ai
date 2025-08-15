// src/components/customers/CreateCustomerModal.tsx

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Customer } from "@/types";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import CreateCustomerModalForm from "./CreateCustomerModalForm";

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

  const validateForm = () => {
    if (!formData.businessName.trim()) {
      toast.error("Nome da empresa é obrigatório");
      return false;
    }
    
    if (!formData.name.trim()) {
      toast.error("Nome do responsável é obrigatório");
      return false;
    }
    
    if (!formData.email.trim()) {
      toast.error("Email é obrigatório");
      return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Email inválido");
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    if (!user || user.role !== 'franchisee') {
      toast.error("Ação não permitida.");
      return;
    }

    setIsSubmitting(true);
    const loadingToast = toast.loading("Criando cliente e enviando convite...");

    try {
      const cleanedPhone = formData.contactPhone.replace(/\D/g, '');
          const finalPhone = cleanedPhone && !cleanedPhone.startsWith('55') ? `55${cleanedPhone}` : cleanedPhone;
          const cleanedDocument = formData.document.replace(/\D/g, '');

          const cleanFormData = {
            ...formData,
            contactPhone: finalPhone,
            document: cleanedDocument,
          };

      const { data, error } = await supabase.functions.invoke('create-customer', {
        body: {
          franchiseeId: user.id,
          customerData: cleanFormData
        }
      });

      if (error) throw error;
      
      toast.dismiss(loadingToast);
      toast.success("Cliente criado com sucesso! Um email de convite foi enviado para ele definir a senha.");
      
      onSuccess(data.customer);
      onClose();
      setFormData({ businessName: "", name: "", email: "", document: "", contactPhone: "" });

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
          <CreateCustomerModalForm 
            formData={formData}
            onFormDataChange={setFormData}
          />

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Salvando..." : "Salvar e Enviar Convite"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}