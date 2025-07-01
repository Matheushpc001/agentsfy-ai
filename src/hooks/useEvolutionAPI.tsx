import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface EvolutionConfig {
  id: string;
  instance_name: string;
  status: string;
  qr_code?: string;
  webhook_url?: string;
  created_at: string;
  updated_at: string;
}

export interface AIAgent {
  id: string;
  agent_id: string;
  evolution_config_id: string;
  phone_number: string;
  model: string;
  system_prompt?: string;
  is_active: boolean;
  auto_response: boolean;
  response_delay_seconds?: number;
  created_at: string;
  updated_at: string;
}

export interface GlobalConfig {
  id: string;
  name: string;
  api_url: string;
  api_key: string;
  manager_url?: string;
  global_api_key?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateAIAgentRequest {
  agent_id: string;
  evolution_config_id: string;
  phone_number: string;
  openai_api_key?: string;
  model: string;
  system_prompt: string;
  auto_response: boolean;
  response_delay_seconds: number;
}

export function useEvolutionAPI(franchiseeId?: string) {
  const [configs, setConfigs] = useState<EvolutionConfig[]>([]);
  const [aiAgents, setAiAgents] = useState<AIAgent[]>([]);
  const [globalConfigs, setGlobalConfigs] = useState<GlobalConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadInitialData();
  }, [franchiseeId]);

  const loadInitialData = async () => {
    await loadGlobalConfigs();
    if (franchiseeId) {
      await Promise.all([
        loadConfigs(),
        loadAIAgents()
      ]);
    }
    setIsLoading(false);
  };

  const loadGlobalConfigs = async () => {
    try {
      const { data, error } = await supabase
        .from('evolution_global_configs')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGlobalConfigs(data || []);
    } catch (error) {
      console.error('Erro ao carregar configurações globais:', error);
      setError('Erro ao carregar configurações globais');
    }
  };

  const loadConfigs = async () => {
    if (!franchiseeId) return;
    
    try {
      const { data, error } = await supabase
        .from('evolution_api_configs')
        .select('*')
        .eq('franchisee_id', franchiseeId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setConfigs(data || []);
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
      setError('Erro ao carregar configurações');
    }
  };

  const loadAIAgents = async () => {
    if (!franchiseeId) return;
    
    try {
      const { data, error } = await supabase
        .from('ai_whatsapp_agents')
        .select(`
          *,
          evolution_api_configs!inner(franchisee_id)
        `)
        .eq('evolution_api_configs.franchisee_id', franchiseeId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAiAgents(data || []);
    } catch (error) {
      console.error('Erro ao carregar agentes IA:', error);
      setError('Erro ao carregar agentes IA');
    }
  };

  const checkInstanceStatus = async (configId: string) => {
    try {
      console.log('Verificando status da instância:', configId);
      
      const { data, error } = await supabase.functions.invoke('evolution-api-manager', {
        body: {
          action: 'check_status',
          config_id: configId
        }
      });

      if (error) throw error;
      
      console.log('Status da instância:', data);
      return data;
    } catch (error) {
      console.error('Erro ao verificar status da instância:', error);
      throw error;
    }
  };

  const createInstanceWithAutoConfig = async (instanceName: string, agentId?: string) => {
    if (!franchiseeId) {
      throw new Error('FranchiseeId é obrigatório');
    }
    
    if (globalConfigs.length === 0) {
      throw new Error('EvolutionAPI não configurada globalmente');
    }
    
    setIsCreating(true);
    try {
      console.log('Criando instância automática:', { instanceName, franchiseeId, agentId });
      
      const { data, error } = await supabase.functions.invoke('evolution-api-manager', {
        body: {
          action: 'create_instance',
          franchisee_id: franchiseeId,
          instance_name: instanceName,
          agent_id: agentId
        }
      });

      if (error) throw error;
      
      // Aguardar um pouco e recarregar os dados
      await new Promise(resolve => setTimeout(resolve, 1000));
      await loadConfigs();
      
      toast.success('Instância criada e configurada automaticamente');
      return data.config;
    } catch (error) {
      console.error('Erro ao criar instância:', error);
      toast.error('Erro ao criar instância automática');
      throw error;
    } finally {
      setIsCreating(false);
    }
  };

  const createInstance = async (instanceName: string) => {
    return createInstanceWithAutoConfig(instanceName);
  };

  const connectInstance = async (configId: string) => {
    try {
      console.log('Conectando instância:', configId);
      
      const { data, error } = await supabase.functions.invoke('evolution-api-manager', {
        body: {
          action: 'connect_instance',
          config_id: configId
        }
      });

      if (error) {
        console.error('Erro da API:', error);
        throw error;
      }
      
      if (!data) {
        throw new Error('Nenhum dado retornado pela API');
      }

      console.log('Resposta da API connectInstance:', data);
      
      // Aguardar um pouco e recarregar os dados
      await new Promise(resolve => setTimeout(resolve, 500));
      await loadConfigs();
      
      // Retornar o QR code se disponível
      if (data.qr_code || data.qrCode || data.base64) {
        return data.qr_code || data.qrCode || data.base64;
      }
      
      if (data.message && data.message.includes('connected')) {
        toast.success('WhatsApp já conectado');
        return null;
      }
      
      throw new Error('QR code não foi gerado pela EvolutionAPI');
    } catch (error) {
      console.error('Erro ao conectar instância:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      toast.error(`Erro ao conectar: ${errorMessage}`);
      throw error;
    }
  };

  const disconnectInstance = async (configId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('evolution-api-manager', {
        body: {
          action: 'disconnect_instance',
          config_id: configId
        }
      });

      if (error) throw error;
      
      await loadConfigs();
      toast.success('Instância desconectada');
      return data;
    } catch (error) {
      console.error('Erro ao desconectar instância:', error);
      toast.error('Erro ao desconectar instância');
      throw error;
    }
  };

  const deleteInstance = async (configId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('evolution-api-manager', {
        body: {
          action: 'delete_instance',
          config_id: configId
        }
      });

      if (error) throw error;
      
      await loadConfigs();
      toast.success('Instância removida');
      return data;
    } catch (error) {
      console.error('Erro ao remover instância:', error);
      toast.error('Erro ao remover instância');
      throw error;
    }
  };

  const updateAIAgent = async (agentId: string, updates: Partial<AIAgent>) => {
    try {
      const { data, error } = await supabase
        .from('ai_whatsapp_agents')
        .update(updates)
        .eq('id', agentId)
        .select()
        .single();

      if (error) throw error;
      
      await loadAIAgents();
      return data;
    } catch (error) {
      console.error('Erro ao atualizar agente:', error);
      throw error;
    }
  };

  const createAIAgent = async (agentData: CreateAIAgentRequest) => {
    try {
      const { data, error } = await supabase
        .from('ai_whatsapp_agents')
        .insert([{
          agent_id: agentData.agent_id,
          evolution_config_id: agentData.evolution_config_id,
          phone_number: agentData.phone_number,
          openai_api_key: agentData.openai_api_key,
          model: agentData.model,
          system_prompt: agentData.system_prompt,
          auto_response: agentData.auto_response,
          response_delay_seconds: agentData.response_delay_seconds,
          is_active: true
        }])
        .select()
        .single();

      if (error) throw error;
      
      await loadAIAgents();
      return data;
    } catch (error) {
      console.error('Erro ao criar agente IA:', error);
      throw error;
    }
  };

  const createAgentWithAutoInstance = async (agentId: string, agentName: string, phoneNumber?: string) => {
    try {
      console.log('Criando instância automática para agente:', agentId);
      
      // Verificar se já existe uma instância para este agente
      const existingConfig = configs.find(c => c.instance_name.includes(agentId));
      
      if (existingConfig) {
        console.log('Using existing configuration:', existingConfig.id);
        return existingConfig;
      }
      
      // Criar nome único para a instância
      const instanceName = `agent_${agentId.replace(/-/g, '_')}_${Date.now()}`;
      
      // Criar instância com configuração automática
      const evolutionConfig = await createInstanceWithAutoConfig(instanceName, agentId);
      
      console.log('Instância criada para agente:', evolutionConfig);
      
      return evolutionConfig;
    } catch (error) {
      console.error('Erro ao criar instância automática para agente:', error);
      throw error;
    }
  };

  const sendTestMessage = async (configId: string, phoneNumber: string, message: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('evolution-api-manager', {
        body: {
          action: 'send_message',
          config_id: configId,
          phone_number: phoneNumber,
          message: message
        }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      throw error;
    }
  };

  const testConnection = async () => {
    try {
      if (globalConfigs.length === 0) {
        throw new Error('Nenhuma configuração global encontrada');
      }

      const config = globalConfigs[0];
      const { data, error } = await supabase.functions.invoke('evolution-api-manager', {
        body: {
          action: 'test_connection',
          api_url: config.api_url,
          api_key: config.api_key
        }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao testar conexão:', error);
      throw error;
    }
  };

  const refreshData = async () => {
    setIsLoading(true);
    await loadInitialData();
  };

  return {
    configs,
    aiAgents,
    globalConfigs,
    isLoading,
    isCreating,
    error,
    createInstance,
    createInstanceWithAutoConfig,
    createAgentWithAutoInstance,
    connectInstance,
    checkInstanceStatus,
    disconnectInstance,
    deleteInstance,
    updateAIAgent,
    createAIAgent,
    sendTestMessage,
    testConnection,
    loadConfigs,
    refreshData
  };
}
