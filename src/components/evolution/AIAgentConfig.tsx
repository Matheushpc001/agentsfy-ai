
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Bot, MessageSquare, Settings, Trash2 } from 'lucide-react';
import { useEvolutionAPI } from '@/hooks/useEvolutionAPI';
import { toast } from 'sonner';

interface AIAgentConfigProps {
  isOpen: boolean;
  onClose: () => void;
  evolutionConfigId: string;
  instanceName: string;
  aiAgents: any[];
}

export default function AIAgentConfig({ 
  isOpen, 
  onClose, 
  evolutionConfigId, 
  instanceName, 
  aiAgents 
}: AIAgentConfigProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<any>(null);
  const [formData, setFormData] = useState({
    agent_id: '',
    phone_number: '',
    openai_api_key: '',
    model: 'gpt-4o-mini',
    system_prompt: 'Você é um assistente útil e prestativo.',
    is_active: true
  });

  const { createAIAgent, updateAIAgent, sendTestMessage } = useEvolutionAPI('');

  const instanceAgents = aiAgents.filter(agent => agent.evolution_config_id === evolutionConfigId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.agent_id || !formData.phone_number) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      if (selectedAgent) {
        await updateAIAgent(selectedAgent.id, formData);
      } else {
        await createAIAgent({
          ...formData,
          evolution_config_id: evolutionConfigId
        });
      }
      
      resetForm();
    } catch (error) {
      // Error handled in hook
    }
  };

  const resetForm = () => {
    setFormData({
      agent_id: '',
      phone_number: '',
      openai_api_key: '',
      model: 'gpt-4o-mini',
      system_prompt: 'Você é um assistente útil e prestativo.',
      is_active: true
    });
    setSelectedAgent(null);
    setIsCreating(false);
  };

  const handleEdit = (agent: any) => {
    setSelectedAgent(agent);
    setFormData({
      agent_id: agent.agent_id,
      phone_number: agent.phone_number,
      openai_api_key: agent.openai_api_key || '',
      model: agent.model,
      system_prompt: agent.system_prompt || 'Você é um assistente útil e prestativo.',
      is_active: agent.is_active
    });
    setIsCreating(true);
  };

  const handleTestMessage = async (agent: any) => {
    try {
      await sendTestMessage(
        evolutionConfigId,
        agent.phone_number,
        'Mensagem de teste do agente IA. Tudo funcionando!'
      );
    } catch (error) {
      // Error handled in hook
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Agentes IA - {instanceName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {!isCreating ? (
            <>
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Agentes Configurados</h3>
                <Button onClick={() => setIsCreating(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Novo Agente
                </Button>
              </div>

              {instanceAgents.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <Bot className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">
                      Nenhum agente IA configurado ainda.
                    </p>
                    <Button onClick={() => setIsCreating(true)} className="mt-4">
                      Criar Primeiro Agente
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {instanceAgents.map((agent) => (
                    <Card key={agent.id}>
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <CardTitle className="text-base">
                              Agente {agent.agent_id}
                            </CardTitle>
                            <Badge variant={agent.is_active ? 'default' : 'secondary'}>
                              {agent.is_active ? 'Ativo' : 'Inativo'}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleTestMessage(agent)}
                              disabled={!agent.is_active}
                            >
                              <MessageSquare className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(agent)}
                            >
                              <Settings className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="text-sm text-muted-foreground space-y-1">
                          <p>Telefone: {agent.phone_number}</p>
                          <p>Modelo: {agent.model}</p>
                          <p>OpenAI: {agent.openai_api_key ? 'Configurado' : 'Não configurado'}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="agent_id">ID do Agente</Label>
                  <Input
                    id="agent_id"
                    placeholder="Ex: agent-001"
                    value={formData.agent_id}
                    onChange={(e) => setFormData(prev => ({ ...prev, agent_id: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone_number">Número do WhatsApp</Label>
                  <Input
                    id="phone_number"
                    placeholder="Ex: 5511999999999"
                    value={formData.phone_number}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone_number: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="openai_api_key">Chave OpenAI API</Label>
                <Input
                  id="openai_api_key"
                  type="password"
                  placeholder="sk-..."
                  value={formData.openai_api_key}
                  onChange={(e) => setFormData(prev => ({ ...prev, openai_api_key: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="model">Modelo IA</Label>
                <Select value={formData.model} onValueChange={(value) => setFormData(prev => ({ ...prev, model: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gpt-4o-mini">GPT-4o Mini (Rápido)</SelectItem>
                    <SelectItem value="gpt-4o">GPT-4o (Avançado)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="system_prompt">Prompt do Sistema</Label>
                <Textarea
                  id="system_prompt"
                  rows={4}
                  placeholder="Instruções para o comportamento do agente IA..."
                  value={formData.system_prompt}
                  onChange={(e) => setFormData(prev => ({ ...prev, system_prompt: e.target.value }))}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                />
                <Label htmlFor="is_active">Agente ativo</Label>
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetForm}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button type="submit" className="flex-1">
                  {selectedAgent ? 'Atualizar' : 'Criar'} Agente
                </Button>
              </div>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
