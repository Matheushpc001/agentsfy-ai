
import AgentStats from "@/components/agents/AgentStats";
import AgentActionButtons from "@/components/agents/AgentActionButtons";
import PlanInfoCard from "@/components/agents/PlanInfoCard";

interface AgentHeaderProps {
  totalAgents: number;
  agentLimit: number;
  connectedAgents: number;
  planName: string;
  billingCycle: string;
  onCreateClick: () => void;
}

export default function AgentHeader({
  totalAgents,
  agentLimit,
  connectedAgents,
  planName,
  billingCycle,
  onCreateClick
}: AgentHeaderProps) {
  return (
    <>
      {/* Stats and create button */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <AgentStats 
          totalAgents={totalAgents} 
          agentLimit={agentLimit} 
          connectedAgents={connectedAgents}
        />
        
        <AgentActionButtons
          totalAgents={totalAgents}
          agentLimit={agentLimit}
          onCreateClick={onCreateClick}
        />
      </div>

      {/* Plan info card */}
      <PlanInfoCard 
        planName={planName}
        agentLimit={agentLimit}
        billingCycle={billingCycle}
        totalAgents={totalAgents}
      />
    </>
  );
}
