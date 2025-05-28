
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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
      <EnhancedStatCard
        title="Agentes"
        value={totalAgents}
        description={`/ ${agentLimit}`}
        icon={<Bot className="h-5 w-5" />}
      />
      
      <EnhancedStatCard
        title="Conectados"
        value={connectedAgents}
        description={`/ ${totalAgents}`}
        icon={<QrCode className="h-5 w-5" />}
      />
    </div>
  );
}
