
import { WhatsAppConnection } from "@/types/whatsapp";
import ConnectionCard from "./ConnectionCard";
import { Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ConnectionsListProps {
  connections: WhatsAppConnection[];
  searchTerm: string;
  onClearSearch: () => void;
  onGenerateQrCode: (connection: WhatsAppConnection) => void;
  onViewMessages: (connection: WhatsAppConnection) => void;
  onOpenSettings: (connection: WhatsAppConnection) => void;
  onDeleteConnection: (connectionId: string) => void;
}

export default function ConnectionsList({
  connections,
  searchTerm,
  onClearSearch,
  onGenerateQrCode,
  onViewMessages,
  onOpenSettings,
  onDeleteConnection
}: ConnectionsListProps) {
  if (connections.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Smartphone size={48} className="text-muted-foreground/30 mb-4" />
        <p className="text-muted-foreground mb-2">Nenhuma conexão encontrada.</p>
        {searchTerm && (
          <Button variant="link" onClick={onClearSearch}>
            Limpar busca
          </Button>
        )}
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {connections.map(connection => (
        <ConnectionCard
          key={connection.id}
          connection={connection}
          onGenerateQrCode={onGenerateQrCode}
          onViewMessages={onViewMessages}
          onOpenSettings={onOpenSettings}
          onDeleteConnection={onDeleteConnection}
        />
      ))}
    </div>
  );
}
