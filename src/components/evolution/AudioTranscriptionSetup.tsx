import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { RefreshCw, Mic, Key } from 'lucide-react';

interface AudioTranscriptionSetupProps {
  instanceName: string;
  onSuccess: () => void;
}

export default function AudioTranscriptionSetup({ instanceName, onSuccess }: AudioTranscriptionSetupProps) {
  const [openaiApiKey, setOpenaiApiKey] = useState('');
  const [enableTranscription, setEnableTranscription] = useState(true);
  const [isConfiguring, setIsConfiguring] = useState(false);

  const handleConfigureTranscription = async () => {
    if (!openaiApiKey.startsWith('sk-')) {
      toast.error('Por favor, insira uma chave OpenAI válida (deve começar com sk-)');
      return;
    }

    setIsConfiguring(true);
    const loadingToast = toast.loading('Configurando transcrição de áudio...');

    try {
      console.log(`🎤 Configurando transcrição para instância: ${instanceName}`);
      
      const { data, error } = await supabase.functions.invoke('evolution-api-manager', {
        body: {
          action: 'configure_speech_to_text',
          instanceName,
          openaiApiKey,
          enableSpeechToText: enableTranscription
        }
      });

      if (error) {
        console.error('❌ Erro na função configure_speech_to_text:', error);
        throw new Error(error.message || 'Erro desconhecido');
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Falha na configuração');
      }

      toast.dismiss(loadingToast);
      toast.success('✅ Transcrição de áudio configurada com sucesso!');
      
      console.log('✅ Configuração concluída:', data);
      onSuccess();
      
    } catch (error: any) {
      toast.dismiss(loadingToast);
      console.error('❌ Erro ao configurar transcrição:', error);
      toast.error(`Erro: ${error.message}`);
    } finally {
      setIsConfiguring(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mic className="h-5 w-5" />
          Configurar Transcrição de Áudio
        </CardTitle>
        <CardDescription>
          Configure a transcrição automática de mensagens de áudio do WhatsApp usando OpenAI Whisper
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="openai-key" className="flex items-center gap-2">
            <Key className="h-4 w-4" />
            Chave da API OpenAI
          </Label>
          <Input
            id="openai-key"
            type="password"
            placeholder="sk-..."
            value={openaiApiKey}
            onChange={(e) => setOpenaiApiKey(e.target.value)}
            disabled={isConfiguring}
          />
          <p className="text-sm text-muted-foreground">
            Necessária para usar o Whisper API para transcrição de áudio
          </p>
        </div>

        <div className="flex items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <Label className="text-base">Habilitar Transcrição</Label>
            <p className="text-sm text-muted-foreground">
              Transcrever automaticamente mensagens de áudio recebidas
            </p>
          </div>
          <Switch
            checked={enableTranscription}
            onCheckedChange={setEnableTranscription}
            disabled={isConfiguring}
          />
        </div>

        <div className="bg-muted/50 p-3 rounded-lg">
          <h4 className="font-medium mb-2">Como funciona:</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>1. Mensagens de áudio são automaticamente transcritas</li>
            <li>2. O texto transcrito é processado pelo agente IA</li>
            <li>3. O agente responde baseado no conteúdo do áudio</li>
            <li>4. Fallback automático caso a Evolution API falhe</li>
          </ul>
        </div>

        <Button 
          onClick={handleConfigureTranscription}
          disabled={isConfiguring || !openaiApiKey}
          className="w-full"
        >
          {isConfiguring && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
          {isConfiguring ? 'Configurando...' : 'Configurar Transcrição'}
        </Button>
      </CardContent>
    </Card>
  );
}