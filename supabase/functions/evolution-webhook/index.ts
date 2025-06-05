
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
    const webhookData = await req.json();

    console.log('Webhook recebido:', JSON.stringify(webhookData, null, 2));

    // Processar diferentes tipos de eventos do EvolutionAPI
    const { event, data } = webhookData;

    switch (event) {
      case 'qrcode.updated':
        await handleQRCodeUpdate(supabase, data);
        break;
      
      case 'connection.update':
        await handleConnectionUpdate(supabase, data);
        break;
      
      case 'messages.upsert':
        await handleNewMessage(supabase, data);
        break;
      
      default:
        console.log('Evento não tratado:', event);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Erro no webhook:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function handleQRCodeUpdate(supabase: any, data: any) {
  const { instance, qrcode } = data;
  
  await supabase
    .from('evolution_api_configs')
    .update({ 
      qr_code: qrcode,
      qr_code_expires_at: new Date(Date.now() + 60000).toISOString(), // 1 minuto
      status: 'connecting'
    })
    .eq('instance_name', instance);
}

async function handleConnectionUpdate(supabase: any, data: any) {
  const { instance, state } = data;
  
  let status = 'disconnected';
  if (state === 'open') status = 'connected';
  else if (state === 'connecting') status = 'connecting';
  
  await supabase
    .from('evolution_api_configs')
    .update({ 
      status,
      qr_code: state === 'open' ? null : undefined
    })
    .eq('instance_name', instance);
}

async function handleNewMessage(supabase: any, data: any) {
  const { instance, messages } = data;
  
  for (const message of messages) {
    // Buscar configuração da instância
    const { data: config } = await supabase
      .from('evolution_api_configs')
      .select('id')
      .eq('instance_name', instance)
      .single();
    
    if (!config) continue;

    // Verificar se é uma mensagem recebida (não enviada pelo bot)
    if (!message.key.fromMe && message.messageType === 'conversation') {
      const contactNumber = message.key.remoteJid.replace('@s.whatsapp.net', '');
      
      // Buscar ou criar conversa
      let { data: conversation } = await supabase
        .from('whatsapp_conversations')
        .select('*')
        .eq('evolution_config_id', config.id)
        .eq('contact_number', contactNumber)
        .single();
      
      if (!conversation) {
        const { data: newConversation } = await supabase
          .from('whatsapp_conversations')
          .insert({
            evolution_config_id: config.id,
            contact_number: contactNumber,
            contact_name: message.pushName || contactNumber
          })
          .select()
          .single();
        
        conversation = newConversation;
      }

      // Salvar mensagem
      await supabase
        .from('whatsapp_messages')
        .insert({
          conversation_id: conversation.id,
          message_id: message.key.id,
          content: message.message?.conversation || '',
          sender_type: 'user',
          is_from_me: false,
          timestamp: new Date(message.messageTimestamp * 1000).toISOString()
        });

      // Processar resposta IA se houver agente ativo
      await processAIResponse(supabase, conversation, message);
    }
  }
}

async function processAIResponse(supabase: any, conversation: any, message: any) {
  // Buscar agente ativo para esta conversa
  const { data: agent } = await supabase
    .from('ai_whatsapp_agents')
    .select('*')
    .eq('evolution_config_id', conversation.evolution_config_id)
    .eq('is_active', true)
    .single();
  
  if (!agent || !agent.openai_api_key) return;

  try {
    // Buscar mensagens anteriores para contexto
    const { data: previousMessages } = await supabase
      .from('whatsapp_messages')
      .select('content, sender_type')
      .eq('conversation_id', conversation.id)
      .order('timestamp', { ascending: false })
      .limit(10);

    // Chamar Edge Function para gerar resposta IA
    const { data: aiResponse, error } = await supabase.functions.invoke('generate-ai-response', {
      body: {
        agentId: agent.id,
        userMessage: message.message?.conversation || '',
        previousMessages: previousMessages || [],
        systemPrompt: agent.system_prompt || 'Você é um assistente útil.',
        model: agent.model || 'gpt-4o-mini',
        openaiApiKey: agent.openai_api_key
      }
    });

    if (aiResponse && !error) {
      // Enviar resposta via EvolutionAPI
      await sendWhatsAppMessage(supabase, conversation, aiResponse.response);
      
      // Registrar log da interação
      await supabase
        .from('ai_interaction_logs')
        .insert({
          agent_id: agent.id,
          conversation_id: conversation.id,
          user_message: message.message?.conversation || '',
          ai_response: aiResponse.response,
          tokens_used: aiResponse.tokensUsed,
          response_time_ms: aiResponse.responseTime,
          model_used: agent.model
        });
    }

  } catch (error) {
    console.error('Erro ao processar resposta IA:', error);
  }
}

async function sendWhatsAppMessage(supabase: any, conversation: any, message: string) {
  try {
    // Buscar configuração da EvolutionAPI
    const { data: config } = await supabase
      .from('evolution_api_configs')
      .select('*')
      .eq('id', conversation.evolution_config_id)
      .single();
    
    if (!config) return;

    // Enviar mensagem via EvolutionAPI
    const response = await fetch(`${config.api_url}/message/sendText/${config.instance_name}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': config.api_key
      },
      body: JSON.stringify({
        number: conversation.contact_number,
        text: message
      })
    });

    if (response.ok) {
      // Salvar mensagem enviada
      await supabase
        .from('whatsapp_messages')
        .insert({
          conversation_id: conversation.id,
          message_id: `ai_${Date.now()}`,
          content: message,
          sender_type: 'agent',
          is_from_me: true,
          ai_response_generated: true
        });
    }

  } catch (error) {
    console.error('Erro ao enviar mensagem WhatsApp:', error);
  }
}
