
import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage
} from "@/components/ui/form";
import { 
  Bot, 
  Plus, 
  MessageSquare, 
  Mic, 
  Settings, 
  Upload, 
  Download, 
  AlertTriangle,
  Save
} from "lucide-react";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { AgentConfig } from "@/types";

// Esquema de validação para o formulário do agente
const agentFormSchema = z.object({
  name: z.string().min(2, {
    message: "O nome do agente deve ter pelo menos 2 caracteres.",
  }),
  instructions: z.string().min(10, {
    message: "As instruções devem ter pelo menos 10 caracteres.",
  }),
  openAIApiKey: z.string().optional(),
  enableVoice: z.boolean().default(false),
  voiceModel: z.string().optional(),
  personalityType: z.enum(["informative", "friendly", "professional", "creative"]),
  knowledgeBase: z.string().optional(),
  maxResponseTokens: z.number().int().min(100).max(4000).default(1500),
  temperature: z.number().min(0).max(2).default(0.7),
});

// Dados simulados de configuração de agentes
const MOCK_AGENT_CONFIGS: AgentConfig[] = [
  {
    id: "agent-1",
    name: "Atendente Virtual",
    instructions: "Você é um atendente virtual para a Padaria São José. Responda perguntas sobre nossos produtos, horários de funcionamento (Segunda a Sábado, 6h às 20h, Domingo 7h às 13h) e promoções. Seja cordial e use uma linguagem simples e amigável. Não faça entregas em domicílio e não forneça informações sobre a concorrência.",
    openAIApiKey: "sk-........",
    enableVoice: false,
    personalityType: "friendly",
    maxResponseTokens: 1500,
    temperature: 0.7,
    isActive: true,
    createdAt: "2023-03-15T08:30:00Z",
    updatedAt: "2023-05-10T14:20:00Z",
    messageCount: 3450,
    avgResponseTime: 2.3
  },
  {
    id: "agent-2",
    name: "Assistente de Vendas",
    instructions: "Você é um assistente de vendas especializado em produtos de panificação. Ajude os clientes a escolherem os produtos certos, sugira combinações e explique os ingredientes quando solicitado. Evite falar sobre preços específicos, pois eles podem variar. Encaminhe pedidos grandes para o gerente.",
    openAIApiKey: "sk-........",
    enableVoice: true,
    voiceModel: "eleven_monolingual_v1",
    personalityType: "professional",
    knowledgeBase: "catalogo-produtos.pdf",
    maxResponseTokens: 2000,
    temperature: 0.5,
    isActive: true,
    createdAt: "2023-04-20T10:15:00Z",
    updatedAt: "2023-05-12T09:45:00Z",
    messageCount: 1280,
    avgResponseTime: 3.1,
    associatedWhatsAppId: "conn-2"
  }
];

// Lista simulada de conexões WhatsApp disponíveis para associar
const MOCK_WHATSAPP_CONNECTIONS = [
  { id: "conn-1", name: "Atendimento Principal", phoneNumber: "+5511999991111" },
  { id: "conn-2", name: "Vendas", phoneNumber: "+5511999992222" },
  { id: "conn-3", name: "Agendamentos", phoneNumber: "+5511999994444" },
];

