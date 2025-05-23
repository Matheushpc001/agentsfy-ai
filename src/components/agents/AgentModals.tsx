
import { Agent, Customer, CustomerPortalAccess } from "@/types";
import CreateAgentModal from "@/components/agents/CreateAgentModal";
import WhatsAppConnectionModal from "@/components/agents/WhatsAppConnectionModal";
import CustomerPortalModal from "@/components/agents/CustomerPortalModal";
import PlanLimitModal from "@/components/agents/PlanLimitModal";

interface AgentModalsProps {
  isCreateModalOpen: boolean;
  isEditModalOpen: boolean;
  isWhatsAppModalOpen: boolean;
  isCustomerPortalModalOpen: boolean;
  isPlanLimitModalOpen: boolean;
  currentAgent: Agent | null;
  currentCustomer: Customer | null;
  currentCustomerPortal: CustomerPortalAccess | null;
  customers: Customer[];
  agentLimit: number;
  onCloseCreateModal: () => void;
  onCloseEditModal: () => void;
  onCloseWhatsAppModal: () => void;
  onCloseCustomerPortalModal: () => void;
  onClosePlanLimitModal: () => void;
  onSubmitAgent: (agentData: Partial<Agent>, customerData?: Partial<Customer>, isNewCustomer?: boolean) => void;
  onConnectWhatsApp: () => void;
  onSendEmail: () => void;
}

export default function AgentModals({
  isCreateModalOpen,
  isEditModalOpen,
  isWhatsAppModalOpen,
  isCustomerPortalModalOpen,
  isPlanLimitModalOpen,
  currentAgent,
  currentCustomer,
  currentCustomerPortal,
  customers,
  agentLimit,
  onCloseCreateModal,
  onCloseEditModal,
  onCloseWhatsAppModal,
  onCloseCustomerPortalModal,
  onClosePlanLimitModal,
  onSubmitAgent,
  onConnectWhatsApp,
  onSendEmail
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
    </>
  );
}
