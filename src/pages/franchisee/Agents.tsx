// ARQUIVO MODIFICADO: src/pages/franchisee/Agents.tsx

import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuthCheck } from "@/hooks/useAuthCheck";
import { Navigate } from "react-router-dom";
import { Agent, Customer } from "@/types";
import AgentHeader from "@/components/agents/AgentHeader";
import AgentsList from "@/components/agents/AgentsList";
import AgentModals from "@/components/agents/AgentModals";
import PlanInfoCard from "@/components/agents/PlanInfoCard";
import useAgentManagement from "@/hooks/useAgentManagement";
import usePromptManagement from "@/hooks/usePromptManagement";
import { Skeleton } from "@/components/ui/skeleton";

export default function Agents() {
  const { user, loading } = useAuthCheck();

  // Hooks de gerenciamento de estado e lógica
  const agentManagement = useAgentManagement([], [], user?.id || "");
  const promptManagement = usePromptManagement();

  // Mock de plano - substitua com dados reais do usuário
  const agentLimit = 5;
  const planName = "Profissional";
  const billingCycle = "monthly" as const;

  if (loading) {
    return (
      <DashboardLayout title="Agentes">
        <Skeleton className="w-full h-64" />
      </DashboardLayout>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Desestruturando os retornos dos hooks para clareza
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
    handleCreateAgentClick,
    handleSubmitAgent,
    handleConnectWhatsApp,
    handleClosePortalModal,
    handleSendCredentialsEmail,
  } = agentManagement;

  const {
    prompts,
    currentPrompt,
    isPromptModalOpen,
    isPromptsLibraryModalOpen,
    isPromptsManagementModalOpen,
    selectedPromptForAgent,
    allNiches,
    setIsPromptModalOpen,
    setIsPromptsLibraryModalOpen,
    setIsPromptsManagementModalOpen,
    handleSubmitPrompt,
    handleSelectPrompt,
    handleEditPrompt,
    handleDeletePrompt,
    handleCreatePrompt,
  } = promptManagement;

  return (
    <DashboardLayout title="Agentes de IA">
      <div className="space-y-6">
        <AgentHeader 
          totalAgents={totalAgents}
          agentLimit={agentLimit}
          connectedAgents={connectedAgents}
          planName={planName}
          billingCycle={billingCycle}
          onCreateClick={() => handleCreateAgentClick(agentLimit)}
          onManagePromptsClick={() => setIsPromptsManagementModalOpen(true)}
        />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <AgentsList
              agents={agents}
              onViewAgent={handleViewAgent}
              onEditAgent={handleEditAgent}
              onConnectAgent={handleConnectAgent}
              onTest={(agent) => console.log("Testar agente:", agent.id)}
            />
          </div>
          
          <div className="space-y-6">
            <PlanInfoCard 
              planName={planName}
              billingCycle={billingCycle}
              agentsUsed={totalAgents}
              agentLimit={agentLimit}
              compact
            />
          </div>
        </div>

        <AgentModals
          isCreateModalOpen={isCreateModalOpen}
          isEditModalOpen={isEditModalOpen}
          isWhatsAppModalOpen={isWhatsAppModalOpen}
          isCustomerPortalModalOpen={isCustomerPortalModalOpen}
          isPlanLimitModalOpen={isPlanLimitModalOpen}
          isPromptModalOpen={isPromptModalOpen}
          isPromptsLibraryModalOpen={isPromptsLibraryModalOpen}
          isPromptsManagementModalOpen={isPromptsManagementModalOpen}
          currentAgent={currentAgent}
          currentCustomer={currentCustomer}
          currentCustomerPortal={currentCustomerPortal}
          currentPrompt={currentPrompt}
          customers={customers}
          prompts={prompts}
          agentLimit={agentLimit}
          allNiches={allNiches}
          onCloseCreateModal={() => setIsCreateModalOpen(false)}
          onCloseEditModal={() => setIsEditModalOpen(false)}
          onCloseWhatsAppModal={() => setIsWhatsAppModalOpen(false)}
          onCloseCustomerPortalModal={handleClosePortalModal}
          onClosePlanLimitModal={() => setIsPlanLimitModalOpen(false)}
          onClosePromptModal={() => setIsPromptModalOpen(false)}
          onClosePromptsLibraryModal={() => setIsPromptsLibraryModalOpen(false)}
          onClosePromptsManagementModal={() => setIsPromptsManagementModalOpen(false)}
          onSubmitAgent={handleSubmitAgent}
          onConnectWhatsApp={handleConnectWhatsApp}
          onSendEmail={handleSendCredentialsEmail}
          onSubmitPrompt={handleSubmitPrompt}
          onSelectPrompt={handleSelectPrompt}
          onEditPrompt={handleEditPrompt}
          onDeletePrompt={handleDeletePrompt}
          onCreatePrompt={handleCreatePrompt}
          selectedPromptForAgent={selectedPromptForAgent}
        />
      </div>
    </DashboardLayout>
  );
}