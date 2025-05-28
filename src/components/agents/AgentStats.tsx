
import { Bot, QrCode } from "lucide-react";
import { EnhancedStatCard } from "@/components/ui/enhanced-stat-card";

interface AgentStatsProps {
  totalAgents: number;
  agentLimit: number;
  connectedAgents: number;
}

export default function AgentStats({ 
  totalAgents, 
  agentLimit,
  connectedAgents
}: AgentStatsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 w-full">
      <EnhancedStatCard
        title="Agentes"
        value={`${totalAgents} / ${agentLimit}`}
        description="Total disponível"
        icon={<Bot className="h-5 w-5" />}
        trend={{
          value: Math.round((totalAgents / agentLimit) * 100),
          positive: totalAgents < agentLimit
        }}
        variant="default"
        className="min-w-0"
      />
      
      <EnhancedStatCard
        title="Conectados"
        value={`${connectedAgents} / ${totalAgents}`}
        description="WhatsApp ativo"
        icon={<QrCode className="h-5 w-5" />}
        trend={{
          value: totalAgents > 0 ? Math.round((connectedAgents / totalAgents) * 100) : 0,
          positive: true
        }}
        variant="success"
        className="min-w-0"
      />
    </div>
  );
}
