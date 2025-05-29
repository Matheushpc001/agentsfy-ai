
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Agent, Customer } from "@/types";
import { Prompt } from "@/types/prompts";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import { useCreateAgentModal } from "@/hooks/useCreateAgentModal";
import CreateAgentModalHeader from "./CreateAgentModalHeader";
import CreateAgentModalContent from "./CreateAgentModalContent";

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
  
  const {
    activeTab,
    setActiveTab,
    isNewCustomer,
    setIsNewCustomer,
    selectedCustomerId,
    formData,
    customerData,
    knowledgeBaseFile,
    selectedPromptId,
    handleChange,
    handleCustomerChange,
    handleCustomerSelect,
    handleSwitchChange,
    handleFileChange,
    handlePromptSelect,
    validateAgentForm,
    validateCustomerForm,
    nextTab,
    prevTab,
  } = useCreateAgentModal({ editing, selectedPrompt, open });

  // Update the prompt selection handler to work with the prompts array
  const handlePromptSelectWithPrompts = (value: string) => {
    handlePromptSelect(value);
    
    if (value) {
      const selectedPrompt = prompts.find(p => p.id === value);
      if (selectedPrompt) {
        // This will be handled by the hook's effect
      }
    }
  };

  const handleSubmit = () => {
    if (!validateAgentForm() || !validateCustomerForm()) {
      return;
    }
    
    // Submit with customer data if it's a new customer
    if (isNewCustomer) {
      onSubmit(formData, customerData, true);
    } else {
      // If using existing customer, just pass the ID
      onSubmit(
        { 
          ...formData, 
          customerId: selectedCustomerId 
        }, 
        undefined, 
        false
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className={`
        ${isMobile ? 'w-[95vw] h-[90vh] max-w-none' : 'w-full max-w-4xl h-[85vh]'} 
        p-0 flex flex-col max-h-[90vh] overflow-hidden
      `}>
        <CreateAgentModalHeader editing={!!editing} />
        
        <CreateAgentModalContent
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isNewCustomer={isNewCustomer}
          setIsNewCustomer={setIsNewCustomer}
          selectedCustomerId={selectedCustomerId}
          formData={formData}
          customerData={customerData}
          knowledgeBaseFile={knowledgeBaseFile}
          selectedPromptId={selectedPromptId}
          editing={editing}
          existingCustomers={existingCustomers}
          prompts={prompts}
          onFormChange={handleChange}
          onCustomerChange={handleCustomerChange}
          onCustomerSelect={handleCustomerSelect}
          onSwitchChange={handleSwitchChange}
          onFileChange={handleFileChange}
          onPromptSelect={handlePromptSelectWithPrompts}
          onOpenPromptsLibrary={onOpenPromptsLibrary}
          onNext={nextTab}
          onPrevious={prevTab}
          onClose={onClose}
          onSubmit={handleSubmit}
        />
      </DialogContent>
    </Dialog>
  );
}
