
import { useState } from "react";
import { Agent, Customer, CustomerPortalAccess } from "@/types";

export function useAgentState(
  initialAgents: Agent[],
  initialCustomers: Customer[]
) {
  const [agents, setAgents] = useState<Agent[]>(initialAgents);
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const [isCustomerPortalModalOpen, setIsCustomerPortalModalOpen] = useState(false);
  const [isPlanLimitModalOpen, setIsPlanLimitModalOpen] = useState(false);
  const [currentAgent, setCurrentAgent] = useState<Agent | null>(null);
  const [currentCustomer, setCurrentCustomer] = useState<Customer | null>(null);
  const [currentCustomerPortal, setCurrentCustomerPortal] = useState<CustomerPortalAccess | null>(null);

  // Calculate stats
  const totalAgents = agents.length;
  const connectedAgents = agents.filter(agent => agent.whatsappConnected).length;

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
  };
}
