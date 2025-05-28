import { Agent, Customer } from "@/types";
import { Prompt } from "@/types/prompts";
import { getPlanById } from "@/constants/plans";
import AgentsList from "@/components/agents/AgentsList";
import AgentHeader from "@/components/agents/AgentHeader";
import AgentModals from "@/components/agents/AgentModals";
import useAgentManagement from "@/hooks/useAgentManagement";
import usePromptManagement from "@/hooks/usePromptManagement";
import { MOCK_FRANCHISEE } from "@/mocks/franchiseeMockData";
import { useState } from "react";

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
  
  // State to store the selected prompt for an agent
  const [selectedPromptForAgent, setSelectedPromptForAgent] = useState<Prompt | null>(null);
  
  // Prompts management
  const {
    prompts,
    isPromptModalOpen,
    isEditPromptModalOpen,
    currentPrompt,
    setIsPromptModalOpen,
    setIsEditPromptModalOpen,
    setCurrentPrompt,
    createPrompt,
    updatePrompt,
    deletePrompt,
    getAllNiches,
    openPromptModal,
    openEditPromptModal
  } = usePromptManagement();
  
  // Agent management
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
    setCurrentAgent,
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
  
  // State for prompts library modal
  const [isPromptsLibraryModalOpen, setIsPromptsLibraryModalOpen] = useState(false);
  
  // Handle prompt library modal
  const handleOpenPromptsLibrary = () => {
    setIsPromptsLibraryModalOpen(true);
  };
  
  // Handle prompt selection for agent
  const handleSelectPromptForAgent = (prompt: Prompt) => {
    setSelectedPromptForAgent(prompt);
    // Reopen the create/edit agent modal
    setTimeout(() => {
      if (!isCreateModalOpen && !isEditModalOpen) {
        setIsCreateModalOpen(true);
      }
    }, 100);
  };

  // Convert billing cycle from "annual" to "yearly" to match expected type
  const billingCycle = currentPlan?.billingCycle === 'annual' ? 'yearly' : 'monthly';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8 space-y-8 max-w-7xl">
        {/* Header with enhanced styling */}
        <AgentHeader
          totalAgents={totalAgents}
          agentLimit={agentLimit}
          connectedAgents={connectedAgents}
          planName={currentPlan?.name || 'Plano Básico'}
          billingCycle={billingCycle}
          onCreateClick={() => handleCreateAgentClick(agentLimit)}
          onManagePromptsClick={handleOpenPromptsLibrary}
        />

        {/* Agents list with better spacing */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <AgentsList 
            agents={agents} 
            onViewAgent={handleViewAgent}
            onEditAgent={handleEditAgent}
            onConnectAgent={handleConnectAgent}
            onTest={handleTestAgent}
          />
        </div>

        {/* Modals */}
        <AgentModals
          isCreateModalOpen={isCreateModalOpen}
          isEditModalOpen={isEditModalOpen}
          isWhatsAppModalOpen={isWhatsAppModalOpen}
          isCustomerPortalModalOpen={isCustomerPortalModalOpen}
          isPlanLimitModalOpen={isPlanLimitModalOpen}
          isPromptModalOpen={isPromptModalOpen}
          isPromptsLibraryModalOpen={isPromptsLibraryModalOpen}
          currentAgent={currentAgent}
          currentCustomer={currentCustomer}
          currentCustomerPortal={currentCustomerPortal}
          currentPrompt={currentPrompt}
          customers={customers}
          prompts={prompts}
          agentLimit={agentLimit}
          allNiches={getAllNiches()}
          onCloseCreateModal={() => setIsCreateModalOpen(false)}
          onCloseEditModal={() => {
            setIsEditModalOpen(false);
            setCurrentAgent(null);
          }}
          onCloseWhatsAppModal={() => setIsWhatsAppModalOpen(false)}
          onCloseCustomerPortalModal={handleClosePortalModal}
          onClosePlanLimitModal={() => setIsPlanLimitModalOpen(false)}
          onClosePromptModal={() => setIsPromptModalOpen(false)}
          onClosePromptsLibraryModal={() => setIsPromptsLibraryModalOpen(false)}
          onSubmitAgent={handleSubmitAgent}
          onConnectWhatsApp={handleConnectWhatsApp}
          onSendEmail={handleSendCredentialsEmail}
          onSubmitPrompt={(promptData) => {
            if (currentPrompt) {
              updatePrompt(currentPrompt.id, promptData);
            } else {
              createPrompt(promptData);
            }
            setIsPromptModalOpen(false);
          }}
          onSelectPrompt={handleSelectPromptForAgent}
          onEditPrompt={(prompt) => {
            setCurrentPrompt(prompt);
            setIsPromptsLibraryModalOpen(false);
            setIsPromptModalOpen(true);
          }}
          onDeletePrompt={deletePrompt}
          onCreatePrompt={() => {
            setCurrentPrompt(null);
            setIsPromptsLibraryModalOpen(false);
            setIsPromptModalOpen(true);
          }}
          selectedPromptForAgent={selectedPromptForAgent}
        />
      </div>
    </div>
  );
}
