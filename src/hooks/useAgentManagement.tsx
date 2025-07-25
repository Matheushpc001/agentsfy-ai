
import { Agent, Customer } from "@/types";
import { useAgentState } from "./useAgentState";
import { useAgentActions } from "./useAgentActions";
import { useAgentSubmission } from "./useAgentSubmission";
import { useEffect } from "react";
import { agentService, customerService } from "@/services/agentService";
import { toast } from "sonner";

export default function useAgentManagement(
  initialAgents: Agent[],
  initialCustomers: Customer[],
  franchiseeId: string
) {
  console.log('useAgentManagement initialized with franchiseeId:', franchiseeId);

  // State management
  const {
    agents,
    customers,
    currentAgent,
    currentCustomer,
    currentCustomerPortal,
    isCreateModalOpen,
    isEditModalOpen,
    isWhatsAppModalOpen,
    isCustomerPortalModalOpen,
    isPlanLimitModalOpen,
    totalAgents,
    connectedAgents,
    setAgents,
    setCustomers,
    setIsCreateModalOpen,
    setIsEditModalOpen,
    setIsWhatsAppModalOpen,
    setIsPlanLimitModalOpen,
    setIsCustomerPortalModalOpen,
    setCurrentAgent,
    setCurrentCustomer,
    setCurrentCustomerPortal,
  } = useAgentState(initialAgents, initialCustomers);

  // Load data from Supabase on mount
  useEffect(() => {
    const loadData = async () => {
      if (!franchiseeId) {
        console.warn('No franchiseeId provided, skipping data load');
        return;
      }

      try {
        console.log('Loading agents and customers for franchisee:', franchiseeId);
        
        const [agentsData, customersData] = await Promise.all([
          agentService.getAgents(franchiseeId),
          customerService.getCustomers(franchiseeId)
        ]);
        
        console.log('Data loaded successfully:', {
          agents: agentsData.length,
          customers: customersData.length
        });
        
        setAgents(agentsData);
        setCustomers(customersData);
      } catch (error) {
        console.error('Error loading data:', error);
        toast.error('Erro ao carregar dados. Verifique sua conexão.');
      }
    };

    loadData();
  }, [franchiseeId, setAgents, setCustomers]);

  // Agent actions
  const {
    handleViewAgent,
    handleEditAgent,
    handleConnectAgent,
    handleTestAgent,
    handleCreateAgentClick,
  } = useAgentActions({
    customers,
    setCurrentAgent,
    setCurrentCustomer,
    setIsEditModalOpen,
    setIsWhatsAppModalOpen,
    setIsCreateModalOpen,
    setIsPlanLimitModalOpen,
  });

  // Agent submission logic
  const {
    handleSubmitAgent,
    handleConnectWhatsApp,
    handleClosePortalModal,
    handleSendCredentialsEmail,
  } = useAgentSubmission({
    agents,
    customers,
    currentAgent,
    franchiseeId,
    isEditModalOpen,
    setAgents,
    setCustomers,
    setCurrentAgent,
    setCurrentCustomer,
    setCurrentCustomerPortal,
    setIsCreateModalOpen,
    setIsEditModalOpen,
    setIsWhatsAppModalOpen,
    setIsCustomerPortalModalOpen,
  });

  // Enhanced create agent click handler
  const handleCreateAgentClickWithLimit = (agentLimit: number) => {
    console.log('Creating agent with limit:', agentLimit, 'Current agents:', agents.length);
    handleCreateAgentClick(agentLimit, agents);
  };

  return {
    agents,
    customers,
    currentAgent,
    currentCustomer,
    currentCustomerPortal,
    isCreateModalOpen,
    isEditModalOpen,
    isWhatsAppModalOpen,
    isCustomerPortalModalOpen,
    isPlanLimitModalOpen,
    totalAgents,
    connectedAgents,
    setIsCreateModalOpen,
    setIsEditModalOpen,
    setIsWhatsAppModalOpen,
    setIsPlanLimitModalOpen,
    setIsCustomerPortalModalOpen,
    setCurrentAgent,
    handleViewAgent,
    handleEditAgent,
    handleConnectAgent,
    handleTestAgent,
    handleCreateAgentClick: handleCreateAgentClickWithLimit,
    handleSubmitAgent,
    handleConnectWhatsApp,
    handleClosePortalModal,
    handleSendCredentialsEmail
  };
}
