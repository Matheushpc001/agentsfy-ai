
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bot, Settings, TestTube } from "lucide-react";
import { toast } from "sonner";

interface AIAgentSetupProps {
  evolutionConfigId: string;
  onCreateAgent: (agentData: any) => Promise<void>;
  onUpdateAgent: (agentId: string, updates: any) => Promise<void>;
  existingAgent?: any;
  agents?: any[];
}

export default function AIAgentSetup({ 
  evolutionConfigId, 
  onCreateAgent, 
  onUpdateAgent,
  existingAgent,
  agents = []
}: AIAgentSetupProps) {
  const [formData, setFormData] = useState({
    agentId: existingAgent?.agent_id || '',
    phoneNumber: existingAgent?.phone_number || '',
    openaiApiKey: existingAgent?.openai_api_key || '',
    model: existingAgent?.model || 'gpt-4o-mini',
    systemPrompt: existingAgent?.system_prompt || '',
    autoResponse: existingAgent?.auto_response !== false,
    responseDelaySeconds: existingAgent?.response_delay_seconds || 2,
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.agentId || !formData.phoneNumber) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    setIsLoading(true);
    try {
      if (existingAgent) {
        await onUpdateAgent(existingAgent.id, {
          agent_id: formData.agentId,
          phone_number: formData.phoneNumber,
          openai_api_key: formData.openaiApiKey,
          model: formData.model,
          system_prompt: formData.systemPrompt,
          auto_response: formData.autoResponse,
          response_delay_seconds: formData.responseDelaySeconds,
        });
      } else {
        await onCreateAgent({
          agentId: formData.agentId,
          evolutionConfigId,
          phoneNumber: formData.phoneNumber,
          openaiApiKey: formData.openaiApiKey,
          model: formData.model,
          systemPrompt: formData.systemPrompt,
          autoResponse: formData.autoResponse,
          responseDelaySeconds: formData.responseDelaySeconds,
        });
      }
      
      // Reset form if creating new agent
      if (!existingAgent) {
        setFormData({
          agentId: '',
          phoneNumber: '',
          openaiApiKey: '',
          model: 'gpt-4o-mini',
          systemPrompt: '',
          autoResponse: true,
          responseDelaySeconds: 2,
        });
      }
    } catch (error) {
      console.error('Erro ao salvar agente:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const testAgent = async () => {
    if (!formData.openaiApiKey) {
      toast.error('Configure a chave da OpenAI primeiro');
      return;
    }

    toast.info('Testando agente IA... (funcionalidade em desenvolvimento)');
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5" />
          <CardTitle>
            {existingAgent ? 'Editar Agente IA' : 'Configurar Agente IA'}
          </CardTitle>
        </div>
        <CardDescription>
          Configure um agente de inteligência artificial para responder automaticamente no WhatsApp
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="agentId">ID do Agente *</Label>
            <Input
              id="agentId"
              value={formData.agentId}
              onChange={(e) => handleChange('agentId', e.target.value)}
              placeholder="ID único do agente"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phoneNumber">Número do WhatsApp *</Label>
            <Input
              id="phoneNumber"
              value={formData.phoneNumber}
              onChange={(e) => handleChange('phoneNumber', e.target.value)}
              placeholder="+5511999999999"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="openaiApiKey">Chave da API OpenAI</Label>
          <Input
            id="openaiApiKey"
            type="password"
            value={formData.openaiApiKey}
            onChange={(e) => handleChange('openaiApiKey', e.target.value)}
            placeholder="sk-..."
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="model">Modelo da IA</Label>
          <Select value={formData.model} onValueChange={(value) => handleChange('model', value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="gpt-4o-mini">GPT-4o Mini (Rápido e Econômico)</SelectItem>
              <SelectItem value="gpt-4o">GPT-4o (Mais Poderoso)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="systemPrompt">Prompt do Sistema</Label>
          <Textarea
            id="systemPrompt"
            value={formData.systemPrompt}
            onChange={(e) => handleChange('systemPrompt', e.target.value)}
            placeholder="Você é um assistente de atendimento ao cliente..."
            rows={4}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Resposta Automática</Label>
              <p className="text-sm text-muted-foreground">
                Responder automaticamente às mensagens
              </p>
            </div>
            <Switch
              checked={formData.autoResponse}
              onCheckedChange={(checked) => handleChange('autoResponse', checked)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="responseDelaySeconds">Delay de Resposta (segundos)</Label>
            <Input
              id="responseDelaySeconds"
              type="number"
              min="1"
              max="30"
              value={formData.responseDelaySeconds}
              onChange={(e) => handleChange('responseDelaySeconds', parseInt(e.target.value))}
            />
          </div>
        </div>

        <div className="flex gap-2 pt-4">
          <Button 
            onClick={handleSubmit} 
            disabled={isLoading}
            className="flex-1"
          >
            <Settings className="w-4 h-4 mr-2" />
            {existingAgent ? 'Atualizar Agente' : 'Criar Agente'}
          </Button>
          
          <Button 
            variant="outline" 
            onClick={testAgent}
            disabled={!formData.openaiApiKey}
          >
            <TestTube className="w-4 h-4 mr-2" />
            Testar
          </Button>
        </div>

        {agents.length > 0 && (
          <div className="mt-6">
            <h4 className="font-medium mb-2">Agentes Configurados:</h4>
            <div className="text-sm text-muted-foreground">
              {agents.length} agente(s) ativo(s) nesta instância
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
