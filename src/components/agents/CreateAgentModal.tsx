// src/components/agents/CreateAgentModal.tsx - VERSÃO REATORADA E UNIFICADA

import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Agent, Customer } from "@/types";
import { Prompt } from "@/types/prompts";
import { useIsMobile } from "@/hooks/use-mobile";
import { useCreateAgentModal } from "@/hooks/useCreateAgentModal";
import CreateAgentModalHeader from "./CreateAgentModalHeader";
import CreateAgentModalContent from "./CreateAgentModalContent";
// ADICIONADO: Importar o modal de cliente para reutilização
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
  
  // ADICIONADO: Estado para controlar o modal de criação de cliente
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  // ADICIONADO: Estado local para a lista de clientes, para que possamos atualizá-la
  const [localCustomers, setLocalCustomers] = useState<Customer[]>(existingCustomers);

  useEffect(() => {
    // Sincroniza a lista local com a propriedade quando ela mudar
    setLocalCustomers(existingCustomers);
  }, [existingCustomers]);
  
  const {
    activeTab,
    setActiveTab,
    isNewCustomer,
    setIsNewCustomer,
    selectedCustomerId,
    setSelectedCustomerId, // Precisamos do setter agora
    formData,
    // customerData não é mais necessário aqui, será gerenciado pelo outro modal
    knowledgeBaseFile,
    selectedPromptId,
    handleChange,
    // handleCustomerChange também não é mais necessário
    handleCustomerSelect,
    handleSwitchChange,
    handleFileChange,
    handlePromptSelect,
    validateAgentForm,
    validateCustomerForm,
    nextTab,
    prevTab,
  } = useCreateAgentModal({ editing, selectedPrompt, open });

  // ADICIONADO: Callback para quando um novo cliente é criado com sucesso
  const handleCustomerCreationSuccess = (newCustomer: Customer) => {
    // Adiciona o novo cliente à lista local
    const updatedCustomers = [newCustomer, ...localCustomers];
    setLocalCustomers(updatedCustomers);
    
    // Fecha o modal de cliente
    setIsCustomerModalOpen(false);
    
    // Mágica: muda para "vincular existente" e já seleciona o cliente recém-criado
    setIsNewCustomer(false);
    setSelectedCustomerId(newCustomer.id);
  };

  const handlePromptSelectWithPrompts = (value: string) => {
    handlePromptSelect(value);
    const selected = prompts.find(p => p.id === value);
    if (selected) {
      handleChange({ target: { name: 'prompt', value: selected.text } } as any);
    }
  };

  const handleSubmit = () => {
    if (!validateAgentForm()) return;
    
    // A validação do cliente agora é mais simples
    if (!isNewCustomer && !selectedCustomerId) {
        toast.error("Por favor, selecione um cliente para vincular o agente.");
        return;
    }
    
    // A opção de criar cliente aqui foi removida, pois é feita no modal separado
    if (isNewCustomer) {
        toast.error("Por favor, cadastre o novo cliente primeiro usando o formulário dedicado.");
        return;
    }

    onSubmit(
        { ...formData, customerId: selectedCustomerId }, 
        undefined, 
        false
    );
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
            selectedCustomerId={selectedCustomerId}
            formData={formData}
            knowledgeBaseFile={knowledgeBaseFile}
            selectedPromptId={selectedPromptId}
            editing={editing}
            existingCustomers={localCustomers} // Usa a lista local
            onFormChange={handleChange}
            onCustomerSelect={handleCustomerSelect}
            onAddNewCustomerClick={() => setIsCustomerModalOpen(true)} // Abre o modal de cliente
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
      
      {/* ADICIONADO: O modal de cliente é renderizado aqui, pronto para ser usado */}
      <CreateCustomerModal
        open={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        onSuccess={handleCustomerCreationSuccess}
      />
    </>
  );
}