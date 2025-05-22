
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { toast } from "sonner";
import { Agent } from "@/types";

interface AgentActionButtonsProps {
  totalAgents: number;
  agentLimit: number;
  onCreateClick: () => void;
}

export default function AgentActionButtons({ 
  totalAgents, 
  agentLimit, 
  onCreateClick 
}: AgentActionButtonsProps) {
  const availableAgents = agentLimit - totalAgents;

  return (
    <div className="flex w-full md:w-auto">
      <Button 
        onClick={onCreateClick}
        disabled={availableAgents <= 0}
        className="w-full md:w-auto"
      >
        <PlusCircle className="mr-2 h-4 w-4" />
        Novo Agente
        {availableAgents > 0 && (
          <span className="ml-2 text-xs bg-white/20 px-1.5 py-0.5 rounded-full">
            {availableAgents} disponível
          </span>
        )}
      </Button>
    </div>
  );
}
