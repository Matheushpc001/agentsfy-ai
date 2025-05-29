
import { Agent, Customer } from "@/types";
import { toast } from "sonner";

interface UseAgentActionsProps {
  customers: Customer[];
  setCurrentAgent: (agent: Agent | null) => void;
  setCurrentCustomer: (customer: Customer | null) => void;
  setIsEditModalOpen: (open: boolean) => void;
  setIsWhatsAppModalOpen: (open: boolean) => void;
  setIsCreateModalOpen: (open: boolean) => void;
  setIsPlanLimitModalOpen: (open: boolean) => void;
}

export function useAgentActions({
  customers,
  setCurrentAgent,
  setCurrentCustomer,
  setIsEditModalOpen,
  setIsWhatsAppModalOpen,
  setIsCreateModalOpen,
  setIsPlanLimitModalOpen,
}: UseAgentActionsProps) {
  const handleViewAgent = (agent: Agent) => {
    toast.info(`Visualizando estatísticas do agente ${agent.name}`);
  };

  const handleEditAgent = (agent: Agent) => {
    setCurrentAgent(agent);
    setIsEditModalOpen(true);
  };

  const handleConnectAgent = (agent: Agent) => {
    setCurrentAgent(agent);
    // Find associated customer
    const customer = customers.find(c => c.id === agent.customerId);
    if (customer) {
      setCurrentCustomer(customer);
    }
    setIsWhatsAppModalOpen(true);
    
    // Show notification
    toast.info(
      <div className="flex flex-col gap-1">
        <p className="font-medium">Conectar WhatsApp</p>
        <p className="text-sm">Agente {agent.name} precisa ser conectado ao WhatsApp</p>
      </div>
    );
  };
  
  const handleTestAgent = (agent: Agent) => {
    setCurrentAgent(agent);
  };

  const handleCreateAgentClick = (agentLimit: number, agents: Agent[]) => {
    if (agents.length >= agentLimit) {
      setIsPlanLimitModalOpen(true);
    } else {
      setIsCreateModalOpen(true);
    }
  };

  return {
    handleViewAgent,
    handleEditAgent,
    handleConnectAgent,
    handleTestAgent,
    handleCreateAgentClick,
  };
}
