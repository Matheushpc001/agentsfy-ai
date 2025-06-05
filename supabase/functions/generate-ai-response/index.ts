
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      agentId,
      userMessage,
      previousMessages,
      systemPrompt,
      model,
      openaiApiKey
    } = await req.json();

    if (!openaiApiKey) {
      throw new Error('Chave da OpenAI não configurada para este agente');
    }

    console.log('Gerando resposta IA para agente:', agentId);

    // Construir histórico de mensagens para contexto
    const messages = [];
    
    // Adicionar prompt do sistema
    if (systemPrompt) {
      messages.push({
        role: 'system',
        content: systemPrompt
      });
    } else {
      messages.push({
        role: 'system',
        content: 'Você é um assistente útil de atendimento ao cliente via WhatsApp. Seja cordial, prestativo e responda de forma clara e objetiva.'
      });
    }

    // Adicionar mensagens anteriores para contexto (limitado aos últimos 10)
    if (previousMessages && previousMessages.length > 0) {
      const contextMessages = previousMessages
        .slice(0, 10)
        .reverse()
        .map((msg: any) => ({
          role: msg.sender_type === 'user' ? 'user' : 'assistant',
          content: msg.content
        }));
      
      messages.push(...contextMessages);
    }

    // Adicionar mensagem atual do usuário
    messages.push({
      role: 'user',
      content: userMessage
    });

    const startTime = Date.now();

    // Chamar OpenAI API
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model || 'gpt-4o-mini',
        messages: messages,
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!openAIResponse.ok) {
      const errorData = await openAIResponse.text();
      console.error('Erro da OpenAI:', errorData);
      throw new Error(`OpenAI API Error: ${openAIResponse.status} - ${errorData}`);
    }

    const openAIData = await openAIResponse.json();
    const responseTime = Date.now() - startTime;

    const aiResponse = openAIData.choices[0]?.message?.content;
    const tokensUsed = openAIData.usage?.total_tokens || 0;

    if (!aiResponse) {
      throw new Error('Resposta da IA não disponível');
    }

    console.log('Resposta gerada em', responseTime, 'ms, tokens:', tokensUsed);

    return new Response(JSON.stringify({
      response: aiResponse,
      tokensUsed,
      responseTime,
      model: model || 'gpt-4o-mini'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Erro ao gerar resposta IA:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: error.stack 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
