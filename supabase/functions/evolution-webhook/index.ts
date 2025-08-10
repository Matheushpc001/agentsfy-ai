// ARQUIVO: supabase/functions/evolution-webhook/index.ts
// VERSÃO FINAL CORRETA - Apenas recebe o texto da Evolution API

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

// Handler Principal
serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload = await req.json();
    console.log('📨 V2 Webhook payload received:', JSON.stringify(payload, null, 2));

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { event } = payload;
    
    if (event === 'messages.upsert' || event === 'MESSAGES_UPSERT') {
      console.log('🔍 Processing messages.upsert event...');
      await handleMessageUpsert(supabase, payload);
    } else {
      console.log(`ℹ️ Evento '${event}' não é do tipo 'messages.upsert'. Ignorando.`);
    }

    return new Response(JSON.stringify({ success: true, message: 'Webhook processed' }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ Webhook processing error:', error);
    return new Response(JSON.stringify({ error: 'Webhook processing failed', details: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

async function handleMessageUpsert(supabase: any, payload: any) {
  const instanceName = payload.instance;
  const messageData = payload.data;
  const remoteJid = messageData?.key?.remoteJid;
  const messageTypeFromAPI = messageData?.messageType;
  const isGroup = !!remoteJid && remoteJid.endsWith('@g.us');
  const hasMessage = !!messageData?.message;
  const hasReaction = !!messageData?.message?.reactionMessage;

  console.log(`ℹ️ Incoming message meta -> remoteJid: ${remoteJid}, fromMe: ${messageData?.key?.fromMe}, typeFromAPI: ${messageTypeFromAPI}, hasMessage: ${hasMessage}`);

  if (!remoteJid) {
    console.log('➡️ Ignoring: remoteJid ausente.');
    return;
  }
  if (isGroup) {
    console.log(`➡️ Ignoring: mensagem de GRUPO (${remoteJid}) conforme solicitado.`);
    return;
  }
  if (!hasMessage) {
    console.log('➡️ Ignoring: payload sem "message".');
    return;
  }
  if (hasReaction) {
    console.log('➡️ Ignoring: reactionMessage (curtidas/emojis não são processados).');
    return;
  }

  let messageContent: string | null = null;
  let messageType = 'text';

// Verificar diferentes tipos de mensagem
const hasAudio = !!messageData.message?.audioMessage;
const hasVideo = !!messageData.message?.videoMessage;
const hasDocument = !!messageData.message?.documentMessage;
const hasImage = !!messageData.message?.imageMessage;
console.log(`🔎 Detecção de tipo -> audio:${hasAudio} video:${hasVideo} doc:${hasDocument} image:${hasImage}`);
  if (hasAudio) {
    messageType = 'audio';
    console.log('🎤 Processando mensagem de áudio...');
    
    // Primeiro, verificar se a Evolution API já fez a transcrição
    messageContent = messageData.message?.audioMessage?.speechToText || 
                    messageData.message?.speechToText ||
                    messageData.speechToText;
    
    if (messageContent && messageContent.trim().length > 0) {
      console.log(`✅ Transcrição obtida da Evolution API: "${messageContent}"`);
    } else {
      console.log('⚠️ Transcrição não encontrada na Evolution API. Tentando fallback...');
      
      try {
        // Obter config + global (para baixar mídia descriptografada via Evolution API)
        const { data: configFull, error: cfgErr } = await supabase
          .from('evolution_api_configs')
          .select('id, instance_name, evolution_global_configs ( api_url, api_key )')
          .eq('instance_name', instanceName)
          .single();
        if (cfgErr || !configFull?.evolution_global_configs) throw new Error("Configuração da instância não encontrada");
        const configId = configFull.id;
        const globalCfg = configFull.evolution_global_configs;

        // Buscar agente IA ativo com chave OpenAI
        const { data: aiAgent } = await supabase
          .from('ai_whatsapp_agents')
          .select('openai_api_key')
          .eq('evolution_config_id', configId)
          .eq('is_active', true)
          .single();
        if (!aiAgent?.openai_api_key) throw new Error("Nenhum agente IA ativo com chave OpenAI encontrado");

        // Tentar baixar mídia já descriptografada pela Evolution API
        const messageId = messageData.key?.id;
        const tryEndpoints = [
          `${globalCfg.api_url}/message/download/${instanceName}/${messageId}`,
          `${globalCfg.api_url}/message/downloadMedia/${instanceName}/${messageId}`,
        ];
        let base64Audio: string | null = null;
        let mimeFromApi: string | undefined;
        let fileNameFromApi: string | undefined;

        for (const endpoint of tryEndpoints) {
          try {
            console.log(`📥 Tentando baixar mídia em: ${endpoint}`);
            const resp = await fetch(endpoint, { headers: { apikey: globalCfg.api_key } });
            if (!resp.ok) {
              console.log(`➡️ Endpoint falhou (${resp.status}).`);
              continue;
            }
            const data = await resp.json().catch(() => ({}));
            const possible = data?.base64 || data?.file || data?.data || data?.audio || null;
            if (possible && typeof possible === 'string') {
              base64Audio = possible.includes(',') ? possible.split(',').pop() : possible;
              mimeFromApi = data?.mimetype || data?.mimeType || undefined;
              fileNameFromApi = data?.fileName || data?.filename || undefined;
              break;
            }
          } catch (e) {
            console.log('➡️ Falha ao baixar em endpoint:', e);
          }
        }

        if (base64Audio) {
          console.log('🎧 Mídia obtida via Evolution API. Enviando para transcribe_base64...');
          const { data: transcribeData, error: transcribeError } = await supabase.functions.invoke('openai-handler', {
            body: {
              action: 'transcribe_base64',
              openaiApiKey: aiAgent.openai_api_key,
              fileBase64: base64Audio,
              mimetype: mimeFromApi || messageData.message?.audioMessage?.mimetype || 'audio/ogg',
              filename: fileNameFromApi || `audio_${messageId}.ogg`
            }
          });
          if (transcribeError) throw transcribeError;
          if (!transcribeData?.transcribedText) throw new Error('Transcrição retornou vazia');
          messageContent = transcribeData.transcribedText;
          console.log(`✅ Transcrição (base64) bem-sucedida: "${messageContent}"`);
        } else {
          // Fallback final: usar URL direta (com headers via payload)
          const audioUrl = messageData.message?.audioMessage?.url;
          const mimetype = messageData.message?.audioMessage?.mimetype || 'audio/ogg';
          if (!audioUrl) throw new Error('URL do áudio não encontrada');
          console.log(`🔁 Fallback final via URL: ${audioUrl}`);
          const extraHeaders = payload?.apikey
            ? { apikey: payload.apikey, 'x-api-key': payload.apikey, Authorization: `Bearer ${payload.apikey}` }
            : undefined;
          const { data: transcribeData, error: transcribeError } = await supabase.functions.invoke('openai-handler', {
            body: {
              action: 'transcribe',
              openaiApiKey: aiAgent.openai_api_key,
              audioUrl,
              mimetype,
              fetchHeaders: extraHeaders
            }
          });
          if (transcribeError) throw transcribeError;
          if (!transcribeData?.transcribedText) throw new Error('Transcrição retornou vazia');
          messageContent = transcribeData.transcribedText;
          console.log(`✅ Transcrição via URL bem-sucedida: "${messageContent}"`);
        }

      } catch (error) {
        console.error('❌ Erro no fallback de transcrição:', error);
        messageContent = "[Erro ao transcrever áudio]";
      }
    }
  } else if (hasVideo) {
    messageType = 'video';
    messageContent = messageData.message?.videoMessage?.caption || '[Vídeo enviado]';
  } else if (hasDocument) {
    messageType = 'document';
    messageContent = messageData.message?.documentMessage?.caption || 
                    `[Documento: ${messageData.message?.documentMessage?.fileName || 'arquivo'}]`;
  } else if (hasImage) {
    messageType = 'image';
    messageContent = messageData.message?.imageMessage?.caption || '[Imagem enviada]';
  } else {
    messageType = 'text';
    messageContent = messageData.message?.conversation || 
                    messageData.message?.extendedTextMessage?.text ||
                    messageData.message?.text;
  }

if (!messageContent || messageContent.trim().length === 0) {
  console.log(`➡️ Mensagem sem conteúdo textual válido após processamento. Tipo detectado: ${messageType}. Ignorando.`);
  return;
}

// Sanitizar prefixos como "[audio] ..." vindos da Evolution
const originalContent = messageContent;
const cleanedContent = String(messageContent).replace(/^\[[^\]]+\]\s*/g, '').trim();
if (cleanedContent !== originalContent) {
  console.log(`🧹 Limpeza de prefixo detectada: "${originalContent}" -> "${cleanedContent}"`);
  messageContent = cleanedContent;
}

// Se após limpar continuar vazio, não responder
if (!messageContent || messageContent.trim().length === 0) {
  console.log('➡️ Conteúdo vazio após limpeza. Ignorando resposta da IA.');
  return;
}

const { data: config } = await supabase.from('evolution_api_configs').select('id').eq('instance_name', instanceName).single();
if (!config) {
  console.log(`❗ Configuração não encontrada para a instância ${instanceName}.`);
  return;
}

  const contactNumber = remoteJid.split('@')[0];
  let { data: conversation } = await supabase.from('whatsapp_conversations').select('id').eq('evolution_config_id', config.id).eq('contact_number', contactNumber).single();
    
  let conversationId = conversation?.id;
if (!conversation) {
  const { data: newConv } = await supabase.from('whatsapp_conversations').insert({ evolution_config_id: config.id, contact_number: contactNumber, contact_name: contactNumber }).select('id').single();
  conversationId = newConv?.id;
  console.log(`🆕 Conversa criada para ${contactNumber}: ${conversationId}`);
}
  
  if (!conversationId) return;

  await supabase.from('whatsapp_messages').insert({
    conversation_id: conversationId,
    message_id: messageData.key?.id,
    content: messageContent,
    message_type: messageType,
    sender_type: messageData.key?.fromMe ? 'agent' : 'user',
    is_from_me: messageData.key?.fromMe || false,
  });
console.log(`✅ Mensagem salva | contato: ${contactNumber} | tipo: ${messageType} | conteúdo: ${String(messageContent).slice(0, 60)}${String(messageContent).length > 60 ? '...' : ''}`);

if (!messageData.key?.fromMe && !messageContent.startsWith("[")) {
  console.log('🤖 Disparando auto-resposta da IA...');
  await checkAutoResponse(supabase, config.id, conversationId, messageContent);
}
}

async function checkAutoResponse(supabase: any, configId: string, conversationId: string, messageContent: string) {
  try {
    console.log(`🤖 checkAutoResponse -> conversationId: ${conversationId}`);
    const { data: aiAgent } = await supabase
      .from('ai_whatsapp_agents')
      .select('*')
      .eq('evolution_config_id', configId)
      .eq('is_active', true)
      .eq('auto_response', true)
      .single();

    if (!aiAgent) {
      console.log('ℹ️ Nenhum agente IA ativo com auto_response. Pulando.');
      return;
    }

    const { data: previousMessages } = await supabase
      .from('whatsapp_messages')
      .select('content, sender_type')
      .eq('conversation_id', conversationId)
      .order('timestamp', { ascending: false })
      .limit(10);
    console.log(`🧾 Histórico carregado (${previousMessages?.length || 0} mensagens).`);

    console.log(`🧠 Invocando openai-handler (generate) com modelo: ${aiAgent.model}`);
    const { data: aiFunctionResponse, error: aiFunctionError } = await supabase.functions.invoke('openai-handler', {
      body: {
        action: 'generate',
        openaiApiKey: aiAgent.openai_api_key,
        userMessage: messageContent,
        previousMessages: previousMessages || [],
        systemPrompt: aiAgent.system_prompt,
        model: aiAgent.model,
      }
    });

    if (aiFunctionError) throw aiFunctionError;
    const { aiResponse } = aiFunctionResponse;
    const finalText = String(aiResponse || '').trim();
    if (!finalText) {
      console.log('ℹ️ openai-handler retornou resposta vazia ou inválida.');
      return;
    }

    await supabase.from('ai_interaction_logs').insert({
      agent_id: aiAgent.id,
      conversation_id: conversationId,
      user_message: messageContent,
      ai_response: finalText
    });

    const { data: conversationData } = await supabase
      .from('whatsapp_conversations')
      .select('contact_number')
      .eq('id', conversationId)
      .single();
    if (!conversationData?.contact_number) {
      console.log('❗ Número do contato não encontrado para a conversa.');
      return;
    }

    console.log(`📤 Enviando resposta IA para ${conversationData.contact_number}...`);
    const { data: sendResult, error: sendError } = await supabase.functions.invoke('evolution-api-manager', {
      body: {
        action: 'send_message',
        config_id: configId,
        phone_number: conversationData.contact_number,
        message: finalText
      }
    });
    if (sendError) {
      console.error('❌ Falha ao enviar mensagem pela Evolution API:', sendError);
    } else {
      console.log('✅ Mensagem enviada pela Evolution API:', sendResult);
    }
  } catch (error) {
    console.error('❌ Erro na auto-resposta da IA:', error);
  }
}