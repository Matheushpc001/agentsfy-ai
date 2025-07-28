import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

// Handler principal
async function handler(req: Request) {
  // --- NOVO LOG DE DIAGNÓSTICO ---
  console.log("✅✅✅ DEPLOY V2 - JWT Desativado - INVOCADO ✅✅✅");
  console.log(`[${new Date().toISOString()}] 🚀 Webhook Handler INVOCADO. Método: ${req.method}. URL: ${req.url}`);
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders
    });
  }
  try {
    const payload = await req.json();
    console.log('📨 Webhook payload received:', JSON.stringify(payload, null, 2));
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase environment variables not configured');
    }
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { event } = payload;
    console.log('🔍 Processing webhook event:', event);
    
    switch(event){
      case 'connection.update':
      case 'CONNECTION_UPDATE':
        await handleConnectionUpdate(supabase, payload);
        break;
      case 'messages.upsert':
      case 'MESSAGES_UPSERT':
        await handleMessageUpsert(supabase, payload);
        break;
      case 'qrcode.updated':
      case 'QRCODE_UPDATED':
        await handleQRCodeUpdate(supabase, payload);
        break;
      default:
        console.log(`ℹ️ Evento não tratado recebido: ${event}`);
    }
    
    return new Response(JSON.stringify({
      success: true,
      message: 'Webhook processed successfully'
    }), {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('❌ Webhook processing error:', error);
    return new Response(JSON.stringify({
      error: 'Webhook processing failed',
      details: error.message
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
}

// Inicia o servidor
console.log(`[${new Date().toISOString()}] 📢 Servidor do Webhook está sendo inicializado e escutando...`);

// MODIFICAÇÃO APLICADA AQUI:
serve(handler, {
  verifyJWT: false, // Permite que a Evolution API chame este webhook sem um token de usuário
  onListen: ({ port, hostname }) => {
    console.log(`🚀 Webhook server listening on http://${hostname}:${port}`);
  },
});

// --- FUNÇÕES AUXILIARES ---

async function handleConnectionUpdate(supabase: any, payload: any) {
  console.log('🔄 Processing connection update:', payload);
  const instanceName = payload.instance?.instanceName;
  const connectionState = payload.data?.state || payload.data?.connectionStatus;
  if (!instanceName) {
    console.log('⚠️ No instance name found in connection update');
    return;
  }
  console.log('📱 Instance:', instanceName, 'New state:', connectionState);
  let newStatus = 'disconnected';
  switch(connectionState){
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
  const updateData: any = {
    status: newStatus,
    updated_at: new Date().toISOString()
  };
  if (newStatus === 'connected') {
    updateData.qr_code = null;
    updateData.qr_code_expires_at = null;
  }
  const { data, error } = await supabase.from('evolution_api_configs').update(updateData).eq('instance_name', instanceName).select();
  if (error) {
    console.error('❌ Error updating config status:', error);
    return;
  }
  if (data && data.length > 0) {
    console.log('✅ Config updated successfully:', data[0].id, 'Status:', newStatus);
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
  const { data: config, error: configError } = await supabase.from('evolution_api_configs').select('id, franchisee_id').eq('instance_name', instanceName).single();
  if (configError || !config) {
    console.log('⚠️ Config not found for message:', instanceName);
    return;
  }
  const contactNumber = messageData.key?.remoteJid?.replace('@s.whatsapp.net', '');
  if (!contactNumber) {
    console.log('⚠️ No contact number found in message');
    return;
  }
  let conversation = await findOrCreateConversation(supabase, config.id, contactNumber);
  const messageInsert = {
    conversation_id: conversation.id,
    message_id: messageData.key?.id || `msg_${Date.now()}`,
    content: messageData.message?.conversation || messageData.message?.extendedTextMessage?.text || '',
    message_type: 'text',
    sender_type: messageData.key?.fromMe ? 'agent' : 'customer',
    is_from_me: messageData.key?.fromMe || false,
    timestamp: new Date((messageData.messageTimestamp || Date.now() / 1000) * 1000).toISOString()
  };
  const { error: messageError } = await supabase.from('whatsapp_messages').insert([
    messageInsert
  ]);
  if (messageError) {
    console.error('❌ Error saving message:', messageError);
  } else {
    console.log('✅ Message saved successfully');
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
  const { error } = await supabase.from('evolution_api_configs').update({
    qr_code: qrCode,
    qr_code_expires_at: new Date(Date.now() + 2 * 60 * 1000).toISOString(),
    status: 'qr_ready',
    updated_at: new Date().toISOString()
  }).eq('instance_name', instanceName);
  if (error) {
    console.error('❌ Error updating QR code:', error);
  } else {
    console.log('✅ QR code updated successfully for:', instanceName);
  }
}

async function findOrCreateConversation(supabase: any, configId: string, contactNumber: string) {
  const { data: existing, error: findError } = await supabase.from('whatsapp_conversations').select('*').eq('evolution_config_id', configId).eq('contact_number', contactNumber).single();
  if (!findError && existing) {
    return existing;
  }
  const { data: newConversation, error: createError } = await supabase.from('whatsapp_conversations').insert([
    {
      evolution_config_id: configId,
      contact_number: contactNumber,
      contact_name: contactNumber,
      is_active: true,
      last_message_at: new Date().toISOString()
    }
  ]).select().single();
  if (createError) {
    console.error('❌ Error creating conversation:', createError);
    throw createError;
  }
  return newConversation;
}

async function checkAutoResponse(supabase: any, configId: string, conversationId: string, messageContent: string) {
  console.log('🤖 Checking auto response for config:', configId);
  const { data: aiAgent, error: agentError } = await supabase.from('ai_whatsapp_agents').select('*').eq('evolution_config_id', configId).eq('is_active', true).eq('auto_response', true).single();
  if (agentError || !aiAgent) {
    console.log('ℹ️ No active AI agent found for auto response');
    return;
  }
  console.log('🚀 Triggering AI response generation...');
  try {
    const { error: aiError } = await supabase.functions.invoke('generate-ai-response', {
      body: {
        agentId: aiAgent.id,
        userMessage: messageContent,
        previousMessages: [], // Ajuste: Você precisará buscar as mensagens anteriores aqui
        systemPrompt: aiAgent.system_prompt,
        model: aiAgent.model,
        openaiApiKey: aiAgent.openai_api_key,
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
  const { error: agentError } = await supabase.from('ai_whatsapp_agents').update({
    is_active: true,
    updated_at: new Date().toISOString()
  }).eq('evolution_config_id', config.id);
  if (agentError) {
    console.error('❌ Error updating related agents:', agentError);
  } else {
    console.log('✅ Related agents updated successfully');
  }
}
