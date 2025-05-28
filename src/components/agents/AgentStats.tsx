
import { Bot, QrCode } from "lucide-react";
import { MetricCard } from "@/components/ui/metric-card";

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
    <div className="flex items-center gap-4 w-full md:w-auto">
      <MetricCard
        title="Agentes"
        value={totalAgents}
        subtitle={`/ ${agentLimit}`}
        icon={<Bot className="h-5 w-5" />}
        variant="compact"
        className="min-w-0 flex-1"
      />
      
      <MetricCard
        title="Conectados"
        value={connectedAgents}
        subtitle={`/ ${totalAgents}`}
        icon={<QrCode className="h-5 w-5 text-emerald-500" />}
        variant="compact"
        className="min-w-0 flex-1"
      />
    </div>
  );
}
