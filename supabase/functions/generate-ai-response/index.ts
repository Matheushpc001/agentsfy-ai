
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
    const { agentId, userMessage, previousMessages, systemPrompt, model, openaiApiKey } = await req.json();

    if (!openaiApiKey) {
      throw new Error('OpenAI API Key não configurada');
    }

    const startTime = Date.now();

    // Construir contexto da conversa
    const messages = [
      { role: 'system', content: systemPrompt }
    ];

    // Adicionar mensagens anteriores (invertidas para ordem cronológica)
    if (previousMessages && previousMessages.length > 0) {
      previousMessages.reverse().forEach((msg: any) => {
        messages.push({
          role: msg.sender_type === 'user' ? 'user' : 'assistant',
          content: msg.content
        });
      });
    }

    // Adicionar mensagem atual do usuário
    messages.push({ role: 'user', content: userMessage });

    // Chamar OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model || 'gpt-4o-mini',
        messages: messages,
        max_tokens: 1000,
        temperature: 0.7
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OpenAI API Error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;
    const tokensUsed = data.usage?.total_tokens || 0;
    const responseTime = Date.now() - startTime;

    return new Response(JSON.stringify({
      response: aiResponse,
      tokensUsed,
      responseTime,
      agentId
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Erro ao gerar resposta IA:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: 'Falha ao gerar resposta do assistente IA'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
