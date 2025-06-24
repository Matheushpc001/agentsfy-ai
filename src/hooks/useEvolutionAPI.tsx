
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

export function useEvolutionAPI(franchiseeId: string) {
  const [configs, setConfigs] = useState<EvolutionConfig[]>([]);
  const [aiAgents, setAiAgents] = useState<AIAgent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!franchiseeId) return;
    
    loadConfigs();
    loadAIAgents();
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
      setError('Erro ao carregar configurações');
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
        .eq('evolution_api_configs.franchisee_id', franchiseeId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAiAgents(data || []);
    } catch (error) {
      console.error('Erro ao carregar agentes IA:', error);
      setError('Erro ao carregar agentes IA');
    } finally {
      setIsLoading(false);
    }
  };

  const createInstance = async (instanceName: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('evolution-api-manager', {
        body: {
          action: 'create_instance',
          franchisee_id: franchiseeId,
          instance_name: instanceName
        }
      });

      if (error) throw error;
      
      await loadConfigs();
      toast.success('Instância criada com sucesso');
      return data;
    } catch (error) {
      console.error('Erro ao criar instância:', error);
      toast.error('Erro ao criar instância');
      throw error;
    }
  };

  const connectInstance = async (configId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('evolution-api-manager', {
        body: {
          action: 'connect_instance',
          config_id: configId
        }
      });

      if (error) throw error;
      
      await loadConfigs();
      return data;
    } catch (error) {
      console.error('Erro ao conectar instância:', error);
      toast.error('Erro ao conectar instância');
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

  const refreshData = async () => {
    setIsLoading(true);
    await Promise.all([loadConfigs(), loadAIAgents()]);
    setIsLoading(false);
  };

  return {
    configs,
    aiAgents,
    isLoading,
    error,
    createInstance,
    connectInstance,
    disconnectInstance,
    deleteInstance,
    updateAIAgent,
    sendTestMessage,
    refreshData
  };
}
