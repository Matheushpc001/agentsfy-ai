
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface EvolutionConfig {
  id: string;
  franchisee_id: string;
  instance_name: string;
  api_url: string;
  api_key: string;
  manager_url?: string;
  global_api_key?: string;
  webhook_url?: string;
  status: 'connected' | 'disconnected' | 'connecting' | 'error';
  qr_code?: string;
  qr_code_expires_at?: string;
  created_at: string;
  updated_at: string;
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

export function useEvolutionAPI(franchiseeId: string) {
  const [configs, setConfigs] = useState<EvolutionConfig[]>([]);
  const [aiAgents, setAIAgents] = useState<AIAgent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    loadConfigs();
    loadAIAgents();
    
    // Subscribe to real-time updates
    const configsSubscription = supabase
      .channel('evolution_configs_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'evolution_api_configs' },
        () => loadConfigs()
      )
      .subscribe();

    const agentsSubscription = supabase
      .channel('ai_agents_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'ai_whatsapp_agents' },
        () => loadAIAgents()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(configsSubscription);
      supabase.removeChannel(agentsSubscription);
    };
  }, [franchiseeId]);

  const loadConfigs = async () => {
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
      toast.error('Erro ao carregar configurações da EvolutionAPI');
    } finally {
      setIsLoading(false);
    }
  };

  const loadAIAgents = async () => {
    try {
      const { data, error } = await supabase
        .from('ai_whatsapp_agents')
        .select(`
          *,
          evolution_api_configs!inner(franchisee_id)
        `)
        .eq('evolution_api_configs.franchisee_id', franchiseeId);

      if (error) throw error;
      setAIAgents(data || []);
    } catch (error) {
      console.error('Erro ao carregar agentes IA:', error);
    }
  };

  const testConnection = async (apiUrl: string, apiKey: string, globalApiKey?: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('evolution-api-manager', {
        body: {
          action: 'test_connection',
          apiUrl,
          apiKey,
          globalApiKey
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

  const createInstance = async (
    instanceName: string, 
    apiUrl: string, 
    apiKey: string,
    managerUrl?: string,
    globalApiKey?: string
  ) => {
    setIsCreating(true);
    try {
      const { data, error } = await supabase.functions.invoke('evolution-api-manager', {
        body: {
          action: 'create_instance',
          franchiseeId,
          instanceName,
          apiUrl,
          apiKey,
          managerUrl,
          globalApiKey
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
      // Primeiro desconectar
      await disconnectInstance(configId);
      
      // Depois deletar do banco
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
