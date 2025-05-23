
import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Bot, Smartphone, MessageSquare, Play, Pause, Upload, Mic, Image } from "lucide-react";
import WhatsAppQRCode from "@/components/whatsapp/WhatsAppQRCode";

interface Campaign {
  id: string;
  name: string;
  totalContacts: number;
  sentMessages: number;
  failedMessages: number;
  status: "running" | "paused" | "completed";
  startedAt: string | null;
  completedAt: string | null;
}

export default function AISalesAgent() {
  const [isWhatsAppConnected, setIsWhatsAppConnected] = useState(false);
  const [isAIAgentEnabled, setIsAIAgentEnabled] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [agentName, setAgentName] = useState("");
  const [agentPrompt, setAgentPrompt] = useState("");
  const [useCalendar, setUseCalendar] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [isGeneratingQr, setIsGeneratingQr] = useState(false);
  
  // Campaign state
  const [phoneNumbers, setPhoneNumbers] = useState("");
  const [campaignMessage, setCampaignMessage] = useState("");
  const [minutesBetweenMessages, setMinutesBetweenMessages] = useState("1");
  const [dailyLimit, setDailyLimit] = useState("50");
  const [activeCampaign, setActiveCampaign] = useState<Campaign | null>(null);
  const [activeTab, setActiveTab] = useState("connection");

  // Media uploads
  const [hasImage, setHasImage] = useState(false);
  const [hasAudio, setHasAudio] = useState(false);

  const connectWhatsApp = () => {
    // In a real implementation, this would connect to the WhatsApp API
    setTimeout(() => {
      setIsWhatsAppConnected(true);
      toast.success("WhatsApp conectado com sucesso!");
      setActiveTab("agent");
    }, 2000);
  };

  const disconnectWhatsApp = () => {
    // In a real implementation, this would disconnect from the WhatsApp API
    setIsWhatsAppConnected(false);
    setQrCodeUrl(null);
    toast.info("WhatsApp desconectado.");
    
    // If there's an active campaign, stop it
    if (activeCampaign && activeCampaign.status === "running") {
      stopCampaign();
    }
  };

  const handleGenerateQrCode = () => {
    setIsGeneratingQr(true);
    // Simulate API call delay
    setTimeout(() => {
      setQrCodeUrl("https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=whatsapp-connection-code-" + Date.now());
      setIsGeneratingQr(false);
    }, 1500);
  };

  const saveAgentSettings = () => {
    if (!apiKey.trim() && isAIAgentEnabled) {
      toast.error("Insira uma API Key válida para ativar o agente IA.");
      return;
    }
    
    if (isAIAgentEnabled) {
      toast.success("Configurações do agente IA salvas com sucesso!");
    } else {
      toast.info("Agente IA desativado.");
    }
    
    // Move to the campaign tab
    setActiveTab("campaign");
  };

  const startCampaign = () => {
    // Validate inputs
    if (!phoneNumbers.trim()) {
      toast.error("Adicione pelo menos um número de telefone.");
      return;
    }

    if (!campaignMessage.trim()) {
      toast.error("Adicione uma mensagem para a campanha.");
      return;
    }

    // Parse phone numbers (simple validation)
    const numbers = phoneNumbers.split("\n").map(n => n.trim()).filter(n => n);
    
    if (numbers.length === 0) {
      toast.error("Nenhum número válido encontrado.");
      return;
    }

    // Create a new campaign
    const newCampaign: Campaign = {
      id: `campaign-${Date.now()}`,
      name: `Campanha ${new Date().toLocaleDateString('pt-BR')}`,
      totalContacts: numbers.length,
      sentMessages: 0,
      failedMessages: 0,
      status: "running",
      startedAt: new Date().toISOString(),
      completedAt: null
    };

    setActiveCampaign(newCampaign);
    toast.success(`Campanha iniciada! Enviando para ${numbers.length} contatos.`);
    
    // Simulate message sending progress
    simulateProgress(newCampaign, numbers.length);
  };

  const stopCampaign = () => {
    if (!activeCampaign) return;
    
    setActiveCampaign({
      ...activeCampaign,
      status: "paused"
    });
    
    toast.info("Campanha pausada.");
  };

  const simulateProgress = (campaign: Campaign, total: number) => {
    // This is just a simulation - in a real app, this would track actual message sending
    let sent = 0;
    let failed = 0;
    
    const interval = setInterval(() => {
      // Simulate a message being sent
      const success = Math.random() > 0.1; // 90% success rate
      
      if (success) {
        sent++;
      } else {
        failed++;
      }
      
      // Update campaign status
      setActiveCampaign(prev => {
        if (!prev) return null;
        
        const updated = {
          ...prev,
          sentMessages: sent,
          failedMessages: failed
        };
        
        // Check if campaign is complete
        if (sent + failed >= total) {
          clearInterval(interval);
          updated.status = "completed";
          updated.completedAt = new Date().toISOString();
          toast.success("Campanha concluída!");
        }
        
        return updated;
      });
      
    }, 1000); // Update every second for demo purposes
    
    // Cleanup interval if component unmounts
    return () => clearInterval(interval);
  };

  const uploadImage = () => {
    // In a real implementation, this would open a file picker
    setHasImage(true);
    toast.success("Imagem carregada com sucesso.");
  };

  const uploadAudio = () => {
    // In a real implementation, this would open a file picker or recording interface
    setHasAudio(true);
    toast.success("Áudio carregado com sucesso.");
  };

  const removeMedia = (type: "image" | "audio") => {
    if (type === "image") {
      setHasImage(false);
      toast.info("Imagem removida.");
    } else {
      setHasAudio(false);
      toast.info("Áudio removido.");
    }
  };

  const handlePhoneNumbersPaste = () => {
    navigator.clipboard.readText().then(text => {
      setPhoneNumbers(text);
      
      // Count numbers
      const count = text.split("\n").filter(line => line.trim().length > 0).length;
      if (count > 0) {
        toast.success(`${count} números adicionados!`);
      }
    }).catch(err => {
      toast.error("Erro ao colar da área de transferência.");
    });
  };

  // Calculate campaign progress percentage
  const campaignProgress = activeCampaign 
    ? Math.round(((activeCampaign.sentMessages + activeCampaign.failedMessages) / activeCampaign.totalContacts) * 100) 
    : 0;

  return (
    <DashboardLayout title="Vendedor IA">
      <div className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="connection" disabled={activeCampaign?.status === "running"}>
              <Smartphone className="mr-2 h-4 w-4" />
              Conexão WhatsApp
            </TabsTrigger>
            <TabsTrigger 
              value="agent" 
              disabled={!isWhatsAppConnected || activeCampaign?.status === "running"}
            >
              <Bot className="mr-2 h-4 w-4" />
              Agente IA
            </TabsTrigger>
            <TabsTrigger 
              value="campaign" 
              disabled={!isWhatsAppConnected || activeCampaign?.status === "running"}
            >
              <MessageSquare className="mr-2 h-4 w-4" />
              Campanha
            </TabsTrigger>
          </TabsList>

          {/* WhatsApp Connection Tab */}
          <TabsContent value="connection">
            <Card>
              <CardHeader>
                <CardTitle>Conexão do WhatsApp</CardTitle>
                <CardDescription>
                  Conecte seu WhatsApp para usar o disparador de mensagens e o agente IA.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <div className={`h-3 w-3 rounded-full ${isWhatsAppConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                      <p className="text-sm font-medium">
                        Status: {isWhatsAppConnected ? 'Conectado' : 'Desconectado'}
                      </p>
                    </div>
                    
                    <Button 
                      onClick={isWhatsAppConnected ? disconnectWhatsApp : connectWhatsApp}
                      variant={isWhatsAppConnected ? "outline" : "default"}
                    >
                      {isWhatsAppConnected ? 'Desconectar' : 'Conectar WhatsApp'}
                    </Button>
                    
                    <div className="mt-6">
                      <p className="text-sm text-muted-foreground">
                        {isWhatsAppConnected 
                          ? "Seu WhatsApp está conectado e pronto para uso." 
                          : "Escaneie o QR Code ao lado com seu WhatsApp para conectar."}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-center">
                    <WhatsAppQRCode 
                      onConnect={connectWhatsApp}
                      onRefresh={handleGenerateQrCode}
                      isGenerating={isGeneratingQr}
                      qrCodeUrl={qrCodeUrl || undefined}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI Agent Tab */}
          <TabsContent value="agent">
            <Card>
              <CardHeader>
                <CardTitle>Configuração do Agente IA</CardTitle>
                <CardDescription>
                  Configure seu agente de IA pessoal para responder mensagens automaticamente.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Ativar Agente IA</Label>
                    <p className="text-sm text-muted-foreground">
                      O agente responderá automaticamente às mensagens recebidas.
                    </p>
                  </div>
                  <Switch
                    checked={isAIAgentEnabled}
                    onCheckedChange={setIsAIAgentEnabled}
                  />
                </div>
                
                <div className={`space-y-4 ${isAIAgentEnabled ? "" : "opacity-60 pointer-events-none"}`}>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="apiKey">API Key da OpenAI</Label>
                      <Input
                        id="apiKey"
                        type="password"
                        placeholder="sk-..."
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground">
                        Necessário para o funcionamento do agente IA.
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="agentName">Nome do Agente</Label>
                      <Input
                        id="agentName"
                        placeholder="Ex: Vendedor Virtual"
                        value={agentName}
                        onChange={(e) => setAgentName(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="agentPrompt">Personalidade do Agente (Prompt)</Label>
                    <Textarea
                      id="agentPrompt"
                      placeholder="Ex: Você é um especialista em vendas de agentes inteligentes para empresas locais..."
                      rows={5}
                      value={agentPrompt}
                      onChange={(e) => setAgentPrompt(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Define como o agente se comportará ao responder mensagens.
                    </p>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Usar Agenda Pessoal</Label>
                      <p className="text-sm text-muted-foreground">
                        O agente poderá marcar reuniões na sua agenda.
                      </p>
                    </div>
                    <Switch
                      checked={useCalendar}
                      onCheckedChange={setUseCalendar}
                      disabled={!isAIAgentEnabled}
                    />
                  </div>
                  
                  <div className={`${useCalendar ? "" : "opacity-60 pointer-events-none"}`}>
                    <Label className="mb-2 block">Disponibilidade para Agendamentos</Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="monday" className="text-sm">Segunda</Label>
                        <Input id="monday" placeholder="08:00 - 18:00" defaultValue="08:00 - 18:00" disabled={!useCalendar} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="tuesday" className="text-sm">Terça</Label>
                        <Input id="tuesday" placeholder="08:00 - 18:00" defaultValue="08:00 - 18:00" disabled={!useCalendar} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="wednesday" className="text-sm">Quarta</Label>
                        <Input id="wednesday" placeholder="08:00 - 18:00" defaultValue="08:00 - 18:00" disabled={!useCalendar} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="thursday" className="text-sm">Quinta</Label>
                        <Input id="thursday" placeholder="08:00 - 18:00" defaultValue="08:00 - 18:00" disabled={!useCalendar} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="friday" className="text-sm">Sexta</Label>
                        <Input id="friday" placeholder="08:00 - 18:00" defaultValue="08:00 - 18:00" disabled={!useCalendar} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="saturday" className="text-sm">Sábado</Label>
                        <Input id="saturday" placeholder="Indisponível" defaultValue="" disabled={!useCalendar} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="sunday" className="text-sm">Domingo</Label>
                        <Input id="sunday" placeholder="Indisponível" defaultValue="" disabled={!useCalendar} />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button onClick={saveAgentSettings}>
                    Salvar Configurações
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Campaign Tab */}
          <TabsContent value="campaign">
            <Card>
              <CardHeader>
                <CardTitle>Campanha de Mensagens</CardTitle>
                <CardDescription>
                  Configure e inicie campanhas de envio automático de mensagens.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {activeCampaign && activeCampaign.status !== "completed" ? (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium">Progresso da Campanha</h3>
                        <span className="text-sm font-medium">{campaignProgress}%</span>
                      </div>
                      <Progress value={campaignProgress} className="h-2" />
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Enviadas: {activeCampaign.sentMessages}/{activeCampaign.totalContacts}</span>
                        <span>Falhas: {activeCampaign.failedMessages}</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-center">
                      {activeCampaign.status === "running" ? (
                        <Button variant="outline" onClick={stopCampaign}>
                          <Pause className="mr-2 h-4 w-4" />
                          Pausar Campanha
                        </Button>
                      ) : (
                        <Button onClick={() => startCampaign()}>
                          <Play className="mr-2 h-4 w-4" />
                          Retomar Campanha
                        </Button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Phone numbers */}
                    <div className="space-y-2">
                      <Label htmlFor="phoneNumbers">Lista de Números</Label>
                      <div className="relative">
                        <Textarea
                          id="phoneNumbers"
                          placeholder="Cole aqui a lista de números (um por linha)"
                          rows={6}
                          value={phoneNumbers}
                          onChange={(e) => setPhoneNumbers(e.target.value)}
                          className="pr-24"
                        />
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="absolute right-2 top-2"
                          onClick={handlePhoneNumbersPaste}
                        >
                          <Upload className="mr-1 h-4 w-4" /> Colar
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Insira um número por linha. Formato: país + DDD + número (Ex: 5511999999999)
                      </p>
                    </div>
                    
                    {/* Campaign message */}
                    <div className="space-y-2">
                      <Label htmlFor="campaignMessage">Mensagem</Label>
                      <Textarea
                        id="campaignMessage"
                        placeholder="Digite a mensagem que será enviada para os contatos..."
                        rows={6}
                        value={campaignMessage}
                        onChange={(e) => setCampaignMessage(e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground">
                        Use {'{nome}'} para personalizar com o nome do contato (se disponível).
                      </p>
                      
                      {/* Attach media controls */}
                      <div className="flex flex-wrap gap-2 mt-2">
                        {!hasImage && (
                          <Button variant="outline" size="sm" onClick={uploadImage}>
                            <Image className="mr-1 h-4 w-4" /> Anexar Imagem
                          </Button>
                        )}
                        
                        {hasImage && (
                          <div className="flex items-center gap-2 px-3 py-1 bg-muted rounded-md">
                            <Image className="h-4 w-4" />
                            <span className="text-sm">imagem.jpg</span>
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeMedia("image")}>
                              <span>×</span>
                            </Button>
                          </div>
                        )}
                        
                        {!hasAudio && (
                          <Button variant="outline" size="sm" onClick={uploadAudio}>
                            <Mic className="mr-1 h-4 w-4" /> Anexar Áudio
                          </Button>
                        )}
                        
                        {hasAudio && (
                          <div className="flex items-center gap-2 px-3 py-1 bg-muted rounded-md">
                            <Mic className="h-4 w-4" />
                            <span className="text-sm">audio.mp3</span>
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeMedia("audio")}>
                              <span>×</span>
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="interval">Tempo Entre Mensagens (minutos)</Label>
                        <Input
                          id="interval"
                          type="number"
                          min="0.5"
                          step="0.5"
                          value={minutesBetweenMessages}
                          onChange={(e) => setMinutesBetweenMessages(e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">
                          Tempo de espera entre cada mensagem enviada.
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="dailyLimit">Limite Diário</Label>
                        <Input
                          id="dailyLimit"
                          type="number"
                          min="1"
                          value={dailyLimit}
                          onChange={(e) => setDailyLimit(e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">
                          Número máximo de mensagens enviadas por dia.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
                      <Button onClick={startCampaign}>
                        <Play className="mr-2 h-4 w-4" />
                        Iniciar Campanha
                      </Button>
                    </div>
                  </div>
                )}
                
                {activeCampaign?.status === "completed" && (
                  <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900 rounded-md">
                    <h3 className="font-medium text-green-700 dark:text-green-300">Campanha Concluída!</h3>
                    <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                      {activeCampaign.sentMessages} mensagens enviadas com sucesso. {activeCampaign.failedMessages} falhas.
                    </p>
                    <div className="mt-4">
                      <Button variant="outline" size="sm" onClick={() => setActiveCampaign(null)}>
                        Criar Nova Campanha
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
