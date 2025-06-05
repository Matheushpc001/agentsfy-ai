
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

    switch (action) {
      case 'create_instance':
        return await createInstance(supabase, params);
      
      case 'connect_instance':
        return await connectInstance(supabase, params);
      
      case 'get_qr_code':
        return await getQRCode(supabase, params);
      
      case 'disconnect_instance':
        return await disconnectInstance(supabase, params);
      
      case 'send_message':
        return await sendMessage(supabase, params);
      
      default:
        throw new Error('Ação não reconhecida');
    }

  } catch (error) {
    console.error('Erro no evolution-api-manager:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function createInstance(supabase: any, { franchiseeId, instanceName, apiUrl, apiKey }: any) {
  try {
    // Criar instância na EvolutionAPI
    const response = await fetch(`${apiUrl}/instance/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': apiKey
      },
      body: JSON.stringify({
        instanceName,
        qrcode: true,
        webhook: `${supabaseUrl}/functions/v1/evolution-webhook`,
        webhook_by_events: true,
        events: [
          'APPLICATION_STARTUP',
          'QRCODE_UPDATED',
          'CONNECTION_UPDATE',
          'MESSAGES_UPSERT'
        ]
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Erro ao criar instância: ${errorData.message || 'Erro desconhecido'}`);
    }

    const instanceData = await response.json();

    // Salvar configuração no banco de dados
    const { data: config, error } = await supabase
      .from('evolution_api_configs')
      .insert({
        franchisee_id: franchiseeId,
        instance_name: instanceName,
        api_url: apiUrl,
        api_key: apiKey,
        webhook_url: `${supabaseUrl}/functions/v1/evolution-webhook`,
        status: 'connecting'
      })
      .select()
      .single();

    if (error) throw error;

    return new Response(JSON.stringify({
      success: true,
      config,
      instance: instanceData
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Erro ao criar instância:', error);
    throw error;
  }
}

async function connectInstance(supabase: any, { configId }: any) {
  try {
    const { data: config } = await supabase
      .from('evolution_api_configs')
      .select('*')
      .eq('id', configId)
      .single();

    if (!config) throw new Error('Configuração não encontrada');

    // Conectar instância na EvolutionAPI
    const response = await fetch(`${config.api_url}/instance/connect/${config.instance_name}`, {
      method: 'GET',
      headers: {
        'apikey': config.api_key
      }
    });

    if (!response.ok) {
      throw new Error('Erro ao conectar instância');
    }

    const connectionData = await response.json();

    return new Response(JSON.stringify({
      success: true,
      qrCode: connectionData.base64
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Erro ao conectar instância:', error);
    throw error;
  }
}

async function getQRCode(supabase: any, { configId }: any) {
  try {
    const { data: config } = await supabase
      .from('evolution_api_configs')
      .select('*')
      .eq('id', configId)
      .single();

    if (!config) throw new Error('Configuração não encontrada');

    return new Response(JSON.stringify({
      success: true,
      qrCode: config.qr_code,
      expiresAt: config.qr_code_expires_at
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Erro ao buscar QR Code:', error);
    throw error;
  }
}

async function disconnectInstance(supabase: any, { configId }: any) {
  try {
    const { data: config } = await supabase
      .from('evolution_api_configs')
      .select('*')
      .eq('id', configId)
      .single();

    if (!config) throw new Error('Configuração não encontrada');

    // Desconectar instância na EvolutionAPI
    await fetch(`${config.api_url}/instance/logout/${config.instance_name}`, {
      method: 'DELETE',
      headers: {
        'apikey': config.api_key
      }
    });

    // Atualizar status no banco
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

  } catch (error) {
    console.error('Erro ao desconectar instância:', error);
    throw error;
  }
}

async function sendMessage(supabase: any, { configId, phoneNumber, message }: any) {
  try {
    const { data: config } = await supabase
      .from('evolution_api_configs')
      .select('*')
      .eq('id', configId)
      .single();

    if (!config) throw new Error('Configuração não encontrada');

    const response = await fetch(`${config.api_url}/message/sendText/${config.instance_name}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': config.api_key
      },
      body: JSON.stringify({
        number: phoneNumber,
        text: message
      })
    });

    if (!response.ok) {
      throw new Error('Erro ao enviar mensagem');
    }

    const result = await response.json();

    return new Response(JSON.stringify({
      success: true,
      result
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Erro ao enviar mensagem:', error);
    throw error;
  }
}
