// src/components/agents/CreateAgentModalContent.tsx - VERSÃO CORRIGIDA

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import AgentFormTab from "./AgentFormTab";
import CustomerFormTab from "./CustomerFormTab";
import { Agent, Customer } from "@/types";
import { Prompt } from "@/types/prompts";

interface CreateAgentModalContentProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  // --- ALTERADO AQUI para corresponder ao novo CustomerFormTab ---
  customerLinkOption: 'new' | 'existing';
  onCustomerLinkOptionChange: (option: 'new' | 'existing') => void;
  onAddNewCustomerClick: () => void;
  // --- FIM DA ALTERAÇÃO ---
  selectedCustomerId: string;
  formData: Partial<Agent>;
  knowledgeBaseFile: File | null;
  selectedPromptId: string;
  editing?: Agent;
  existingCustomers: Customer[];
  prompts: Prompt[];
  onFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onCustomerSelect: (value: string) => void;
  onSwitchChange: (checked: boolean) => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPromptSelect: (value: string) => void;
  onOpenPromptsLibrary?: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onClose: () => void;
  onSubmit: () => void;
  isEditing: boolean;
}

export default function CreateAgentModalContent({
  activeTab,
  setActiveTab,
  // --- ALTERADO AQUI ---
  customerLinkOption,
  onCustomerLinkOptionChange,
  onAddNewCustomerClick,
  // --- FIM DA ALTERAÇÃO ---
  selectedCustomerId,
  formData,
  knowledgeBaseFile,
  selectedPromptId,
  editing,
  existingCustomers,
  prompts,
  onFormChange,
  onCustomerSelect,
  onSwitchChange,
  onFileChange,
  onPromptSelect,
  onOpenPromptsLibrary,
  onNext,
  onPrevious,
  onClose,
  onSubmit,
  isEditing,
}: CreateAgentModalContentProps) {
  return (
    <ScrollArea className="max-h-[calc(90vh-130px)] px-6 flex-1 min-h-0">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="agent">Dados do Agente</TabsTrigger>
          <TabsTrigger value="customer">Vincular Cliente</TabsTrigger>
        </TabsList>
        
        <form className="space-y-4 py-4">
          <TabsContent value="agent">
            <AgentFormTab
              formData={formData}
              prompts={prompts}
              selectedPromptId={selectedPromptId}
              onFormChange={onFormChange}
              onSwitchChange={onSwitchChange}
              onFileChange={onFileChange}
              onPromptSelect={onPromptSelect}
              onOpenPromptsLibrary={onOpenPromptsLibrary}
              onNext={onNext}
              knowledgeBaseFile={knowledgeBaseFile}
            />
          </TabsContent>

          <TabsContent value="customer">
            <CustomerFormTab
              // --- ALTERADO AQUI para passar as props corretas ---
              customerLinkOption={customerLinkOption}
              onCustomerLinkOptionChange={onCustomerLinkOptionChange}
              onAddNewCustomerClick={onAddNewCustomerClick}
              // --- FIM DA ALTERAÇÃO ---
              selectedCustomerId={selectedCustomerId}
              existingCustomers={existingCustomers}
              onCustomerSelect={onCustomerSelect}
              onPrevious={onPrevious}
              onClose={onClose}
              onSubmit={onSubmit}
              isEditing={isEditing}
            />
          </TabsContent>
        </form>
      </Tabs>
    </ScrollArea>
  );
}