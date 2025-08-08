// Versão 1.2 - Correção para transcrição de áudio WhatsApp v666
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Função aprimorada para transcrever áudio com melhor detecção de formato
async function handleTranscribe(openaiApiKey: string, audioUrl: string, mimetype: string) {
  if (!openaiApiKey) throw new Error("Chave da API OpenAI não fornecida.");
  if (!audioUrl) throw new Error("URL do áudio não fornecida.");
  
  console.log(`🎤 Iniciando transcrição para: ${audioUrl}`);
  console.log(`📱 Mimetype recebido: ${mimetype}`);
  
  // Download do áudio com timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout
  
  try {
    const audioResponse = await fetch(audioUrl, { 
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; AudioBot/1.0)'
      }
    });
    clearTimeout(timeoutId);
    
    if (!audioResponse.ok) {
      throw new Error(`Falha ao baixar áudio: ${audioResponse.status} ${audioResponse.statusText}`);
    }
    
    const contentLength = audioResponse.headers.get('content-length');
    console.log(`📊 Tamanho do áudio: ${contentLength} bytes`);
    
    const audioArrayBuffer = await audioResponse.arrayBuffer();
    if (audioArrayBuffer.byteLength === 0) {
      throw new Error("Arquivo de áudio baixado está vazio.");
    }
    
    if (audioArrayBuffer.byteLength > 25 * 1024 * 1024) { // 25MB limit
      throw new Error("Arquivo de áudio muito grande (máximo 25MB).");
    }

    // Detecção inteligente do formato do áudio
    let extension = 'ogg';
    let finalMimetype = 'audio/ogg';
    
    if (mimetype) {
      if (mimetype.includes('mp4') || mimetype.includes('m4a')) {
        extension = 'm4a';
        finalMimetype = 'audio/mp4';
      } else if (mimetype.includes('mpeg') || mimetype.includes('mp3')) {
        extension = 'mp3';
        finalMimetype = 'audio/mpeg';
      } else if (mimetype.includes('wav')) {
        extension = 'wav';
        finalMimetype = 'audio/wav';
      } else if (mimetype.includes('webm')) {
        extension = 'webm';
        finalMimetype = 'audio/webm';
      }
    }
    
    // Fallback: detectar pelo magic number (primeiros bytes)
    const firstBytes = new Uint8Array(audioArrayBuffer.slice(0, 12));
    const header = Array.from(firstBytes).map(b => b.toString(16).padStart(2, '0')).join('');
    
    if (header.startsWith('667479704d34')) { // ftypisom
      extension = 'm4a';
      finalMimetype = 'audio/mp4';
    } else if (header.startsWith('494433') || header.startsWith('fffb')) { // ID3 ou MP3
      extension = 'mp3';
      finalMimetype = 'audio/mpeg';
    } else if (header.startsWith('52494646') && header.includes('57415645')) { // RIFF WAVE
      extension = 'wav';
      finalMimetype = 'audio/wav';
    }
    
    const fileName = `audio_${Date.now()}.${extension}`;
    console.log(`📝 Arquivo preparado: ${fileName} (${finalMimetype}) - ${audioArrayBuffer.byteLength} bytes`);

    const formData = new FormData();
    const audioFile = new File([audioArrayBuffer], fileName, { type: finalMimetype });
    
    formData.append('file', audioFile);
    formData.append('model', 'whisper-1');
    formData.append('language', 'pt');
    formData.append('response_format', 'text');
    formData.append('temperature', '0');

    console.log(`🔄 Enviando para Whisper API...`);
    const transcribeResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${openaiApiKey}`,
      },
      body: formData,
    });

    if (!transcribeResponse.ok) {
      const errorText = await transcribeResponse.text();
      console.error('❌ Erro da API Whisper:', {
        status: transcribeResponse.status,
        statusText: transcribeResponse.statusText,
        error: errorText
      });
      throw new Error(`Erro API Whisper (${transcribeResponse.status}): ${errorText}`);
    }

    const transcribedText = await transcribeResponse.text();
    const cleanText = transcribedText.trim();
    
    if (!cleanText || cleanText.length === 0) {
      throw new Error("Transcrição retornou vazia");
    }
    
    console.log(`✅ Transcrição concluída: "${cleanText}"`);
    return cleanText;
    
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error("Timeout ao baixar áudio");
    }
    throw error;
  }
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