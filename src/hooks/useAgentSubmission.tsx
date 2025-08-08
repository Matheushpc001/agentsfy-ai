// ARQUIVO: src/hooks/useAgentSubmission.tsx

import { Agent, Customer, CustomerPortalAccess } from "@/types";
import { toast } from "sonner";
import { generateCustomerPortalAccess } from "@/utils/agentHelpers";
import { agentService, customerService, CreateAgentRequest, CreateCustomerRequest } from "@/services/agentService";
import { supabase } from "@/integrations/supabase/client";

interface UseAgentSubmissionProps {
  agents: Agent[];
  customers: Customer[];
  currentAgent: Agent | null;
  franchiseeId: string;
  isEditModalOpen: boolean;
  setAgents: (agents: Agent[]) => void;
  setCustomers: (customers: Customer[]) => void;
  setCurrentAgent: (agent: Agent | null) => void;
  setCurrentCustomer: (customer: Customer | null) => void;
  setCurrentCustomerPortal: (portal: CustomerPortalAccess | null) => void;
  setIsCreateModalOpen: (open: boolean) => void;
  setIsEditModalOpen: (open: boolean) => void;
  setIsWhatsAppModalOpen: (open: boolean) => void;
  setIsCustomerPortalModalOpen: (open: boolean) => void;
}

