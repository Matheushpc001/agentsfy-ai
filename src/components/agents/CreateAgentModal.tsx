
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Agent, Customer } from "@/types";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Upload } from "lucide-react";

interface CreateAgentModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (agent: Partial<Agent>, customer?: Partial<Customer>, isNewCustomer?: boolean) => void;
  editing?: Agent;
  existingCustomers?: Customer[];
}

export default function CreateAgentModal({ open, onClose, onSubmit, editing, existingCustomers = [] }: CreateAgentModalProps) {
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
    }
  }, [open, editing]);

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

  const handleCustomerSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCustomerId(e.target.value);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
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
      <DialogContent className="sm:max-w-lg max-w-[90vw]">
        <DialogHeader>
          <DialogTitle>{editing ? "Editar Agente" : "Criar Novo Agente"}</DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="agent">Dados do Agente</TabsTrigger>
            <TabsTrigger value="customer">Dados do Cliente</TabsTrigger>
          </TabsList>
          
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <TabsContent value="agent" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome do Agente</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Ex: Atendente Virtual"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="sector">Setor / Especialidade</Label>
                <Input
                  id="sector"
                  name="sector"
                  value={formData.sector}
                  onChange={handleChange}
                  placeholder="Ex: Atendimento ao Cliente"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="prompt" className="flex justify-between">
                  <span>Prompt da IA</span>
                  <span className="text-xs text-muted-foreground">
                    Instruções para o comportamento do agente
                  </span>
                </Label>
                <Textarea
                  id="prompt"
                  name="prompt"
                  value={formData.prompt}
                  onChange={handleChange}
                  placeholder="Descreva como o agente deve se comportar, que tipo de respostas dar, etc."
                  rows={5}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="openAiKey" className="flex justify-between">
                  <span>Chave da API OpenAI</span>
                  <a 
                    href="https://platform.openai.com/api-keys" 
                    target="_blank" 
                    rel="noreferrer" 
                    className="text-xs text-primary hover:underline"
                  >
                    Obter chave
                  </a>
                </Label>
                <Input
                  id="openAiKey"
                  name="openAiKey"
                  value={formData.openAiKey}
                  onChange={handleChange}
                  type="password"
                  placeholder="sk-..."
                />
                <p className="text-xs text-muted-foreground">
                  Sua chave ficará armazenada de forma segura e será usada apenas para este agente.
                </p>
              </div>

              {/* Voice Recognition Switch */}
              <div className="flex items-center justify-between space-y-0 py-4 border-t">
                <div>
                  <h4 className="font-medium text-sm">Habilitar reconhecimento de voz</h4>
                  <p className="text-xs text-muted-foreground">
                    Permite que o agente processe mensagens de áudio usando a Whisper API.
                  </p>
                </div>
                <Switch 
                  checked={formData.enableVoiceRecognition} 
                  onCheckedChange={handleSwitchChange}
                />
              </div>
              
              {/* Knowledge Base Upload */}
              <div className="space-y-2 border-t pt-4">
                <Label className="text-base">Base de conhecimento</Label>
                <div className="grid gap-2">
                  <div className="flex flex-col gap-1">
                    <p className="text-xs text-muted-foreground">
                      Opcional: Adicione uma base de conhecimento para seu agente (PDF, DOC, URL).
                    </p>
                    
                    <div className="flex gap-2">
                      <Input
                        id="knowledgeBase"
                        name="knowledgeBase"
                        value={formData.knowledgeBase}
                        onChange={handleChange}
                        placeholder="Insira URL ou selecione um arquivo"
                      />
                      
                      <div className="relative">
                        <Input 
                          type="file" 
                          id="file-upload" 
                          className="absolute inset-0 opacity-0 cursor-pointer" 
                          accept=".pdf,.doc,.docx,.txt" 
                          onChange={handleFileChange}
                        />
                        <Button type="button" variant="outline" className="flex items-center h-full">
                          <Upload size={18} className="mr-1" />
                          Arquivo
                        </Button>
                      </div>
                    </div>
                    
                    {knowledgeBaseFile && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Arquivo selecionado: {knowledgeBaseFile.name}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button type="button" onClick={nextTab}>
                  Próximo
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="customer" className="space-y-4">
              {!editing && (
                <div className="flex items-center space-x-2 mb-4">
                  <Checkbox 
                    id="isNewCustomer" 
                    checked={!isNewCustomer} 
                    onCheckedChange={(checked) => setIsNewCustomer(!checked)}
                  />
                  <Label htmlFor="isNewCustomer">Vincular a um cliente existente</Label>
                </div>
              )}

              {!isNewCustomer ? (
                <div className="space-y-2">
                  <Label htmlFor="customerId">Selecione um cliente</Label>
                  <select 
                    id="customerId"
                    className="w-full p-2 border rounded-md"
                    value={selectedCustomerId}
                    onChange={handleCustomerSelect}
                  >
                    <option value="">Selecione um cliente</option>
                    {existingCustomers.map(customer => (
                      <option key={customer.id} value={customer.id}>
                        {customer.businessName}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="businessName">Nome da Empresa</Label>
                    <Input
                      id="businessName"
                      name="businessName"
                      value={customerData.businessName}
                      onChange={handleCustomerChange}
                      placeholder="Nome da empresa cliente"
                      required={isNewCustomer}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="customerName">Nome do Responsável</Label>
                    <Input
                      id="name"
                      name="name"
                      value={customerData.name}
                      onChange={handleCustomerChange}
                      placeholder="Nome da pessoa responsável"
                      required={isNewCustomer}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="document">CNPJ/CPF</Label>
                    <Input
                      id="document"
                      name="document"
                      value={customerData.document}
                      onChange={handleCustomerChange}
                      placeholder="Documento do cliente (CNPJ ou CPF)"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="customerEmail">E-mail</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={customerData.email}
                      onChange={handleCustomerChange}
                      placeholder="Email para acesso ao painel"
                      required={isNewCustomer}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactPhone">WhatsApp para contato</Label>
                    <Input
                      id="contactPhone"
                      name="contactPhone"
                      value={customerData.contactPhone}
                      onChange={handleCustomerChange}
                      placeholder="Número para contato do responsável"
                    />
                    <p className="text-xs text-muted-foreground">
                      Este é apenas para contato com o responsável, não é o número que será vinculado ao agente.
                    </p>
                  </div>
                </>
              )}

              <DialogFooter className="flex justify-between pt-4">
                <Button type="button" variant="outline" onClick={prevTab}>
                  Voltar
                </Button>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={onClose}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    {editing ? "Salvar Alterações" : "Criar Agente"}
                  </Button>
                </div>
              </DialogFooter>
            </TabsContent>
          </form>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
