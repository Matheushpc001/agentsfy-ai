// src/components/customers/ManageCustomerModal.tsx

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Customer } from "@/types";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface ManageCustomerModalProps {
  open: boolean;
  customer: Customer | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ManageCustomerModal({ open, customer, onClose, onSuccess }: ManageCustomerModalProps) {
  const [formData, setFormData] = useState<Partial<Customer>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (customer) {
      setFormData({
        business_name: customer.business_name || '',
        name: customer.name || '',
        document: customer.document || '',
        contact_phone: customer.contact_phone || '',
        status: customer.status || 'active',
      });
    } else {
      setFormData({});
    }
  }, [customer]);

  if (!customer) return null;

  const handleInputChange = (field: keyof Partial<Customer>, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleStatusChange = (isChecked: boolean) => {
    const newStatus = isChecked ? 'active' : 'inactive';
    setFormData(prev => ({ ...prev, status: newStatus }));
  };

  const handleUpdate = async () => {
    setIsSubmitting(true);
    const loadingToast = toast.loading("Salvando alterações...");
    try {
      const { error } = await supabase.functions.invoke('update-customer', {
        body: { customerId: customer.id, customerData: formData },
      });

      if (error) throw new Error(await error.context.json().then(d => d.error));

      toast.success("Cliente atualizado com sucesso!");
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error("Falha ao atualizar cliente", { description: error.message });
    } finally {
      setIsSubmitting(false);
      toast.dismiss(loadingToast);
    }
  };

  const handleDelete = async () => {
    setIsSubmitting(true);
    const loadingToast = toast.loading("Excluindo cliente...");
    try {
      const { error } = await supabase.functions.invoke('delete-customer', {
        body: { customerId: customer.id },
      });

      if (error) throw new Error(await error.context.json().then(d => d.error));

      toast.success("Cliente excluído com sucesso!");
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error("Falha ao excluir cliente", { description: error.message });
    } finally {
      setIsSubmitting(false);
      toast.dismiss(loadingToast);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Gerenciar Cliente</DialogTitle>
          <DialogDescription>Edite, ative ou desative o cliente. O e-mail não pode ser alterado.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="businessName">Nome da Empresa</Label>
            <Input id="businessName" value={formData.business_name} onChange={(e) => handleInputChange('business_name', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Responsável</Label>
            <Input id="name" value={formData.name} onChange={(e) => handleInputChange('name', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email de Acesso (não editável)</Label>
            <Input id="email" value={customer.email} disabled />
          </div>
          <div className="space-y-2">
            <Label htmlFor="document">CNPJ/CPF</Label>
            <Input id="document" value={formData.document} onChange={(e) => handleInputChange('document', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contactPhone">Contato</Label>
            <Input id="contactPhone" value={formData.contact_phone} onChange={(e) => handleInputChange('contact_phone', e.target.value)} />
          </div>
          <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
            <div className="space-y-0.5">
                <Label>Status do Cliente</Label>
                <p className="text-[0.8rem] text-muted-foreground">
                    {formData.status === 'active' ? 'Cliente ativo e com acesso ao sistema.' : 'Cliente inativo e sem acesso.'}
                </p>
            </div>
            <Switch
              checked={formData.status === 'active'}
              onCheckedChange={handleStatusChange}
              disabled={isSubmitting}
            />
          </div>
        </div>
        <DialogFooter className="justify-between sm:justify-between">
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button type="button" variant="destructive" disabled={isSubmitting}>Excluir</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Você tem certeza absoluta?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Essa ação não pode ser desfeita. Isso excluirá permanentemente o cliente e removerá todos os seus dados de nossos servidores.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete}>Sim, excluir cliente</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>Cancelar</Button>
                <Button type="button" onClick={handleUpdate} disabled={isSubmitting}>Salvar Alterações</Button>
            </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
