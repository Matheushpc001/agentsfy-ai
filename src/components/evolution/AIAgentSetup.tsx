// ARQUIVO REFINADO E FINAL: src/components/evolution/AIAgentSetup.tsx

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

// Schema de validação
const agentSchema = z.object({
  agent_id: z.string().uuid({ message: "Selecione um agente válido." }),
  evolution_config_id: z.string().uuid({ message: "Selecione uma instância do WhatsApp." }),
  openai_api_key: z.string().optional(), // A chave é opcional no formulário, pois pode vir do agente
  system_prompt: z.string().min(10, { message: "O prompt deve ter pelo menos 10 caracteres." }),
  speechToText: z.boolean().default(true),
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
    // O defaultValues agora é mais simples
    defaultValues: {
      agent_id: '',
      evolution_config_id: '',
      openai_api_key: '',
      system_prompt: 'Você é um assistente virtual profissional.',
      speechToText: true,
    }
  });
  
  // ==========================================================
  // ### CORREÇÃO PARA O MODO DE EDIÇÃO APLICADA AQUI ###
  // ==========================================================
  // Novo useEffect para popular o formulário QUANDO o modal abre para edição
  useEffect(() => {
    if (isOpen && existingAgent) {
      console.log("📝 Populando formulário para edição com dados do agente:", existingAgent);
      form.reset({
        agent_id: existingAgent.agent_id,
        evolution_config_id: existingAgent.evolution_config_id,
        system_prompt: existingAgent.system_prompt,
        speechToText: existingAgent.auto_response, // Assumindo que speechToText está mapeado aqui
        openai_api_key: '' // Sempre limpo, pois usaremos a chave salva
      });
      // Seta o `selectedTraditionalAgent` para que a lógica da chave funcione
      const agent = traditionalAgents.find(a => a.id === existingAgent.agent_id);
      if(agent) setSelectedTraditionalAgent(agent);

    } else if (isOpen && !existingAgent) {
       // Reseta o formulário se abriu para criação
       form.reset({
          agent_id: '',
          evolution_config_id: '',
          openai_api_key: '',
          system_prompt: 'Você é um assistente virtual profissional.',
          speechToText: true,
       });
       setSelectedTraditionalAgent(null);
    }
  }, [isOpen, existingAgent, traditionalAgents, form]);

  const selectedAgentId = form.watch('agent_id');

  useEffect(() => {
    if (selectedAgentId && traditionalAgents.length > 0) {
      const agent = traditionalAgents.find(a => a.id === selectedAgentId);
      setSelectedTraditionalAgent(agent || null);
      if (agent) {
        form.setValue('system_prompt', agent.prompt);
        // Se o agente já tem uma chave, o campo de input não aparecerá.
        // Se não tem, o campo aparecerá e o usuário deverá preenchê-lo.
      }
    } else {
      setSelectedTraditionalAgent(null);
    }
  }, [selectedAgentId, traditionalAgents, form]);
  
  const onSubmit = async (values: AgentFormValues) => {
    setIsSubmitting(true);
    const toastId = toast.loading("Configurando agente IA...");

    try {
      toast.loading("Validando dados...", { id: toastId });

      // **LÓGICA DE OBTENÇÃO DA CHAVE - PONTO CENTRAL DA CORREÇÃO**
      let finalApiKey: string | undefined;

      if (selectedTraditionalAgent?.openAiKey) {
        console.log("🔑 Usando chave da API do 'Agente do Sistema' pré-cadastrado.");
        finalApiKey = selectedTraditionalAgent.openAiKey;
      } else {
        console.log("🔑 Usando chave da API digitada no formulário.");
        finalApiKey = values.openai_api_key;
      }
      
      if (!finalApiKey || !finalApiKey.startsWith('sk-')) {
        throw new Error("Chave da API OpenAI é inválida. Verifique o cadastro do Agente ou o valor digitado.");
      }

      const instance = evolutionConfigs.find(c => c.id === values.evolution_config_id);
      if (!instance) throw new Error("Instância do WhatsApp selecionada não foi encontrada.");
      const instanceName = instance.instance_name;

      // ... [O restante da lógica de 3 passos permanece a mesma] ...
      
      toast.loading("Passo 1/3: Enviando credenciais...", { id: toastId });
      const { data: credsData, error: credsError } = await supabase.functions.invoke('evolution-api-manager', {
        body: { action: 'openai_set_creds', instanceName, credsName: `creds-${instanceName}`, apiKey: finalApiKey },
      });
      if (credsError) throw credsError;
      const openAICredsId = credsData.id;
      if (!openAICredsId) throw new Error("ID da credencial OpenAI não retornado pela API.");

      toast.loading("Passo 2/3: Criando bot...", { id: toastId });
      const { error: botError } = await supabase.functions.invoke('evolution-api-manager', {
        body: {
          action: 'openai_create_bot', instanceName,
          botConfig: { enabled: true, openaiCredsId, botType: 'chatCompletion', model: 'gpt-4o-mini', systemMessages: [values.system_prompt], triggerType: 'all' },
        },
      });
      if (botError) throw botError;

      toast.loading("Passo 3/3: Ativando transcrição...", { id: toastId });
      const { error: settingsError } = await supabase.functions.invoke('evolution-api-manager', {
        body: { action: 'openai_set_defaults', instanceName, settings: { openaiCredsId, speechToText: values.speechToText } },
      });
      if (settingsError) throw settingsError;

      toast.loading("Finalizando e salvando...", { id: toastId });
      const payloadToSave = {
        agent_id: values.agent_id,
        evolution_config_id: values.evolution_config_id,
        phone_number: instanceName,
        openai_api_key: finalApiKey,
        model: 'gpt-4o-mini',
        system_prompt: values.system_prompt,
        auto_response: true,
        is_active: true,
      };

      const { error: dbError } = existingAgent 
        ? await supabase.from('ai_whatsapp_agents').update(payloadToSave).eq('id', existingAgent.id)
        : await supabase.from('ai_whatsapp_agents').insert(payloadToSave);

      if (dbError) throw dbError;

      toast.success(existingAgent ? "Agente IA atualizado com sucesso!" : "Agente IA criado com sucesso!", { id: toastId });
      onSave();
      onClose();

    } catch (error: any) {
      toast.error(`Erro: ${error.message}`, { id: toastId });
      console.error("Detalhes do erro na submissão:", error);
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
              {/* ... [Restante do formulário como estava, o campo condicional está correto] ... */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="agent_id" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Agente do Sistema</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value} disabled={!!existingAgent}>
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

              {/* **CAMPO CONDICIONAL CORRETO** */}
              {selectedTraditionalAgent && !selectedTraditionalAgent.openAiKey && (
                <FormField control={form.control} name="openai_api_key" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Chave da API OpenAI</FormLabel>
                    <FormControl><Input type="password" placeholder="sk-..." {...field} /></FormControl>
                    <FormMessage />
                    <p className="text-xs text-muted-foreground">
                      Esta chave não foi encontrada no Agente do Sistema selecionado. Por favor, insira-a aqui.
                    </p>
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
