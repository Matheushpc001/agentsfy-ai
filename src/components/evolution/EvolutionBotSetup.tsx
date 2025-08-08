// ARQUIVO FINAL: src/components/evolution/EvolutionBotSetup.tsx

import { useState, useEffect } from 'react';
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

const botSchema = z.object({
  apiKey: z.string().startsWith('sk-', { message: "Chave da OpenAI inválida." }),
  systemPrompt: z.string().min(10, { message: "Prompt muito curto." }),
  speechToText: z.boolean().default(false),
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
    defaultValues: { apiKey: '', systemPrompt: '', speechToText: false },
  });

  const onSubmit = async (values: BotFormValues) => {
    setIsSubmitting(true);
    const loadingToast = toast.loading("Atualizando configuração de IA na Evolution API...");

    try {
      const { data: credsData, error: credsError } = await supabase.functions.invoke('evolution-api-manager', {
        body: { action: 'openai_set_creds', instanceName, credsName: `creds-${instanceName}`, apiKey: values.apiKey },
      });
      if (credsError) throw new Error(`Erro ao salvar credenciais: ${credsError.message}`);
      const openAICredsId = credsData.id;

      const { error: botError } = await supabase.functions.invoke('evolution-api-manager', {
        body: {
          action: 'openai_create_bot', instanceName,
          botConfig: {
            enabled: true, openaiCredsId, botType: 'chatCompletion', model: 'gpt-4o-mini',
            systemMessages: [values.systemPrompt], triggerType: 'all',
          },
        },
      });
      if (botError) throw new Error(`Erro ao criar bot: ${botError.message}`);

      const { error: settingsError } = await supabase.functions.invoke('evolution-api-manager', {
        body: { action: 'openai_set_defaults', instanceName, settings: { openaiCredsId, speechToText: values.speechToText } },
      });
      if (settingsError) throw new Error(`Erro ao habilitar speech-to-text: ${settingsError.message}`);

      toast.dismiss(loadingToast);
      toast.success("Configuração de IA atualizada com sucesso!");
      onSave();

    } catch (error: any) {
      toast.dismiss(loadingToast);
      toast.error(`Falha na atualização: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Editar IA Nativa da Evolution</CardTitle>
        <CardDescription>
          Altere a configuração de IA para a instância <span className="font-bold">{instanceName}</span>. 
          As novas informações irão sobrescrever as existentes.
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
                  <FormLabel>Chave da API OpenAI</FormLabel>
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
                  <FormLabel>Personalidade (System Prompt)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Você é um assistente virtual..." {...field} rows={5} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="speechToText"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Habilitar Transcrição de Áudio</FormLabel>
                    <p className="text-sm text-muted-foreground">
                      Permitir que a Evolution API transcreva áudios recebidos.
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
                Salvar Alterações
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}