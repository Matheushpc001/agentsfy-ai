import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
interface AgentConfigTabProps {
  setActiveTab: (tab: string) => void;
}
export default function AgentConfigTab({
  setActiveTab
}: AgentConfigTabProps) {
  const [isAIAgentEnabled, setIsAIAgentEnabled] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [agentName, setAgentName] = useState("");
  const [agentPrompt, setAgentPrompt] = useState("");
  const [useCalendar, setUseCalendar] = useState(false);
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
  return <Card>
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
          <Switch checked={isAIAgentEnabled} onCheckedChange={setIsAIAgentEnabled} className="bg-slate-300 hover:bg-slate-200" />
        </div>
        
        <div className={`space-y-4 ${isAIAgentEnabled ? "" : "opacity-60 pointer-events-none"}`}>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="apiKey">API Key da OpenAI</Label>
              <Input id="apiKey" type="password" placeholder="sk-..." value={apiKey} onChange={e => setApiKey(e.target.value)} />
              <p className="text-xs text-muted-foreground">
                Necessário para o funcionamento do agente IA.
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="agentName">Nome do Agente</Label>
              <Input id="agentName" placeholder="Ex: Vendedor Virtual" value={agentName} onChange={e => setAgentName(e.target.value)} />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="agentPrompt">Personalidade do Agente (Prompt)</Label>
            <Textarea id="agentPrompt" placeholder="Ex: Você é um especialista em vendas de agentes inteligentes para empresas locais..." rows={5} value={agentPrompt} onChange={e => setAgentPrompt(e.target.value)} />
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
            <Switch checked={useCalendar} onCheckedChange={setUseCalendar} disabled={!isAIAgentEnabled} />
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
    </Card>;
}