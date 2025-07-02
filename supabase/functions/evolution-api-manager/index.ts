import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.0.0"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, ...params } = await req.json();
    
    console.log('Evolution API Manager - Action:', action, 'Params:', params);

    // Conectar ao Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase environment variables not configured');
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    switch (action) {
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
      default:
        return new Response(
          JSON.stringify({ error: 'Ação não reconhecida' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
  } catch (error) {
    console.error('Erro no Evolution API Manager:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Erro interno do servidor',
        details: error.toString()
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function handleCreateInstance(supabase: any, params: any) {
  const { franchisee_id, instance_name, agent_id } = params;
  
  console.log('Creating instance for franchisee:', franchisee_id, 'with name:', instance_name);
  
  try {
    if (!franchisee_id || !instance_name) {
      throw new Error('Parâmetros obrigatórios ausentes: franchisee_id e instance_name');
    }

    // Buscar configuração global ativa
    const { data: globalConfigs, error: globalError } = await supabase
      .from('evolution_global_configs')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1);

    if (globalError) {
      console.error('Erro ao buscar configuração global:', globalError);
      throw new Error(`Erro ao buscar configuração global: ${globalError.message}`);
    }
    
    if (!globalConfigs || globalConfigs.length === 0) {
      throw new Error('Nenhuma configuração global ativa encontrada');
    }

    const globalConfig = globalConfigs[0];
    console.log('Using global config:', globalConfig.name, 'URL:', globalConfig.api_url);

    // Verificar se a URL da API é válida
    if (!globalConfig.api_url || !globalConfig.api_key) {
      throw new Error('Configuração global inválida: URL ou chave da API ausente');
    }

    // Criar configuração local primeiro - USANDO APENAS STATUS VÁLIDOS
    const configData = {
      franchisee_id,
      instance_name,
      global_config_id: globalConfig.id,
      status: 'disconnected', // Mudando de 'created' para 'disconnected' - valor válido
      webhook_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/evolution-webhook`
    };

    console.log('Inserting config with data:', configData);

    const { data: config, error: configError } = await supabase
      .from('evolution_api_configs')
      .insert([configData])
      .select()
      .single();

    if (configError) {
      console.error('Erro ao criar configuração:', configError);
      throw new Error(`Erro ao criar configuração: ${configError.message}`);
    }
    
    console.log('Config created in database:', config.id);

    // Tentar criar instância na EvolutionAPI
    const createPayload = {
      instanceName: instance_name,
      integration: 'WHATSAPP-BAILEYS'
    };

    console.log('Creating instance in EvolutionAPI with payload:', createPayload);
    console.log('API URL:', globalConfig.api_url);

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

      if (!createResponse.ok) {
        const errorText = await createResponse.text();
        console.error('EvolutionAPI error response:', errorText);
        
        // Se a instância já existe, considerar como sucesso
        if (createResponse.status === 409 || errorText.includes('already exists')) {
          console.log('Instance already exists, considering as success');
        } else {
          throw new Error(`Erro ao criar instância na EvolutionAPI: ${createResponse.status} - ${errorText}`);
        }
      }

      let createResult = {};
      try {
        const responseText = await createResponse.text();
        if (responseText) {
          createResult = JSON.parse(responseText);
        }
      } catch (e) {
        console.log('Resposta não é JSON válido, continuando...');
      }

      console.log('EvolutionAPI create response:', createResult);

      // Configurar webhook
      try {
        const webhookPayload = {
          webhook: {
            url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/evolution-webhook`,
            events: ['MESSAGES_UPSERT', 'CONNECTION_UPDATE']
          }
        };

        const webhookResponse = await fetch(`${globalConfig.api_url}/webhook/set/${instance_name}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': globalConfig.api_key
          },
          body: JSON.stringify(webhookPayload)
        });

        if (webhookResponse.ok) {
          console.log('Webhook configured successfully');
        } else {
          console.log('Webhook configuration failed, but continuing...');
        }
      } catch (webhookError) {
        console.error('Erro ao configurar webhook (não crítico):', webhookError);
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          config: config,
          evolution_response: createResult,
          message: 'Instância criada com sucesso'
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );

    } catch (apiError) {
      console.error('Erro na API da EvolutionAPI:', apiError);
      
      // Remover configuração criada se falhou na API
      await supabase
        .from('evolution_api_configs')
        .delete()
        .eq('id', config.id);
      
      throw new Error(`Erro na comunicação com EvolutionAPI: ${apiError.message}`);
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

async function handleConnectInstance(supabase: any, params: any) {
  const { config_id } = params;
  
  console.log('Connecting instance for config:', config_id);
  
  try {
    if (!config_id) {
      throw new Error('config_id é obrigatório');
    }

    // Buscar configuração
    const { data: config, error: configError } = await supabase
      .from('evolution_api_configs')
      .select(`
        *,
        evolution_global_configs (*)
      `)
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

    // Conectar instância
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

    const connectText = await connectResponse.text();
    console.log('Connect response text:', connectText);

    let connectResult;
    try {
      connectResult = JSON.parse(connectText);
    } catch (e) {
      console.error('Erro ao fazer parse da resposta:', e);
      throw new Error('Resposta inválida da EvolutionAPI');
    }

    console.log('Connect result received:', connectResult);

    // Verificar se há QR code na resposta
    const qrCode = connectResult.base64 || connectResult.qr_code || connectResult.qrCode;
    
    if (qrCode) {
      console.log('QR code generated successfully');
      
      // Atualizar status no banco para 'qr_ready' - STATUS VÁLIDO
      await supabase
        .from('evolution_api_configs')
        .update({ 
          status: 'qr_ready', // Usando status válido
          qr_code: qrCode,
          qr_code_expires_at: new Date(Date.now() + 2 * 60 * 1000).toISOString()
        })
        .eq('id', config_id);

      return new Response(
        JSON.stringify({ 
          success: true, 
          qr_code: qrCode,
          qrCode: qrCode,
          base64: qrCode,
          message: 'QR code generated successfully'
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    } else {
      // Se não há QR code, verificar se já está conectado
      console.log('No QR code in response, checking if already connected');
      
      // Verificar status atual
      const statusCheck = await handleCheckStatus(supabase, { config_id });
      return statusCheck;
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
    // Buscar configuração
    const { data: config, error: configError } = await supabase
      .from('evolution_api_configs')
      .select(`
        *,
        evolution_global_configs (*)
      `)
      .eq('id', config_id)
      .single();

    if (configError) throw configError;
    if (!config) throw new Error('Configuração não encontrada');

    const globalConfig = config.evolution_global_configs;
    if (!globalConfig) throw new Error('Configuração global não encontrada');

    console.log('📱 Checking status for instance:', config.instance_name);
    console.log('🔗 Current status in DB:', config.status);

    // Verificar status na EvolutionAPI
    const statusResponse = await fetch(`${globalConfig.api_url}/instance/fetchInstances/${config.instance_name}`, {
      method: 'GET',
      headers: {
        'apikey': globalConfig.api_key
      }
    });

    console.log('📡 EvolutionAPI status response status:', statusResponse.status);

    if (!statusResponse.ok) {
      console.log('❌ Instance not found or error checking status:', statusResponse.status);
      if (statusResponse.status === 404) {
        return new Response(
          JSON.stringify({ 
            success: true, 
            status: 'not_found',
            message: 'Instance not found, might need to be created'
          }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
      throw new Error(`Erro ao verificar status: ${statusResponse.status}`);
    }

    const statusText = await statusResponse.text();
    console.log('📄 Raw status response:', statusText);

    let statusResult;
    try {
      statusResult = JSON.parse(statusText);
    } catch (e) {
      console.error('❌ Error parsing status response:', e);
      throw new Error('Invalid response from EvolutionAPI');
    }

    console.log('📊 Parsed status result:', JSON.stringify(statusResult, null, 2));

    let currentStatus = 'disconnected'; // Mudando default para 'disconnected'
    let instanceData = null;
    
    if (statusResult && Array.isArray(statusResult) && statusResult.length > 0) {
      instanceData = statusResult[0];
      const evolutionStatus = instanceData.connectionStatus || instanceData.status;
      
      console.log('🚦 Evolution status from API:', evolutionStatus);
      console.log('📋 Full instance data:', JSON.stringify(instanceData, null, 2));
      
      // Mapear status da EvolutionAPI para nosso sistema com status válidos
      if (evolutionStatus === 'open' || evolutionStatus === 'connected') {
        currentStatus = 'connected';
        console.log('✅ STATUS MAPPED TO: CONNECTED - WhatsApp is online!');
      } else if (evolutionStatus === 'connecting' || evolutionStatus === 'qr') {
        currentStatus = 'qr_ready';
        console.log('🔄 STATUS MAPPED TO: QR_READY - Waiting for QR scan');
      } else if (evolutionStatus === 'close' || evolutionStatus === 'closed' || evolutionStatus === 'disconnected') {
        currentStatus = 'disconnected';
        console.log('❌ STATUS MAPPED TO: DISCONNECTED - WhatsApp is disconnected');
      } else {
        console.log('❓ UNKNOWN STATUS from EvolutionAPI:', evolutionStatus);
        // Para status desconhecido, usar disconnected como fallback
        currentStatus = config.qr_code ? 'qr_ready' : 'disconnected';
        console.log('🤔 Fallback status based on QR presence:', currentStatus);
      }
    } else {
      console.log('❌ No instance data found in API response');
      currentStatus = 'disconnected';
    }

    console.log('🎯 Final mapped status:', currentStatus);
    console.log('🔄 Previous status in DB:', config.status);

    // Atualizar status no banco se mudou
    if (currentStatus !== config.status) {
      console.log('💾 UPDATING STATUS IN DATABASE:', config.status, '->', currentStatus);
      
      const updateData: any = { 
        status: currentStatus,
        updated_at: new Date().toISOString()
      };
      
      // Se conectado, limpar QR code
      if (currentStatus === 'connected') {
        updateData.qr_code = null;
        updateData.qr_code_expires_at = null;
        console.log('🧹 Clearing QR code data since connected');
      }
      
      const { error: updateError } = await supabase
        .from('evolution_api_configs')
        .update(updateData)
        .eq('id', config_id);
      
      if (updateError) {
        console.error('❌ Error updating status in database:', updateError);
        throw updateError;
      }
      
      console.log('✅ Status successfully updated in database');
    } else {
      console.log('⏭️ Status unchanged, no database update needed');
    }

    // Log final para debug
    if (currentStatus === 'connected') {
      console.log('🎉 WHATSAPP CONNECTION DETECTED! Status is CONNECTED');
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        status: currentStatus,
        instance_data: instanceData,
        previous_status: config.status,
        debug_info: {
          raw_evolution_status: instanceData?.connectionStatus || instanceData?.status,
          evolution_response: statusResult
        }
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('❌ Error checking status:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

async function handleDisconnectInstance(supabase: any, params: any) {
  const { config_id } = params;
  
  try {
    // Buscar configuração
    const { data: config, error: configError } = await supabase
      .from('evolution_api_configs')
      .select(`
        *,
        evolution_global_configs (*)
      `)
      .eq('id', config_id)
      .single();

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

    // Atualizar status no banco usando status válido
    await supabase
      .from('evolution_api_configs')
      .update({ status: 'disconnected', qr_code: null })
      .eq('id', config_id);

    return new Response(
      JSON.stringify({ success: true, message: 'Instance disconnected' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erro ao desconectar instância:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

async function handleDeleteInstance(supabase: any, params: any) {
  const { config_id } = params;
  
  try {
    // Buscar configuração
    const { data: config, error: configError } = await supabase
      .from('evolution_api_configs')
      .select(`
        *,
        evolution_global_configs (*)
      `)
      .eq('id', config_id)
      .single();

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
    await supabase
      .from('evolution_api_configs')
      .delete()
      .eq('id', config_id);

    return new Response(
      JSON.stringify({ success: true, message: 'Instance deleted' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erro ao deletar instância:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

async function handleSendMessage(supabase: any, params: any) {
  const { config_id, phone_number, message } = params;
  
  try {
    // Buscar configuração
    const { data: config, error: configError } = await supabase
      .from('evolution_api_configs')
      .select(`
        *,
        evolution_global_configs (*)
      `)
      .eq('id', config_id)
      .single();

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

    return new Response(
      JSON.stringify({ success: true, result: sendResult }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erro ao enviar mensagem:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

async function handleTestConnection(params: any) {
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

    return new Response(
      JSON.stringify({ success: true, message: 'Conexão realizada com sucesso', data: testResult }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erro ao testar conexão:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}
