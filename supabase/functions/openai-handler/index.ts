// Versão 1.3 - Melhorias na transcrição de áudio WhatsApp com retry e validações
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Função para validar chave OpenAI
const validateOpenAIKey = (apiKey: string): boolean => {
  return apiKey.startsWith('sk-') && apiKey.length > 20;
};

// Função para detectar formato de áudio
const detectAudioFormat = (mimetype: string, header: string): { extension: string, finalMimetype: string } => {
  const formats = {
    'mp3': { mimes: ['audio/mp3', 'audio/mpeg'], headers: ['494433', 'fffb'], mimetype: 'audio/mpeg' },
    'wav': { mimes: ['audio/wav'], headers: ['52494646'], mimetype: 'audio/wav' },
    'ogg': { mimes: ['audio/ogg'], headers: ['4f676753'], mimetype: 'audio/ogg' },
    'm4a': { mimes: ['audio/mp4', 'audio/m4a'], headers: ['667479704d34'], mimetype: 'audio/mp4' },
    'webm': { mimes: ['audio/webm'], headers: ['1a45dfa3'], mimetype: 'audio/webm' }
  };
  
  for (const [format, config] of Object.entries(formats)) {
    if (config.mimes.some(mime => mimetype?.includes(mime)) ||
        config.headers.some(h => header.startsWith(h))) {
      return { extension: format, finalMimetype: config.mimetype };
    }
  }
  return { extension: 'ogg', finalMimetype: 'audio/ogg' }; // default
};

// Função de retry para transcrição
const transcribeWithRetry = async (transcribeFunction: () => Promise<string>, maxRetries = 3): Promise<string> => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const result = await transcribeFunction();
      return result;
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      console.log(`🔄 Tentativa ${i + 1} falhou, tentando novamente em ${1000 * (i + 1)}ms...`);
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
  throw new Error('Todas as tentativas de transcrição falharam');
};

