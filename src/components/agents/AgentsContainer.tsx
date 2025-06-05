import { Agent, Customer } from "@/types";
import AgentHeader from "./AgentHeader";
import AgentStats from "./AgentStats";
import AgentsList from "./AgentsList";
import AgentModals from "./AgentModals";
import PlanInfoCard from "./PlanInfoCard";
import useAgentManagement from "@/hooks/useAgentManagement";
import usePromptManagement from "@/hooks/usePromptManagement";
import EvolutionIntegration from "@/components/evolution/EvolutionIntegration";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface AgentsContainerProps {
  initialAgents: Agent[];
  initialCustomers: Customer[];
  franchiseeId: string;
}

export default function AgentsContainer({ 
  initialAgents, 
  initialCustomers, 
  franchiseeId 
}: AgentsContainerProps) {
  const agentLimit = 5; // This would come from the user's plan
  const planName = "Profissional";
  const billingCycle = "monthly" as const;

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
    handleCreateAgentClick,
    handleSubmitAgent,
    handleConnectWhatsApp,
    handleClosePortalModal,
    handleSendCredentialsEmail
  } = useAgentManagement(initialAgents, initialCustomers, franchiseeId);

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
  } = usePromptManagement();

  // Handler for testing agents
  const handleTestAgent = (agent: Agent) => {
    console.log("Testing agent:", agent.name);
    // This would open a test dialog or similar functionality
  };

  const handleCreateAgentWithLimit = () => {
    handleCreateAgentClick(agentLimit);
  };

  const handleManagePrompts = () => {
    setIsPromptsManagementModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <AgentHeader 
        totalAgents={totalAgents}
        agentLimit={agentLimit}
        connectedAgents={connectedAgents}
        planName={planName}
        billingCycle={billingCycle}
        onCreateClick={handleCreateAgentWithLimit}
        onManagePromptsClick={handleManagePrompts}
      />

      <Tabs defaultValue="traditional" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="traditional">Agentes Tradicionais</TabsTrigger>
          <TabsTrigger value="evolution">Integração EvolutionAPI</TabsTrigger>
        </TabsList>

        <TabsContent value="traditional" className="space-y-6">
          <AgentStats 
            totalAgents={totalAgents}
            connectedAgents={connectedAgents}
            agentLimit={agentLimit}
          />

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3">
              <AgentsList
                agents={agents}
                onViewAgent={handleViewAgent}
                onEditAgent={handleEditAgent}
                onConnectAgent={handleConnectAgent}
                onTest={handleTestAgent}
              />
            </div>
            
            <div className="space-y-6">
              <PlanInfoCard 
                planName={planName}
                billingCycle={billingCycle}
                agentsUsed={totalAgents}
                agentLimit={agentLimit}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="evolution" className="space-y-6">
          <EvolutionIntegration franchiseeId={franchiseeId} />
        </TabsContent>
      </Tabs>

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
  );
}
