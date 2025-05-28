
import { useState } from "react";
import { Bot, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import AgentCard from "@/components/agents/AgentCard";
import { Agent } from "@/types";
import AgentTestDialog from "@/components/agents/AgentTestDialog";
import { Dialog } from "@/components/ui/dialog";

interface AgentsListProps {
  agents: Agent[];
  onViewAgent: (agent: Agent) => void;
  onEditAgent: (agent: Agent) => void;
  onConnectAgent: (agent: Agent) => void;
  onTest: (agent: Agent) => void;
}

export default function AgentsList({ 
  agents, 
  onViewAgent, 
  onEditAgent, 
  onConnectAgent,
  onTest 
}: AgentsListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [testingAgent, setTestingAgent] = useState<Agent | null>(null);
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value.toLowerCase());
  };

  const handleTestAgent = (agent: Agent) => {
    setTestingAgent(agent);
  };

  const filteredAgents = agents.filter(agent => 
    agent.name.toLowerCase().includes(searchTerm) ||
    agent.sector.toLowerCase().includes(searchTerm)
  );

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="relative w-full sm:w-[280px]">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
        <Input
          type="search"
          placeholder="Buscar agentes..."
          className="w-full pl-8 bg-white/80 dark:bg-gray-900/80 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400"
          value={searchTerm}
          onChange={handleSearch}
        />
      </div>

      {filteredAgents.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
          {filteredAgents.map(agent => (
            <AgentCard 
              key={agent.id} 
              agent={agent} 
              onView={onViewAgent}
              onEdit={onEditAgent}
              onConnect={onConnectAgent}
              onTest={onTest}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-48 sm:h-64 text-center px-4">
          <Bot size={48} className="text-gray-400 dark:text-gray-500 mb-4" />
          <p className="text-gray-600 dark:text-gray-300 mb-2 text-sm sm:text-base">
            Nenhum agente encontrado.
          </p>
          {searchTerm && (
            <button 
              className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
              onClick={() => setSearchTerm("")}
            >
              Limpar busca
            </button>
          )}
        </div>
      )}
      
      {/* Dialog for testing agent */}
      {testingAgent && (
        <AgentTestDialog 
          agent={testingAgent}
          isOpen={!!testingAgent}
          onClose={() => setTestingAgent(null)}
        />
      )}
    </div>
  );
}
