// Versão 1.1 - Forçando re-deploy para limpar cache
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
async function handleMessageUpsert(supabase: any, payload: any) {
  const instanceName = payload.instance;
  const messageData = payload.data;
  const remoteJid = messageData?.key?.remoteJid;

  // Ignorar mensagens de grupo e de status
  if (!remoteJid || remoteJid.endsWith('@g.us') || remoteJid.endsWith('@broadcast')) {
    console.log('🗣️ Mensagem de grupo ou status ignorada.');
    return;
  }
  
  // Ignorar mensagens sem conteúdo relevante (ex: chamadas perdidas)
  if (!messageData.message) {
    console.log('ℹ️ Mensagem sem conteúdo relevante ignorada.');
    return;
  }

  // --- BUSCAR CONFIGURAÇÃO DA INSTÂNCIA E AGENTE DE IA ---
  const { data: config, error: configError } = await supabase
    .from('evolution_api_configs')
    .select('id, franchisee_id')
    .eq('instance_name', instanceName)
    .single();

  if (configError || !config) {
    console.error(`❌ Configuração não encontrada para a instância: ${instanceName}`, configError);
    return;
  }
  
  const { data: aiAgent, error: agentError } = await supabase
    .from('ai_whatsapp_agents')
    .select('id, openai_api_key')
    .eq('evolution_config_id', config.id)
    .eq('is_active', true)
    .single();

  if (agentError || !aiAgent?.openai_api_key) {
    console.log(`ℹ️ Nenhum agente de IA ativo com chave OpenAI para a instância: ${instanceName}`);
    // Poderíamos parar aqui ou continuar salvando a mensagem sem IA
  }
  
  // --- PROCESSAMENTO E TRANSCRIÇÃO DA MENSAGEM ---
  let messageContent = "[Mídia não suportada]";
  let messageType = 'text';

  const isAudioMessage = !!messageData.message?.audioMessage;
  
  if (isAudioMessage) {
    messageType = 'audio';
    console.log('🎤 Mensagem de áudio recebida. Tentando transcrever...');
    
    // VERIFICA SE A EVOLUTION API JÁ TRANSCRITOU (FALLBACK)
    if (messageData.message.speechToText) {
        console.log('✅ Transcrição encontrada no payload da Evolution API.');
        messageContent = messageData.message.speechToText;
    } 
    // SE NÃO, CHAMA NOSSA FUNÇÃO DE TRANSCRIÇÃO
    else if (aiAgent?.openai_api_key && messageData.message.audioMessage.url) {
      try {
        const { data: transcribeData, error: transcribeError } = await supabase.functions.invoke('openai-handler', {
          body: {
            action: 'transcribe',
            openaiApiKey: aiAgent.openai_api_key,
            audioUrl: messageData.message.audioMessage.url,
            mimetype: messageData.message.audioMessage.mimetype || 'audio/ogg'
          }
        });
        
        if (transcribeError) throw transcribeError;
        
        messageContent = transcribeData.transcribedText;
        console.log(`✅ Transcrição bem-sucedida: "${messageContent.substring(0, 50)}..."`);
        
      } catch (error) {
        // --- LOG DE ERRO APRIMORADO ---
        console.error('❌ Erro ao invocar a função de transcrição:', error);
        if (error.context && error.context.json) {
            const errorJson = await error.context.json();
            console.error('Detalhes do erro da função openai-handler:', JSON.stringify(errorJson, null, 2));
        }
        // --- FIM DO APRIMORAMENTO ---
        messageContent = "[Erro ao transcrever áudio]";
      }
    } else {
        console.warn('⚠️ Não foi possível transcrever: Chave OpenAI ou URL do áudio ausente.');
        messageContent = "[Áudio recebido, transcrição indisponível]";
    }
  } else {
    messageType = 'text';
    messageContent = messageData.message?.conversation || messageData.message?.extendedTextMessage?.text || "[Tipo de mensagem não suportado]";
  }

  // --- SALVAR MENSAGEM E CONVERSA ---
  const contactNumber = remoteJid.split('@')[0];
  if (!contactNumber) return;

  const { data: conversation } = await supabase
    .from('whatsapp_conversations')
    .select('id')
    .eq('evolution_config_id', config.id)
    .eq('contact_number', contactNumber)
    .single();
    
  let conversationId = conversation?.id;

  if (!conversation) {
    const { data: newConversation, error: createConvError } = await supabase
      .from('whatsapp_conversations')
      .insert({ evolution_config_id: config.id, contact_number: contactNumber, contact_name: contactNumber })
      .select('id')
      .single();
      
    if (createConvError) {
      console.error('❌ Erro ao criar nova conversa:', createConvError);
      return;
    }
    conversationId = newConversation?.id;
  }
  
  if (!conversationId) {
    console.error('❌ ID da conversa não pôde ser determinado.');
    return;
  }

  const { error: insertMsgError } = await supabase.from('whatsapp_messages').insert({
    conversation_id: conversationId,
    message_id: messageData.key?.id,
    content: messageContent,
    message_type: messageType,
    sender_type: messageData.key?.fromMe ? 'agent' : 'user',
    is_from_me: messageData.key?.fromMe || false,
  });

  if(insertMsgError) {
    console.error('❌ Erro ao salvar mensagem:', insertMsgError);
    return;
  }
  console.log(`✅ Mensagem de ${contactNumber} salva com sucesso. Tipo: ${messageType}`);

  // --- ACIONAR RESPOSTA DA IA ---
  if (!messageData.key?.fromMe && messageContent && !messageContent.startsWith("[")) {
    console.log('➡️ Mensagem de usuário recebida. Acionando verificação de auto-resposta da IA...');
    await checkAutoResponse(supabase, config.id, conversationId, messageContent);
  } else {
    console.log('➡️ Mensagem do agente ou sem conteúdo válido. Ignorando auto-resposta.');
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
    const { data: aiFunctionResponse, error: aiFunctionError } = await supabase.functions.invoke('openai-handler', {
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
