import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.0.0";
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};
// Handler principal
async function handler(req) {
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
  verifyJWT: false,
  onListen: ({ port, hostname })=>{
    console.log(`🚀 Webhook server listening on http://${hostname}:${port}`);
  }
});
// --- FUNÇÕES AUXILIARES ---
async function handleConnectionUpdate(supabase, payload) {
  console.log('🔄 Processing connection update:', payload);
  const instanceName = payload.instance;
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
  const updateData = {
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
async function handleMessageUpsert(supabase, payload) {
  console.log('💬 Processing message upsert:', payload);
  const instanceName = payload.instance;
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
    content: messageData.message?.conversation || messageData.message?.extendedTextMessage?.text || 'No content found',
    message_type: 'text',
    sender_type: messageData.key?.fromMe ? 'agent' : 'user',
    is_from_me: messageData.key?.fromMe || false,
    timestamp: new Date((messageData.messageTimestamp || Date.now() / 1000) * 1000).toISOString()
  };
  console.log('📦 Preparing to insert message:', JSON.stringify(messageInsert, null, 2));
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
async function handleQRCodeUpdate(supabase, payload) {
  console.log('📱 Processing QR code update:', payload);
  const instanceName = payload.instance;
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
async function findOrCreateConversation(supabase, configId, contactNumber) {
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
  console.log('🤖 Verificando auto-resposta para config:', configId);
  
  // 1. Encontrar o agente de IA ativo para esta instância
  const { data: aiAgent, error: agentError } = await supabase
    .from('ai_whatsapp_agents')
    .select('*')
    .eq('evolution_config_id', configId)
    .eq('is_active', true)
    .eq('auto_response', true)
    .single();

  if (agentError || !aiAgent) {
    console.log('ℹ️ Nenhum agente de IA ativo para auto-resposta.', agentError);
    return;
  }

  console.log(`🤖 Agente de IA encontrado: ${aiAgent.agent_id}`);

  try {
    // 2. Buscar o histórico da conversa para dar contexto
    const { data: previousMessages, error: historyError } = await supabase
      .from('whatsapp_messages')
      .select('content, sender_type')
      .eq('conversation_id', conversationId)
      .order('timestamp', { ascending: false })
      .limit(10);

    if (historyError) {
      console.error('❌ Erro ao buscar histórico da conversa:', historyError);
      // Continuar mesmo sem histórico
    }

    // 3. Invocar a função de IA para gerar a resposta
    console.log('🚀 Invocando a função generate-ai-response...');
    const { data: aiFunctionResponse, error: aiFunctionError } = await supabase.functions.invoke('generate-ai-response', {
      body: {
        agentId: aiAgent.id,
        userMessage: messageContent,
        previousMessages: previousMessages || [],
        systemPrompt: aiAgent.system_prompt,
        model: aiAgent.model,
        openaiApiKey: aiAgent.openai_api_key,
      }
    });

    if (aiFunctionError) {
      throw new Error(`Erro ao invocar a função de IA: ${aiFunctionError.message}`);
    }

    const { aiResponse, tokensUsed, modelUsed } = aiFunctionResponse;
    
    if (!aiResponse) {
      throw new Error("A função de IA não retornou uma resposta válida.");
    }
    
    console.log('✅ Resposta da IA recebida:', aiResponse);

    // 4. Salvar o log da interação com a IA
    await supabase.from('ai_interaction_logs').insert({
      agent_id: aiAgent.id,
      conversation_id: conversationId,
      user_message: messageContent,
      ai_response: aiResponse,
      tokens_used: tokensUsed,
      model_used: modelUsed
    });
    
    // 5. Invocar o api-manager para ENVIAR a resposta para o WhatsApp
    console.log('📤 Enviando resposta para o usuário via evolution-api-manager...');
    const { error: sendMessageError } = await supabase.functions.invoke('evolution-api-manager', {
      body: {
        action: 'send_message',
        config_id: configId,
        phone_number: (await supabase.from('whatsapp_conversations').select('contact_number').eq('id', conversationId).single()).data.contact_number,
        message: aiResponse
      }
    });

    if (sendMessageError) {
      throw new Error(`Erro ao enviar mensagem de resposta: ${sendMessageError.message}`);
    }

    console.log('✅ Resposta da IA enviada com sucesso para o usuário.');

  } catch (error) {
    console.error('❌ Erro no fluxo de auto-resposta da IA:', error);
  }
}
async function notifyConnectionSuccess(supabase, config) {
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
