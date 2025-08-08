// ARQUIVO: supabase/functions/evolution-api-manager/index.ts v1

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.0.0"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, ...params } = await req.json();
    console.log('Evolution API Manager - Action:', action, 'Params:', params);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase environment variables not configured');
    }
    const supabase = createClient(supabaseUrl, supabaseKey);

    switch (action) {
      // Ações Originais
      case 'create_instance':
        return await handleCreateInstance(supabase, params);
      case 'connect_instance':
        return await handleConnectInstance(supabase, params);
      case 'check_status':
        return await handleCheckStatus(supabase, params);
      case 'disconnect_instance':
        return await handleDisconnectInstance(supabase, params);
      case 'delete_instance':
        return await handleDeleteInstance(supabase, params);
      case 'send_message':
        return await handleSendMessage(supabase, params);
      case 'test_connection':
        return await handleTestConnection(params);
      case 'force_status_sync':
        return await handleForceStatusSync(supabase, params);
      
      // ### NOVAS AÇÕES PARA IA NATIVA DA EVOLUTION V2 ###
      case 'openai_set_creds':
        return await handleOpenAISetCreds(supabase, params);
      case 'openai_create_bot':
        return await handleOpenAICreateBot(supabase, params);
      case 'openai_set_defaults':
        return await handleOpenAISetDefaults(supabase, params);

      default:
        return new Response(JSON.stringify({ error: 'Ação não reconhecida' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
  } catch (error) {
    console.error('Erro no Evolution API Manager:', error);
    return new Response(JSON.stringify({ error: error.message || 'Erro interno do servidor', details: error.toString() }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});

// --- FUNÇÕES DE AJUDA ---
async function getGlobalConfigForInstance(supabase: any, instanceName: string) {
    const { data: config, error } = await supabase
      .from('evolution_api_configs')
      .select(`instance_name, evolution_global_configs (*)`)
      .eq('instance_name', instanceName)
      .single();

    if (error || !config || !config.evolution_global_configs) {
        throw new Error(`Configuração global não encontrada para a instância ${instanceName}. Erro: ${error?.message}`);
    }
    return config.evolution_global_configs;
}

// --- FUNÇÕES DE AÇÃO (EXISTENTES) ---
// (As funções handleCreateInstance, handleConnectInstance, handleCheckStatus, etc., permanecem aqui sem alterações)
// ... (código anterior omitido por brevidade, ele não muda)

async function handleCreateInstance(supabase: any, params: any) {
  const { franchisee_id, instance_name, agent_id } = params;
  
  console.log('Creating instance for franchisee:', franchisee_id, 'with name:', instance_name);
  
  try {
    if (!franchisee_id || !instance_name) {
      throw new Error('Parâmetros obrigatórios ausentes: franchisee_id e instance_name');
    }

    // Buscar configuração global ativa
    const { data: globalConfig, error: globalError } = await supabase
      .from('evolution_global_configs')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (globalError || !globalConfig) {
      console.error('❌ Erro ao buscar configuração global ou nenhuma ativa encontrada:', globalError);
      throw new Error('Nenhuma configuração global da EvolutionAPI ativa foi encontrada.');
    }
    
    console.log('✅ Usando configuração global:', globalConfig.name, 'URL:', globalConfig.api_url);

    // Verificar se a URL da API é válida
    if (!globalConfig.api_url || !globalConfig.api_key) {
      throw new Error('Configuração global inválida: URL ou chave da API ausente');
    }

    // Criar configuração local primeiro
    const configData = {
      franchisee_id,
      instance_name,
      global_config_id: globalConfig.id,
      status: 'disconnected',
      webhook_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/evolution-webhook`
    };

    console.log('Inserting config with data:', configData);

    const { data: newConfig, error: configError } = await supabase
      .from('evolution_api_configs')
      .insert([configData])
      .select()
      .single();

    if (configError) {
      console.error('❌ Erro ao criar configuração local no DB:', configError);
      throw new Error(`Erro ao criar configuração: ${configError.message}`);
    }
    
    console.log('✅ Config created in database:', newConfig.id);

    // Tentar criar instância na EvolutionAPI
    const createPayload = {
      instanceName: instance_name,
      integration: 'WHATSAPP-BAILEYS',
      webhook: {
        url: configData.webhook_url,
        enabled: true,
        webhook_by_events: false,
        events: ['APPLICATION_STARTUP', 'QRCODE_UPDATED', 'CONNECTION_UPDATE', 'MESSAGES_UPSERT']
      }
    };

    console.log('Creating instance in EvolutionAPI with payload:', createPayload);

    try {
      const createResponse = await fetch(`${globalConfig.api_url}/instance/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': globalConfig.api_key
        },
        body: JSON.stringify(createPayload)
      });

      console.log('EvolutionAPI create response status:', createResponse.status);

      if (!createResponse.ok && createResponse.status !== 409) {
          const errorText = await createResponse.text();
          throw new Error(`Erro da EvolutionAPI: ${createResponse.status} - ${errorText}`);
      }

      const createResult = createResponse.status !== 204 ? await createResponse.json().catch(() => ({})) : {};
      console.log('EvolutionAPI create response:', createResult);

      // Configurar webhook explicitamente
      await configureWebhook(globalConfig, instance_name);

      return new Response(
        JSON.stringify({ 
          success: true, 
          config: newConfig,
          evolution_response: createResult,
          message: 'Instância criada com sucesso'
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );

    } catch (apiError) {
      console.error('❌ Falha na comunicação com a EvolutionAPI. Iniciando rollback...', apiError);
      
      // Rollback: Remover configuração local criada
      await supabase
        .from('evolution_api_configs')
        .delete()
        .eq('id', newConfig.id);
      
      console.log('롤 Rollback concluído. Configuração local removida.');

      return new Response(
        JSON.stringify({ error: `Erro na comunicação com EvolutionAPI: ${apiError.message}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

  } catch (error) {
    console.error('Erro geral ao criar instância:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Erro desconhecido',
        details: error.toString()
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

async function configureWebhook(globalConfig: any, instanceName: string) {
  try {
    const webhookPayload = {
      webhook: {
        enabled: true,
        url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/evolution-webhook`,
        events: [
          'APPLICATION_STARTUP',
          'QRCODE_UPDATED', 
          'CONNECTION_UPDATE', 
          'MESSAGES_UPSERT'
        ],
        webhook_by_events: false
      }
    };

    console.log('Configuring webhook for instance:', instanceName, 'with FINAL payload:', webhookPayload);

    const webhookResponse = await fetch(`${globalConfig.api_url}/webhook/set/${instanceName}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': globalConfig.api_key
      },
      body: JSON.stringify(webhookPayload)
    });

    if (webhookResponse.ok) {
      console.log('✅ Webhook configured successfully for:', instanceName);
    } else {
      const errorText = await webhookResponse.text();
      console.error(`❌ Webhook configuration failed: ${errorText}`);
    }
  } catch (error) {
    console.error('❌ Error configuring webhook:', error);
  }
}

async function handleConnectInstance(supabase: any, params: any) {
  const { config_id } = params;
  
  console.log('Connecting instance for config:', config_id);
  
  try {
    if (!config_id) {
      throw new Error('config_id é obrigatório');
    }

    const { data: config, error: configError } = await supabase
      .from('evolution_api_configs')
      .select(`*, evolution_global_configs (*)`)
      .eq('id', config_id)
      .single();

    if (configError) {
      console.error('Erro ao buscar configuração:', configError);
      throw new Error(`Erro ao buscar configuração: ${configError.message}`);
    }
    
    if (!config) throw new Error('Configuração não encontrada');

    const globalConfig = config.evolution_global_configs;
    if (!globalConfig) throw new Error('Configuração global não encontrada');

    console.log('Connecting instance:', config.instance_name, 'at:', globalConfig.api_url);

    await configureWebhook(globalConfig, config.instance_name);

    const connectResponse = await fetch(`${globalConfig.api_url}/instance/connect/${config.instance_name}`, {
      method: 'GET',
      headers: {
        'apikey': globalConfig.api_key
      }
    });

    console.log('Connect response status:', connectResponse.status);
    
    if (!connectResponse.ok) {
      const errorText = await connectResponse.text();
      console.error('Connect error response:', errorText);
      throw new Error(`Erro ao conectar instância: ${connectResponse.status} - ${errorText}`);
    }

    const connectResult = await connectResponse.json();
    console.log('Connect result received:', connectResult);

    const qrCode = connectResult.base64 || connectResult.qr_code || connectResult.qrCode;
    
    if (qrCode) {
      console.log('QR code generated successfully');
      
      await supabase
        .from('evolution_api_configs')
        .update({ 
          status: 'qr_ready',
          qr_code: qrCode,
          qr_code_expires_at: new Date(Date.now() + 2 * 60 * 1000).toISOString()
        })
        .eq('id', config_id);

      return new Response(
        JSON.stringify({ 
          success: true, 
          qr_code: qrCode,
          message: 'QR code generated successfully'
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      console.log('No QR code in response, checking if already connected');
      return await handleCheckStatus(supabase, { config_id });
    }

  } catch (error) {
    console.error('Erro ao conectar instância:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Erro ao conectar instância',
        details: error.toString()
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

async function handleCheckStatus(supabase: any, params: any) {
  const { config_id } = params;
  
  console.log('🔍 Checking status for config:', config_id);
  
  try {
    const { data: config, error: configError } = await supabase
      .from('evolution_api_configs')
      .select(`*, evolution_global_configs (*)`)
      .eq('id', config_id)
      .single();

    if (configError) throw configError;
    if (!config) throw new Error('Configuração não encontrada');

    const globalConfig = config.evolution_global_configs;
    if (!globalConfig) throw new Error('Configuração global não encontrada');

    console.log('📱 Checking status for instance:', config.instance_name);
    console.log('🔗 Current status in DB:', config.status);

    let statusResult = null;
    let lastError = null;
    const statusEndpoints = [
      `${globalConfig.api_url}/instance/fetchInstances/${config.instance_name}`,
      `${globalConfig.api_url}/instance/connectionState/${config.instance_name}`
    ];

    for (const endpoint of statusEndpoints) {
      try {
        console.log('📡 Trying endpoint:', endpoint);
        const statusResponse = await fetch(endpoint, {
          method: 'GET',
          headers: { 'apikey': globalConfig.api_key }
        });

        if (statusResponse.ok) {
          statusResult = await statusResponse.json();
          console.log('✅ Status retrieved from:', endpoint);
          break;
        } else {
          console.log('❌ Endpoint failed:', endpoint, 'Status:', statusResponse.status);
          lastError = `Status ${statusResponse.status} from ${endpoint}`;
        }
      } catch (error) {
        console.log('❌ Error with endpoint:', endpoint, error.message);
        lastError = error.message;
      }
    }

    if (!statusResult) {
      console.log('❌ All status endpoints failed, last error:', lastError);
      return new Response(JSON.stringify({ success: true, status: 'not_found', message: 'Instance not found or unreachable', error: lastError }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    console.log('📊 Parsed status result:', JSON.stringify(statusResult, null, 2));

    let currentStatus = 'disconnected';
    let instanceData = null;
    if (statusResult && Array.isArray(statusResult) && statusResult.length > 0) {
      instanceData = statusResult[0];
    } else if (statusResult && typeof statusResult === 'object') {
      instanceData = statusResult;
    }

    if (instanceData) {
      const evolutionStatus = instanceData?.state || instanceData?.instance?.state || instanceData?.connectionStatus || instanceData?.status;
      console.log('🚦 Evolution status from API:', evolutionStatus);
      currentStatus = mapEvolutionStatus(evolutionStatus);
      console.log('🎯 Status mapped to:', currentStatus);
    } else {
      console.log('❌ No instance data found in API response');
    }

    if (currentStatus !== config.status) {
      console.log('💾 UPDATING STATUS IN DATABASE:', config.status, '->', currentStatus);
      const updateData: any = { status: currentStatus, updated_at: new Date().toISOString() };
      
      if (currentStatus === 'connected') {
        updateData.qr_code = null;
        updateData.qr_code_expires_at = null;
        console.log('🧹 Clearing QR code data since connected');
      }
      
      const { error: updateError } = await supabase.from('evolution_api_configs').update(updateData).eq('id', config_id);
      if (updateError) {
        console.error('❌ Error updating status in database:', updateError);
        throw updateError;
      }
      console.log('✅ Status successfully updated in database');
    } else {
      console.log('⏭️ Status unchanged, no database update needed');
    }

    if (currentStatus === 'connected') {
      console.log('🎉 WHATSAPP CONNECTION DETECTED! Status is CONNECTED');
    }

    return new Response(JSON.stringify({ success: true, status: currentStatus, instance_data: instanceData }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error) {
    console.error('❌ Error checking status:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
}

function mapEvolutionStatus(evolutionStatus: string): string {
  switch (evolutionStatus?.toLowerCase()) {
    case 'open':
    case 'connected':
      return 'connected';
    case 'connecting':
    case 'qr':
      return 'qr_ready';
    case 'close':
    case 'closed':
    case 'disconnected':
      return 'disconnected';
    default:
      return 'disconnected';
  }
}

async function handleForceStatusSync(supabase: any, params: any) {
  const { config_id } = params;
  console.log('🔄 Force syncing status for config:', config_id);

  const { data: config, error: configError } = await supabase.from('evolution_api_configs').select(`*, evolution_global_configs (*)`).eq('id', config_id).single();

  if (!configError && config && config.evolution_global_configs) {
    console.log('🔗 Forcing webhook reconfiguration...');
    await configureWebhook(config.evolution_global_configs, config.instance_name);
  }
  
  const statusResult = await handleCheckStatus(supabase, { config_id });
  const statusData = await statusResult.json();
  console.log('🔄 Force sync result:', statusData);
  
  return new Response(JSON.stringify({ ...statusData, force_synced: true, sync_timestamp: new Date().toISOString() }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
}
async function handleDisconnectInstance(supabase, params) {
  const { config_id } = params;
  try {
    // Buscar configuração
    const { data: config, error: configError } = await supabase.from('evolution_api_configs').select(`
        *,
        evolution_global_configs (*)
      `).eq('id', config_id).single();
    if (configError) throw configError;
    if (!config) throw new Error('Configuração não encontrada');
    const globalConfig = config.evolution_global_configs;
    if (!globalConfig) throw new Error('Configuração global não encontrada');
    // Desconectar instância
    const disconnectResponse = await fetch(`${globalConfig.api_url}/instance/logout/${config.instance_name}`, {
      method: 'DELETE',
      headers: {
        'apikey': globalConfig.api_key
      }
    });
    if (!disconnectResponse.ok) {
      throw new Error(`Erro ao desconectar instância: ${disconnectResponse.status}`);
    }
    // Atualizar status no banco
    await supabase.from('evolution_api_configs').update({
      status: 'disconnected',
      qr_code: null
    }).eq('id', config_id);
    return new Response(JSON.stringify({
      success: true,
      message: 'Instance disconnected'
    }), {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Erro ao desconectar instância:', error);
    return new Response(JSON.stringify({
      error: error.message
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
}
async function handleDeleteInstance(supabase, params) {
  const { config_id } = params;
  try {
    // Buscar configuração
    const { data: config, error: configError } = await supabase.from('evolution_api_configs').select(`
        *,
        evolution_global_configs (*)
      `).eq('id', config_id).single();
    if (configError) throw configError;
    if (!config) throw new Error('Configuração não encontrada');
    const globalConfig = config.evolution_global_configs;
    if (!globalConfig) throw new Error('Configuração global não encontrada');
    // Deletar instância
    const deleteResponse = await fetch(`${globalConfig.api_url}/instance/delete/${config.instance_name}`, {
      method: 'DELETE',
      headers: {
        'apikey': globalConfig.api_key
      }
    });
    if (!deleteResponse.ok) {
      throw new Error(`Erro ao deletar instância: ${deleteResponse.status}`);
    }
    // Remover do banco
    await supabase.from('evolution_api_configs').delete().eq('id', config_id);
    return new Response(JSON.stringify({
      success: true,
      message: 'Instance deleted'
    }), {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Erro ao deletar instância:', error);
    return new Response(JSON.stringify({
      error: error.message
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
}
async function handleSendMessage(supabase, params) {
  const { config_id, phone_number, message } = params;
  try {
    // Buscar configuração
    const { data: config, error: configError } = await supabase.from('evolution_api_configs').select(`
        *,
        evolution_global_configs (*)
      `).eq('id', config_id).single();
    if (configError) throw configError;
    if (!config) throw new Error('Configuração não encontrada');
    const globalConfig = config.evolution_global_configs;
    if (!globalConfig) throw new Error('Configuração global não encontrada');
    // Enviar mensagem
    const messagePayload = {
      number: phone_number,
      text: message
    };
    const sendResponse = await fetch(`${globalConfig.api_url}/message/sendText/${config.instance_name}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': globalConfig.api_key
      },
      body: JSON.stringify(messagePayload)
    });
    if (!sendResponse.ok) {
      throw new Error(`Erro ao enviar mensagem: ${sendResponse.status}`);
    }
    const sendResult = await sendResponse.json();
    return new Response(JSON.stringify({
      success: true,
      result: sendResult
    }), {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error);
    return new Response(JSON.stringify({
      error: error.message
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
}
async function handleTestConnection(params) {
  const { api_url, api_key } = params;
  try {
    const testResponse = await fetch(`${api_url}/instance/fetchInstances`, {
      method: 'GET',
      headers: {
        'apikey': api_key
      }
    });
    if (!testResponse.ok) {
      throw new Error(`Erro de conexão: ${testResponse.status}`);
    }
    const testResult = await testResponse.json();
    return new Response(JSON.stringify({
      success: true,
      message: 'Conexão realizada com sucesso',
      data: testResult
    }), {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Erro ao testar conexão:', error);
    return new Response(JSON.stringify({
      error: error.message
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
}

// ### NOVAS FUNÇÕES PARA IA NATIVA ###
async function handleOpenAISetCreds(supabase: any, params: any) {
    const { instanceName, credsName, apiKey } = params;
    const { data: config, error } = await supabase.from('evolution_api_configs').select(`*, evolution_global_configs (*)`).eq('instance_name', instanceName).single();
    if (error || !config.evolution_global_configs) throw new Error(`Configuração não encontrada para ${instanceName}`);
    
    const globalConfig = config.evolution_global_configs;
    const response = await fetch(`${globalConfig.api_url}/openai/creds/${instanceName}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'apikey': globalConfig.api_key },
        body: JSON.stringify({ name: credsName, apiKey: apiKey }),
    });

    const responseText = await response.text();

    if (!response.ok) {
        // Log aprimorado para sabermos exatamente o que a Evolution API retornou
        console.error(`❌ Erro da Evolution API [${response.status}]:`, responseText);
        
        let errorMessage = responseText;
        try {
            const errorJson = JSON.parse(responseText);
            // Extrai a mensagem de dentro do JSON de erro, se existir
            errorMessage = errorJson.response?.message || errorJson.message || responseText;
        } catch (e) {
            // Ignora o erro se não for JSON, apenas usa o texto bruto.
        }
        throw new Error(`Erro ao configurar credenciais OpenAI: ${errorMessage}`);
    }
    
    const responseBody = JSON.parse(responseText);
    
    return new Response(JSON.stringify(responseBody), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' }});
}
async function handleOpenAICreateBot(supabase: any, params: any) {
    const { instanceName, botConfig } = params;
    const { data: config, error } = await supabase.from('evolution_api_configs').select(`*, evolution_global_configs (*)`).eq('instance_name', instanceName).single();
    if (error || !config.evolution_global_configs) throw new Error(`Configuração não encontrada para ${instanceName}`);

    const globalConfig = config.evolution_global_configs;
    const response = await fetch(`${globalConfig.api_url}/openai/create/${instanceName}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'apikey': globalConfig.api_key },
        body: JSON.stringify(botConfig),
    });

    // Aplicando o mesmo padrão robusto aqui
    const responseText = await response.text();
    if (!response.ok) {
        console.error(`❌ Erro da Evolution API [${response.status}] ao criar bot:`, responseText);
        throw new Error(`Erro ao criar bot OpenAI: ${responseText}`);
    }
    const responseBody = JSON.parse(responseText);
    return new Response(JSON.stringify(responseBody), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' }});
}

async function handleOpenAISetDefaults(supabase: any, params: any) {
    const { instanceName, settings } = params;
    const { data: config, error } = await supabase.from('evolution_api_configs').select(`*, evolution_global_configs (*)`).eq('instance_name', instanceName).single();
    if (error || !config.evolution_global_configs) throw new Error(`Configuração não encontrada para ${instanceName}`);
    
    const globalConfig = config.evolution_global_configs;
    const response = await fetch(`${globalConfig.api_url}/openai/settings/${instanceName}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'apikey': globalConfig.api_key },
        body: JSON.stringify(settings),
    });
    
    // Aplicando o mesmo padrão robusto aqui
    const responseText = await response.text();
    if (!response.ok) {
        console.error(`❌ Erro da Evolution API [${response.status}] ao definir padrões:`, responseText);
        throw new Error(`Erro ao definir configurações padrão da OpenAI: ${responseText}`);
    }
    const responseBody = JSON.parse(responseText);
    return new Response(JSON.stringify(responseBody), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' }});
}
