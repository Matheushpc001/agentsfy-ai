import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = 'https://kzxiqdakyfxtyyuybwtl.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt6eGlxZGFreWZ4dHl5dXlid3RsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg0NTYwNjksImV4cCI6MjA2NDAzMjA2OX0.8GwAjmdwup-i7gfhHKAxKi2Uufr3JAisKj5jg0qIALk';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const { action, ...params } = await req.json();

    console.log('Action:', action, 'Params:', params);

    switch (action) {
      case 'create_instance':
        return await createInstance(supabase, params);
      case 'create_instance_with_global':
        return await createInstanceWithGlobal(supabase, params);
      case 'connect_instance':
        return await connectInstance(supabase, params);
      case 'disconnect_instance':
        return await disconnectInstance(supabase, params);
      case 'send_message':
        return await sendMessage(supabase, params);
      case 'create_ai_agent':
        return await createAIAgent(supabase, params);
      case 'update_ai_agent':
        return await updateAIAgent(supabase, params);
      case 'test_connection':
        return await testConnection(supabase, params);
      case 'test_connection_global':
        return await testConnectionGlobal(supabase, params);
      default:
        throw new Error(`Ação não reconhecida: ${action}`);
    }

  } catch (error) {
    console.error('Erro no manager:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: error.stack 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function createInstanceWithGlobal(supabase: any, params: any) {
  const { franchiseeId, instanceName, globalConfigId } = params;

  // Get global config
  const { data: globalConfig, error: globalError } = await supabase
    .from('evolution_global_configs')
    .select('*')
    .eq('id', globalConfigId)
    .eq('is_active', true)
    .single();

  if (globalError || !globalConfig) {
    throw new Error('Configuração global não encontrada ou inativa');
  }

  // Check if instance already exists
  const { data: existing } = await supabase
    .from('evolution_api_configs')
    .select('id')
    .eq('franchisee_id', franchiseeId)
    .eq('instance_name', instanceName)
    .single();

  if (existing) {
    throw new Error('Uma instância com este nome já existe');
  }

  // Configure webhook URL
  const webhookUrl = `${supabaseUrl}/functions/v1/evolution-webhook`;

  // Create config in database
  const { data: config, error } = await supabase
    .from('evolution_api_configs')
    .insert({
      franchisee_id: franchiseeId,
      instance_name: instanceName,
      global_config_id: globalConfigId,
      webhook_url: webhookUrl,
      status: 'disconnected'
    })
    .select()
    .single();

  if (error) throw error;

  try {
    // Create instance in EvolutionAPI
    const createResponse = await fetch(`${globalConfig.api_url}/instance/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': globalConfig.global_api_key || globalConfig.api_key
      },
      body: JSON.stringify({
        instanceName,
        integration: 'WHATSAPP-BAILEYS',
        webhook: webhookUrl,
        webhook_by_events: true,
        events: [
          'APPLICATION_STARTUP',
          'QRCODE_UPDATED',
          'CONNECTION_UPDATE',
          'MESSAGES_UPSERT',
          'MESSAGES_UPDATE',
          'MESSAGES_DELETE',
          'SEND_MESSAGE',
          'CONTACTS_UPDATE',
          'CONTACTS_UPSERT',
          'PRESENCE_UPDATE',
          'CHATS_UPDATE',
          'CHATS_UPSERT',
          'CHATS_DELETE',
          'GROUPS_UPSERT',
          'GROUP_UPDATE',
          'GROUP_PARTICIPANTS_UPDATE',
          'NEW_JWT_TOKEN'
        ]
      })
    });

    if (!createResponse.ok) {
      const errorText = await createResponse.text();
      console.error('Erro ao criar instância:', errorText);
      throw new Error(`Falha ao criar instância: ${errorText}`);
    }

    const createResult = await createResponse.json();
    console.log('Instância criada:', createResult);

    return new Response(JSON.stringify({ 
      success: true, 
      config,
      evolutionResponse: createResult 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (evolutionError) {
    console.error('Erro da EvolutionAPI:', evolutionError);
    
    // Remove config from database if EvolutionAPI failed
    await supabase
      .from('evolution_api_configs')
      .delete()
      .eq('id', config.id);

    throw new Error(`Erro ao criar instância na EvolutionAPI: ${evolutionError.message}`);
  }
}

async function testConnectionGlobal(supabase: any, params: any) {
  const { globalConfigId } = params;

  const { data: globalConfig, error } = await supabase
    .from('evolution_global_configs')
    .select('*')
    .eq('id', globalConfigId)
    .eq('is_active', true)
    .single();

  if (error || !globalConfig) {
    throw new Error('Configuração global não encontrada');
  }

  try {
    const testResponse = await fetch(`${globalConfig.api_url}/instance/fetchInstances`, {
      method: 'GET',
      headers: {
        'apikey': globalConfig.global_api_key || globalConfig.api_key
      }
    });

    if (!testResponse.ok) {
      throw new Error(`Falha na conexão: ${testResponse.statusText}`);
    }

    const result = await testResponse.json();

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Conexão testada com sucesso',
      instances: result 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Erro ao testar conexão:', error);
    throw new Error(`Erro de conexão: ${error.message}`);
  }
}

async function createInstance(supabase: any, params: any) {
  const { franchiseeId, instanceName, apiUrl, apiKey, managerUrl, globalApiKey } = params;

  // Check if instance already exists
  const { data: existing } = await supabase
    .from('evolution_api_configs')
    .select('id')
    .eq('franchisee_id', franchiseeId)
    .eq('instance_name', instanceName)
    .single();

  if (existing) {
    throw new Error('Uma instância com este nome já existe');
  }

  // Configure webhook URL
  const webhookUrl = `${supabaseUrl}/functions/v1/evolution-webhook`;

  // Create config in database
  const { data: config, error } = await supabase
    .from('evolution_api_configs')
    .insert({
      franchisee_id: franchiseeId,
      instance_name: instanceName,
      webhook_url: webhookUrl,
      status: 'disconnected'
    })
    .select()
    .single();

  if (error) throw error;

  try {
    // Create instance in EvolutionAPI
    const createResponse = await fetch(`${apiUrl}/instance/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': globalApiKey || apiKey
      },
      body: JSON.stringify({
        instanceName,
        integration: 'WHATSAPP-BAILEYS',
        webhook: webhookUrl,
        webhook_by_events: true,
        events: [
          'APPLICATION_STARTUP',
          'QRCODE_UPDATED',
          'CONNECTION_UPDATE',
          'MESSAGES_UPSERT',
          'MESSAGES_UPDATE',
          'MESSAGES_DELETE',
          'SEND_MESSAGE',
          'CONTACTS_UPDATE',
          'CONTACTS_UPSERT',
          'PRESENCE_UPDATE',
          'CHATS_UPDATE',
          'CHATS_UPSERT',
          'CHATS_DELETE',
          'GROUPS_UPSERT',
          'GROUP_UPDATE',
          'GROUP_PARTICIPANTS_UPDATE',
          'NEW_JWT_TOKEN'
        ]
      })
    });

    if (!createResponse.ok) {
      const errorText = await createResponse.text();
      console.error('Erro ao criar instância:', errorText);
      throw new Error(`Falha ao criar instância: ${errorText}`);
    }

    const createResult = await createResponse.json();
    console.log('Instância criada:', createResult);

    return new Response(JSON.stringify({ 
      success: true, 
      config,
      evolutionResponse: createResult 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (evolutionError) {
    console.error('Erro da EvolutionAPI:', evolutionError);
    
    // Remove config from database if EvolutionAPI failed
    await supabase
      .from('evolution_api_configs')
      .delete()
      .eq('id', config.id);

    throw new Error(`Erro ao criar instância na EvolutionAPI: ${evolutionError.message}`);
  }
}

async function connectInstance(supabase: any, params: any) {
  const { configId } = params;

  // Get config with global config joined
  const { data: config, error } = await supabase
    .from('evolution_api_configs')
    .select(`
      *,
      evolution_global_configs(
        api_url,
        api_key,
        global_api_key
      )
    `)
    .eq('id', configId)
    .single();

  if (error || !config) {
    throw new Error('Configuração não encontrada');
  }

  const globalConfig = config.evolution_global_configs;
  const apiUrl = globalConfig?.api_url;
  const apiKey = globalConfig?.global_api_key || globalConfig?.api_key;

  if (!apiUrl || !apiKey) {
    throw new Error('Configuração global da API não encontrada');
  }

  try {
    // Connect instance
    const connectResponse = await fetch(`${apiUrl}/instance/connect/${config.instance_name}`, {
      method: 'GET',
      headers: {
        'apikey': apiKey
      }
    });

    if (!connectResponse.ok) {
      throw new Error(`Falha ao conectar: ${connectResponse.statusText}`);
    }

    const connectResult = await connectResponse.json();

    // Update status
    await supabase
      .from('evolution_api_configs')
      .update({ status: 'connecting' })
      .eq('id', configId);

    return new Response(JSON.stringify({ 
      success: true, 
      qrCode: connectResult.base64,
      result: connectResult 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Erro ao conectar instância:', error);
    throw error;
  }
}

async function disconnectInstance(supabase: any, params: any) {
  const { configId } = params;

  const { data: config, error } = await supabase
    .from('evolution_api_configs')
    .select(`
      *,
      evolution_global_configs(
        api_url,
        api_key,
        global_api_key
      )
    `)
    .eq('id', configId)
    .single();

  if (error || !config) {
    throw new Error('Configuração não encontrada');
  }

  const globalConfig = config.evolution_global_configs;
  const apiUrl = globalConfig?.api_url;
  const apiKey = globalConfig?.global_api_key || globalConfig?.api_key;

  if (apiUrl && apiKey) {
    try {
      // Disconnect instance
      await fetch(`${apiUrl}/instance/logout/${config.instance_name}`, {
        method: 'DELETE',
        headers: {
          'apikey': apiKey
        }
      });
    } catch (error) {
      console.error('Erro ao desconectar instância via API:', error);
    }
  }

  // Update status regardless of API response
  await supabase
    .from('evolution_api_configs')
    .update({ 
      status: 'disconnected',
      qr_code: null,
      qr_code_expires_at: null
    })
    .eq('id', configId);

  return new Response(JSON.stringify({ success: true }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function sendMessage(supabase: any, params: any) {
  const { configId, phoneNumber, message } = params;

  const { data: config, error } = await supabase
    .from('evolution_api_configs')
    .select(`
      *,
      evolution_global_configs(
        api_url,
        api_key,
        global_api_key
      )
    `)
    .eq('id', configId)
    .single();

  if (error || !config) {
    throw new Error('Configuração não encontrada');
  }

  if (config.status !== 'connected') {
    throw new Error('Instância não está conectada');
  }

  const globalConfig = config.evolution_global_configs;
  const apiUrl = globalConfig?.api_url;
  const apiKey = globalConfig?.global_api_key || globalConfig?.api_key;

  if (!apiUrl || !apiKey) {
    throw new Error('Configuração global da API não encontrada');
  }

  try {
    const sendResponse = await fetch(`${apiUrl}/message/sendText/${config.instance_name}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': apiKey
      },
      body: JSON.stringify({
        number: phoneNumber,
        text: message
      })
    });

    if (!sendResponse.ok) {
      throw new Error(`Falha ao enviar mensagem: ${sendResponse.statusText}`);
    }

    const result = await sendResponse.json();

    return new Response(JSON.stringify({ success: true, result }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Erro ao enviar mensagem:', error);
    throw error;
  }
}

async function createAIAgent(supabase: any, params: any) {
  const { 
    agent_id, 
    evolution_config_id, 
    phone_number, 
    openai_api_key, 
    model, 
    system_prompt,
    auto_response,
    response_delay_seconds 
  } = params;

  const { data: agent, error } = await supabase
    .from('ai_whatsapp_agents')
    .insert({
      agent_id: agent_id,
      evolution_config_id: evolution_config_id,
      phone_number: phone_number,
      openai_api_key: openai_api_key,
      model: model || 'gpt-4o-mini',
      system_prompt: system_prompt,
      auto_response: auto_response !== false,
      response_delay_seconds: response_delay_seconds || 2,
      is_active: true
    })
    .select()
    .single();

  if (error) throw error;

  return new Response(JSON.stringify({ success: true, agent }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function updateAIAgent(supabase: any, params: any) {
  const { agentId, updates } = params;

  const { data: agent, error } = await supabase
    .from('ai_whatsapp_agents')
    .update(updates)
    .eq('id', agentId)
    .select()
    .single();

  if (error) throw error;

  return new Response(JSON.stringify({ success: true, agent }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function testConnection(supabase: any, params: any) {
  const { apiUrl, apiKey, globalApiKey } = params;

  try {
    const testResponse = await fetch(`${apiUrl}/instance/fetchInstances`, {
      method: 'GET',
      headers: {
        'apikey': globalApiKey || apiKey
      }
    });

    if (!testResponse.ok) {
      throw new Error(`Falha na conexão: ${testResponse.statusText}`);
    }

    const result = await testResponse.json();

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Conexão testada com sucesso',
      instances: result 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Erro ao testar conexão:', error);
    throw new Error(`Erro de conexão: ${error.message}`);
  }
}
