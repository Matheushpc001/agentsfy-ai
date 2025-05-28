
import { Button } from "@/components/ui/button";
import PlanInfoCard from "@/components/agents/PlanInfoCard";
import AgentStats from "@/components/agents/AgentStats";
import { PlusCircle, Settings } from "lucide-react";

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
    <div className="space-y-4 lg:space-y-6">
      {/* Title and Description */}
      <div className="text-center lg:text-left px-2 sm:px-0">
        <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          Seus Agentes IA
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mt-2 text-base sm:text-lg leading-relaxed">
          Gerencie os agentes de vendas inteligentes e suas conexões WhatsApp
        </p>
      </div>

      {/* Plan Info Card - Full width on mobile, prominent display */}
      <div className="lg:hidden">
        <PlanInfoCard 
          planName={planName} 
          billingCycle={billingCycle}
          agentLimit={agentLimit}
          totalAgents={totalAgents}
        />
      </div>

      {/* Stats and Actions Row */}
      <div className="flex flex-col xl:flex-row gap-4 lg:gap-6 items-start xl:items-center justify-between">
        {/* Stats */}
        <div className="w-full xl:w-auto">
          <AgentStats 
            totalAgents={totalAgents} 
            connectedAgents={connectedAgents} 
            agentLimit={agentLimit} 
          />
        </div>
        
        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto xl:flex-shrink-0">
          {onManagePromptsClick && (
            <Button 
              variant="outline" 
              className="flex-1 xl:flex-none group transition-all duration-200 hover:bg-blue-50 dark:hover:bg-blue-950/50 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300"
              onClick={onManagePromptsClick}
            >
              <Settings className="mr-2 h-4 w-4 transition-transform group-hover:rotate-90" />
              <span className="whitespace-nowrap">Gerenciar Prompts</span>
            </Button>
          )}
          
          <Button 
            onClick={onCreateClick} 
            className="flex-1 xl:flex-none bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 hover:scale-105 hover:shadow-lg text-white border-0"
            size="lg"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            <span className="whitespace-nowrap">Criar Novo Agente</span>
          </Button>
        </div>
        
        {/* Plan Info Card - Desktop */}
        <div className="hidden xl:block min-w-[300px] xl:min-w-[320px] flex-shrink-0">
          <PlanInfoCard 
            planName={planName} 
            billingCycle={billingCycle}
            agentLimit={agentLimit}
            totalAgents={totalAgents}
          />
        </div>
      </div>
    </div>
  );
}
