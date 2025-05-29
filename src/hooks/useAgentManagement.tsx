
import { Agent, Customer } from "@/types";
import { useAgentState } from "./useAgentState";
import { useAgentActions } from "./useAgentActions";
import { useAgentSubmission } from "./useAgentSubmission";

export default function useAgentManagement(
  initialAgents: Agent[],
  initialCustomers: Customer[],
  franchiseeId: string
) {
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
