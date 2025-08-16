
import { useState } from "react";
import { Bot, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import AgentCard from "@/components/agents/AgentCard";
import { Agent, Customer } from "@/types";
import AgentTestDialog from "@/components/agents/AgentTestDialog";

interface AgentsListProps {
  agents: Agent[];
  customers: Customer[];
  instanceStatuses: Record<string, string>;
  onViewAgent: (agent: Agent) => void;
  onEditAgent: (agent: Agent) => void;
  onConnectAgent: (agent: Agent) => void;
  onTest: (agent: Agent) => void;
  onDeleteAgent: (agent: Agent) => void;
  onRestartAgent: (agent: Agent) => void;
}

export default function AgentsList({ 
  agents, 
  customers,
  instanceStatuses,
  onViewAgent, 
  onEditAgent, 
  onConnectAgent,
  onTest,
  onDeleteAgent,
  onRestartAgent
}: AgentsListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [testingAgent, setTestingAgent] = useState<Agent | null>(null);
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value.toLowerCase());
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
          {filteredAgents.map(agent => {
            const customerName = customers.find(c => c.id === agent.customerId)?.business_name;
            return (
              <AgentCard 
                key={agent.id} 
                agent={agent} 
                customerName={customerName}
                instanceStatus={instanceStatuses[agent.id]}
                onView={onViewAgent}
                onEdit={onEditAgent}
                onConnect={onConnectAgent}
                onTest={onTest}
                onDelete={onDeleteAgent}
                onRestart={onRestartAgent}
              />
            );
          })}
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
