
import { Button } from "@/components/ui/button";
import PlanInfoCard from "@/components/agents/PlanInfoCard";
import AgentStats from "@/components/agents/AgentStats";
import { PlusCircle } from "lucide-react";

interface AgentHeaderProps {
  totalAgents: number;
  agentLimit: number;
  connectedAgents: number;
  planName: string;
  billingCycle: 'monthly' | 'yearly';
  onCreateClick: () => void;
  onManagePromptsClick?: () => void;
}

export default function AgentHeader({
  totalAgents,
  agentLimit,
  connectedAgents,
  planName,
  billingCycle,
  onCreateClick,
  onManagePromptsClick
}: AgentHeaderProps) {
  return (
    <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
      <div className="flex-1">
        <h1 className="text-2xl font-bold">Agentes</h1>
        <p className="text-muted-foreground mt-1">
          Gerencie os agentes IA e suas conexões WhatsApp
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
        <AgentStats 
          totalAgents={totalAgents} 
          connectedAgents={connectedAgents} 
          agentLimit={agentLimit} 
        />
        
        <div className="flex gap-3">
          {onManagePromptsClick && (
            <Button 
              variant="outline" 
              className="flex-1 md:flex-none whitespace-nowrap"
              onClick={onManagePromptsClick}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mr-1 h-4 w-4"
              >
                <path d="M3 3m0 2a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v6a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2z"></path>
                <path d="M8 10v11"></path>
                <path d="M12 12v9"></path>
                <path d="M16 10v11"></path>
                <path d="M3 10h18"></path>
              </svg>
              Prompts
            </Button>
          )}
          
          <Button onClick={onCreateClick} className="flex-1 md:flex-none">
            <PlusCircle className="mr-1 h-4 w-4" />
            Novo Agente
          </Button>
        </div>
      </div>
      
      <div className="hidden xl:block ml-4">
        <PlanInfoCard planName={planName} billingCycle={billingCycle} />
      </div>
    </div>
  );
}
