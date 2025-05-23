
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter 
} from "@/components/ui/card";
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator 
} from "@/components/ui/dropdown-menu";
import { 
  MoreVertical, 
  RefreshCw, 
  MessageSquare, 
  Settings, 
  Check, 
  X, 
  QrCode, 
  Phone 
} from "lucide-react";
import { WhatsAppConnection } from "@/types/whatsapp";

interface ConnectionCardProps {
  connection: WhatsAppConnection;
  onGenerateQrCode: (connection: WhatsAppConnection) => void;
  onViewMessages: (connection: WhatsAppConnection) => void;
  onOpenSettings: (connection: WhatsAppConnection) => void;
  onDeleteConnection: (connectionId: string) => void;
}

export default function ConnectionCard({
  connection,
  onGenerateQrCode,
  onViewMessages,
  onOpenSettings,
  onDeleteConnection
}: ConnectionCardProps) {
  return (
    <Card key={connection.id} className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{connection.name}</CardTitle>
            <CardDescription>{connection.customerName}</CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">Mais opções</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onViewMessages(connection)}>
                <MessageSquare className="mr-2 h-4 w-4" /> Ver mensagens
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onOpenSettings(connection)}>
                <Settings className="mr-2 h-4 w-4" /> Configurações
              </DropdownMenuItem>
              {connection.status !== "connected" && (
                <DropdownMenuItem onClick={() => onGenerateQrCode(connection)}>
                  <RefreshCw className="mr-2 h-4 w-4" /> Reconectar
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-destructive focus:text-destructive"
                onClick={() => onDeleteConnection(connection.id)}
              >
                <RefreshCw className="mr-2 h-4 w-4" /> Remover
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="text-sm">{connection.phoneNumber}</span>
            </div>
            <div className="flex items-center">
              {connection.status === "connected" ? (
                <span className="text-xs bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-500 px-2 py-1 rounded-full flex items-center">
                  <Check className="h-3 w-3 mr-1" /> Conectado
                </span>
              ) : connection.status === "pending" ? (
                <span className="text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-800/30 dark:text-yellow-500 px-2 py-1 rounded-full flex items-center">
                  <QrCode className="h-3 w-3 mr-1" /> Pendente
                </span>
              ) : (
                <span className="text-xs bg-red-100 text-red-800 dark:bg-red-800/30 dark:text-red-500 px-2 py-1 rounded-full flex items-center">
                  <X className="h-3 w-3 mr-1" /> Desconectado
                </span>
              )}
            </div>
          </div>
          
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Mensagens:</span>
            <span className="font-medium">{connection.messageCount.toLocaleString()}</span>
          </div>
          
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Última atividade:</span>
            <span className="font-medium">
              {new Date(connection.lastActive).toLocaleDateString()}
            </span>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="pt-3">
        {connection.status === "connected" ? (
          <Button 
            className="w-full" 
            variant="default"
            onClick={() => onViewMessages(connection)}
          >
            <MessageSquare className="mr-2 h-4 w-4" />
            Ver conversas
          </Button>
        ) : (
          <Button 
            className="w-full" 
            variant="secondary"
            onClick={() => onGenerateQrCode(connection)}
          >
            <QrCode className="mr-2 h-4 w-4" />
            {connection.status === "pending" ? "Conectar WhatsApp" : "Reconectar WhatsApp"}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
