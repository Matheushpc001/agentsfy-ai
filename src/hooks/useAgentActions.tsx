
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
    
    // Enhanced notification with more context
    toast.info(
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
          <p className="font-medium">Configuração WhatsApp Necessária</p>
        </div>
        <p className="text-sm text-muted-foreground">
          O agente <strong>{agent.name}</strong> precisa ser conectado ao WhatsApp para funcionar corretamente.
        </p>
        <p className="text-xs text-muted-foreground">
          Cliente: {customer?.businessName || 'N/A'}
        </p>
      </div>,
      {
        duration: 5000,
      }
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
