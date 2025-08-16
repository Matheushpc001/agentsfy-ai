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
import AgentTestDialog from "./AgentTestDialog"; // Importar o Dialog de Teste
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

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

  const [testingAgent, setTestingAgent] = useState<Agent | null>(null);

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
    handleSendCredentialsEmail,
    handleDeleteAgent, // Importado
    handleRestartAgent, // Importado
  } = useAgentManagement(initialAgents, initialCustomers, franchiseeId);

  const [instanceStatuses, setInstanceStatuses] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchStatuses = async () => {
      const statuses: Record<string, string> = {};
      for (const agent of agents) {
        if (agent.evolution_api_config_id) {
          try {
            const { data, error } = await supabase.functions.invoke('evolution-api-manager', {
              body: { action: 'check_status', config_id: agent.evolution_api_config_id },
            });
            if (error) throw error;
            statuses[agent.id] = data.status;
          } catch (e) {
            statuses[agent.id] = 'error';
            console.error(`Failed to fetch status for agent ${agent.name}:`, e);
          }
        }
      }
      setInstanceStatuses(statuses);
    };

    if (agents.length > 0) {
      fetchStatuses();
      const interval = setInterval(fetchStatuses, 30000); // Atualiza a cada 30 segundos
      return () => clearInterval(interval);
    }
  }, [agents]);

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

  const handleTestAgent = (agent: Agent) => {
    setTestingAgent(agent);
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
                customers={customers}
                instanceStatuses={instanceStatuses}
                onViewAgent={handleViewAgent}
                onEditAgent={handleEditAgent}
                onConnectAgent={handleConnectAgent}
                onTest={handleTestAgent}
                onDeleteAgent={handleDeleteAgent} // Passando a função
                onRestartAgent={handleRestartAgent} // Passando a função
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
