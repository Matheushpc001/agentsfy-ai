// ARQUIVO CORRIGIDO: src/hooks/useAgentSubmission.tsx

import { Agent, Customer, CustomerPortalAccess } from "@/types";
import { toast } from "sonner";
import { generateCustomerPortalAccess } from "@/utils/agentHelpers";
import { agentService, customerService, CreateAgentRequest, CreateCustomerRequest } from "@/services/agentService";
import { supabase } from "@/integrations/supabase/client";

// As props da interface permanecem as mesmas
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
  agents, customers, currentAgent, franchiseeId, isEditModalOpen,
  setAgents, setCustomers, setCurrentAgent, setCurrentCustomer,
  setCurrentCustomerPortal, setIsCreateModalOpen, setIsEditModalOpen,
  setIsWhatsAppModalOpen, setIsCustomerPortalModalOpen,
}: UseAgentSubmissionProps) {

  const handleSubmitAgent = async (
    agentData: Partial<Agent>, 
    customerData?: Partial<Customer>, 
    isNewCustomer?: boolean
  ) => {
    const isEditing = isEditModalOpen && currentAgent;
    const toastId = toast.loading(isEditing ? "Atualizando agente..." : "Iniciando criação completa do agente...");

    try {
      // ETAPA 1: Criar/Identificar Cliente e Agente no nosso banco de dados
      let customerId = "";
      let customer: Customer | undefined;

      if (isNewCustomer && customerData) {
        toast.loading("Passo 1 de 5: Criando cliente...", { id: toastId });
        customer = await customerService.createCustomer({
          business_name: customerData.businessName!, name: customerData.name!,
          email: customerData.email!, document: customerData.document,
          contact_phone: customerData.contactPhone
        }, franchiseeId);
        setCustomers(prev => [...prev, customer!]);
        customerId = customer.id;
      } else {
        customerId = agentData.customerId!;
        customer = customers.find(c => c.id === customerId);
      }

      if (!customerId || !customer) throw new Error('Cliente inválido.');

      let finalAgent: Agent;

      if (isEditing) {
        toast.loading("Atualizando dados do agente...", { id: toastId });
        finalAgent = await agentService.updateAgent(currentAgent.id, {
          name: agentData.name, sector: agentData.sector, prompt: agentData.prompt,
          open_ai_key: agentData.openAiKey, enable_voice_recognition: agentData.enableVoiceRecognition,
        });
        setAgents(agents.map(a => a.id === currentAgent.id ? finalAgent : a));
      } else {
        toast.loading("Passo 2 de 5: Salvando agente no sistema...", { id: toastId });
        finalAgent = await agentService.createAgent({
          name: agentData.name!, sector: agentData.sector!, prompt: agentData.prompt,
          open_ai_key: agentData.openAiKey!, enable_voice_recognition: agentData.enableVoiceRecognition,
          customer_id: customerId,
        }, franchiseeId);
        setAgents(prev => [...prev, finalAgent]);

        // ETAPA 2: Configurar TUDO na Evolution API automaticamente
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
        setIsWhatsAppModalOpen(true); // Abre o modal do QR Code para finalizar
      }

    } catch (error) {
      toast.dismiss(toastId);
      console.error('Erro no fluxo de submissão do agente:', error);
      toast.error(`Falha: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  };

  const configureEvolutionAI = async (agent: Agent, toastId: any) => {
    const instanceName = `agent_${agent.id.substring(0, 8)}_${Date.now()}`;

    toast.loading("Passo 3 de 5: Criando instância WhatsApp...", { id: toastId });
    const { data: instanceResult, error: instanceError } = await supabase.functions.invoke('evolution-api-manager', {
      body: { action: 'create_instance', franchisee_id: franchiseeId, instance_name: instanceName }
    });
    if (instanceError || !instanceResult.success) throw new Error(instanceError?.message || instanceResult?.error || 'Falha ao criar instância.');

    toast.loading("Passo 4 de 5: Configurando credenciais de IA...", { id: toastId });
    const { data: credsData, error: credsError } = await supabase.functions.invoke('evolution-api-manager', {
      body: { action: 'openai_set_creds', instanceName, credsName: `creds-${instanceName}`, apiKey: agent.openAiKey }
    });
    if (credsError || !credsData?.id) throw new Error(credsError?.message || credsData?.error || 'Falha ao configurar credenciais.');
    const openAICredsId = credsData.id;

    toast.loading("Passo 5 de 5: Ativando bot e transcrição...", { id: toastId });
    await supabase.functions.invoke('evolution-api-manager', {
      body: {
        action: 'openai_create_bot', instanceName,
        botConfig: { enabled: true, openaiCredsId, botType: 'chatCompletion', model: 'gpt-4o-mini', systemMessages: [agent.prompt || 'Você é um assistente.'], triggerType: 'all' },
      },
    }).then(({ error }) => { if (error) throw error; });

    await supabase.functions.invoke('evolution-api-manager', {
      body: { action: 'openai_set_defaults', instanceName, settings: { openaiCredsId, speechToText: !!agent.enableVoiceRecognition } },
    }).then(({ error }) => { if (error) throw error; });
  };

  // Funções restantes permanecem iguais
  const handleConnectWhatsApp = () => { if (currentAgent) setIsWhatsAppModalOpen(true); };
  const handleClosePortalModal = () => {
    setIsCustomerPortalModalOpen(false);
    setCurrentCustomerPortal(null);
    setCurrentAgent(null);
  };
  const handleSendCredentialsEmail = () => {
    toast.info("Funcionalidade de envio de email a ser implementada.");
    handleClosePortalModal();
  };

  return { handleSubmitAgent, handleConnectWhatsApp, handleClosePortalModal, handleSendCredentialsEmail };
}