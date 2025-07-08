
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.0.0"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  console.log('🎣 Evolution Webhook called with method:', req.method);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload = await req.json();
    console.log('📨 Webhook payload received:', JSON.stringify(payload, null, 2));

    // Conectar ao Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase environment variables not configured');
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Processar diferentes tipos de eventos
    const { event, instance, data } = payload;
    
    console.log('🔍 Processing webhook event:', {
      event,
      instance: instance?.instanceName || 'unknown',
      connectionStatus: data?.state || data?.connectionStatus || 'unknown'
    });

    // Processar eventos de conexão
    if (event === 'connection.update' || event === 'CONNECTION_UPDATE') {
      await handleConnectionUpdate(supabase, payload);
    }
    
    // Processar mensagens
    if (event === 'messages.upsert' || event === 'MESSAGES_UPSERT') {
      await handleMessageUpsert(supabase, payload);
    }

    // Processar eventos de QR Code
    if (event === 'qrcode.updated' || event === 'QRCODE_UPDATED') {
      await handleQRCodeUpdate(supabase, payload);
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Webhook processed successfully' }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('❌ Webhook processing error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Webhook processing failed',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

async function handleConnectionUpdate(supabase: any, payload: any) {
  console.log('🔄 Processing connection update:', payload);
  
  const instanceName = payload.instance?.instanceName;
  const connectionState = payload.data?.state || payload.data?.connectionStatus;
  
  if (!instanceName) {
    console.log('⚠️ No instance name found in connection update');
    return;
  }

  console.log('📱 Instance:', instanceName, 'New state:', connectionState);

  // Mapear status da EvolutionAPI para nosso sistema
  let newStatus = 'disconnected';
  
  switch (connectionState) {
    case 'open':
    case 'connected':
      newStatus = 'connected';
      console.log('✅ WhatsApp CONNECTED detected via webhook!');
      break;
    case 'connecting':
    case 'qr':
      newStatus = 'qr_ready';
      console.log('🔄 WhatsApp waiting for QR scan');
      break;
    case 'close':
    case 'closed':
    case 'disconnected':
      newStatus = 'disconnected';
      console.log('❌ WhatsApp DISCONNECTED');
      break;
    default:
      console.log('❓ Unknown connection state:', connectionState);
      return;
  }

  // Atualizar status no banco de dados
  const updateData: any = {
    status: newStatus,
    updated_at: new Date().toISOString()
  };

  // Se conectado, limpar QR code
  if (newStatus === 'connected') {
    updateData.qr_code = null;
    updateData.qr_code_expires_at = null;
  }

  const { data, error } = await supabase
    .from('evolution_api_configs')
    .update(updateData)
    .eq('instance_name', instanceName)
    .select();

  if (error) {
    console.error('❌ Error updating config status:', error);
    return;
  }

  if (data && data.length > 0) {
    console.log('✅ Config updated successfully:', data[0].id, 'Status:', newStatus);
    
    // Notificar outros sistemas sobre a mudança de status
    if (newStatus === 'connected') {
      await notifyConnectionSuccess(supabase, data[0]);
    }
  } else {
    console.log('⚠️ No config found for instance:', instanceName);
  }
}

async function handleMessageUpsert(supabase: any, payload: any) {
  console.log('💬 Processing message upsert:', payload);
  
  const instanceName = payload.instance?.instanceName;
  const messageData = payload.data;
  
  if (!instanceName || !messageData) {
    console.log('⚠️ Incomplete message data');
    return;
  }

  // Buscar configuração da instância
  const { data: config, error: configError } = await supabase
    .from('evolution_api_configs')
    .select('id, franchisee_id')
    .eq('instance_name', instanceName)
    .single();

  if (configError || !config) {
    console.log('⚠️ Config not found for message:', instanceName);
    return;
  }

  // Buscar ou criar conversa
  const contactNumber = messageData.key?.remoteJid?.replace('@s.whatsapp.net', '');
  if (!contactNumber) {
    console.log('⚠️ No contact number found in message');
    return;
  }

  let conversation = await findOrCreateConversation(supabase, config.id, contactNumber);
  
  // Salvar mensagem
  const messageInsert = {
    conversation_id: conversation.id,
    message_id: messageData.key?.id || `msg_${Date.now()}`,
    content: messageData.message?.conversation || messageData.message?.extendedTextMessage?.text || '',
    message_type: 'text',
    sender_type: messageData.key?.fromMe ? 'agent' : 'customer',
    is_from_me: messageData.key?.fromMe || false,
    timestamp: new Date(messageData.messageTimestamp * 1000).toISOString(),
  };

  const { error: messageError } = await supabase
    .from('whatsapp_messages')
    .insert([messageInsert]);

  if (messageError) {
    console.error('❌ Error saving message:', messageError);
  } else {
    console.log('✅ Message saved successfully');
    
    // Se é mensagem do cliente, verificar se precisa de resposta automática
    if (!messageData.key?.fromMe) {
      await checkAutoResponse(supabase, config.id, conversation.id, messageInsert.content);
    }
  }
}

async function handleQRCodeUpdate(supabase: any, payload: any) {
  console.log('📱 Processing QR code update:', payload);
  
  const instanceName = payload.instance?.instanceName;
  const qrCode = payload.data?.qrcode || payload.data?.qr;
  
  if (!instanceName || !qrCode) {
    console.log('⚠️ Incomplete QR code data');
    return;
  }

  // Atualizar QR code no banco
  const { error } = await supabase
    .from('evolution_api_configs')
    .update({
      qr_code: qrCode,
      qr_code_expires_at: new Date(Date.now() + 2 * 60 * 1000).toISOString(), // 2 minutos
      status: 'qr_ready',
      updated_at: new Date().toISOString()
    })
    .eq('instance_name', instanceName);

  if (error) {
    console.error('❌ Error updating QR code:', error);
  } else {
    console.log('✅ QR code updated successfully for:', instanceName);
  }
}

async function findOrCreateConversation(supabase: any, configId: string, contactNumber: string) {
  // Tentar encontrar conversa existente
  const { data: existing, error: findError } = await supabase
    .from('whatsapp_conversations')
    .select('*')
    .eq('evolution_config_id', configId)
    .eq('contact_number', contactNumber)
    .single();

  if (!findError && existing) {
    return existing;
  }

  // Criar nova conversa
  const { data: newConversation, error: createError } = await supabase
    .from('whatsapp_conversations')
    .insert([{
      evolution_config_id: configId,
      contact_number: contactNumber,
      contact_name: contactNumber, // Pode ser atualizado depois
      is_active: true,
      last_message_at: new Date().toISOString()
    }])
    .select()
    .single();

  if (createError) {
    console.error('❌ Error creating conversation:', createError);
    throw createError;
  }

  return newConversation;
}

async function checkAutoResponse(supabase: any, configId: string, conversationId: string, messageContent: string) {
  console.log('🤖 Checking auto response for config:', configId);
  
  // Buscar agente AI ativo para esta configuração
  const { data: aiAgent, error: agentError } = await supabase
    .from('ai_whatsapp_agents')
    .select('*')
    .eq('evolution_config_id', configId)
    .eq('is_active', true)
    .eq('auto_response', true)
    .single();

  if (agentError || !aiAgent) {
    console.log('ℹ️ No active AI agent found for auto response');
    return;
  }

  console.log('🚀 Triggering AI response generation...');
  
  // Chamar função de geração de resposta AI
  try {
    const { error: aiError } = await supabase.functions.invoke('generate-ai-response', {
      body: {
        agent_id: aiAgent.id,
        conversation_id: conversationId,
        message_content: messageContent
      }
    });

    if (aiError) {
      console.error('❌ Error generating AI response:', aiError);
    } else {
      console.log('✅ AI response generation triggered');
    }
  } catch (error) {
    console.error('❌ Error calling AI response function:', error);
  }
}

async function notifyConnectionSuccess(supabase: any, config: any) {
  console.log('🎉 Notifying connection success for config:', config.id);
  
  // Aqui podemos adicionar notificações em tempo real
  // ou outras ações quando uma conexão é estabelecida
  
  // Atualizar agentes relacionados
  const { error: agentError } = await supabase
    .from('ai_whatsapp_agents')
    .update({ 
      is_active: true,
      updated_at: new Date().toISOString()
    })
    .eq('evolution_config_id', config.id);

  if (agentError) {
    console.error('❌ Error updating related agents:', agentError);
  } else {
    console.log('✅ Related agents updated successfully');
  }
}
