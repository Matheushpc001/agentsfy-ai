
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
    <div className="space-y-6">
      <div className="relative w-full sm:w-[250px]">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Buscar agentes..."
          className="w-full pl-8"
          value={searchTerm}
          onChange={handleSearch}
        />
      </div>

      {filteredAgents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
        <div className="flex flex-col items-center justify-center h-64">
          <Bot size={48} className="text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground mb-2">Nenhum agente encontrado.</p>
          {searchTerm && (
            <button 
              className="text-primary hover:underline"
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
