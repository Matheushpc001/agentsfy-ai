import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Agent, Customer } from "@/types";
import { Prompt } from "@/types/prompts";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import AgentFormTab from "./AgentFormTab";
import CustomerFormTab from "./CustomerFormTab";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const [activeTab, setActiveTab] = useState<string>("agent");
  const [isNewCustomer, setIsNewCustomer] = useState(true);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");
  const [formData, setFormData] = useState<Partial<Agent>>(
    editing || {
      name: "",
      sector: "",
      prompt: "",
      openAiKey: "",
      enableVoiceRecognition: false,
      knowledgeBase: "",
    }
  );
  
  const [customerData, setCustomerData] = useState<Partial<Customer>>({
    businessName: "",
    name: "",
    email: "",
    document: "",
    contactPhone: "",
  });

  const [knowledgeBaseFile, setKnowledgeBaseFile] = useState<File | null>(null);
  const [selectedPromptId, setSelectedPromptId] = useState<string>("");
  const isMobile = useIsMobile();

  // Reset form when modal opens/closes or editing changes
  useEffect(() => {
    if (open) {
      setActiveTab("agent");
      if (editing) {
        setFormData({...editing});
        setIsNewCustomer(false);
        if (editing.customerId) {
          setSelectedCustomerId(editing.customerId);
        }
      } else {
        setFormData({
          name: "",
          sector: "",
          prompt: "",
          openAiKey: "",
          enableVoiceRecognition: false,
          knowledgeBase: "",
        });
        setCustomerData({
          businessName: "",
          name: "",
          email: "",
          document: "",
          contactPhone: "",
        });
        setIsNewCustomer(true);
        setSelectedCustomerId("");
      }
      setKnowledgeBaseFile(null);
      setSelectedPromptId("");
    }
  }, [open, editing]);

  // Update the prompt field when a prompt is selected from the library
  useEffect(() => {
    if (selectedPrompt) {
      setFormData(prev => ({
        ...prev,
        prompt: selectedPrompt.text
      }));
      setSelectedPromptId(selectedPrompt.id);
    }
  }, [selectedPrompt]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCustomerChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCustomerData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCustomerSelect = (value: string) => {
    setSelectedCustomerId(value);
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      enableVoiceRecognition: checked,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setKnowledgeBaseFile(file);
      
      // Store the file name or URL in formData
      setFormData((prev) => ({
        ...prev,
        knowledgeBase: file.name,
      }));
    }
  };

  const handlePromptSelect = (value: string) => {
    setSelectedPromptId(value);
    
    if (value) {
      const selectedPrompt = prompts.find(p => p.id === value);
      if (selectedPrompt) {
        setFormData((prev) => ({
          ...prev,
          prompt: selectedPrompt.text
        }));
      }
    }
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.sector) {
      toast.error("Por favor, preencha todos os campos obrigatórios do agente");
      return;
    }

    if (!formData.openAiKey || !formData.openAiKey.startsWith("sk-")) {
      toast.error("Por favor, forneça uma chave válida da OpenAI");
      return;
    }

    // Validate customer data if creating a new customer
    if (isNewCustomer) {
      if (!customerData.businessName || !customerData.name || !customerData.email) {
        setActiveTab("customer");
        toast.error("Por favor, preencha os dados obrigatórios do cliente");
        return;
      }
    } else if (!selectedCustomerId) {
      setActiveTab("customer");
      toast.error("Por favor, selecione um cliente existente");
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

  const nextTab = () => {
    if (!formData.name || !formData.sector || !formData.openAiKey) {
      toast.error("Por favor, preencha todos os campos obrigatórios antes de continuar");
      return;
    }
    
    if (!formData.openAiKey.startsWith("sk-")) {
      toast.error("Por favor, forneça uma chave válida da OpenAI");
      return;
    }
    
    setActiveTab("customer");
  };

  const prevTab = () => {
    setActiveTab("agent");
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className={`
        ${isMobile ? 'w-[95vw] h-[90vh] max-w-none' : 'w-full max-w-4xl h-[85vh]'} 
        p-0 flex flex-col max-h-[90vh] overflow-hidden
      `}>
        <DialogHeader className="p-6 pb-2 flex-shrink-0">
          <DialogTitle>{editing ? "Editar Agente" : "Criar Novo Agente"}</DialogTitle>
        </DialogHeader>
        
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
                  onFormChange={handleChange}
                  onSwitchChange={handleSwitchChange}
                  onFileChange={handleFileChange}
                  onPromptSelect={handlePromptSelect}
                  onOpenPromptsLibrary={onOpenPromptsLibrary}
                  onNext={nextTab}
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
                  onCustomerSelect={handleCustomerSelect}
                  onCustomerDataChange={handleCustomerChange}
                  onPrevious={prevTab}
                  onClose={onClose}
                  onSubmit={handleSubmit}
                  isEditing={!!editing}
                />
              </TabsContent>
            </form>
          </Tabs>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
