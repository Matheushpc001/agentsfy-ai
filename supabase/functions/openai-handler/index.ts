// Versão 1.2 - Correção para transcrição de áudio WhatsApp v1
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Função aprimorada para transcrever áudio
async function handleTranscribe(openaiApiKey: string, audioUrl: string, mimetype: string) {
  if (!audioUrl) throw new Error("URL do áudio não fornecida.");
  
  console.log(`🎤 Iniciando transcrição (Fallback) para: ${audioUrl}`);
  const audioResponse = await fetch(audioUrl);
  if (!audioResponse.ok) throw new Error(`Falha ao baixar áudio: ${audioResponse.statusText}`);
  
  const audioArrayBuffer = await audioResponse.arrayBuffer();
  if (audioArrayBuffer.byteLength === 0) throw new Error("Arquivo de áudio baixado está vazio.");

  let extension = 'ogg';
  let finalMimetype = 'audio/ogg';
  if (mimetype && mimetype.includes('mp4')) { 
      extension = 'm4a'; 
      finalMimetype = 'audio/mp4'; 
  }
  const fileName = `audio.${extension}`;
  console.log(`📝 Arquivo preparado: ${fileName} com mimetype: ${finalMimetype}`);

  const formData = new FormData();
  const audioFile = new File([audioArrayBuffer], fileName, { type: finalMimetype });
  
  formData.append('file', audioFile);
  formData.append('model', 'whisper-1');
  formData.append('language', 'pt');
  formData.append('response_format', 'text');

  const transcribeResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${openaiApiKey}` },
    body: formData,
  });

  if (!transcribeResponse.ok) {
    const errorText = await transcribeResponse.text();
    console.error('❌ Erro da API Whisper:', errorText);
    throw new Error(`Erro API Whisper: ${errorText}`);
  }

  const transcribedText = await transcribeResponse.text();
  return transcribedText.trim();
}

// Função para gerar resposta de texto (mantida como estava)
async function handleGenerate(openaiApiKey: string, payload: any) {
    const { userMessage, previousMessages, systemPrompt, model } = payload;
    const messages = [];
    messages.push({ role: 'system', content: systemPrompt || 'Você é um assistente prestativo.' });
    if (previousMessages?.length > 0) {
      messages.push(...previousMessages.map((msg: any) => ({
        role: msg.sender_type === 'agent' ? 'assistant' : 'user',
        content: msg.content
      })));
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

// Servidor principal
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload = await req.json();
    const { action, openaiApiKey, ...params } = payload;
    
    if (!openaiApiKey) throw new Error('Chave da API OpenAI não fornecida.');

    let responseData;
    switch (action) {
      case 'transcribe':
        responseData = { transcribedText: await handleTranscribe(openaiApiKey, params.audioUrl, params.mimetype) };
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
    console.error('❌ Erro na função openai-handler:', error);
    return new Response(JSON.stringify({ error: error.message, details: error.stack }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});