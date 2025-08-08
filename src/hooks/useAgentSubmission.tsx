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

  const handleSubmitAgent = async (
    agentData: Partial<Agent>, 
    customerData?: Partial<Customer>, 
    isNewCustomer?: boolean
  ) => {
    const isEditing = isEditModalOpen && currentAgent;
    const toastId = toast.loading(isEditing ? "Atualizando agente..." : "Criando agente e configurando IA...");

    try {
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
        toast.loading("Atualizando dados do agente...", { id: toastId });
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
        // A lógica para re-configurar a IA na Evolution se a chave mudar iria aqui.
      } else {
        toast.loading("Passo 2 de 4: Salvando agente...", { id: toastId });
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

        await configureEvolutionAI(finalAgent, toastId);
        
        const customerPortal = generateCustomerPortalAccess(customer);
        setCurrentCustomerPortal(customerPortal);
      }

      toast.dismiss(toastId);
      toast.success(`Agente "${finalAgent.name}" ${isEditing ? 'atualizado' : 'criado e configurado'} com sucesso!`);
      
      setIsCreateModalOpen(false);
      setIsEditModalOpen(false);
      
      if (!isEditing) {
        setCurrentAgent(finalAgent);
        setCurrentCustomer(customer);
        // Após a configuração bem-sucedida, mostramos o modal para conectar o QR Code
        setIsWhatsAppModalOpen(true);
      }

    } catch (error) {
      toast.dismiss(toastId);
      console.error('Erro no fluxo de submissão do agente:', error);
      toast.error(`Falha: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  };

  const configureEvolutionAI = async (agent: Agent, toastId: any) => {
    const instanceName = `agent_${agent.id.substring(0, 8)}_${Date.now()}`;

    toast.loading("Passo 2 de 4: Criando instância no WhatsApp...", { id: toastId });
    const { data: instanceResult, error: instanceError } = await supabase.functions.invoke('evolution-api-manager', {
      body: { action: 'create_instance', franchisee_id: franchiseeId, instance_name: instanceName }
    });
    if (instanceError || !instanceResult.success) {
      throw new Error(instanceError?.message || instanceResult?.error || 'Falha ao criar instância na Evolution API.');
    }

    toast.loading("Passo 3 de 4: Configurando credenciais de IA...", { id: toastId });
    const { data: credsData, error: credsError } = await supabase.functions.invoke('evolution-api-manager', {
      body: { action: 'openai_set_creds', instanceName, credsName: `creds-${instanceName}`, apiKey: agent.openAiKey }
    });
    if (credsError || !credsData?.id) {
      throw new Error(credsError?.message || credsData?.error || 'Falha ao configurar credenciais OpenAI.');
    }
    const openAICredsId = credsData.id;

    toast.loading("Passo 4 de 4: Ativando bot e transcrição...", { id: toastId });
    const { error: botError } = await supabase.functions.invoke('evolution-api-manager', {
      body: {
        action: 'openai_create_bot',
        instanceName,
        botConfig: {
          enabled: true, openaiCredsId, botType: 'chatCompletion',
          model: 'gpt-4o-mini', systemMessages: [agent.prompt || 'Você é um assistente prestativo.'],
          triggerType: 'all',
        },
      },
    });
    if (botError) throw new Error(botError.message || 'Falha ao criar o bot.');

    const { error: defaultsError } = await supabase.functions.invoke('evolution-api-manager', {
      body: {
        action: 'openai_set_defaults',
        instanceName,
        settings: {
          openaiCredsId,
          speechToText: agent.enableVoiceRecognition,
        },
      },
    });
    if (defaultsError) throw new Error(defaultsError.message || 'Falha ao ativar a transcrição.');
  };

  const handleConnectWhatsApp = () => {
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