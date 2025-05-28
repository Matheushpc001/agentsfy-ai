
import { Phone, MessageSquare } from "lucide-react";
import { MetricCard } from "@/components/ui/metric-card";
import { WhatsAppConnection } from "@/types/whatsapp";

interface StatisticsSectionProps {
  connections: WhatsAppConnection[];
}

export default function StatisticsSection({ connections }: StatisticsSectionProps) {
  const activeConnections = connections.filter(c => c.status === "connected").length;
  const totalMessages = connections.reduce((acc, conn) => acc + conn.messageCount, 0);
  
  return (
    <div className="flex items-center gap-4 w-full md:w-auto">
      <MetricCard
        title="Conexões"
        value={activeConnections}
        subtitle={`/ ${connections.length} total`}
        icon={<Phone className="h-5 w-5 text-emerald-500" />}
        variant="compact"
        className="min-w-0 flex-1"
      />
      
      <MetricCard
        title="Mensagens"
        value={totalMessages.toLocaleString()}
        icon={<MessageSquare className="h-5 w-5 text-blue-500" />}
        variant="compact"
        className="min-w-0 flex-1"
      />
    </div>
  );
}
