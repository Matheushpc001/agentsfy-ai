
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Customer } from "@/types";
import { toast } from "sonner";

interface CreateCustomerModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (customer: Partial<Customer>) => void;
  editing?: Customer;
}

export default function CreateCustomerModal({
  open,
  onClose,
  onSubmit,
  editing
}: CreateCustomerModalProps) {
  const [formData, setFormData] = useState<Partial<Customer>>(
    editing || {
      businessName: "",
      name: "",
      email: "",
      document: "",
      contactPhone: "",
    }
  );

  // Reset form when modal opens/closes or editing changes
  useEffect(() => {
    if (open) {
      if (editing) {
        setFormData({ ...editing });
      } else {
        setFormData({
          businessName: "",
          name: "",
          email: "",
          document: "",
          contactPhone: "",
        });
      }
    }
  }, [open, editing]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.businessName || !formData.name || !formData.email) {
      toast.error("Por favor, preencha todos os campos obrigatórios");
      return;
    }
    
    onSubmit(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-w-[90vw]">
        <DialogHeader>
          <DialogTitle>{editing ? "Editar Cliente" : "Novo Cliente"}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="businessName">Nome da Empresa</Label>
            <Input
              id="businessName"
              name="businessName"
              value={formData.businessName}
              onChange={handleChange}
              placeholder="Nome da empresa cliente"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Nome do Responsável</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Nome da pessoa responsável"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="document">CNPJ/CPF</Label>
            <Input
              id="document"
              name="document"
              value={formData.document}
              onChange={handleChange}
              placeholder="Documento do cliente (CNPJ ou CPF)"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email para acesso ao painel"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contactPhone">WhatsApp para contato</Label>
            <Input
              id="contactPhone"
              name="contactPhone"
              value={formData.contactPhone}
              onChange={handleChange}
              placeholder="Número para contato do responsável"
            />
            <p className="text-xs text-muted-foreground">
              Este é apenas para contato com o responsável, não é o número que será vinculado ao agente.
            </p>
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">
              {editing ? "Salvar Alterações" : "Criar Cliente"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