export default function AIAgentConfig() {
  const [agentConfigs, setAgentConfigs] = useState<AgentConfig[]>(MOCK_AGENT_CONFIGS);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentAgentId, setCurrentAgentId] = useState<string | null>(null);
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [testMessage, setTestMessage] = useState("");
  const [testResponse, setTestResponse] = useState("");
  const [isResponding, setIsResponding] = useState(false);
  const [showApiKeyWarning, setShowApiKeyWarning] = useState(true);
  
  // Obtém o agente atual para edição ou teste
  const currentAgent = currentAgentId 
    ? agentConfigs.find(agent => agent.id === currentAgentId) 
    : null;

  // Instância de formulário usando React Hook Form + Zod
  const form = useForm<z.infer<typeof agentFormSchema>>({
    resolver: zodResolver(agentFormSchema),
    defaultValues: {
      name: currentAgent?.name || "",
      instructions: currentAgent?.instructions || "",
      openAIApiKey: currentAgent?.openAIApiKey || "",
      enableVoice: currentAgent?.enableVoice || false,
      voiceModel: currentAgent?.voiceModel || "",
      personalityType: currentAgent?.personalityType || "friendly",
      knowledgeBase: currentAgent?.knowledgeBase || "",
      maxResponseTokens: currentAgent?.maxResponseTokens || 1500,
      temperature: currentAgent?.temperature || 0.7,
    },
  });

  // Atualiza os valores do formulário quando o agente atual muda
  const updateFormValues = () => {
    if (currentAgent) {
      form.reset({
        name: currentAgent.name,
        instructions: currentAgent.instructions,
        openAIApiKey: currentAgent.openAIApiKey,
        enableVoice: currentAgent.enableVoice,
        voiceModel: currentAgent.voiceModel,
        personalityType: currentAgent.personalityType,
        knowledgeBase: currentAgent.knowledgeBase,
        maxResponseTokens: currentAgent.maxResponseTokens,
        temperature: currentAgent.temperature,
      });
    } else {
      form.reset({
        name: "",
        instructions: "",
        openAIApiKey: "",
        enableVoice: false,
        voiceModel: "",
        personalityType: "friendly",
        knowledgeBase: "",
        maxResponseTokens: 1500,
        temperature: 0.7,
      });
    }
  };

  // Função para criar ou atualizar agente
  const onSubmit = (values: z.infer<typeof agentFormSchema>) => {
    if (isEditModalOpen && currentAgentId) {
      // Atualizar agente existente
      const updatedAgents = agentConfigs.map(agent => {
        if (agent.id === currentAgentId) {
          return {
            ...agent,
            ...values,
            updatedAt: new Date().toISOString()
          };
        }
        return agent;
      });
      
      setAgentConfigs(updatedAgents);
      setIsEditModalOpen(false);
      toast.success("Agente de IA atualizado com sucesso!");
    } else {
      // Criar novo agente - garantindo que todos os campos obrigatórios estejam presentes
      const newAgent: AgentConfig = {
        id: `agent-${Date.now()}`,
        name: values.name,
        instructions: values.instructions,
        openAIApiKey: values.openAIApiKey || undefined,
        enableVoice: values.enableVoice,
        voiceModel: values.voiceModel,
        personalityType: values.personalityType,
        knowledgeBase: values.knowledgeBase,
        maxResponseTokens: values.maxResponseTokens,
        temperature: values.temperature,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messageCount: 0,
        avgResponseTime: 0
      };
      
      setAgentConfigs([...agentConfigs, newAgent]);
      setIsCreateModalOpen(false);
      toast.success("Novo agente de IA criado com sucesso!");
    }
    
    setCurrentAgentId(null);
  };

  // Abrir modal para editar agente
  const handleEditAgent = (agentId: string) => {
    setCurrentAgentId(agentId);
    setIsEditModalOpen(true);
    setTimeout(updateFormValues, 100);
  };

  // Abrir modal para testar agente
  const handleTestAgent = (agentId: string) => {
    setCurrentAgentId(agentId);
    setTestMessage("");
    setTestResponse("");
    setIsTestModalOpen(true);
  };

  // Simular resposta de IA
  const handleTestAIResponse = () => {
    if (!testMessage.trim()) {
      toast.error("Digite uma mensagem para testar o agente.");
      return;
    }

    setIsResponding(true);
    
    // Simula tempo de resposta da API
    setTimeout(() => {
      setTestResponse(`Esta é uma resposta simulada do agente "${currentAgent?.name}" para a sua pergunta. Em uma integração real, esta resposta seria gerada pela OpenAI com base nas instruções configuradas para o agente.`);
      setIsResponding(false);
    }, 1500);
  };

  // Alternar status ativo do agente
  const toggleAgentActive = (agentId: string) => {
    const updatedAgents = agentConfigs.map(agent => {
      if (agent.id === agentId) {
        return {
          ...agent,
          isActive: !agent.isActive,
          updatedAt: new Date().toISOString()
        };
      }
      return agent;
    });
    
    setAgentConfigs(updatedAgents);
    const agent = updatedAgents.find(a => a.id === agentId);
    toast.success(`Agente ${agent?.name} ${agent?.isActive ? 'ativado' : 'desativado'} com sucesso!`);
  };

  // Remover agente
  const handleDeleteAgent = (agentId: string) => {
    setAgentConfigs(agentConfigs.filter(agent => agent.id !== agentId));
    toast.success("Agente de IA removido com sucesso!");
  };

  return (
    <DashboardLayout title="Configuração de Agentes de IA">
      <div className="space-y-6">
        {/* Aviso de chave API */}
        {showApiKeyWarning && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 dark:bg-yellow-900/20 dark:border-yellow-600">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-yellow-400" aria-hidden="true" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700 dark:text-yellow-200">
                  Para utilizar agentes de IA, é necessário fornecer uma chave de API da OpenAI. 
                  Você pode criar sua chave na <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="font-medium underline hover:text-yellow-800 dark:hover:text-yellow-100">plataforma OpenAI</a>.
                </p>
              </div>
              <div className="ml-auto pl-3">
                <button
                  type="button"
                  className="inline-flex rounded-md bg-yellow-50 p-1.5 text-yellow-500 hover:bg-yellow-100 dark:bg-yellow-900/20 dark:hover:bg-yellow-900/40"
                  onClick={() => setShowApiKeyWarning(false)}
                >
                  <span className="sr-only">Dispensar</span>
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Estatísticas e controles */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm border flex items-center gap-2">
              <Bot className="text-primary h-5 w-5" />
              <div>
                <p className="text-sm text-muted-foreground">Agentes Ativos</p>
                <p className="font-medium">
                  {agentConfigs.filter(agent => agent.isActive).length} <span className="text-xs text-muted-foreground">/ {agentConfigs.length} total</span>
                </p>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm border flex items-center gap-2">
              <MessageSquare className="text-blue-500 h-5 w-5" />
              <div>
                <p className="text-sm text-muted-foreground">Mensagens Processadas</p>
                <p className="font-medium">
                  {agentConfigs.reduce((acc, agent) => acc + agent.messageCount, 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
          
          <Button onClick={() => {
            setCurrentAgentId(null);
            updateFormValues();
            setIsCreateModalOpen(true);
          }}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Agente de IA
          </Button>
        </div>

        {/* Grid de agentes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {agentConfigs.map(agent => (
            <Card key={agent.id} className={`overflow-hidden ${!agent.isActive ? 'opacity-70' : ''}`}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-xl flex items-center gap-2">
                      {agent.name}
                      {agent.enableVoice && (
                        <Mic className="h-4 w-4 text-blue-500" aria-label="Com suporte a voz" />
                      )}
                    </CardTitle>
                    <CardDescription>
                      {agent.personalityType === "friendly" && "Personalidade amigável"}
                      {agent.personalityType === "professional" && "Personalidade profissional"}
                      {agent.personalityType === "informative" && "Personalidade informativa"}
                      {agent.personalityType === "creative" && "Personalidade criativa"}
                      {agent.associatedWhatsAppId && (
                        <span className="ml-2">• Conectado ao WhatsApp</span>
                      )}
                    </CardDescription>
                  </div>
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-2 ${agent.isActive ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                    <span className="text-xs text-muted-foreground">{agent.isActive ? 'Ativo' : 'Inativo'}</span>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div>
                    <h4 className="font-medium mb-1">Instruções:</h4>
                    <p className="text-muted-foreground line-clamp-3">{agent.instructions}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-muted-foreground">Mensagens:</span>
                      <p className="font-medium">{agent.messageCount.toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Tempo de resposta:</span>
                      <p className="font-medium">{agent.avgResponseTime}s</p>
                    </div>
                    {agent.knowledgeBase && (
                      <div className="col-span-2">
                        <span className="text-muted-foreground">Base de conhecimento:</span>
                        <p className="font-medium">{agent.knowledgeBase}</p>
                      </div>
                    )}
                  </div>
                  
                  {agent.associatedWhatsAppId && (
                    <div className="flex items-center p-2 bg-gray-50 dark:bg-gray-800 rounded-md">
                      <div className="mr-2 p-1 bg-green-100 dark:bg-green-900/30 rounded">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600 dark:text-green-400" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M17.6 6.31999C16.8669 5.58141 15.9943 4.99596 15.033 4.59767C14.0716 4.19938 13.0406 3.99684 12 3.99999C10.6089 4.00135 9.24248 4.36819 8.03771 5.06377C6.83294 5.75935 5.83203 6.75926 5.13534 7.96335C4.43866 9.16745 4.07055 10.5335 4.06776 11.9246C4.06497 13.3158 4.42761 14.6832 5.12 15.89L4 20L8.2 18.9C9.35975 19.5452 10.6629 19.8891 11.99 19.9C14.0997 19.9 16.124 19.0563 17.6242 17.556C19.1245 16.0557 19.9683 14.0314 19.9683 11.9217C19.9683 9.81208 19.1245 7.78775 17.6242 6.28752L17.6 6.31999ZM12 18.53C10.8177 18.5308 9.65701 18.213 8.64 17.61L8.4 17.46L5.91 18.12L6.57 15.69L6.41 15.44C5.55925 14.0667 5.24174 12.4602 5.50762 10.8906C5.7735 9.32108 6.6009 7.89757 7.84162 6.84853C9.08233 5.79948 10.6567 5.19036 12.2921 5.11775C13.9275 5.04513 15.5535 5.51361 16.89 6.43999C18.2171 7.34265 19.1834 8.64968 19.6168 10.1363C20.0502 11.623 19.9239 13.2145 19.2593 14.622C18.5947 16.0294 17.437 17.1728 16.0186 17.8193C14.6003 18.4659 13.0022 18.5694 11.51 18.11H11.5"></path>
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs font-medium">Conectado ao WhatsApp</p>
                        <p className="text-xs text-muted-foreground">
                          {MOCK_WHATSAPP_CONNECTIONS.find(c => c.id === agent.associatedWhatsAppId)?.name || "Conexão WhatsApp"}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
              
              <CardFooter className="flex gap-2 pt-2">
                <Button 
                  variant="default" 
                  size="sm"
                  onClick={() => handleTestAgent(agent.id)}
                >
                  <MessageSquare className="mr-1 h-4 w-4" />
                  Testar
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleEditAgent(agent.id)}
                >
                  <Settings className="mr-1 h-4 w-4" />
                  Configurar
                </Button>
                <Button 
                  variant={agent.isActive ? "ghost" : "secondary"}
                  size="sm"
                  className="ml-auto"
                  onClick={() => toggleAgentActive(agent.id)}
                >
                  {agent.isActive ? "Desativar" : "Ativar"}
                </Button>
              </CardFooter>
            </Card>
          ))}

          {/* Card para criar novo agente */}
          <Card className="border-dashed border-2 flex flex-col items-center justify-center p-6 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer min-h-[300px]" onClick={() => {
            setCurrentAgentId(null);
            updateFormValues();
            setIsCreateModalOpen(true);
          }}>
            <Bot size={48} className="text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Criar novo agente de IA</h3>
            <p className="text-center text-muted-foreground mb-4">Configure um agente de IA personalizado para atender às necessidades específicas do seu negócio.</p>
            <Button variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Novo Agente
            </Button>
          </Card>
        </div>
      </div>

      {/* Modal para criar/editar agente */}
      <Dialog 
        open={isCreateModalOpen || isEditModalOpen} 
        onOpenChange={(open) => {
          if (!open) {
            isCreateModalOpen ? setIsCreateModalOpen(false) : setIsEditModalOpen(false);
            setCurrentAgentId(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEditModalOpen ? "Editar Agente de IA" : "Criar Novo Agente de IA"}</DialogTitle>
            <DialogDescription>
              Configure as instruções e comportamento do seu agente de IA. Defina como ele deve interagir com os clientes.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do agente</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Atendente Virtual" {...field} />
                    </FormControl>
                    <FormDescription>
                      Um nome descritivo para identificar o agente.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="instructions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Instruções para o agente</FormLabel>
                    <FormControl>
                      <textarea
                        className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder="Explique em detalhes como o agente deve se comportar e responder..."
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Instruções detalhadas que guiarão o comportamento do agente. Seja específico sobre o tom, informações que pode compartilhar e como lidar com diferentes situações.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="personalityType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de personalidade</FormLabel>
                    <FormControl>
                      <select
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        {...field}
                      >
                        <option value="friendly">Amigável</option>
                        <option value="professional">Profissional</option>
                        <option value="informative">Informativo</option>
                        <option value="creative">Criativo</option>
                      </select>
                    </FormControl>
                    <FormDescription>
                      Define o estilo de comunicação geral do agente.
                    </FormDescription>
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="maxResponseTokens"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Limite de tokens</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="100" 
                          max="4000" 
                          step="100"
                          {...field}
                          onChange={e => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormDescription>
                        Comprimento máximo das respostas (100-4000).
                      </FormDescription>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="temperature"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Temperatura</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="0" 
                          max="2" 
                          step="0.1"
                          {...field}
                          onChange={e => field.onChange(parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <FormDescription>
                        Criatividade (0-2, valores maiores = mais criativo).
                      </FormDescription>
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="openAIApiKey"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Chave de API OpenAI</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="sk-..." {...field} />
                    </FormControl>
                    <FormDescription>
                      Chave secreta da API OpenAI para este agente. Deixe em branco para usar a chave padrão do sistema.
                    </FormDescription>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="enableVoice"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div>
                      <div className="font-medium leading-none">Habilitar reconhecimento de voz</div>
                      <p className="text-sm text-muted-foreground">
                        Permite que o agente processe mensagens de áudio usando a Whisper API.
                      </p>
                    </div>
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        className="h-4 w-4"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              {form.watch("enableVoice") && (
                <FormField
                  control={form.control}
                  name="voiceModel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Modelo de voz</FormLabel>
                      <FormControl>
                        <select
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                          {...field}
                        >
                          <option value="">Selecione um modelo de voz</option>
                          <option value="eleven_monolingual_v1">Eleven Monolingual v1</option>
                          <option value="eleven_multilingual_v1">Eleven Multilingual v1</option>
                          <option value="eleven_multilingual_v2">Eleven Multilingual v2</option>
                        </select>
                      </FormControl>
                      <FormDescription>
                        Modelo usado para síntese de voz em respostas de áudio.
                      </FormDescription>
                    </FormItem>
                  )}
                />
              )}
              
              <FormField
                control={form.control}
                name="knowledgeBase"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Base de conhecimento</FormLabel>
                    <div className="flex gap-2">
                      <FormControl>
                        <Input 
                          placeholder="Selecione um arquivo ou insira URL"
                          {...field}
                          disabled
                          className="flex-1"
                        />
                      </FormControl>
                      <Button type="button" variant="outline" size="icon">
                        <Upload className="h-4 w-4" />
                      </Button>
                    </div>
                    <FormDescription>
                      Opcional: Adicione uma base de conhecimento para seu agente (PDF, DOC, URL).
                    </FormDescription>
                  </FormItem>
                )}
              />

              {isEditModalOpen && currentAgentId && (
                <div className="space-y-2 pt-2">
                  <label className="text-sm font-medium">Conexão WhatsApp</label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="">Sem conexão WhatsApp</option>
                    {MOCK_WHATSAPP_CONNECTIONS.map(conn => (
                      <option 
                        key={conn.id} 
                        value={conn.id}
                        selected={currentAgent?.associatedWhatsAppId === conn.id}
                      >
                        {conn.name} ({conn.phoneNumber})
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-muted-foreground">
                    Associe este agente a uma conexão WhatsApp para responder mensagens automaticamente.
                  </p>
                </div>
              )}

              <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-between gap-2">
                <Button 
                  type="button"
                  variant="destructive" 
                  className="sm:mr-auto"
                  onClick={() => {
                    if (isEditModalOpen && currentAgentId) {
                      handleDeleteAgent(currentAgentId);
                      setIsEditModalOpen(false);
                    }
                  }}
                >
                  Excluir agente
                </Button>
                
                <div className="flex gap-2">
                  <Button 
                    type="button"
                    variant="outline" 
                    onClick={() => {
                      isCreateModalOpen ? setIsCreateModalOpen(false) : setIsEditModalOpen(false);
                      setCurrentAgentId(null);
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit">
                    <Save className="mr-2 h-4 w-4" />
                    {isEditModalOpen ? "Salvar alterações" : "Criar agente"}
                  </Button>
                </div>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Modal para testar agente */}
      <Dialog open={isTestModalOpen} onOpenChange={setIsTestModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Testar Agente de IA</DialogTitle>
            <DialogDescription>
              Digite uma mensagem para ver como o agente "{currentAgent?.name}" responderá.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="border rounded-lg overflow-hidden mb-4">
              <div className="bg-muted p-3">
                <h4 className="text-sm font-medium">Conversa de Teste</h4>
              </div>
              <div className="p-4 max-h-[300px] overflow-y-auto space-y-4">
                {testMessage && (
                  <div className="flex justify-end">
                    <div className="bg-primary text-primary-foreground p-3 rounded-lg max-w-[80%]">
                      <p>{testMessage}</p>
                    </div>
                  </div>
                )}
                
                {isResponding && (
                  <div className="flex">
                    <div className="bg-muted p-3 rounded-lg max-w-[80%]">
                      <div className="flex space-x-2">
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
                      </div>
                    </div>
                  </div>
                )}
                
                {testResponse && (
                  <div className="flex">
                    <div className="bg-muted p-3 rounded-lg max-w-[80%]">
                      <p>{testResponse}</p>
                    </div>
                  </div>
                )}
                
                {!testMessage && !testResponse && !isResponding && (
                  <div className="text-center text-muted-foreground py-8">
                    <Bot className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>Digite uma mensagem para iniciar a conversa de teste.</p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex gap-2">
              <Input 
                placeholder="Digite uma mensagem para testar..." 
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
                disabled={isResponding}
              />
              <Button 
                onClick={handleTestAIResponse}
                disabled={!testMessage.trim() || isResponding}
              >
                Enviar
              </Button>
            </div>
            
            <div className="mt-4 text-xs text-muted-foreground">
              <p className="flex items-center">
                <Download className="inline h-3 w-3 mr-1" />
                Modelo: {currentAgent?.voiceModel || "GPT-4"}
              </p>
              <p>Este é um ambiente de teste. As mensagens não serão salvas ou enviadas para clientes reais.</p>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTestModalOpen(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
