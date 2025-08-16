
import { Bot, BarChart3, MessageCircle, Clock, QrCode, ExternalLink, Trash2, RefreshCw, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Agent } from "@/types";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface AgentCardProps {
  agent: Agent;
  customerName?: string; // Nome do cliente vinculado
  instanceStatus?: string; // Status da instância da Evolution API
  onView: (agent: Agent) => void;
  onEdit: (agent: Agent) => void;
  onConnect: (agent: Agent) => void;
  onTest: (agent: Agent) => void;
  onDelete: (agent: Agent) => void; // Função para excluir
  onRestart: (agent: Agent) => void; // Função para reiniciar
}

export default function AgentCard({ 
  agent, 
  customerName,
  instanceStatus,
  onView, 
  onEdit, 
  onConnect, 
  onTest, 
  onDelete,
  onRestart
}: AgentCardProps) {

  const getStatusBadge = () => {
    switch (instanceStatus) {
      case 'connected':
        return <Badge variant="success">Conectado</Badge>;
      case 'qr_ready':
        return <Badge variant="warning">Aguardando QR Code</Badge>;
      case 'disconnected':
        return <Badge variant="destructive">Desconectado</Badge>;
      default:
        return <Badge variant="secondary">Verificando...</Badge>;
    }
  };

  return (
    <Card className="overflow-hidden border border-gray-200 dark:border-gray-800 flex flex-col">
      <CardHeader className="bg-gray-50 dark:bg-gray-800/50 p-4 flex flex-row items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-full flex items-center justify-center bg-gray-100 text-gray-600">
            <Bot size={20} />
          </div>
          <div>
            <CardTitle className="text-base font-medium">{agent.name}</CardTitle>
            <div className="text-xs text-muted-foreground">{agent.sector}</div>
          </div>
        </div>
        {getStatusBadge()}
      </CardHeader>

      <CardContent className="p-4 space-y-4 flex-grow">
        <div className="text-sm border-b pb-2 mb-2 flex items-center">
          <User className="mr-2 h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">Cliente: </span>
          <span className="font-medium ml-1">{customerName || "Nenhum"}</span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center">
            <MessageCircle className="mr-2 h-4 w-4 text-muted-foreground" />
            <span className="text-sm"><strong>{agent.messageCount?.toLocaleString() || 0}</strong> msgs</span>
          </div>
          <div className="flex items-center">
            <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
            <span className="text-sm"><strong>{agent.responseTime || 0}s</strong> resp.</span>
          </div>
        </div>

        <div className="flex items-center text-sm">
          <QrCode className="mr-2 h-4 w-4 text-muted-foreground" />
          <span className={cn(instanceStatus === 'connected' ? "text-green-600" : "text-yellow-600")}>
            {instanceStatus === 'connected' ? "WhatsApp Conectado" : "WhatsApp Desconectado"}
          </span>
        </div>
      </CardContent>

      <div className="p-4 pt-0 space-y-2">
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={() => onEdit(agent)} className="flex-1">Editar</Button>
          <Button variant="outline" size="sm" onClick={() => onRestart(agent)} className="flex-1">
            <RefreshCw className="mr-1 h-3.5 w-3.5" />
            Reiniciar
          </Button>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={() => onTest(agent)} className="flex-1">Testar</Button>
           <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm" className="flex-1"><Trash2 className="mr-1 h-3.5 w-3.5" /> Excluir</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tem certeza que deseja excluir o agente "{agent.name}"? Esta ação removerá a instância da Evolution API e não pode ser desfeita.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => onDelete(agent)}>Sim, Excluir</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
        
        {instanceStatus !== 'connected' && (
          <Button variant="default" size="sm" onClick={() => onConnect(agent)} className="w-full mt-2">
            <QrCode className="mr-1 h-3.5 w-3.5" />
            Conectar WhatsApp
          </Button>
        )}
      </div>
    </Card>
  );
}
