// ARQUIVO MODIFICADO: src/components/evolution/EvolutionBotSetup.tsx

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { RefreshCw } from 'lucide-react';

// ### MODIFICAÇÃO 1: ADICIONAR speechToText AO SCHEMA DE VALIDAÇÃO ###
const botSchema = z.object({
  apiKey: z.string().startsWith('sk-', { message: "A chave da OpenAI deve começar com 'sk-'." }),
  systemPrompt: z.string().min(10, { message: "O prompt do sistema é muito curto." }),
  speechToText: z.boolean().default(false), // Adicionado para controlar a transcrição
});

type BotFormValues = z.infer<typeof botSchema>;

interface EvolutionBotSetupProps {
  instanceName: string;
  onSave: () => void;
}

export default function EvolutionBotSetup({ instanceName, onSave }: EvolutionBotSetupProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<BotFormValues>({
    resolver: zodResolver(botSchema),
    defaultValues: { 
      apiKey: '', 
      systemPrompt: 'Você é um assistente virtual prestativo e profissional.', 
      speechToText: true // Padrão para true para melhor experiência
    },
  });

  // ### MODIFICAÇÃO 2: ATUALIZAR A LÓGICA DE SUBMISSÃO ###
  const onSubmit = async (values: BotFormValues) => {
    setIsSubmitting(true);
    const loadingToast = toast.loading("Configurando IA na Evolution API...");

    try {
      // Passo 1: Configurar as credenciais e obter o ID
      console.log('Passo 1: Configurando credenciais...');
      const { data: credsData, error: credsError } = await supabase.functions.invoke('evolution-api-manager', {
        body: {
          action: 'openai_set_creds',
          instanceName,
          credsName: `creds-${instanceName}`,
          apiKey: values.apiKey,
        },
      });

      if (credsError) throw new Error(`Erro ao salvar credenciais: ${credsError.message}`);
      if (!credsData?.id) throw new Error('A API não retornou um ID para as credenciais.');
      
      const openAICredsId = credsData.id;
      console.log(`✅ Credenciais salvas com ID: ${openAICredsId}`);
      toast.dismiss(loadingToast);
      toast.loading("Passo 2 de 3: Criando bot...");

      // Passo 2: Criar o "Bot" de resposta automática
      console.log('Passo 2: Criando o bot...');
      const { error: botError } = await supabase.functions.invoke('evolution-api-manager', {
        body: {
          action: 'openai_create_bot',
          instanceName,
          botConfig: {
            enabled: true,
            openaiCredsId, // Usar o ID obtido no passo 1
            botType: 'chatCompletion',
            model: 'gpt-4o-mini',
            systemMessages: [values.systemPrompt],
            triggerType: 'all', // Ativar para todas as mensagens
          },
        },
      });
      if (botError) throw new Error(`Erro ao criar bot: ${botError.message}`);
      
      console.log('✅ Bot criado com sucesso.');
      toast.dismiss(loadingToast);
      toast.loading("Passo 3 de 3: Ativando transcrição de áudio...");

      // Passo 3: Habilitar a transcrição de áudio (speech-to-text)
      console.log(`Passo 3: Configurando speechToText=${values.speechToText}`);
      const { error: settingsError } = await supabase.functions.invoke('evolution-api-manager', {
        body: {
          action: 'openai_set_defaults',
          instanceName,
          settings: {
            openaiCredsId, // Usar o ID obtido no passo 1
            speechToText: values.speechToText, // Usar o valor do formulário
          },
        },
      });
      if (settingsError) throw new Error(`Erro ao habilitar speech-to-text: ${settingsError.message}`);

      console.log('✅ Configurações padrão salvas.');
      toast.dismiss(loadingToast);
      toast.success("Agente IA configurado com sucesso na Evolution API!");
      onSave();

    } catch (error: any) {
      toast.dismiss(loadingToast);
      toast.error(`Falha na configuração: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Configurar IA Nativa da Evolution</CardTitle>
        <CardDescription>
          Configure a IA para a instância <span className="font-bold">{instanceName}</span>.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="apiKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Chave da API OpenAI *</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="sk-..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="systemPrompt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Personalidade (System Prompt) *</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Você é um assistente virtual..." {...field} rows={5} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* ### MODIFICAÇÃO 3: ADICIONAR O SWITCH NA INTERFACE ### */}
            <FormField
              control={form.control}
              name="speechToText"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Habilitar Transcrição de Áudio</FormLabel>
                    <p className="text-sm text-muted-foreground">
                      Permite que a Evolution API transcreva áudios recebidos.
                    </p>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />
            <div className="flex justify-end">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
                Salvar e Ativar IA
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}