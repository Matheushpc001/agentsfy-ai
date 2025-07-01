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
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function handleCreateInstance(supabase: any, params: any) {
  const { franchisee_id, instance_name, agent_id } = params;
  
  console.log('Creating instance for franchisee:', franchisee_id, 'with name:', instance_name);
  
  try {
    // Buscar configuração global ativa
    const { data: globalConfigs, error: globalError } = await supabase
      .from('evolution_global_configs')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1);

    if (globalError) throw globalError;
    
    if (!globalConfigs || globalConfigs.length === 0) {
      throw new Error('Nenhuma configuração global ativa encontrada');
    }

    const globalConfig = globalConfigs[0];
    console.log('Using global config:', globalConfig.name, 'URL:', globalConfig.api_url);

    // Criar configuração local
    const configData = {
      franchisee_id,
      instance_name,
      global_config_id: globalConfig.id,
      status: 'disconnected',
      webhook_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/evolution-webhook`
    };

    const { data: config, error: configError } = await supabase
      .from('evolution_api_configs')
      .insert([configData])
      .select()
      .single();

    if (configError) throw configError;
    
    console.log('Config created in database:', config.id);

    // Criar instância na EvolutionAPI
    const createPayload = {
      instanceName: instance_name,
      integration: 'WHATSAPP-BAILEYS'
    };

    console.log('Creating instance in EvolutionAPI with payload:', createPayload);

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
      throw new Error(`Erro ao criar instância: ${createResponse.status}`);
    }

    const createResult = await createResponse.json();
    console.log('EvolutionAPI create response:', createResult);

    console.log('Instância criada com sucesso na EvolutionAPI');

    // Configurar webhook
    const webhookPayload = {
      webhook: {
        url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/evolution-webhook`,
        events: ['MESSAGES_UPSERT', 'CONNECTION_UPDATE']
      }
    };

    await fetch(`${globalConfig.api_url}/webhook/set/${instance_name}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': globalConfig.api_key
      },
      body: JSON.stringify(webhookPayload)
    });

    // Atualizar configuração com webhook
    await supabase
      .from('evolution_api_configs')
      .update({ 
        webhook_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/evolution-webhook`,
        status: 'created'
      })
      .eq('id', config.id);

    console.log('Webhook URL updated in database');

    return new Response(
      JSON.stringify({ 
        success: true, 
        config: config,
        evolution_response: createResult 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Erro ao criar instância:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

async function handleConnectInstance(supabase: any, params: any) {
  const { config_id } = params;
  
  console.log('Connecting instance for config:', config_id);
  
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
      throw new Error(`Erro ao conectar instância: ${connectResponse.status}`);
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
    if (connectResult.base64 || connectResult.qr_code || connectResult.qrCode) {
      console.log('QR code generated successfully');
      
      // Atualizar status no banco
      await supabase
        .from('evolution_api_configs')
        .update({ 
          status: 'connecting',
          qr_code: connectResult.base64 || connectResult.qr_code || connectResult.qrCode,
          qr_code_expires_at: new Date(Date.now() + 2 * 60 * 1000).toISOString()
        })
        .eq('id', config_id);

      return new Response(
        JSON.stringify({ 
          success: true, 
          qr_code: connectResult.base64,
          qrCode: connectResult.qrCode,
          base64: connectResult.base64,
          message: 'QR code generated'
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    } else {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Instance already connected or connecting'
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

  } catch (error) {
    console.error('Erro ao conectar instância:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

async function handleCheckStatus(supabase: any, params: any) {
  const { config_id } = params;
  
  console.log('Checking status for config:', config_id);
  
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

    console.log('Checking status for instance:', config.instance_name);

    // Verificar status na EvolutionAPI
    const statusResponse = await fetch(`${globalConfig.api_url}/instance/fetchInstances/${config.instance_name}`, {
      method: 'GET',
      headers: {
        'apikey': globalConfig.api_key
      }
    });

    if (!statusResponse.ok) {
      console.log('Instance not found or error checking status:', statusResponse.status);
      // Se a instância não for encontrada, pode estar sendo criada
      if (statusResponse.status === 404) {
        return new Response(
          JSON.stringify({ 
            success: true, 
            status: 'disconnected',
            message: 'Instance not found, might be creating'
          }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
      throw new Error(`Erro ao verificar status: ${statusResponse.status}`);
    }

    const statusResult = await statusResponse.json();
    console.log('Status result from EvolutionAPI:', statusResult);

    let currentStatus = 'disconnected';
    let instanceData = null;
    
    if (statusResult && statusResult.length > 0) {
      instanceData = statusResult[0];
      const evolutionStatus = instanceData.status;
      
      console.log('Evolution status received:', evolutionStatus);
      
      // Mapear status da EvolutionAPI para nosso sistema
      if (evolutionStatus === 'open' || evolutionStatus === 'connected') {
        currentStatus = 'connected';
        console.log('WhatsApp is connected!');
      } else if (evolutionStatus === 'connecting' || evolutionStatus === 'qr') {
        currentStatus = 'connecting';
      } else if (evolutionStatus === 'close' || evolutionStatus === 'closed') {
        currentStatus = 'disconnected';
      } else {
        // Para qualquer outro status, manter como connecting se tiver QR code ativo
        currentStatus = config.qr_code ? 'connecting' : 'disconnected';
      }
    } else {
      console.log('No instance data found');
    }

    console.log('Mapped status:', currentStatus);

    // Atualizar status no banco se mudou
    if (currentStatus !== config.status) {
      console.log('Updating status in database from', config.status, 'to', currentStatus);
      
      const updateData: any = { status: currentStatus };
      
      // Se conectado, limpar QR code
      if (currentStatus === 'connected') {
        updateData.qr_code = null;
        updateData.qr_code_expires_at = null;
      }
      
      await supabase
        .from('evolution_api_configs')
        .update(updateData)
        .eq('id', config_id);
      
      console.log('Status updated in database');
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        status: currentStatus,
        instance_data: instanceData,
        previous_status: config.status
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Erro ao verificar status:', error);
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

    // Atualizar status no banco
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
