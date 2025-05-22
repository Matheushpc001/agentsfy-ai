
import { Bot, BarChart3, MessageCircle, Clock, QrCode, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Agent } from "@/types";

interface AgentCardProps {
  agent: Agent;
  onView: (agent: Agent) => void;
  onEdit: (agent: Agent) => void;
  onConnect: (agent: Agent) => void;
  onTest: (agent: Agent) => void;
}

export default function AgentCard({ 
  agent, 
  onView, 
  onEdit, 
  onConnect, 
  onTest 
}: AgentCardProps) {
  return (
    <Card className="overflow-hidden border border-gray-200 dark:border-gray-800">
      <CardHeader className="bg-gray-50 dark:bg-gray-800/50 p-4 flex flex-row items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={cn(
            "w-9 h-9 rounded-full flex items-center justify-center",
            agent.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
          )}>
            <Bot size={20} />
          </div>
          <div>
            <CardTitle className="text-base font-medium">{agent.name}</CardTitle>
            <div className="text-xs text-muted-foreground">{agent.sector}</div>
          </div>
        </div>
        <Badge className={cn(
          agent.isActive ? "bg-green-100 hover:bg-green-100 text-green-800 border-green-200" :
          "bg-gray-100 hover:bg-gray-100 text-gray-800 border-gray-200"
        )}>
          {agent.isActive ? "Ativo" : "Inativo"}
        </Badge>
      </CardHeader>

      <CardContent className="p-4 space-y-4">
        {/* Cliente vinculado */}
        <div className="text-sm border-b pb-2 mb-2">
          <span className="text-muted-foreground">Cliente: </span>
          <span className="font-medium">
            {agent.customerId && agent.customerId.startsWith('customer') ? 
              `Cliente ${agent.customerId.replace('customer', '')}` : 
              agent.customerId}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center">
            <MessageCircle className="mr-2 h-4 w-4 text-muted-foreground" />
            <span className="text-sm">
              <strong>{agent.messageCount.toLocaleString()}</strong> msgs
            </span>
          </div>
          <div className="flex items-center">
            <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
            <span className="text-sm">
              <strong>{agent.responseTime}s</strong> resp.
            </span>
          </div>
        </div>

        <div className="flex items-center text-sm">
          <QrCode className="mr-2 h-4 w-4 text-muted-foreground" />
          <span className={cn(
            agent.whatsappConnected ? "text-green-600" : "text-yellow-600"
          )}>
            {agent.whatsappConnected ? "WhatsApp Conectado" : "Desconectado"}
          </span>
        </div>

        {agent.demoUrl && (
          <div className="flex items-center text-sm text-primary">
            <ExternalLink className="mr-2 h-4 w-4" />
            <a 
              href={agent.demoUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="underline underline-offset-2"
            >
              Link de Demonstração
            </a>
          </div>
        )}

        <div className="flex space-x-2 pt-2">
          <Button variant="outline" size="sm" onClick={() => onView(agent)} className="flex-1">
            <BarChart3 className="mr-1 h-3.5 w-3.5" />
            Estatísticas
          </Button>
          <Button variant="outline" size="sm" onClick={() => onTest(agent)} className="flex-1">
            <MessageCircle className="mr-1 h-3.5 w-3.5" />
            Testar
          </Button>
          <Button variant="outline" size="sm" onClick={() => onEdit(agent)} className="flex-1">
            Editar
          </Button>
        </div>
        
        {!agent.whatsappConnected && (
          <Button variant="default" size="sm" onClick={() => onConnect(agent)} className="w-full mt-2">
            <QrCode className="mr-1 h-3.5 w-3.5" />
            Conectar WhatsApp
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
