
import { Agent, Customer, CustomerPortalAccess } from "@/types";
import { Prompt } from "@/types/prompts";
import CreateAgentModal from "@/components/agents/CreateAgentModal";
import WhatsAppConnectionModal from "@/components/agents/WhatsAppConnectionModal";
import CustomerPortalModal from "@/components/agents/CustomerPortalModal";
import PlanLimitModal from "@/components/agents/PlanLimitModal";
import PromptModal from "@/components/agents/PromptModal";
import PromptsLibraryModal from "@/components/agents/PromptsLibraryModal";

interface AgentModalsProps {
  isCreateModalOpen: boolean;
  isEditModalOpen: boolean;
  isWhatsAppModalOpen: boolean;
  isCustomerPortalModalOpen: boolean;
  isPlanLimitModalOpen: boolean;
  isPromptModalOpen: boolean;
  isPromptsLibraryModalOpen: boolean;
  currentAgent: Agent | null;
  currentCustomer: Customer | null;
  currentCustomerPortal: CustomerPortalAccess | null;
  currentPrompt: Prompt | null;
  customers: Customer[];
  prompts: Prompt[];
  agentLimit: number;
  allNiches: string[];
  onCloseCreateModal: () => void;
  onCloseEditModal: () => void;
  onCloseWhatsAppModal: () => void;
  onCloseCustomerPortalModal: () => void;
  onClosePlanLimitModal: () => void;
  onClosePromptModal: () => void;
  onClosePromptsLibraryModal: () => void;
  onSubmitAgent: (agentData: Partial<Agent>, customerData?: Partial<Customer>, isNewCustomer?: boolean) => void;
  onConnectWhatsApp: () => void;
  onSendEmail: () => void;
  onSubmitPrompt: (promptData: Omit<Prompt, 'id' | 'createdAt'>) => void;
  onSelectPrompt: (prompt: Prompt) => void;
  onEditPrompt: (prompt: Prompt) => void;
  onDeletePrompt: (id: string) => void;
  onCreatePrompt: () => void;
  selectedPromptForAgent: Prompt | null;
}

export default function AgentModals({
  isCreateModalOpen,
  isEditModalOpen,
  isWhatsAppModalOpen,
  isCustomerPortalModalOpen,
  isPlanLimitModalOpen,
  isPromptModalOpen,
  isPromptsLibraryModalOpen,
  currentAgent,
  currentCustomer,
  currentCustomerPortal,
  currentPrompt,
  customers,
  prompts,
  agentLimit,
  allNiches,
  onCloseCreateModal,
  onCloseEditModal,
  onCloseWhatsAppModal,
  onCloseCustomerPortalModal,
  onClosePlanLimitModal,
  onClosePromptModal,
  onClosePromptsLibraryModal,
  onSubmitAgent,
  onConnectWhatsApp,
  onSendEmail,
  onSubmitPrompt,
  onSelectPrompt,
  onEditPrompt,
  onDeletePrompt,
  onCreatePrompt,
  selectedPromptForAgent
}: AgentModalsProps) {
  return (
    <>
      <CreateAgentModal
        open={isCreateModalOpen || isEditModalOpen}
        onClose={() => {
          isCreateModalOpen ? onCloseCreateModal() : onCloseEditModal();
        }}
        onSubmit={onSubmitAgent}
        editing={isEditModalOpen ? currentAgent! : undefined}
        existingCustomers={customers}
        prompts={prompts}
        selectedPrompt={selectedPromptForAgent}
        onOpenPromptsLibrary={() => {
          if (isCreateModalOpen) {
            onCloseCreateModal();
          } else if (isEditModalOpen) {
            onCloseEditModal();
          }
        }}
      />

      <WhatsAppConnectionModal
        isOpen={isWhatsAppModalOpen}
        onClose={onCloseWhatsAppModal}
        onConnect={onConnectWhatsApp}
        agent={currentAgent}
        customer={currentCustomer}
      />

      <CustomerPortalModal
        isOpen={isCustomerPortalModalOpen}
        onClose={onCloseCustomerPortalModal}
        portalAccess={currentCustomerPortal}
        onSendEmail={onSendEmail}
      />

      <PlanLimitModal
        isOpen={isPlanLimitModalOpen}
        onClose={onClosePlanLimitModal}
        agentLimit={agentLimit}
      />

      <PromptModal
        isOpen={isPromptModalOpen}
        onClose={onClosePromptModal}
        onSubmit={onSubmitPrompt}
        editing={currentPrompt}
        allNiches={allNiches}
      />

      <PromptsLibraryModal
        isOpen={isPromptsLibraryModalOpen}
        onClose={onClosePromptsLibraryModal}
        prompts={prompts}
        onSelect={onSelectPrompt}
        onEdit={onEditPrompt}
        onDelete={onDeletePrompt}
        onCreateNew={onCreatePrompt}
        niches={allNiches}
      />
    </>
  );
}
