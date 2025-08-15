// src/components/agents/CreateAgentModal.tsx - VERSÃO FINAL E CORRIGIDA

import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button"; // Importe o Button se necessário
import { Agent, Customer } from "@/types";
import { Prompt } from "@/types/prompts";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import { useCreateAgentModal } from "@/hooks/useCreateAgentModal";
import CreateAgentModalHeader from "./CreateAgentModalHeader";
import CreateAgentModalContent from "./CreateAgentModalContent";
import CreateCustomerModal from "@/components/customers/CreateCustomerModal";

interface CreateAgentModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (agent: Partial<Agent>, customer?: Partial<Customer>, isNewCustomer?: boolean) => void;
  editing?: Agent;
  existingCustomers?: Customer[];
  prompts?: Prompt[];
  selectedPrompt?: Prompt | null;
  onOpenPromptsLibrary?: () => void;
}

export default function CreateAgentModal({ 
  open, 
  onClose, 
  onSubmit, 
  editing, 
  existingCustomers = [],
  prompts = [],
  selectedPrompt = null,
  onOpenPromptsLibrary
}: CreateAgentModalProps) {
  const isMobile = useIsMobile();
  
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [localCustomers, setLocalCustomers] = useState<Customer[]>(existingCustomers);

  useEffect(() => {
    setLocalCustomers(existingCustomers);
  }, [existingCustomers, open]); // Atualiza também quando o modal abre

  const {
    activeTab,
    setActiveTab,
    isNewCustomer,
    setIsNewCustomer,
    selectedCustomerId,
    setSelectedCustomerId,
    formData,
    knowledgeBaseFile,
    selectedPromptId,
    handleChange,
    handleCustomerSelect,
    handleSwitchChange,
    handleFileChange,
    handlePromptSelect,
    validateAgentForm,
    nextTab,
    prevTab,
  } = useCreateAgentModal({ editing, selectedPrompt, open });

  const handleCustomerCreationSuccess = (newCustomer: Customer) => {
    const updatedCustomers = [newCustomer, ...localCustomers];
    setLocalCustomers(updatedCustomers);
    setIsCustomerModalOpen(false);
    setIsNewCustomer(false);
    setSelectedCustomerId(newCustomer.id);
  };

  const handlePromptSelectWithPrompts = (value: string) => {
    const selected = prompts.find(p => p.id === value);
    if (selected) {
      handleChange({ target: { name: 'prompt', value: selected.text } } as any);
      handlePromptSelect(value);
    }
  };

  const handleSubmit = () => {
    if (!validateAgentForm()) {
      setActiveTab('agent'); // Volta para a aba com erro
      return;
    }
    
    if (isNewCustomer) {
      toast.error("Por favor, cadastre o novo cliente primeiro clicando no botão apropriado.");
      setActiveTab('customer');
      return;
    }
    
    if (!selectedCustomerId) {
      toast.error("Por favor, selecione um cliente para vincular o agente.");
      setActiveTab('customer');
      return;
    }

    onSubmit({ ...formData, customerId: selectedCustomerId }, undefined, false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className={`
          ${isMobile ? 'w-[95vw] h-[90vh] max-w-none' : 'w-full max-w-4xl h-[85vh]'} 
          p-0 flex flex-col max-h-[90vh] overflow-hidden
        `}>
          <CreateAgentModalHeader editing={!!editing} />
          
          <CreateAgentModalContent
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            customerLinkOption={isNewCustomer ? 'new' : 'existing'}
            onCustomerLinkOptionChange={(option) => setIsNewCustomer(option === 'new')}
            onAddNewCustomerClick={() => setIsCustomerModalOpen(true)}
            selectedCustomerId={selectedCustomerId}
            formData={formData}
            knowledgeBaseFile={knowledgeBaseFile}
            selectedPromptId={selectedPromptId}
            editing={editing}
            existingCustomers={localCustomers}
            prompts={prompts}
            onFormChange={handleChange}
            onCustomerSelect={handleCustomerSelect}
            onSwitchChange={handleSwitchChange}
            onFileChange={handleFileChange}
            onPromptSelect={handlePromptSelectWithPrompts}
            onOpenPromptsLibrary={onOpenPromptsLibrary}
            onNext={nextTab}
            onPrevious={prevTab}
            onClose={onClose}
            onSubmit={handleSubmit}
            isEditing={!!editing}
          />
        </DialogContent>
      </Dialog>
      
      <CreateCustomerModal
        open={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        onSuccess={handleCustomerCreationSuccess}
      />
    </>
  );
}