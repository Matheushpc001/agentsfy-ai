// ARQUIVO: src/components/evolution/AIAgentSetup.tsx

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

// Schema de validação com Zod
const agentSchema = z.object({
  agent_id: z.string().uuid({ message: "Selecione um agente válido." }),
  evolution_config_id: z.string().uuid({ message: "Selecione uma instância do WhatsApp." }),
  phone_number: z.string().min(10, { message: "Número de telefone é obrigatório." }),
  openai_api_key: z.string().refine(val => val.startsWith('sk-'), { message: "Chave da OpenAI deve iniciar com 'sk-'." }),
  model: z.string().default('gpt-4o-mini'),
  system_prompt: z.string().min(10, { message: "O prompt deve ter pelo menos 10 caracteres." }),
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
  const { configs: evolutionConfigs, agents: traditionalAgents } = useEvolutionAPI(franchiseeId);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<AgentFormValues>({
    resolver: zodResolver(agentSchema),
    defaultValues: {
      agent_id: '',
      evolution_config_id: '',
      phone_number: '',
      openai_api_key: '',
      model: 'gpt-4o-mini',
      system_prompt: '',
      auto_response: true,
      is_active: true,
    }
  });

  useEffect(() => {
    if (existingAgent) {
      form.reset({
        agent_id: existingAgent.agent_id,
        evolution_config_id: existingAgent.evolution_config_id,
        phone_number: existingAgent.phone_number,
        openai_api_key: existingAgent.openai_api_key || '',
        model: existingAgent.model || 'gpt-4o-mini',
        system_prompt: existingAgent.system_prompt || '',
        auto_response: existingAgent.auto_response,
        is_active: existingAgent.is_active,
      });
    } else {
      form.reset(); // Reseta para os valores padrão
    }
  }, [existingAgent, form, isOpen]);

  const onSubmit = async (values: AgentFormValues) => {
    setIsSubmitting(true);
    try {
      if (existingAgent) {
        // Atualizar
        const { error } = await supabase
          .from('ai_whatsapp_agents')
          .update(values)
          .eq('id', existingAgent.id);
        if (error) throw error;
        toast.success("Agente IA atualizado com sucesso!");
      } else {
        // Criar
        const { error } = await supabase
          .from('ai_whatsapp_agents')
          .insert(values);
        if (error) throw error;
        toast.success("Agente IA criado com sucesso!");
      }
      onSave();
      onClose();
    } catch (error: any) {
      toast.error(`Erro ao salvar: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{existingAgent ? 'Editar' : 'Criar'} Agente IA</DialogTitle>
          <DialogDescription>
            Configure os detalhes do seu agente de resposta automática.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="agent_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Agente do Sistema</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o agente a ser automatizado" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {traditionalAgents.map(agent => (
                          <SelectItem key={agent.id} value={agent.id}>{agent.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="evolution_config_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Instância do WhatsApp</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a instância conectada" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {evolutionConfigs.filter(c => c.status === 'connected').map(config => (
                          <SelectItem key={config.id} value={config.id}>{config.instance_name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="phone_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Número do WhatsApp</FormLabel>
                  <FormControl>
                    <Input placeholder="5511999998888" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="openai_api_key"
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
              name="system_prompt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Personalidade (System Prompt)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Você é um assistente virtual para..." {...field} rows={5} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex items-center space-x-4">
               <FormField
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormLabel>Agente Ativo</FormLabel>
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="auto_response"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormLabel>Resposta Automática</FormLabel>
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
                Salvar Configurações
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
