
import { Bot, QrCode } from "lucide-react";
import { Agent } from "@/types";

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
      <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm border flex items-center gap-2">
        <Bot className="text-primary h-5 w-5" />
        <div>
          <p className="text-sm text-muted-foreground">Agentes</p>
          <p className="font-medium">
            {totalAgents} <span className="text-xs text-muted-foreground">/ {agentLimit}</span>
          </p>
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm border flex items-center gap-2">
        <QrCode className="text-primary h-5 w-5" />
        <div>
          <p className="text-sm text-muted-foreground">Conectados</p>
          <p className="font-medium">
            {connectedAgents} <span className="text-xs text-muted-foreground">/ {totalAgents}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
