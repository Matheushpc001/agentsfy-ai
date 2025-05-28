
import { Phone, MessageSquare } from "lucide-react";
import { WhatsAppConnection } from "@/types/whatsapp";

interface StatisticsSectionProps {
  connections: WhatsAppConnection[];
}

export default function StatisticsSection({ connections }: StatisticsSectionProps) {
  const activeConnections = connections.filter(c => c.status === "connected").length;
  const totalMessages = connections.reduce((acc, conn) => acc + conn.messageCount, 0);
  
  return (
    <div className="flex items-center gap-4 w-full md:w-auto">
      <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm border flex items-center gap-2">
        <Phone className="text-green-500 h-5 w-5" />
        <div>
          <p className="text-sm text-muted-foreground">Conexões</p>
          <p className="font-medium">
            {activeConnections} <span className="text-xs text-muted-foreground">/ {connections.length} total</span>
          </p>
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm border flex items-center gap-2">
        <MessageSquare className="text-blue-500 h-5 w-5" />
        <div>
          <p className="text-sm text-muted-foreground">Mensagens</p>
          <p className="font-medium">
            {totalMessages.toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}
