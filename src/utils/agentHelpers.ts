
import { Agent, Customer, CustomerPortalAccess } from "@/types";

export const generateRandomId = () => `id${Math.floor(Math.random() * 10000)}`;
export const generateRandomPassword = () => Math.random().toString(36).slice(-8);

export const createNewCustomer = (customerData: Partial<Customer>, franchiseeId: string): Customer => {
  return {
    id: `customer${Date.now()}`,
    name: customerData.name || "",
    email: customerData.email || "",
    businessName: customerData.businessName || "",
    role: "customer",
    franchiseeId: franchiseeId,
    agentCount: 1,
    createdAt: new Date().toISOString(),
    document: customerData.document,
    contactPhone: customerData.contactPhone,
    portalUrl: `https://cliente.plataforma.com/c/${generateRandomId()}`,
    password: generateRandomPassword()
  };
};

export const createNewAgent = (
  agentData: Partial<Agent>,
  customerId: string,
  franchiseeId: string
): Agent => {
  return {
    id: `agent${Date.now()}`,
    name: agentData.name!,
    sector: agentData.sector!,
    prompt: agentData.prompt || "",
    isActive: true,
    createdAt: new Date().toISOString(),
    customerId: customerId,
    franchiseeId: franchiseeId,
    openAiKey: agentData.openAiKey!,
    whatsappConnected: false,
    messageCount: 0,
    responseTime: 0
  };
};

export const generateCustomerPortalAccess = (customer: Customer): CustomerPortalAccess => {
  return {
    url: customer.portalUrl || `https://cliente.plataforma.com/c/${customer.id}`,
    username: customer.email,
    password: customer.password || generateRandomPassword(),
    customerId: customer.id,
  };
};
