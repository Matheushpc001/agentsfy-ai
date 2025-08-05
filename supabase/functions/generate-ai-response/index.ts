// ARQUIVO: supabase/functions/generate-ai-response/index.ts

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
      previousMessages, // Array de { role: 'user'|'assistant', content: '...' }
      systemPrompt,
      model,
      openaiApiKey,
    } = await req.json();

    if (!openaiApiKey || !openaiApiKey.startsWith('sk-')) {
      throw new Error('Chave da API OpenAI inválida ou não configurada para este agente.');
    }

    console.log(`🤖 Gerando resposta de IA para o agente: ${agentId}`);
    console.log(`🗣️ Usando o modelo: ${model || 'gpt-4o-mini'}`);

    const messages = [];
    
    // 1. Adicionar o prompt do sistema
    messages.push({
      role: 'system',
      content: systemPrompt || 'Você é um assistente prestativo.'
    });

    // 2. Adicionar mensagens anteriores para contexto (se houver)
    if (previousMessages && previousMessages.length > 0) {
      // O Supabase retorna sender_type, então precisamos mapear para role
      const contextMessages = previousMessages
        .slice(-10) // Pega as últimas 10 mensagens
        .map((msg: any) => ({
          role: msg.sender_type === 'agent' ? 'assistant' : 'user',
          content: msg.content
        }));
      messages.push(...contextMessages);
    }

    // 3. Adicionar a mensagem atual do usuário
    messages.push({
      role: 'user',
      content: userMessage
    });

    console.log('📦 Payload final enviado para OpenAI:', JSON.stringify(messages, null, 2));

    const startTime = Date.now();

    // Chamar a API da OpenAI
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
      console.error('❌ Erro da API OpenAI:', errorData);
      throw new Error(`Erro da API OpenAI: ${openAIResponse.status} - ${errorData}`);
    }

    const openAIData = await openAIResponse.json();
    const responseTime = Date.now() - startTime;

    const aiResponseContent = openAIData.choices[0]?.message?.content;

    if (!aiResponseContent) {
      throw new Error('A API da OpenAI não retornou uma resposta.');
    }

    console.log(`✅ Resposta da IA gerada em ${responseTime}ms`);

    // Retorna a resposta gerada em um JSON
    return new Response(JSON.stringify({
      aiResponse: aiResponseContent,
      tokensUsed: openAIData.usage?.total_tokens || 0,
      modelUsed: model || 'gpt-4o-mini'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('❌ Erro ao gerar resposta de IA:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: error.stack 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
