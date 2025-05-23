
import { Agent, Customer } from "@/types";
import { getPlanById } from "@/constants/plans";
import AgentsList from "@/components/agents/AgentsList";
import AgentHeader from "@/components/agents/AgentHeader";
import AgentModals from "@/components/agents/AgentModals";
import useAgentManagement from "@/hooks/useAgentManagement";
import { MOCK_FRANCHISEE } from "@/mocks/franchiseeMockData";

interface AgentsContainerProps {
  initialAgents: Agent[];
  initialCustomers: Customer[];
}

export default function AgentsContainer({ 
  initialAgents, 
  initialCustomers 
}: AgentsContainerProps) {
  // Get current plan details from the franchisee data
  const currentPlanId = MOCK_FRANCHISEE.planId;
  const currentPlan = currentPlanId ? getPlanById(currentPlanId) : null;
  const agentLimit = currentPlan?.agentLimit || 3; // Default to 3 if no plan is found
  
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
    setIsCreateModalOpen,
    setIsEditModalOpen,
    setIsWhatsAppModalOpen,
    setIsPlanLimitModalOpen,
    setIsCustomerPortalModalOpen,
    handleViewAgent,
    handleEditAgent,
    handleConnectAgent,
    handleTestAgent,
    handleCreateAgentClick,
    handleSubmitAgent,
    handleConnectWhatsApp,
    handleClosePortalModal,
    handleSendCredentialsEmail
  } = useAgentManagement(initialAgents, initialCustomers, MOCK_FRANCHISEE.id);

  return (
    <div className="space-y-6">
      {/* Header with stats, action buttons and plan info */}
      <AgentHeader
        totalAgents={totalAgents}
        agentLimit={agentLimit}
        connectedAgents={connectedAgents}
        planName={currentPlan?.name || 'Plano Básico'}
        billingCycle={currentPlan?.billingCycle || 'monthly'}
        onCreateClick={() => handleCreateAgentClick(agentLimit)}
      />

      {/* Agents list */}
      <AgentsList 
        agents={agents} 
        onViewAgent={handleViewAgent}
        onEditAgent={handleEditAgent}
        onConnectAgent={handleConnectAgent}
        onTest={handleTestAgent}
      />

      {/* Modals */}
      <AgentModals
        isCreateModalOpen={isCreateModalOpen}
        isEditModalOpen={isEditModalOpen}
        isWhatsAppModalOpen={isWhatsAppModalOpen}
        isCustomerPortalModalOpen={isCustomerPortalModalOpen}
        isPlanLimitModalOpen={isPlanLimitModalOpen}
        currentAgent={currentAgent}
        currentCustomer={currentCustomer}
        currentCustomerPortal={currentCustomerPortal}
        customers={customers}
        agentLimit={agentLimit}
        onCloseCreateModal={() => setIsCreateModalOpen(false)}
        onCloseEditModal={() => {
          setIsEditModalOpen(false);
          setCurrentAgent(null);
        }}
        onCloseWhatsAppModal={() => setIsWhatsAppModalOpen(false)}
        onCloseCustomerPortalModal={handleClosePortalModal}
        onClosePlanLimitModal={() => setIsPlanLimitModalOpen(false)}
        onSubmitAgent={handleSubmitAgent}
        onConnectWhatsApp={handleConnectWhatsApp}
        onSendEmail={handleSendCredentialsEmail}
      />
    </div>
  );
}
