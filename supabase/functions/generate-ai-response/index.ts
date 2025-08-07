// ARQUIVO: supabase/functions/generate-ai-response/index.ts
//test
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Nova função para transcrever áudio
async function handleTranscribe(openaiApiKey: string, audioUrl: string) {
  if (!audioUrl) {
    throw new Error("URL do áudio não fornecida.");
  }
  console.log(`🎤 Iniciando transcrição para a URL: ${audioUrl}`);

  // 1. Baixar o arquivo de áudio
  const audioResponse = await fetch(audioUrl);
  if (!audioResponse.ok) {
    throw new Error(`Falha ao baixar o áudio da URL: ${audioResponse.statusText}`);
  }
  const audioBlob = await audioResponse.blob();
  
  // ###############################################################
  // ### CORREÇÃO FINAL: FORÇAR A EXTENSÃO PARA .ogg             ###
  // ###############################################################
  // O WhatsApp geralmente usa o codec Opus em contêineres OGG.
  // Vamos forçar essa extensão, já que a API não nos informa o tipo correto.
  const fileName = 'audio.ogg';
  console.log(`🎤 Arquivo de áudio recebido como blob. Tipo: ${audioBlob.type}, Tamanho: ${audioBlob.size}, Forçando nome de arquivo: ${fileName}`);

  // 2. Criar o FormData para enviar à API Whisper
  const formData = new FormData();
  formData.append('file', audioBlob, fileName); // Usa o nome de arquivo forçado
  formData.append('model', 'whisper-1');
  formData.append('response_format', 'text');

  // 3. Chamar a API de transcrições da OpenAI
  const transcribeResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openaiApiKey}`,
    },
    body: formData,
  });

  if (!transcribeResponse.ok) {
    const errorText = await transcribeResponse.text();
    console.error('❌ Erro da API Whisper:', errorText);
    throw new Error(`Erro na API Whisper: ${transcribeResponse.status} - ${errorText}`);
  }

  const transcribedText = await transcribeResponse.text();
  console.log(`✅ Transcrição concluída: "${transcribedText}"`);
  return transcribedText;
}


// Função para gerar resposta de texto (código que já tínhamos)
async function handleGenerate(openaiApiKey: string, payload: any) {
    const {
      agentId,
      userMessage,
      previousMessages,
      systemPrompt,
      model,
    } = payload;

    console.log(`🤖 Gerando resposta de IA para o agente: ${agentId}`);
    const messages = [];
    messages.push({ role: 'system', content: systemPrompt || 'Você é um assistente prestativo.' });

    if (previousMessages && previousMessages.length > 0) {
      const contextMessages = previousMessages.slice(-10).map((msg: any) => ({
        role: msg.sender_type === 'agent' ? 'assistant' : 'user',
        content: msg.content
      }));
      messages.push(...contextMessages);
    }
    messages.push({ role: 'user', content: userMessage });

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
        throw new Error(`Erro da API OpenAI: ${openAIResponse.status} - ${errorData}`);
    }

    const openAIData = await openAIResponse.json();
    const aiResponseContent = openAIData.choices[0]?.message?.content;
    if (!aiResponseContent) {
        throw new Error('A API da OpenAI não retornou uma resposta.');
    }

    return {
        aiResponse: aiResponseContent,
        tokensUsed: openAIData.usage?.total_tokens || 0,
        modelUsed: model || 'gpt-4o-mini'
    };
}


// Servidor principal da função
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload = await req.json();
    const { action, openaiApiKey, ...params } = payload;
    
    if (!openaiApiKey || !openaiApiKey.startsWith('sk-')) {
      throw new Error('Chave da API OpenAI inválida ou não fornecida.');
    }

    let responseData;
    
    switch (action) {
      case 'transcribe':
        const transcribedText = await handleTranscribe(openaiApiKey, params.audioUrl);
        responseData = { transcribedText };
        break;
      
      case 'generate':
        responseData = await handleGenerate(openaiApiKey, params);
        break;

      default:
        throw new Error(`Ação desconhecida: ${action}`);
    }

    return new Response(JSON.stringify(responseData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('❌ Erro na função generate-ai-response:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
