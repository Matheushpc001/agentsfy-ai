
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { action, ...params } = await req.json();

    console.log('Evolution API Manager - Action:', action, 'Params:', params);

    switch (action) {
      case 'create_instance':
        return await createInstanceWithGlobal(supabase, params);
      case 'connect_instance':
        return await connectInstance(supabase, params);
      case 'disconnect_instance':
        return await disconnectInstance(supabase, params);
      case 'delete_instance':
        return await deleteInstance(supabase, params);
      case 'send_message':
        return await sendMessage(supabase, params);
      case 'test_connection':
        return await testConnectionGlobal(supabase, params);
      default:
        throw new Error(`Ação não reconhecida: ${action}`);
    }

  } catch (error) {
    console.error('Erro no Evolution API Manager:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: error.stack 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function getActiveGlobalConfig(supabase: any) {
  const { data: globalConfigs, error } = await supabase
    .from('evolution_global_configs')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(1);

  if (error || !globalConfigs || globalConfigs.length === 0) {
    throw new Error('Nenhuma configuração global ativa encontrada. Configure a EvolutionAPI no painel admin.');
  }

  return globalConfigs[0];
}

async function createInstanceWithGlobal(supabase: any, params: any) {
  const { franchisee_id, instance_name, agent_id } = params;
  console.log('Creating instance for franchisee:', franchisee_id, 'with name:', instance_name);

  // Get active global config automatically
  const globalConfig = await getActiveGlobalConfig(supabase);
  console.log('Using global config:', globalConfig.name, 'API URL:', globalConfig.api_url);

  // Check if instance already exists
  const { data: existing } = await supabase
    .from('evolution_api_configs')
    .select('*')
    .eq('franchisee_id', franchisee_id)
    .eq('instance_name', instance_name)
    .single();

  if (existing) {
    console.log('Instance already exists, returning existing config:', existing.id);
    return new Response(JSON.stringify({ 
      success: true, 
      config: existing,
      message: 'Instance already exists'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Create config in database first
  const { data: config, error } = await supabase
    .from('evolution_api_configs')
    .insert({
      franchisee_id: franchisee_id,
      instance_name: instance_name,
      global_config_id: globalConfig.id,
      webhook_url: null, // Inicialmente null, será definido após criação
      status: 'disconnected'
    })
    .select()
    .single();

  if (error) {
    console.error('Database insert error:', error);
    throw error;
  }

  console.log('Config created in database:', config.id);

  try {
    // Create instance in EvolutionAPI without webhook initially
    const createPayload = {
      instanceName: instance_name,
      integration: 'WHATSAPP-BAILEYS'
    };

    console.log('Creating instance in EvolutionAPI with payload:', createPayload);

    const createResponse = await fetch(`${globalConfig.api_url}/instance/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': globalConfig.global_api_key || globalConfig.api_key
      },
      body: JSON.stringify(createPayload)
    });

    const responseText = await createResponse.text();
    console.log('EvolutionAPI create response status:', createResponse.status);
    console.log('EvolutionAPI create response:', responseText);

    if (!createResponse.ok) {
      console.error('EvolutionAPI create failed:', responseText);
      throw new Error(`Falha ao criar instância na EvolutionAPI: ${createResponse.status} - ${responseText}`);
    }

    let createResult;
    try {
      createResult = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse EvolutionAPI response:', parseError);
      createResult = { success: true, raw_response: responseText };
    }

    console.log('Instância criada com sucesso na EvolutionAPI');

    // Update config with webhook URL after successful creation
    const webhookUrl = `${supabaseUrl}/functions/v1/evolution-webhook`;
    await supabase
      .from('evolution_api_configs')
      .update({ webhook_url: webhookUrl })
      .eq('id', config.id);

    console.log('Webhook URL updated in database');

    return new Response(JSON.stringify({ 
      success: true, 
      config: { ...config, webhook_url: webhookUrl },
      evolutionResponse: createResult 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (evolutionError) {
    console.error('Erro da EvolutionAPI ao criar instância:', evolutionError);
    
    // Remove config from database if EvolutionAPI failed
    await supabase
      .from('evolution_api_configs')
      .delete()
      .eq('id', config.id);

    throw new Error(`Erro ao criar instância na EvolutionAPI: ${evolutionError.message}`);
  }
}

async function connectInstance(supabase: any, params: any) {
  const { config_id } = params;
  console.log('Connecting instance for config:', config_id);

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
    .eq('id', config_id)
    .single();

  if (error || !config) {
    console.error('Config not found:', error);
    throw new Error('Configuração não encontrada');
  }

  const globalConfig = config.evolution_global_configs;
  const apiUrl = globalConfig?.api_url;
  const apiKey = globalConfig?.global_api_key || globalConfig?.api_key;

  if (!apiUrl || !apiKey) {
    console.error('Missing API configuration:', { apiUrl: !!apiUrl, apiKey: !!apiKey });
    throw new Error('Configuração global da API não encontrada');
  }

  console.log('Connecting instance:', config.instance_name, 'at:', apiUrl);

  try {
    // Connect instance and get QR code
    const connectResponse = await fetch(`${apiUrl}/instance/connect/${config.instance_name}`, {
      method: 'GET',
      headers: {
        'apikey': apiKey
      }
    });

    const responseText = await connectResponse.text();
    console.log('Connect response status:', connectResponse.status);
    console.log('Connect response text:', responseText);

    if (!connectResponse.ok) {
      console.error('Connect failed:', responseText);
      throw new Error(`Falha ao conectar: ${connectResponse.status} - ${responseText}`);
    }

    let connectResult;
    try {
      connectResult = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse connect response:', parseError);
      throw new Error('Resposta inválida da EvolutionAPI');
    }

    console.log('Connect result received:', connectResult);

    // Update status to connecting
    await supabase
      .from('evolution_api_configs')
      .update({ 
        status: 'connecting',
        qr_code: connectResult.base64 || connectResult.qrcode || connectResult.qr,
        qr_code_expires_at: new Date(Date.now() + 2 * 60 * 1000).toISOString()
      })
      .eq('id', config_id);

    // Return QR code in base64 format
    const qrCode = connectResult.base64 || connectResult.qrcode || connectResult.qr;
    
    if (!qrCode) {
      console.error('No QR code in response:', connectResult);
      throw new Error('QR code não encontrado na resposta da EvolutionAPI');
    }

    console.log('QR code generated successfully');

    return new Response(JSON.stringify({ 
      success: true, 
      qr_code: qrCode,
      base64: qrCode,
      qrCode: qrCode,
      result: connectResult 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Erro ao conectar instância:', error);
    
    await supabase
      .from('evolution_api_configs')
      .update({ status: 'error' })
      .eq('id', config_id);
      
    throw error;
  }
}

async function disconnectInstance(supabase: any, params: any) {
  const { config_id } = params;

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
    .eq('id', config_id)
    .single();

  if (error || !config) {
    throw new Error('Configuração não encontrada');
  }

  const globalConfig = config.evolution_global_configs;
  const apiUrl = globalConfig?.api_url;
  const apiKey = globalConfig?.global_api_key || globalConfig?.api_key;

  if (apiUrl && apiKey) {
    try {
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

  await supabase
    .from('evolution_api_configs')
    .update({ 
      status: 'disconnected',
      qr_code: null,
      qr_code_expires_at: null
    })
    .eq('id', config_id);

  return new Response(JSON.stringify({ success: true }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function deleteInstance(supabase: any, params: any) {
  const { config_id } = params;

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
    .eq('id', config_id)
    .single();

  if (error || !config) {
    throw new Error('Configuração não encontrada');
  }

  const globalConfig = config.evolution_global_configs;
  const apiUrl = globalConfig?.api_url;
  const apiKey = globalConfig?.global_api_key || globalConfig?.api_key;

  if (apiUrl && apiKey) {
    try {
      await fetch(`${apiUrl}/instance/delete/${config.instance_name}`, {
        method: 'DELETE',
        headers: {
          'apikey': apiKey
        }
      });
    } catch (error) {
      console.error('Erro ao deletar instância via API:', error);
    }
  }

  await supabase
    .from('evolution_api_configs')
    .delete()
    .eq('id', config_id);

  return new Response(JSON.stringify({ success: true }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function sendMessage(supabase: any, params: any) {
  const { config_id, phone_number, message } = params;

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
    .eq('id', config_id)
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
        number: phone_number,
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

async function testConnectionGlobal(supabase: any, params: any) {
  const { globalConfigId } = params;
  console.log('Testing global connection for config:', globalConfigId);

  let globalConfig;
  
  if (globalConfigId) {
    const { data, error } = await supabase
      .from('evolution_global_configs')
      .select('*')
      .eq('id', globalConfigId)
      .eq('is_active', true)
      .single();

    if (error || !data) {
      console.error('Specific global config not found:', error);
      throw new Error('Configuração global específica não encontrada');
    }
    globalConfig = data;
  } else {
    // Get any active global config
    globalConfig = await getActiveGlobalConfig(supabase);
  }

  try {
    console.log('Testing connection to:', globalConfig.api_url);
    
    const testResponse = await fetch(`${globalConfig.api_url}/instance/fetchInstances`, {
      method: 'GET',
      headers: {
        'apikey': globalConfig.global_api_key || globalConfig.api_key
      }
    });

    const responseText = await testResponse.text();
    console.log('Test connection response status:', testResponse.status);

    if (!testResponse.ok) {
      throw new Error(`Falha na conexão: ${testResponse.status} - ${responseText}`);
    }

    let result;
    try {
      result = JSON.parse(responseText);
    } catch (parseError) {
      result = { raw_response: responseText };
    }

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