// Função aprimorada para transcrever áudio com melhor detecção de formato
async function handleTranscribe(openaiApiKey: string, audioUrl: string, mimetype: string, fetchHeaders?: Record<string, string>) {
  if (!openaiApiKey) throw new Error("Chave da API OpenAI não fornecida.");
  if (!validateOpenAIKey(openaiApiKey)) {
    throw new Error('Chave OpenAI inválida. Deve começar com sk- e ter pelo menos 20 caracteres');
  }
  if (!audioUrl) throw new Error("URL do áudio não fornecida.");
  
  console.log(`🎤 Iniciando transcrição para: ${audioUrl}`);
  console.log(`📱 Mimetype recebido: ${mimetype}`);
  
  // Download do áudio com timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout
  
  try {
    // Headers melhorados com mais opções de autenticação
    const baseHeaders: Record<string, string> = {
      'User-Agent': 'Mozilla/5.0 (compatible; AudioBot/1.0)',
      'Accept': 'audio/*,*/*'
    };
    
    const enhancedHeaders = fetchHeaders ? {
      ...baseHeaders,
      ...fetchHeaders,
      'Content-Type': fetchHeaders['Content-Type'] || 'application/json',
      'Authorization': fetchHeaders['Authorization'] || `Bearer ${openaiApiKey}`
    } : baseHeaders;
    
    const mergedHeaders = enhancedHeaders;
    console.log(`🌐 Baixando áudio com headers: ${Object.keys(mergedHeaders).join(', ') || 'nenhum'}`);    
    console.log(`🔍 DEBUG INFO: Download de áudio`, {
      audioUrl: audioUrl.substring(0, 100) + '...',
      originalMimetype: mimetype,
      hasCustomHeaders: !!fetchHeaders,
      headersCount: Object.keys(mergedHeaders).length
    });
    const audioResponse = await fetch(audioUrl, { 
      signal: controller.signal,
      headers: mergedHeaders
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

      // Detecção inteligente do formato do áudio usando função melhorada
    const firstBytes = new Uint8Array(audioArrayBuffer.slice(0, 12));
    const header = Array.from(firstBytes).map(b => b.toString(16).padStart(2, '0')).join('');
    
    const { extension, finalMimetype } = detectAudioFormat(mimetype || '', header);
    
    console.log(`🔍 DEBUG INFO: Detecção de formato`, {
      originalMimetype: mimetype,
      detectedExtension: extension,
      finalMimetype: finalMimetype,
      headerBytes: header.substring(0, 24),
      fileSize: audioArrayBuffer.byteLength
    });
    
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

// Nova função para transcrever a partir de bytes/base64 (evita download de URL criptografada)
async function handleTranscribeBase64(openaiApiKey: string, fileBase64: string, mimetype?: string, filename?: string) {
  if (!openaiApiKey) throw new Error("Chave da API OpenAI não fornecida.");
  if (!validateOpenAIKey(openaiApiKey)) {
    throw new Error('Chave OpenAI inválida. Deve começar com sk- e ter pelo menos 20 caracteres');
  }
  if (!fileBase64) throw new Error("Conteúdo do áudio (base64) não fornecido.");

  // Remover prefixo data URL se existir
  const cleaned = fileBase64.includes(',') ? fileBase64.split(',').pop()! : fileBase64;
  const binary = atob(cleaned);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);

  if (bytes.byteLength === 0) throw new Error("Arquivo de áudio vazio (base64).");
  if (bytes.byteLength > 25 * 1024 * 1024) throw new Error("Arquivo de áudio muito grande (máximo 25MB).");

  // Detecção inteligente de formato usando função melhorada
  const header = Array.from(bytes.slice(0, 12)).map(b => b.toString(16).padStart(2, '0')).join('');
  const { extension, finalMimetype } = detectAudioFormat(mimetype || '', header);
  
  console.log(`🔍 DEBUG INFO Base64: Detecção de formato`, {
    originalMimetype: mimetype,
    detectedExtension: extension,
    finalMimetype: finalMimetype,
    headerBytes: header.substring(0, 24),
    fileSize: bytes.byteLength
  });

  const formData = new FormData();
  const fileName = filename || `audio_${Date.now()}.${extension}`;
  const audioFile = new File([bytes], fileName, { type: finalMimetype });
  formData.append('file', audioFile);
  formData.append('model', 'whisper-1');
  formData.append('language', 'pt');
  formData.append('response_format', 'text');
  formData.append('temperature', '0');

  console.log(`🔄 Enviando (base64) para Whisper API como ${fileName} (${finalMimetype}) - ${bytes.byteLength} bytes`);
  const transcribeResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${openaiApiKey}` },
    body: formData,
  });

  if (!transcribeResponse.ok) {
    const errorText = await transcribeResponse.text();
    console.error('❌ Erro da API Whisper (base64):', { status: transcribeResponse.status, statusText: transcribeResponse.statusText, error: errorText });
    throw new Error(`Erro API Whisper (${transcribeResponse.status}): ${errorText}`);
  }

  const transcribedText = await transcribeResponse.text();
  const cleanText = transcribedText.trim();
  if (!cleanText) throw new Error('Transcrição (base64) retornou vazia');
  console.log(`✅ Transcrição (base64) concluída: "${cleanText}"`);
  return cleanText;
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

// Nova função para verificar status de transcrição
async function handleCheckTranscriptionStatus(params: any) {
  const { instanceName, globalConfig } = params;
  
  if (!instanceName || !globalConfig) {
    throw new Error('instanceName e globalConfig são obrigatórios para verificar status');
  }
  
  try {
    // Verificar configurações atuais da Evolution API
    const settingsResponse = await fetch(`${globalConfig.api_url}/openai/settings/${instanceName}`, {
      method: 'GET',
      headers: { 'apikey': globalConfig.api_key }
    });
    
    if (!settingsResponse.ok) {
      return {
        speechToTextEnabled: false,
        error: 'Não foi possível verificar configurações',
        status: 'unknown'
      };
    }
    
    const settings = await settingsResponse.json();
    
    return {
      speechToTextEnabled: settings?.speechToText || false,
      settings: settings,
      status: 'verified',
      instanceName: instanceName
    };
    
  } catch (error) {
    console.error('Erro ao verificar status de transcrição:', error);
    return {
      speechToTextEnabled: false,
      error: error.message,
      status: 'error'
    };
  }
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
        responseData = { 
          transcribedText: await transcribeWithRetry(() => 
            handleTranscribe(openaiApiKey, params.audioUrl, params.mimetype, params.fetchHeaders)
          )
        };
        break;
      case 'transcribe_base64':
        responseData = { 
          transcribedText: await transcribeWithRetry(() => 
            handleTranscribeBase64(openaiApiKey, params.fileBase64, params.mimetype, params.filename)
          )
        };
        break;
      case 'generate':
        responseData = await handleGenerate(openaiApiKey, params);
        break;
      case 'check_transcription_status':
        responseData = await handleCheckTranscriptionStatus(params);
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