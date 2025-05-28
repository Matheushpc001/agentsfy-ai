
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
    <div className="space-y-6">
      {/* Title and Description */}
      <div className="text-center lg:text-left">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          Seus Agentes IA
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2 text-lg">
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
      <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
        {/* Stats */}
        <AgentStats 
          totalAgents={totalAgents} 
          connectedAgents={connectedAgents} 
          agentLimit={agentLimit} 
        />
        
        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          {onManagePromptsClick && (
            <Button 
              variant="outline" 
              className="flex-1 lg:flex-none group transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-800"
              onClick={onManagePromptsClick}
            >
              <Settings className="mr-2 h-4 w-4 transition-transform group-hover:rotate-90" />
              Gerenciar Prompts
            </Button>
          )}
          
          <Button 
            onClick={onCreateClick} 
            className="flex-1 lg:flex-none bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 hover:scale-105 hover:shadow-lg"
            size="lg"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Criar Novo Agente
          </Button>
        </div>
        
        {/* Plan Info Card - Desktop */}
        <div className="hidden lg:block min-w-[320px]">
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
