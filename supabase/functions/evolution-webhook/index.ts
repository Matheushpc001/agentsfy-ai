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

  // Filtro de Grupo
  const remoteJid = messageData?.key?.remoteJid;
  if (remoteJid && remoteJid.endsWith('@g.us')) {
    console.log('🗣️ Mensagem de grupo ignorada.');
    return;
  }
  
  if (!instanceName || !messageData) {
    console.log('⚠️ Incomplete message data');
    return;
  }

  // Encontrar a configuração da instância para obter o franchisee_id
  const { data: config, error: configError } = await supabase.from('evolution_api_configs').select('id, franchisee_id').eq('instance_name', instanceName).single();
  if (configError || !config) {
    console.log('⚠️ Configuração não encontrada para a instância:', instanceName);
    return;
  }
  
  const contactNumber = remoteJid?.replace('@s.whatsapp.net', '');
  if (!contactNumber) {
    console.log('⚠️ Número do contato não encontrado na mensagem.');
    return;
  }

  let messageContent = messageData.message?.conversation || messageData.message?.extendedTextMessage?.text;
  let messageType = 'text';

  // Lógica para Transcrição de Áudio
  if (messageData.message?.audioMessage) {
    console.log('🎤 Mensagem de áudio detectada. Iniciando transcrição...');
    messageType = 'audio';
    
    // Precisamos da chave da OpenAI para transcrever. Buscamos do primeiro agente de IA ativo.
    const { data: anyAiAgent, error: anyAiAgentError } = await supabase
      .from('ai_whatsapp_agents')
      .select('openai_api_key')
      .eq('evolution_config_id', config.id)
      .eq('is_active', true)
      .limit(1)
      .single();

    if (anyAiAgentError || !anyAiAgent?.openai_api_key) {
        console.error('❌ Não foi possível encontrar uma chave da OpenAI para transcrever o áudio.');
        return;
    }

    try {
      const { data: transcribeData, error: transcribeError } = await supabase.functions.invoke('generate-ai-response', {
        body: {
          action: 'transcribe',
          openaiApiKey: anyAiAgent.openai_api_key,
          audioUrl: messageData.message.audioMessage.url,
        }
      });

      if (transcribeError) throw transcribeError;

      messageContent = transcribeData.transcribedText;
      console.log(`🗣️ Texto Transcrito: "${messageContent}"`);

    } catch (error) {
      console.error('❌ Falha ao transcrever o áudio:', error);
      // Salva uma mensagem de falha para que o franqueado veja que um áudio foi recebido
      messageContent = "[Falha ao transcrever mensagem de voz]";
    }
  }
  
  if (!messageContent) {
    console.log('⚠️ Conteúdo da mensagem não encontrado ou tipo não suportado. Ignorando.');
    return;
  }

  // O resto do fluxo continua como antes
  const conversation = await findOrCreateConversation(supabase, config.id, contactNumber);

  const messageInsert = {
    conversation_id: conversation.id,
    message_id: messageData.key?.id || `msg_${Date.now()}`,
    content: messageContent,
    message_type: messageType,
    sender_type: messageData.key?.fromMe ? 'agent' : 'user',
    is_from_me: messageData.key?.fromMe || false,
    timestamp: new Date((messageData.messageTimestamp || Date.now() / 1000) * 1000).toISOString()
  };
  
  console.log('📦 Preparando para inserir mensagem:', JSON.stringify(messageInsert, null, 2));
  
  const { error: messageError } = await supabase.from('whatsapp_messages').insert([messageInsert]);

  if (messageError) {
    console.error('❌ Erro ao salvar mensagem:', messageError);
  } else {
    console.log('✅ Mensagem salva com sucesso');
    if (!messageData.key?.fromMe) {
      await checkAutoResponse(supabase, config.id, conversation.id, messageContent);
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
  console.log('🤖 PASSO 1: Iniciando checkAutoResponse...');
  
  try {
    // Encontrar o agente de IA ativo para esta instância
    const { data: aiAgent, error: agentError } = await supabase
      .from('ai_whatsapp_agents')
      .select('*')
      .eq('evolution_config_id', configId)
      .eq('is_active', true)
      .eq('auto_response', true)
      .single();

    if (agentError || !aiAgent) {
      console.log('ℹ️ PASSO 2: Nenhum agente de IA ativo encontrado. Finalizando auto-resposta.', { agentError });
      return;
    }
    console.log(`🤖 PASSO 2: Agente de IA encontrado: ${aiAgent.id}`);

    // Buscar o histórico da conversa para dar contexto
    console.log('📚 PASSO 3: Buscando histórico da conversa...');
    const { data: previousMessages, error: historyError } = await supabase
      .from('whatsapp_messages')
      .select('content, sender_type')
      .eq('conversation_id', conversationId)
      .order('timestamp', { ascending: false })
      .limit(10);

    if (historyError) {
      console.error('❌ Erro no PASSO 3 ao buscar histórico:', historyError);
    }
    console.log(`📚 PASSO 3: Histórico encontrado: ${previousMessages?.length || 0} mensagens.`);
    
    // Montar o corpo da requisição para a função de IA
    const invokeBody = {
      agentId: aiAgent.id,
      userMessage: messageContent,
      previousMessages: previousMessages || [],
      systemPrompt: aiAgent.system_prompt,
      model: aiAgent.model,
      openaiApiKey: aiAgent.openai_api_key,
    };

    // Invocar a função de IA para gerar a resposta
    console.log('🚀 PASSO 4: Invocando a função generate-ai-response...');
    const { data: aiFunctionResponse, error: aiFunctionError } = await supabase.functions.invoke('generate-ai-response', {
      body: {
        // ##############################################
        // ### ADICIONE A ACTION AQUI                 ###
        // ##############################################
        action: 'generate', // Especifica que queremos gerar texto
        agentId: aiAgent.id,
        userMessage: messageContent,
        previousMessages: previousMessages || [],
        systemPrompt: aiAgent.system_prompt,
        model: aiAgent.model,
        openaiApiKey: aiAgent.openai_api_key,
      }
    });

    if (aiFunctionError) {
      console.error('❌ Erro no PASSO 4 ao invocar a função de IA:', aiFunctionError);
      throw new Error(`Erro ao invocar a função de IA: ${aiFunctionError.message}`);
    }
    console.log('✅ PASSO 4: Função de IA invocada com sucesso.');

    const { aiResponse, tokensUsed, modelUsed } = aiFunctionResponse;
    
    if (!aiResponse) {
      console.error('❌ Erro no PASSO 5: A função de IA não retornou uma resposta válida.');
      throw new Error("A função de IA não retornou uma resposta válida.");
    }
    console.log('✅ PASSO 5: Resposta da IA recebida:', aiResponse.substring(0, 50) + "...");

    // Salvar o log da interação com a IA
    console.log('💾 PASSO 6: Salvando log da interação...');
    const { error: logInsertError } = await supabase.from('ai_interaction_logs').insert({
      agent_id: aiAgent.id,
      conversation_id: conversationId,
      user_message: messageContent,
      ai_response: aiResponse,
      tokens_used: tokensUsed,
      model_used: modelUsed
    });

    if (logInsertError) {
      console.error('❌ Erro no PASSO 6 ao salvar log:', logInsertError);
    } else {
      console.log('✅ PASSO 6: Log da interação salvo com sucesso.');
    }

    // Buscar o número de telefone para enviar a resposta
    console.log('📞 PASSO 7: Buscando número do contato...');
    const { data: conversationData, error: conversationError } = await supabase
        .from('whatsapp_conversations')
        .select('contact_number')
        .eq('id', conversationId)
        .single();

    if (conversationError || !conversationData?.contact_number) {
        console.error('❌ Erro no PASSO 7 ao buscar número do contato:', conversationError);
        throw new Error("Não foi possível encontrar o número do contato para responder.");
    }
    const contactNumber = conversationData.contact_number;
    console.log(`📞 PASSO 7: Número do contato encontrado: ${contactNumber}`);

    // Invocar o api-manager para ENVIAR a resposta para o WhatsApp
    console.log('📤 PASSO 8: Invocando evolution-api-manager para enviar a resposta...');
    const { error: sendMessageError } = await supabase.functions.invoke('evolution-api-manager', {
      body: {
        action: 'send_message',
        config_id: configId,
        phone_number: contactNumber,
        message: aiResponse
      }
    });

    if (sendMessageError) {
      console.error('❌ Erro no PASSO 8 ao invocar o envio de mensagem:', sendMessageError);
      throw new Error(`Erro ao enviar mensagem de resposta: ${sendMessageError.message}`);
    }

    console.log('✅ PASSO 8: Resposta da IA enviada com sucesso para o usuário.');

  } catch (error) {
    console.error('❌ Erro GERAL no fluxo de auto-resposta da IA:', error);
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
