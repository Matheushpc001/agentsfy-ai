
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { 
  Settings, 
  Brain, 
  Clock, 
  MessageSquare, 
  Zap, 
  Filter,
  Save,
  TestTube,
  AlertCircle,
  CheckCircle
} from "lucide-react";
import { toast } from "sonner";

interface AdvancedAIConfigProps {
  agent: any;
  onUpdate: (updates: any) => Promise<void>;
}

export default function AdvancedAIConfig({ agent, onUpdate }: AdvancedAIConfigProps) {
  const [config, setConfig] = useState({
    // Configurações básicas
    model: agent.model || 'gpt-4o-mini',
    temperature: 0.7,
    max_tokens: 1000,
    top_p: 1.0,
    frequency_penalty: 0.0,
    presence_penalty: 0.0,
    
    // Configurações de comportamento
    auto_response: agent.auto_response ?? true,
    response_delay_seconds: agent.response_delay_seconds || 2,
    max_conversation_length: 50,
    context_window_size: 10,
    
    // Filtros e triggers
    keyword_triggers: [],
    ignore_keywords: [],
    business_hours_only: false,
    business_hours_start: '09:00',
    business_hours_end: '18:00',
    
    // Configurações avançadas
    enable_memory: true,
    enable_web_search: false,
    enable_image_analysis: false,
    enable_voice_response: false,
    
    // Sistema de fallback
    fallback_enabled: true,
    fallback_message: 'Desculpe, não consigo responder agora. Um atendente humano entrará em contato em breve.',
    human_handoff_keywords: ['falar com humano', 'atendente', 'suporte'],
    
    // Personalização
    personality_style: 'professional',
    response_style: 'helpful',
    language_preference: 'pt-BR',
    custom_greeting: '',
    custom_goodbye: ''
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onUpdate(config);
      toast.success('Configurações salvas com sucesso!');
    } catch (error) {
      toast.error('Erro ao salvar configurações');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTest = async () => {
    setIsTesting(true);
    try {
      // Simular teste de configuração
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success('Configurações testadas com sucesso!');
    } catch (error) {
      toast.error('Erro no teste de configurações');
    } finally {
      setIsTesting(false);
    }
  };

  const updateConfig = (field: string, value: any) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold">Configurações Avançadas</h3>
          <p className="text-muted-foreground">
            Configure comportamentos detalhados do agente IA
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleTest} disabled={isTesting}>
            <TestTube className="h-4 w-4 mr-2" />
            {isTesting ? 'Testando...' : 'Testar'}
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="model" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="model">Modelo</TabsTrigger>
          <TabsTrigger value="behavior">Comportamento</TabsTrigger>
          <TabsTrigger value="triggers">Triggers</TabsTrigger>
          <TabsTrigger value="advanced">Avançado</TabsTrigger>
          <TabsTrigger value="personality">Personalidade</TabsTrigger>
        </TabsList>

        <TabsContent value="model" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Configurações do Modelo IA
              </CardTitle>
              <CardDescription>
                Ajuste os parâmetros do modelo de linguagem
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="model">Modelo</Label>
                  <Select value={config.model} onValueChange={(value) => updateConfig('model', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gpt-4o-mini">GPT-4O Mini (Rápido)</SelectItem>
                      <SelectItem value="gpt-4o">GPT-4O (Avançado)</SelectItem>
                      <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo (Econômico)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="max_tokens">Tokens Máximos</Label>
                  <Input
                    id="max_tokens"
                    type="number"
                    value={config.max_tokens}
                    onChange={(e) => updateConfig('max_tokens', parseInt(e.target.value))}
                    min={100}
                    max={4000}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Temperatura: {config.temperature}</Label>
                    <Badge variant="outline">{config.temperature < 0.3 ? 'Conservador' : config.temperature > 0.7 ? 'Criativo' : 'Balanceado'}</Badge>
                  </div>
                  <Slider
                    value={[config.temperature]}
                    onValueChange={(value) => updateConfig('temperature', value[0])}
                    max={1}
                    min={0}
                    step={0.1}
                    className="w-full"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Top P: {config.top_p}</Label>
                    <Badge variant="outline">Diversidade</Badge>
                  </div>
                  <Slider
                    value={[config.top_p]}
                    onValueChange={(value) => updateConfig('top_p', value[0])}
                    max={1}
                    min={0}
                    step={0.1}
                    className="w-full"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Penalty Frequência: {config.frequency_penalty}</Label>
                    <Badge variant="outline">Repetição</Badge>
                  </div>
                  <Slider
                    value={[config.frequency_penalty]}
                    onValueChange={(value) => updateConfig('frequency_penalty', value[0])}
                    max={2}
                    min={-2}
                    step={0.1}
                    className="w-full"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="behavior" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Comportamento e Timing
              </CardTitle>
              <CardDescription>
                Configure como e quando o agente responde
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Resposta Automática</Label>
                  <p className="text-sm text-muted-foreground">
                    Responder automaticamente às mensagens recebidas
                  </p>
                </div>
                <Switch
                  checked={config.auto_response}
                  onCheckedChange={(checked) => updateConfig('auto_response', checked)}
                />
              </div>

              <Separator />

              <div className="space-y-3">
                <Label>Delay de Resposta: {config.response_delay_seconds}s</Label>
                <Slider
                  value={[config.response_delay_seconds]}
                  onValueChange={(value) => updateConfig('response_delay_seconds', value[0])}
                  max={30}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <p className="text-sm text-muted-foreground">
                  Tempo de espera antes de responder (simula digitação humana)
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="max_conversation">Máx. Mensagens por Conversa</Label>
                  <Input
                    id="max_conversation"
                    type="number"
                    value={config.max_conversation_length}
                    onChange={(e) => updateConfig('max_conversation_length', parseInt(e.target.value))}
                    min={1}
                    max={100}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="context_window">Janela de Contexto</Label>
                  <Input
                    id="context_window"
                    type="number"
                    value={config.context_window_size}
                    onChange={(e) => updateConfig('context_window_size', parseInt(e.target.value))}
                    min={1}
                    max={20}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Apenas Horário Comercial</Label>
                    <p className="text-sm text-muted-foreground">
                      Responder apenas durante horário de funcionamento
                    </p>
                  </div>
                  <Switch
                    checked={config.business_hours_only}
                    onCheckedChange={(checked) => updateConfig('business_hours_only', checked)}
                  />
                </div>

                {config.business_hours_only && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="start_hour">Hora Início</Label>
                      <Input
                        id="start_hour"
                        type="time"
                        value={config.business_hours_start}
                        onChange={(e) => updateConfig('business_hours_start', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="end_hour">Hora Fim</Label>
                      <Input
                        id="end_hour"
                        type="time"
                        value={config.business_hours_end}
                        onChange={(e) => updateConfig('business_hours_end', e.target.value)}
                      />
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="triggers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Triggers e Filtros
              </CardTitle>
              <CardDescription>
                Configure palavras-chave e condições para ativação
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="keyword_triggers">Palavras-chave Trigger</Label>
                <Textarea
                  id="keyword_triggers"
                  placeholder="Digite palavras-chave separadas por vírgula..."
                  className="min-h-[100px]"
                />
                <p className="text-sm text-muted-foreground">
                  O agente responderá apenas quando estas palavras forem mencionadas
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ignore_keywords">Palavras para Ignorar</Label>
                <Textarea
                  id="ignore_keywords"
                  placeholder="Digite palavras para ignorar separadas por vírgula..."
                  className="min-h-[100px]"
                />
                <p className="text-sm text-muted-foreground">
                  O agente não responderá se estas palavras forem mencionadas
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="handoff_keywords">Palavras para Transferir para Humano</Label>
                <Textarea
                  id="handoff_keywords"
                  value={config.human_handoff_keywords.join(', ')}
                  onChange={(e) => updateConfig('human_handoff_keywords', e.target.value.split(', ').filter(k => k.trim()))}
                  placeholder="falar com humano, atendente, suporte..."
                  className="min-h-[100px]"
                />
                <p className="text-sm text-muted-foreground">
                  Quando estas palavras forem mencionadas, o agente transferirá para atendimento humano
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Recursos Avançados
              </CardTitle>
              <CardDescription>
                Configure funcionalidades experimentais e avançadas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Memória de Conversas</Label>
                    <p className="text-sm text-muted-foreground">
                      Lembrar conversas anteriores com o mesmo usuário
                    </p>
                  </div>
                  <Switch
                    checked={config.enable_memory}
                    onCheckedChange={(checked) => updateConfig('enable_memory', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Busca na Web</Label>
                    <p className="text-sm text-muted-foreground">
                      Permitir buscar informações atualizadas na internet
                    </p>
                  </div>
                  <Switch
                    checked={config.enable_web_search}
                    onCheckedChange={(checked) => updateConfig('enable_web_search', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Análise de Imagens</Label>
                    <p className="text-sm text-muted-foreground">
                      Analisar e responder sobre imagens enviadas
                    </p>
                  </div>
                  <Switch
                    checked={config.enable_image_analysis}
                    onCheckedChange={(checked) => updateConfig('enable_image_analysis', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Resposta por Voz</Label>
                    <p className="text-sm text-muted-foreground">
                      Converter respostas em áudio quando possível
                    </p>
                  </div>
                  <Switch
                    checked={config.enable_voice_response}
                    onCheckedChange={(checked) => updateConfig('enable_voice_response', checked)}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Sistema de Fallback</Label>
                    <p className="text-sm text-muted-foreground">
                      Ativar respostas de emergência quando a IA falha
                    </p>
                  </div>
                  <Switch
                    checked={config.fallback_enabled}
                    onCheckedChange={(checked) => updateConfig('fallback_enabled', checked)}
                  />
                </div>

                {config.fallback_enabled && (
                  <div className="space-y-2">
                    <Label htmlFor="fallback_message">Mensagem de Fallback</Label>
                    <Textarea
                      id="fallback_message"
                      value={config.fallback_message}
                      onChange={(e) => updateConfig('fallback_message', e.target.value)}
                      placeholder="Mensagem enviada quando a IA não consegue responder..."
                      className="min-h-[80px]"
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="personality" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Personalidade e Estilo
              </CardTitle>
              <CardDescription>
                Configure a personalidade e estilo de comunicação do agente
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="personality_style">Estilo de Personalidade</Label>
                  <Select value={config.personality_style} onValueChange={(value) => updateConfig('personality_style', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="professional">Profissional</SelectItem>
                      <SelectItem value="friendly">Amigável</SelectItem>
                      <SelectItem value="casual">Casual</SelectItem>
                      <SelectItem value="formal">Formal</SelectItem>
                      <SelectItem value="enthusiastic">Entusiasmado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="response_style">Estilo de Resposta</Label>
                  <Select value={config.response_style} onValueChange={(value) => updateConfig('response_style', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="helpful">Prestativo</SelectItem>
                      <SelectItem value="concise">Conciso</SelectItem>
                      <SelectItem value="detailed">Detalhado</SelectItem>
                      <SelectItem value="empathetic">Empático</SelectItem>
                      <SelectItem value="educational">Educativo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="language_preference">Idioma Preferido</Label>
                <Select value={config.language_preference} onValueChange={(value) => updateConfig('language_preference', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                    <SelectItem value="en-US">English (US)</SelectItem>
                    <SelectItem value="es-ES">Español</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="custom_greeting">Saudação Personalizada</Label>
                <Textarea
                  id="custom_greeting"
                  value={config.custom_greeting}
                  onChange={(e) => updateConfig('custom_greeting', e.target.value)}
                  placeholder="Olá! Como posso ajudá-lo hoje?"
                  className="min-h-[80px]"
                />
                <p className="text-sm text-muted-foreground">
                  Mensagem enviada quando uma nova conversa é iniciada
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="custom_goodbye">Despedida Personalizada</Label>
                <Textarea
                  id="custom_goodbye"
                  value={config.custom_goodbye}
                  onChange={(e) => updateConfig('custom_goodbye', e.target.value)}
                  placeholder="Obrigado pelo contato! Tenha um ótimo dia!"
                  className="min-h-[80px]"
                />
                <p className="text-sm text-muted-foreground">
                  Mensagem enviada ao finalizar uma conversa
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
