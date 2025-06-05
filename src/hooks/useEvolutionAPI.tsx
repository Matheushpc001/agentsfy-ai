
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';

interface EvolutionConfig {
  id: string;
  franchisee_id: string;
  instance_name: string;
  global_config_id?: string;
  webhook_url?: string;
  status: 'connected' | 'disconnected' | 'connecting' | 'error';
  qr_code?: string;
  qr_code_expires_at?: string;
  created_at: string;
  updated_at: string;
  global_config?: {
    api_url: string;
    api_key: string;
    manager_url?: string;
    global_api_key?: string;
  };
}

interface AIAgent {
  id: string;
  agent_id: string;
  evolution_config_id: string;
  phone_number: string;
  is_active: boolean;
  openai_api_key?: string;
  model: string;
  system_prompt?: string;
  auto_response?: boolean;
  response_delay_seconds?: number;
  created_at: string;
  updated_at: string;
}

interface GlobalConfig {
  id: string;
  name: string;
  api_url: string;
  api_key: string;
  manager_url?: string;
  global_api_key?: string;
  is_active: boolean;
}

export function useEvolutionAPI(franchiseeId?: string) {
  const { user } = useAuth();
  const [configs, setConfigs] = useState<EvolutionConfig[]>([]);
  const [globalConfigs, setGlobalConfigs] = useState<GlobalConfig[]>([]);
  const [aiAgents, setAIAgents] = useState<AIAgent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  const effectiveFranchiseeId = franchiseeId || user?.id;

  useEffect(() => {
    if (!effectiveFranchiseeId) {
      setIsLoading(false);
      return;
    }

    loadConfigs();
    loadGlobalConfigs();
    loadAIAgents();
    
    const timestamp = Date.now();
    const configChannelName = `evolution_configs_${effectiveFranchiseeId}_${timestamp}`;
    const agentsChannelName = `ai_agents_${effectiveFranchiseeId}_${timestamp}`;
    
    const configsSubscription = supabase
      .channel(configChannelName)
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'evolution_api_configs' },
        () => {
          console.log('Evolution configs changed, reloading...');
          loadConfigs();
        }
      )
      .subscribe();

    const agentsSubscription = supabase
      .channel(agentsChannelName)
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'ai_whatsapp_agents' },
        () => {
          console.log('AI agents changed, reloading...');
          loadAIAgents();
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up Evolution API subscriptions');
      supabase.removeChannel(configsSubscription);
      supabase.removeChannel(agentsSubscription);
    };
  }, [effectiveFranchiseeId]);

  const loadConfigs = async () => {
    if (!effectiveFranchiseeId) return;
    
    try {
      const { data, error } = await supabase
        .from('evolution_api_configs')
        .select(`
          *,
          evolution_global_configs(
            api_url,
            api_key,
            manager_url,
            global_api_key
          )
        `)
        .eq('franchisee_id', effectiveFranchiseeId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const transformedData = data?.map(config => ({
        ...config,
        global_config: config.evolution_global_configs
      })) || [];
      
      setConfigs(transformedData);
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
      toast.error('Erro ao carregar configurações da EvolutionAPI');
    } finally {
      setIsLoading(false);
    }
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
    }
  };

  const loadAIAgents = async () => {
    if (!effectiveFranchiseeId) return;
    
    try {
      const { data, error } = await supabase
        .from('ai_whatsapp_agents')
        .select(`
          *,
          evolution_api_configs!inner(franchisee_id)
        `)
        .eq('evolution_api_configs.franchisee_id', effectiveFranchiseeId);

      if (error) throw error;
      setAIAgents(data || []);
    } catch (error) {
      console.error('Erro ao carregar agentes IA:', error);
    }
  };

  const testConnection = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('evolution-api-manager', {
        body: {
          action: 'test_connection_global'
        }
      });

      if (error) throw error;

      toast.success('Conexão testada com sucesso!');
      return data;

    } catch (error) {
      console.error('Erro ao testar conexão:', error);
      toast.error('Erro ao testar conexão com a EvolutionAPI');
      throw error;
    }
  };

  const createInstance = async (instanceName: string) => {
    if (!effectiveFranchiseeId) {
      throw new Error('User ID not available');
    }

    setIsCreating(true);
    try {
      const { data, error } = await supabase.functions.invoke('evolution-api-manager', {
        body: {
          action: 'create_instance_with_global',
          franchiseeId: effectiveFranchiseeId,
          instanceName
        }
      });

      if (error) throw error;

      toast.success('Instância criada com sucesso!');
      await loadConfigs();
      return data.config;

    } catch (error) {
      console.error('Erro ao criar instância:', error);
      toast.error(`Erro ao criar instância: ${error.message}`);
      throw error;
    } finally {
      setIsCreating(false);
    }
  };

  const connectInstance = async (configId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('evolution-api-manager', {
        body: {
          action: 'connect_instance',
          configId
        }
      });

      if (error) throw error;

      toast.success('Conectando ao WhatsApp...');
      return data.qrCode;

    } catch (error) {
      console.error('Erro ao conectar instância:', error);
      toast.error('Erro ao conectar com WhatsApp');
      throw error;
    }
  };

  const disconnectInstance = async (configId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('evolution-api-manager', {
        body: {
          action: 'disconnect_instance',
          configId
        }
      });

      if (error) throw error;

      toast.success('Instância desconectada');
      await loadConfigs();

    } catch (error) {
      console.error('Erro ao desconectar instância:', error);
      toast.error('Erro ao desconectar instância');
    }
  };

  const createAIAgent = async (agentData: Partial<AIAgent>) => {
    try {
      const { data, error } = await supabase.functions.invoke('evolution-api-manager', {
        body: {
          action: 'create_ai_agent',
          ...agentData
        }
      });

      if (error) throw error;

      toast.success('Agente IA criado com sucesso!');
      await loadAIAgents();
      return data.agent;

    } catch (error) {
      console.error('Erro ao criar agente IA:', error);
      toast.error('Erro ao criar agente IA');
      throw error;
    }
  };

  const updateAIAgent = async (agentId: string, updates: Partial<AIAgent>) => {
    try {
      const { data, error } = await supabase.functions.invoke('evolution-api-manager', {
        body: {
          action: 'update_ai_agent',
          agentId,
          updates
        }
      });

      if (error) throw error;

      toast.success('Agente IA atualizado!');
      await loadAIAgents();
      return data.agent;

    } catch (error) {
      console.error('Erro ao atualizar agente IA:', error);
      toast.error('Erro ao atualizar agente IA');
      throw error;
    }
  };

  const sendTestMessage = async (configId: string, phoneNumber: string, message: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('evolution-api-manager', {
        body: {
          action: 'send_message',
          configId,
          phoneNumber,
          message
        }
      });

      if (error) throw error;

      toast.success('Mensagem de teste enviada!');
      return data.result;

    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      toast.error('Erro ao enviar mensagem de teste');
      throw error;
    }
  };

  const deleteInstance = async (configId: string) => {
    try {
      await disconnectInstance(configId);
      
      const { error } = await supabase
        .from('evolution_api_configs')
        .delete()
        .eq('id', configId);

      if (error) throw error;

      toast.success('Instância removida com sucesso!');
      await loadConfigs();

    } catch (error) {
      console.error('Erro ao deletar instância:', error);
      toast.error('Erro ao remover instância');
      throw error;
    }
  };

  return {
    configs,
    globalConfigs,
    aiAgents,
    isLoading,
    isCreating,
    testConnection,
    createInstance,
    connectInstance,
    disconnectInstance,
    createAIAgent,
    updateAIAgent,
    sendTestMessage,
    deleteInstance,
    loadConfigs,
    loadAIAgents
  };
}