export function useAgentSubmission({
  agents,
  customers,
  currentAgent,
  franchiseeId,
  isEditModalOpen,
  setAgents,
  setCustomers,
  setCurrentAgent,
  setCurrentCustomer,
  setCurrentCustomerPortal,
  setIsCreateModalOpen,
  setIsEditModalOpen,
  setIsWhatsAppModalOpen,
  setIsCustomerPortalModalOpen,
}: UseAgentSubmissionProps) {

  // NOVA LÓGICA UNIFICADA DE SUBMISSÃO
  const handleSubmitAgent = async (
    agentData: Partial<Agent>, 
    customerData?: Partial<Customer>, 
    isNewCustomer?: boolean
  ) => {
    const isEditing = isEditModalOpen && currentAgent;
    const toastId = toast.loading(isEditing ? "Atualizando agente..." : "Criando agente e configurando IA...");

    try {
      // --- ETAPA 1: Lidar com Cliente e Agente no nosso DB ---
      let customerId = "";
      let customer: Customer | undefined;

      if (isNewCustomer && customerData) {
        toast.loading("Passo 1 de 4: Criando cliente...", { id: toastId });
        const createCustomerRequest: CreateCustomerRequest = {
          business_name: customerData.businessName || "",
          name: customerData.name || "",
          email: customerData.email || "",
          document: customerData.document,
          contact_phone: customerData.contactPhone
        };
        customer = await customerService.createCustomer(createCustomerRequest, franchiseeId);
        setCustomers(prev => [...prev, customer!]);
        customerId = customer.id;
      } else {
        customerId = agentData.customerId!;
        customer = customers.find(c => c.id === customerId);
      }

      if (!customerId || !customer) throw new Error('Cliente não encontrado ou selecionado.');

      let finalAgent: Agent;

      if (isEditing) {
        // --- LÓGICA DE ATUALIZAÇÃO ---
        toast.loading("Passo 2 de 4: Atualizando dados do agente...", { id: toastId });
        const updateRequest: Partial<CreateAgentRequest> = {
          name: agentData.name,
          sector: agentData.sector,
          prompt: agentData.prompt,
          open_ai_key: agentData.openAiKey,
          enable_voice_recognition: agentData.enableVoiceRecognition,
        };
        finalAgent = await agentService.updateAgent(currentAgent.id, updateRequest);
        setAgents(agents.map(a => a.id === currentAgent.id ? finalAgent : a));
        toast.success("Agente atualizado com sucesso!");
        // Em edição, não reconfiguramos a IA a menos que a chave mude.
        // A lógica de reconfiguração seria adicionada aqui se necessário.
      } else {
        // --- LÓGICA DE CRIAÇÃO ---
        toast.loading("Passo 2 de 4: Salvando agente no sistema...", { id: toastId });
        const createAgentRequest: CreateAgentRequest = {
          name: agentData.name!,
          sector: agentData.sector!,
          prompt: agentData.prompt,
          open_ai_key: agentData.openAiKey!,
          enable_voice_recognition: agentData.enableVoiceRecognition,
          customer_id: customerId,
        };
        finalAgent = await agentService.createAgent(createAgentRequest, franchiseeId);
        setAgents(prev => [...prev, finalAgent]);

        // --- ETAPA 2: Criar Instância e Configurar IA na Evolution API ---
        await configureEvolutionAI(finalAgent, toastId);
        
        const customerPortal = generateCustomerPortalAccess(customer);
        setCurrentCustomerPortal(customerPortal);
      }

      // --- ETAPA FINAL: Fechar Modais e Notificar ---
      toast.dismiss(toastId);
      toast.success(`Agente "${finalAgent.name}" ${isEditing ? 'atualizado' : 'criado e configurado'} com sucesso!`);
      
      setIsCreateModalOpen(false);
      setIsEditModalOpen(false);
      
      if (!isEditing) {
        setCurrentAgent(finalAgent);
        setCurrentCustomer(customer);
        setIsCustomerPortalModalOpen(true); // Abre o modal com os dados do portal
      }

    } catch (error) {
      toast.dismiss(toastId);
      console.error('Erro no fluxo de submissão do agente:', error);
      toast.error(`Falha: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  };

  // NOVA FUNÇÃO AUXILIAR PARA CONFIGURAR A EVOLUTION API
  const configureEvolutionAI = async (agent: Agent, toastId: any) => {
    // Gera um nome de instância único para evitar conflitos
    const instanceName = `agent_${agent.id.substring(0, 8)}_${Date.now()}`;

    // Passo 2.1: Criar a instância na Evolution API
    toast.loading("Passo 2 de 4: Criando instância no WhatsApp...", { id: toastId });
    const { data: instanceResult, error: instanceError } = await supabase.functions.invoke('evolution-api-manager', {
      body: { action: 'create_instance', franchisee_id: franchiseeId, instance_name: instanceName }
    });
    if (instanceError || !instanceResult.success) {
      throw new Error(instanceError?.message || instanceResult?.error || 'Falha ao criar instância na Evolution API.');
    }

    // Passo 2.2: Configurar Credenciais OpenAI na Instância
    toast.loading("Passo 3 de 4: Configurando credenciais de IA...", { id: toastId });
    const { data: credsData, error: credsError } = await supabase.functions.invoke('evolution-api-manager', {
      body: { action: 'openai_set_creds', instanceName, credsName: `creds-${instanceName}`, apiKey: agent.openAiKey }
    });
    if (credsError || !credsData?.id) {
      throw new Error(credsError?.message || credsData?.error || 'Falha ao configurar credenciais OpenAI.');
    }
    const openAICredsId = credsData.id;

    // Passo 2.3: Configurar o Bot na Instância
    toast.loading("Passo 4 de 4: Ativando bot e transcrição...", { id: toastId });
    const { error: botError } = await supabase.functions.invoke('evolution-api-manager', {
      body: {
        action: 'openai_create_bot',
        instanceName,
        botConfig: {
          enabled: true,
          openaiCredsId,
          botType: 'chatCompletion',
          model: 'gpt-4o-mini',
          systemMessages: [agent.prompt || 'Você é um assistente prestativo.'],
          triggerType: 'all',
        },
      },
    });
    if (botError) throw new Error(botError.message || 'Falha ao criar o bot na Evolution API.');

    // Passo 2.4: Configurar Padrões (incluindo Transcrição de Áudio)
    const { error: defaultsError } = await supabase.functions.invoke('evolution-api-manager', {
      body: {
        action: 'openai_set_defaults',
        instanceName,
        settings: {
          openaiCredsId,
          speechToText: agent.enableVoiceRecognition, // Usa o valor do switch
        },
      },
    });
    if (defaultsError) throw new Error(defaultsError.message || 'Falha ao ativar a transcrição de áudio.');
  };

  const handleConnectWhatsApp = async () => {
      // Esta função pode ser simplificada ou removida, pois a conexão agora é parte do fluxo de criação.
      // Mantemos por enquanto para reconexão.
      if (!currentAgent) return;
      setIsWhatsAppModalOpen(true);
  };
  
  const handleClosePortalModal = () => {
    setIsCustomerPortalModalOpen(false);
    setCurrentCustomerPortal(null);
    setCurrentAgent(null);
  };

  const handleSendCredentialsEmail = () => {
    toast.info("Funcionalidade de envio de email a ser implementada.");
    handleClosePortalModal();
  };

  return {
    handleSubmitAgent,
    handleConnectWhatsApp,
    handleClosePortalModal,
    handleSendCredentialsEmail,
  };
}