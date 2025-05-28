
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
  const usagePercentage = (totalAgents / agentLimit) * 100;
  const connectionPercentage = totalAgents > 0 ? (connectedAgents / totalAgents) * 100 : 0;
  
  return (
    <div className="flex items-center gap-4 w-full md:w-auto">
      <div className="bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-blue-900/20 p-4 rounded-xl shadow-sm border border-blue-100 dark:border-blue-800/30 flex items-center gap-3 flex-1 md:flex-none hover:shadow-md transition-shadow duration-200">
        <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-sm">
          <Bot className="text-white h-5 w-5" />
        </div>
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Agentes</p>
          <p className="font-bold text-lg text-gray-900 dark:text-gray-100">
            {totalAgents} <span className="text-sm text-gray-500 dark:text-gray-400 font-normal">/ {agentLimit}</span>
          </p>
          <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-1 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(usagePercentage, 100)}%` }}
            ></div>
          </div>
        </div>
      </div>
      
      <div className="bg-gradient-to-br from-white to-green-50 dark:from-gray-800 dark:to-green-900/20 p-4 rounded-xl shadow-sm border border-green-100 dark:border-green-800/30 flex items-center gap-3 flex-1 md:flex-none hover:shadow-md transition-shadow duration-200">
        <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg shadow-sm">
          <QrCode className="text-white h-5 w-5" />
        </div>
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Conectados</p>
          <p className="font-bold text-lg text-gray-900 dark:text-gray-100">
            {connectedAgents} <span className="text-sm text-gray-500 dark:text-gray-400 font-normal">/ {totalAgents}</span>
          </p>
          <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-1 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-green-500 to-emerald-600 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(connectionPercentage, 100)}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}
