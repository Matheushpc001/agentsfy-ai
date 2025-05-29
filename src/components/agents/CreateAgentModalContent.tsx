
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import AgentFormTab from "./AgentFormTab";
import CustomerFormTab from "./CustomerFormTab";
import { Agent, Customer } from "@/types";
import { Prompt } from "@/types/prompts";

interface CreateAgentModalContentProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isNewCustomer: boolean;
  setIsNewCustomer: (isNew: boolean) => void;
  selectedCustomerId: string;
  formData: Partial<Agent>;
  customerData: Partial<Customer>;
  knowledgeBaseFile: File | null;
  selectedPromptId: string;
  editing?: Agent;
  existingCustomers: Customer[];
  prompts: Prompt[];
  onFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onCustomerChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onCustomerSelect: (value: string) => void;
  onSwitchChange: (checked: boolean) => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPromptSelect: (value: string) => void;
  onOpenPromptsLibrary?: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onClose: () => void;
  onSubmit: () => void;
}

export default function CreateAgentModalContent({
  activeTab,
  setActiveTab,
  isNewCustomer,
  setIsNewCustomer,
  selectedCustomerId,
  formData,
  customerData,
  knowledgeBaseFile,
  selectedPromptId,
  editing,
  existingCustomers,
  prompts,
  onFormChange,
  onCustomerChange,
  onCustomerSelect,
  onSwitchChange,
  onFileChange,
  onPromptSelect,
  onOpenPromptsLibrary,
  onNext,
  onPrevious,
  onClose,
  onSubmit,
}: CreateAgentModalContentProps) {
  return (
    <ScrollArea className="max-h-[calc(90vh-130px)] px-6 flex-1 min-h-0">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="agent">Dados do Agente</TabsTrigger>
          <TabsTrigger value="customer">Dados do Cliente</TabsTrigger>
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
              isNewCustomer={isNewCustomer}
              selectedCustomerId={selectedCustomerId}
              customerData={customerData}
              existingCustomers={existingCustomers}
              editing={!!editing}
              onNewCustomerChange={setIsNewCustomer}
              onCustomerSelect={onCustomerSelect}
              onCustomerDataChange={onCustomerChange}
              onPrevious={onPrevious}
              onClose={onClose}
              onSubmit={onSubmit}
              isEditing={!!editing}
            />
          </TabsContent>
        </form>
      </Tabs>
    </ScrollArea>
  );
}
