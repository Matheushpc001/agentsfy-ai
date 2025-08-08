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
  
  console.log(`🎤 Iniciando transcrição para a URL: ${audioUrl}`);
  console.log(`📋 Mimetype recebido: ${mimetype}`);

  try {
    // 1. Baixar o arquivo de áudio
    const audioResponse = await fetch(audioUrl);
    if (!audioResponse.ok) {
      throw new Error(`Falha ao baixar o áudio: ${audioResponse.status} ${audioResponse.statusText}`);
    }
    
    const audioBlob = new Blob([await audioResponse.arrayBuffer()]);
    console.log(`📦 Áudio baixado. Tamanho: ${audioBlob.size} bytes`);

    if (audioBlob.size === 0) {
      throw new Error("O arquivo de áudio baixado está vazio.");
    }

    // 2. Determinar a extensão correta do arquivo
    // WhatsApp envia audio/ogg; codecs=opus. Whisper aceita .ogg.
    let extension = 'ogg'; 
    if (mimetype) {
      if (mimetype.includes('mp4a') || mimetype.includes('mp4')) extension = 'm4a';
      else if (mimetype.includes('mpeg') || mimetype.includes('mp3')) extension = 'mp3';
      else if (mimetype.includes('webm')) extension = 'webm';
      else if (mimetype.includes('wav')) extension = 'wav';
    }
    const fileName = `audio.${extension}`;
    console.log(`📝 Arquivo preparado: ${fileName}`);

    // 3. Criar o FormData
    const formData = new FormData();
    formData.append('file', audioBlob, fileName);
    formData.append('model', 'whisper-1');
    formData.append('response_format', 'text');
    formData.append('language', 'pt'); // Forçar português para maior precisão

    // 4. Chamar a API Whisper
    console.log('🚀 Enviando para a API Whisper...');
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
    console.log(`✅ Transcrição concluída: "${transcribedText.substring(0, 100)}..."`);
    
    return transcribedText.trim();
    
  } catch (error) {
    console.error('❌ Erro detalhado durante a transcrição:', error);
    throw error;
  }
}

// Função para gerar resposta de texto (mantida como estava)
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

// Servidor principal
serve(async (req) => {
  // CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload = await req.json();
    const { action, openaiApiKey, ...params } = payload;
    
    console.log(`📋 Ação recebida: ${action}`);
    
    if (!openaiApiKey || !openaiApiKey.startsWith('sk-')) {
      throw new Error('Chave da API OpenAI inválida ou não fornecida.');
    }

    let responseData;
    
    switch (action) {
      case 'transcribe':
        const transcribedText = await handleTranscribe(
          openaiApiKey, 
          params.audioUrl, 
          params.mimetype
        );
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
    console.error('❌ Erro na função openai-handler:', error);
    
    // Resposta de erro mais detalhada
    const errorResponse = {
      error: error.message,
      details: error.stack,
      timestamp: new Date().toISOString()
    };
    
    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});