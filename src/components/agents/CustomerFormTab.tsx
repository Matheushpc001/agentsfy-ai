// src/components/agents/CustomerFormTab.tsx - VERSÃO REATORADA E SIMPLIFICADA

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DialogFooter } from "@/components/ui/dialog";
import { Customer } from "@/types";
import { PlusCircle } from "lucide-react";

interface CustomerFormTabProps {
  customerLinkOption: 'new' | 'existing';
  selectedCustomerId: string;
  existingCustomers: Customer[];
  onCustomerLinkOptionChange: (option: 'new' | 'existing') => void;
  onCustomerSelect: (value: string) => void;
  onAddNewCustomerClick: () => void; // Novo prop
  onPrevious: () => void;
  onClose: () => void;
  onSubmit: () => void;
  isEditing: boolean;
}

export default function CustomerFormTab({
  customerLinkOption,
  selectedCustomerId,
  existingCustomers,
  onCustomerLinkOptionChange,
  onCustomerSelect,
  onAddNewCustomerClick,
  onPrevious,
  onClose,
  onSubmit,
  isEditing
}: CustomerFormTabProps) {
  return (
    <div className="space-y-6">
      {!isEditing && (
        <RadioGroup
          defaultValue="new"
          value={customerLinkOption}
          onValueChange={onCustomerLinkOptionChange}
          className="grid grid-cols-2 gap-4"
        >
          <div>
            <RadioGroupItem value="new" id="new" className="peer sr-only" />
            <Label htmlFor="new" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
              <PlusCircle className="mb-3 h-6 w-6" />
              Cadastrar Novo Cliente
            </Label>
          </div>
          <div>
            <RadioGroupItem value="existing" id="existing" className="peer sr-only" />
            <Label htmlFor="existing" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="mb-3 h-6 w-6"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
              Vincular a Cliente Existente
            </Label>
          </div>
        </RadioGroup>
      )}

      {customerLinkOption === 'existing' || isEditing ? (
        <div className="space-y-2">
          <Label htmlFor="customerId">Selecione um cliente *</Label>
          <Select value={selectedCustomerId} onValueChange={onCustomerSelect} disabled={isEditing}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione um cliente da sua lista" />
            </SelectTrigger>
            <SelectContent>
              {existingCustomers.length > 0 ? (
                existingCustomers.map(customer => (
                  <SelectItem key={customer.id} value={customer.id}>
                    {customer.businessName} {/* <-- PARA esta linha */}
                  </SelectItem>
                ))
              ) : (
                <div className="p-4 text-center text-sm text-muted-foreground">Nenhum cliente cadastrado.</div>
              )}
            </SelectContent>
          </Select>
        </div>
      ) : (
        <div className="text-center p-4 border-2 border-dashed rounded-lg">
          <p className="text-muted-foreground mb-4">
            O formulário de cadastro de cliente será aberto em uma nova janela para garantir a segurança e o envio do convite.
          </p>
          <Button type="button" variant="outline" onClick={onAddNewCustomerClick}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Abrir Formulário de Cliente
          </Button>
        </div>
      )}

      <DialogFooter className="flex justify-between pt-4">
        <Button type="button" variant="outline" onClick={onPrevious}>
          Voltar
        </Button>
        <div className="flex gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button 
            type="button" 
            onClick={onSubmit} 
            disabled={!isEditing && customerLinkOption === 'new'} // Desabilita se "novo cliente" for selecionado mas não cadastrado
          >
            {isEditing ? "Salvar Alterações" : "Criar Agente"}
          </Button>
        </div>
      </DialogFooter>
    </div>
  );
}