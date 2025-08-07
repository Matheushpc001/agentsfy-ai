// ARQUIVO: src/hooks/useEvolutionAPI.tsx

import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Agent } from "@/types";

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
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const monitoringInterval = useRef<NodeJS.Timeout | null>(null);

  const loadGlobalConfigs = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('evolution_global_configs')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setGlobalConfigs(data || []);
    } catch (err: any) {
      console.error('Erro ao carregar configurações globais:', err);
      setError('Erro ao carregar configurações globais');
    }
  }, []);

  const loadConfigs = useCallback(async () => {
    if (!franchiseeId) return;
    try {
      const { data, error } = await supabase
        .from('evolution_api_configs')
        .select('*')
        .eq('franchisee_id', franchiseeId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setConfigs(data || []);
    } catch (err: any) {
      console.error('Erro ao carregar configurações:', err);
      setError('Erro ao carregar configurações');
    }
  }, [franchiseeId]);

  const loadAIAgents = useCallback(async () => {
    if (!franchiseeId) return;
    try {
      const { data, error } = await supabase
        .from('ai_whatsapp_agents')
        .select(`*, evolution_api_configs!inner(franchisee_id)`)
        .eq('evolution_api_configs.franchisee_id', franchiseeId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setAiAgents(data || []);
    } catch (err: any) {
      console.error('Erro ao carregar agentes IA:', err);
      setError('Erro ao carregar agentes IA');
    }
  }, [franchiseeId]);

  const loadTraditionalAgents = useCallback(async () => {
    if (!franchiseeId) return;
    try {
      const { data, error } = await supabase
        .from('agents')
        .select('*')
        .eq('franchisee_id', franchiseeId);
      if (error) throw error;
      setAgents(data || []);
    } catch (err: any) {
      console.error('Erro ao carregar agentes tradicionais:', err);
      setError('Erro ao carregar agentes tradicionais');
    }
  }, [franchiseeId]);
  
  const refreshData = useCallback(async () => {
    if (!franchiseeId) return;
    setIsLoading(true);
    await Promise.all([
      loadGlobalConfigs(),
      loadConfigs(),
      loadAIAgents(),
      loadTraditionalAgents(),
    ]);
    setIsLoading(false);
  }, [franchiseeId, loadGlobalConfigs, loadConfigs, loadAIAgents, loadTraditionalAgents]);

  const stopMonitoring = useCallback(() => {
    if (monitoringInterval.current) {
      clearInterval(monitoringInterval.current);
      monitoringInterval.current = null;
      console.log('⏹️ Monitoramento de status parado.');
    }
  }, []);

  const checkSingleInstanceStatus = useCallback(async (configId: string): Promise<string | null> => {
    try {
      const { data, error } = await supabase.functions.invoke('evolution-api-manager', {
        body: { action: 'check_status', config_id: configId }
      });

      if (error) {
        console.error('Erro na verificação de status:', error);
        return null;
      }
      
      if (data?.status) {
         setConfigs(prevConfigs => 
            prevConfigs.map(c => c.id === configId ? { ...c, status: data.status, ...data.instance_data } : c)
         );
      }
      return data?.status || null;
    } catch (e) {
      console.error('Falha na chamada da função check_status', e);
      return null;
    }
  }, [setConfigs]);

  const startMonitoringStatus = useCallback((configId: string) => {
    stopMonitoring();
    console.log(`🔄 Iniciando monitoramento de status para a instância ${configId}...`);
    
    monitoringInterval.current = setInterval(async () => {
      const newStatus = await checkSingleInstanceStatus(configId);
      if (newStatus === 'connected') {
        toast.success("WhatsApp Conectado com Sucesso!");
        stopMonitoring();
        await refreshData();
      }
    }, 5000);
  }, [checkSingleInstanceStatus, stopMonitoring, refreshData]);

  useEffect(() => {
    refreshData();
    return () => {
      stopMonitoring();
    };
  }, [franchiseeId, refreshData, stopMonitoring]);

  const createInstance = async (instanceName: string) => {
    setIsCreating(true);
    try {
      const { data, error } = await supabase.functions.invoke('evolution-api-manager', {
        body: { action: 'create_instance', franchisee_id: franchiseeId, instance_name: instanceName }
      });
      if (error) throw error;
      if (!data.success) throw new Error(data.error);
      await refreshData();
      return data.config;
    } catch(err: any) {
        toast.error(`Erro ao criar instância: ${err.message}`);
        throw err;
    } finally {
      setIsCreating(false);
    }
  };

  const connectInstance = async (configId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('evolution-api-manager', {
        body: { action: 'connect_instance', config_id: configId }
      });

      if (error) throw new Error(error.message);
      if (!data.success) throw new Error(data.error || 'Falha ao conectar');
      
      if (data.qr_code) {
        startMonitoringStatus(configId);
        return data.qr_code;
      }
      return null;
    } catch (err: any) {
       toast.error(`Erro ao conectar: ${err.message}`);
       throw err;
    }
  };
  
  const disconnectInstance = async (configId: string) => {
    try {
        await supabase.functions.invoke('evolution-api-manager', {
          body: { action: 'disconnect_instance', config_id: configId }
        });
        await refreshData();
    } catch (err: any) {
        toast.error(`Erro ao desconectar: ${err.message}`);
        throw err;
    }
  };

  const deleteInstance = async (configId: string) => {
    try {
        await supabase.functions.invoke('evolution-api-manager', {
          body: { action: 'delete_instance', config_id: configId }
        });
        await refreshData();
    } catch (err: any) {
        toast.error(`Erro ao deletar: ${err.message}`);
        throw err;
    }
  };
  
  // As funções abaixo não foram implementadas na UI ainda, mas estão aqui para o futuro
  const updateAIAgent = async (agentId: string, updates: Partial<AIAgent>) => { /* ... */ };
  const createAIAgent = async (agentData: CreateAIAgentRequest) => { /* ... */ };
  const sendTestMessage = async (configId: string, phoneNumber: string, message: string) => { /* ... */ };
  const testConnection = async () => { /* ... */ };

  return {
    configs,
    aiAgents,
    globalConfigs,
    agents,
    isLoading,
    isCreating,
    error,
    createInstance,
    connectInstance,
    disconnectInstance,
    deleteInstance,
    updateAIAgent,
    createAIAgent,
    sendTestMessage,
    testConnection,
    refreshData,
    stopMonitoring,
  };
}