// ARQUIVO CORRIGIDO E FINAL v2: src/components/evolution/AIAgentSetup.tsx

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useEvolutionAPI } from "@/hooks/useEvolutionAPI";
import { toast } from "sonner";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { RefreshCw } from "lucide-react";
import { Agent } from "@/types";

// Schema com API Key opcional para validação flexível
const agentSchema = z.object({
  agent_id: z.string().uuid({ message: "Selecione um agente válido." }),
  evolution_config_id: z.string().uuid({ message: "Selecione uma instância do WhatsApp." }),
  openai_api_key: z.string().optional(),
  system_prompt: z.string().min(10, { message: "O prompt deve ter pelo menos 10 caracteres." }),
  speechToText: z.boolean().default(true),
  // Campos auxiliares
  phone_number: z.string().optional(),
  model: z.string().default('gpt-4o-mini'),
  auto_response: z.boolean().default(true),
  is_active: z.boolean().default(true),
});

type AgentFormValues = z.infer<typeof agentSchema>;

interface AIAgentSetupProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  existingAgent?: any | null;
  franchiseeId: string;
}

export default function AIAgentSetup({ isOpen, onClose, onSave, existingAgent, franchiseeId }: AIAgentSetupProps) {
  const { configs: evolutionConfigs, agents: traditionalAgents, isLoading } = useEvolutionAPI(franchiseeId);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTraditionalAgent, setSelectedTraditionalAgent] = useState<Agent | null>(null);

  const form = useForm<AgentFormValues>({
    resolver: zodResolver(agentSchema),
    defaultValues: {
      agent_id: '',
      evolution_config_id: '',
      openai_api_key: '',
      system_prompt: 'Você é um assistente virtual profissional.',
      speechToText: true,
    }
  });

  const selectedAgentId = form.watch('agent_id');

  // Lógica de preenchimento automático, agora CORRIGIDA
  useEffect(() => {
    if (selectedAgentId && traditionalAgents.length > 0) {
      const agent = traditionalAgents.find(a => a.id === selectedAgentId);
      if (agent) {
        setSelectedTraditionalAgent(agent);
        form.setValue('system_prompt', agent.prompt);
        
        // ### A CORREÇÃO ESTÁ AQUI ###
        // Se o agente JÁ TEM uma chave, limpamos o campo do formulário para evitar
        // que um valor antigo (digitado anteriormente) permaneça no estado.
        if (agent.openAiKey) {
          form.setValue('openai_api_key', ''); // Limpa o valor do formulário
        }
      }
    } else {
      setSelectedTraditionalAgent(null);
    }
  }, [selectedAgentId, traditionalAgents, form]);

  // Lógica de `onSubmit` robusta
  const onSubmit = async (values: AgentFormValues) => {
    setIsSubmitting(true);
    const toastId = toast.loading("Configurando agente IA...");

    try {
      // Validação final da API Key
      const apiKey = selectedTraditionalAgent?.openAiKey || values.openai_api_key;
      if (!apiKey || !apiKey.startsWith('sk-')) {
        throw new Error("Chave da API OpenAI não encontrada ou inválida. Verifique o cadastro do agente ou digite-a no campo.");
      }

      const instance = evolutionConfigs.find(c => c.id === values.evolution_config_id);
      if (!instance) throw new Error("Instância selecionada não encontrada.");
      const instanceName = instance.instance_name;

      // ---- Fluxo de 3 passos para a Evolution API ----
      toast.loading("Passo 1 de 3: Configurando credenciais...", { id: toastId });
      const { data: credsData, error: credsError } = await supabase.functions.invoke('evolution-api-manager', {
        body: { action: 'openai_set_creds', instanceName, credsName: `creds-${instanceName}`, apiKey: apiKey },
      });
      if (credsError || !credsData?.id) throw new Error(credsError?.message || 'Falha ao configurar credenciais.');
      const openAICredsId = credsData.id;
      
      toast.loading("Passo 2 de 3: Criando bot...", { id: toastId });
      await supabase.functions.invoke('evolution-api-manager', {
        body: {
          action: 'openai_create_bot', instanceName,
          botConfig: { enabled: true, openaiCredsId, botType: 'chatCompletion', model: 'gpt-4o-mini', systemMessages: [values.system_prompt], triggerType: 'all' },
        },
      }).then(({ error }) => { if (error) throw error; });

      toast.loading("Passo 3 de 3: Ativando transcrição...", { id: toastId });
      await supabase.functions.invoke('evolution-api-manager', {
        body: { action: 'openai_set_defaults', instanceName, settings: { openaiCredsId, speechToText: values.speechToText } },
      }).then(({ error }) => { if (error) throw error; });
      // ---- Fim do fluxo ----

      // Salva a associação no banco de dados
      const payloadToSave = {
        agent_id: values.agent_id,
        evolution_config_id: values.evolution_config_id,
        phone_number: instance.instance_name,
        openai_api_key: apiKey,
        model: 'gpt-4o-mini',
        system_prompt: values.system_prompt,
        auto_response: true,
        is_active: true,
      };

      if (existingAgent) {
        await supabase.from('ai_whatsapp_agents').update(payloadToSave).eq('id', existingAgent.id).throwOnError();
        toast.success("Agente IA atualizado com sucesso!");
      } else {
        await supabase.from('ai_whatsapp_agents').insert(payloadToSave).throwOnError();
        toast.success("Agente IA criado e configurado com sucesso!");
      }

      toast.dismiss(toastId);
      onSave();
      onClose();

    } catch (error: any) {
      toast.dismiss(toastId);
      toast.error(`Erro: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{existingAgent ? 'Editar' : 'Criar'} Agente IA para Evolution</DialogTitle>
          <DialogDescription>Vincule um agente a uma instância do WhatsApp e configure o comportamento da IA.</DialogDescription>
        </DialogHeader>
        {isLoading ? (
          <div className="flex justify-center p-8"><RefreshCw className="h-6 w-6 animate-spin" /></div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="agent_id" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Agente do Sistema</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Selecione o agente" /></SelectTrigger></FormControl>
                        <SelectContent>{traditionalAgents?.map(agent => (<SelectItem key={agent.id} value={agent.id}>{agent.name}</SelectItem>))}</SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                )}/>
                <FormField control={form.control} name="evolution_config_id" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Instância do WhatsApp</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Selecione a instância conectada" /></SelectTrigger></FormControl>
                        <SelectContent>{evolutionConfigs?.filter(c => c.status === 'connected').map(config => (<SelectItem key={config.id} value={config.id}>{config.instance_name}</SelectItem>))}</SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                )}/>
              </div>
              
              {!selectedTraditionalAgent?.openAiKey && (
                <FormField control={form.control} name="openai_api_key" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Chave da API OpenAI</FormLabel>
                    <FormControl><Input type="password" placeholder="sk-..." {...field} /></FormControl>
                    <FormMessage />
                    <p className="text-xs text-muted-foreground">Esta chave não foi encontrada no Agente do Sistema selecionado. Por favor, insira-a aqui.</p>
                  </FormItem>
                )}/>
              )}

              <FormField control={form.control} name="system_prompt" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Personalidade (System Prompt)</FormLabel>
                    <FormControl><Textarea placeholder="Você é um assistente virtual..." {...field} rows={5} /></FormControl>
                    <FormMessage />
                  </FormItem>
              )}/>
              
              <FormField control={form.control} name="speechToText" render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Habilitar Transcrição de Áudio</FormLabel>
                      <p className="text-sm text-muted-foreground">Permitir que a IA transcreva áudios recebidos.</p>
                    </div>
                    <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                  </FormItem>
              )}/>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
                  {existingAgent ? "Salvar Alterações" : "Criar e Ativar IA"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}