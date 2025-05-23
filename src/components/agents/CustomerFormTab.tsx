
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DialogFooter } from "@/components/ui/dialog";
import { Customer } from "@/types";

interface CustomerFormTabProps {
  isNewCustomer: boolean;
  selectedCustomerId: string;
  customerData: Partial<Customer>;
  existingCustomers: Customer[];
  editing?: boolean;
  onNewCustomerChange: (checked: boolean) => void;
  onCustomerSelect: (value: string) => void;
  onCustomerDataChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onPrevious: () => void;
  onClose: () => void;
  onSubmit: () => void;
  isEditing: boolean;
}

export default function CustomerFormTab({
  isNewCustomer,
  selectedCustomerId,
  customerData,
  existingCustomers,
  editing,
  onNewCustomerChange,
  onCustomerSelect,
  onCustomerDataChange,
  onPrevious,
  onClose,
  onSubmit,
  isEditing
}: CustomerFormTabProps) {
  return (
    <div className="space-y-4">
      {!editing && (
        <div className="flex items-center space-x-2 mb-4">
          <Checkbox 
            id="isNewCustomer" 
            checked={!isNewCustomer} 
            onCheckedChange={(checked) => onNewCustomerChange(!checked)}
          />
          <Label htmlFor="isNewCustomer">Vincular a um cliente existente</Label>
        </div>
      )}

      {!isNewCustomer ? (
        <div className="space-y-2">
          <Label htmlFor="customerId">Selecione um cliente</Label>
          <Select value={selectedCustomerId} onValueChange={onCustomerSelect}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione um cliente" />
            </SelectTrigger>
            <SelectContent>
              {existingCustomers.map(customer => (
                <SelectItem key={customer.id} value={customer.id}>
                  {customer.businessName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            <Label htmlFor="businessName">Nome da Empresa</Label>
            <Input
              id="businessName"
              name="businessName"
              value={customerData.businessName || ""}
              onChange={onCustomerDataChange}
              placeholder="Nome da empresa cliente"
              required={isNewCustomer}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="customerName">Nome do Responsável</Label>
            <Input
              id="name"
              name="name"
              value={customerData.name || ""}
              onChange={onCustomerDataChange}
              placeholder="Nome da pessoa responsável"
              required={isNewCustomer}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="document">CNPJ/CPF</Label>
            <Input
              id="document"
              name="document"
              value={customerData.document || ""}
              onChange={onCustomerDataChange}
              placeholder="Documento do cliente (CNPJ ou CPF)"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="customerEmail">E-mail</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={customerData.email || ""}
              onChange={onCustomerDataChange}
              placeholder="Email para acesso ao painel"
              required={isNewCustomer}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contactPhone">WhatsApp para contato</Label>
            <Input
              id="contactPhone"
              name="contactPhone"
              value={customerData.contactPhone || ""}
              onChange={onCustomerDataChange}
              placeholder="Número para contato do responsável"
            />
            <p className="text-xs text-muted-foreground">
              Este é apenas para contato com o responsável, não é o número que será vinculado ao agente.
            </p>
          </div>
        </>
      )}

      <DialogFooter className="flex justify-between pt-4">
        <Button type="button" variant="outline" onClick={onPrevious}>
          Voltar
        </Button>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="button" onClick={onSubmit}>
            {isEditing ? "Salvar Alterações" : "Criar Agente"}
          </Button>
        </div>
      </DialogFooter>
    </div>
  );
}
