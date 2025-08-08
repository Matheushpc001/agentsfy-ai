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

  if (!remoteJid || remoteJid.endsWith('@g.us') || !messageData.message) {
    return;
  }

  let messageContent: string | null = null;
  let messageType = 'text';

  const isAudioMessage = !!messageData.message?.audioMessage;
  
  if (isAudioMessage) {
    messageType = 'audio';
    messageContent = messageData.message.speechToText; 
    
    if (messageContent) {
      console.log(`✅ Transcrição recebida da Evolution API: "${messageContent}"`);
    } else {
      console.warn('⚠️ Transcrição da Evolution API ausente. Ativando fallback para openai-handler...');
      
      try {
        const { data: config } = await supabase.from('evolution_api_configs').select('id').eq('instance_name', instanceName).single();
        if (!config) throw new Error("Configuração da instância não encontrada para o fallback.");

        // Busca o AI Agent associado a essa configuração para pegar a chave
        const { data: aiAgent } = await supabase.from('ai_whatsapp_agents').select('openai_api_key').eq('evolution_config_id', config.id).single();
        if (!aiAgent?.openai_api_key || !messageData.message.audioMessage.url) {
            throw new Error("Chave OpenAI ou URL do áudio ausente para o fallback.");
        }

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
        console.log(`✅ Transcrição via fallback bem-sucedida: "${messageContent}"`);

      } catch (error) {
        console.error('❌ Erro no fallback de transcrição:', error);
        messageContent = "[Erro ao transcrever áudio]";
      }
    }
  } else {
    messageType = 'text';
    messageContent = messageData.message?.conversation || messageData.message?.extendedTextMessage?.text;
  }

  if (!messageContent || messageContent.trim().length === 0) {
    console.log('➡️ Mensagem sem conteúdo textual válido após processamento. Ignorando.');
    return;
  }
  
  if (messageContent.startsWith("[")) {
      console.log(`➡️ Conteúdo inválido ('${messageContent}'), ignorando resposta da IA.`);
      // Ainda podemos salvar a mensagem para registro, se desejado.
  }

  const { data: config } = await supabase.from('evolution_api_configs').select('id').eq('instance_name', instanceName).single();
  if (!config) return;

  const contactNumber = remoteJid.split('@')[0];
  let { data: conversation } = await supabase.from('whatsapp_conversations').select('id').eq('evolution_config_id', config.id).eq('contact_number', contactNumber).single();
    
  let conversationId = conversation?.id;
  if (!conversation) {
    const { data: newConv } = await supabase.from('whatsapp_conversations').insert({ evolution_config_id: config.id, contact_number: contactNumber, contact_name: contactNumber }).select('id').single();
    conversationId = newConv?.id;
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
  console.log(`✅ Mensagem de ${contactNumber} salva.`);

  if (!messageData.key?.fromMe && !messageContent.startsWith("[")) {
    await checkAutoResponse(supabase, config.id, conversationId, messageContent);
  }
}

async function checkAutoResponse(supabase: any, configId: string, conversationId: string, messageContent: string) {
  try {
    const { data: aiAgent } = await supabase.from('ai_whatsapp_agents').select('*').eq('evolution_config_id', configId).eq('is_active', true).eq('auto_response', true).single();
    if (!aiAgent) return;

    const { data: previousMessages } = await supabase.from('whatsapp_messages').select('content, sender_type').eq('conversation_id', conversationId).order('timestamp', { ascending: false }).limit(10);
    
    // Agora o openai-handler é usado apenas para gerar texto, o que é correto.
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
    if (!aiResponse) return;

    await supabase.from('ai_interaction_logs').insert({
      agent_id: aiAgent.id, conversation_id: conversationId, user_message: messageContent, ai_response: aiResponse
    });

    const { data: conversationData } = await supabase.from('whatsapp_conversations').select('contact_number').eq('id', conversationId).single();
    if (!conversationData?.contact_number) return;
    
    await supabase.functions.invoke('evolution-api-manager', {
      body: { action: 'send_message', config_id: configId, phone_number: conversationData.contact_number, message: aiResponse }
    });

  } catch (error) {
    console.error('❌ Erro na auto-resposta da IA:', error);
  }
}