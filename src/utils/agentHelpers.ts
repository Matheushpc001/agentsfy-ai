
import { Agent, Customer, CustomerPortalAccess } from "@/types";
import { v4 as uuidv4 } from "uuid";

export function createNewAgent(
  agentData: Partial<Agent>, 
  customerId: string, 
  franchiseeId: string
): Agent {
  const now = new Date().toISOString();
  
  return {
    id: uuidv4(),
    name: agentData.name || "",
    sector: agentData.sector || "",
    prompt: agentData.prompt || "",
    openAiKey: agentData.openAiKey || "",
    enableVoiceRecognition: agentData.enableVoiceRecognition || false,
    knowledgeBase: agentData.knowledgeBase || "",
    customerId: customerId,
    franchiseeId: franchiseeId,
    whatsappConnected: false,
    createdAt: now,
    updatedAt: now,
    status: "active",
    ...agentData
  };
}

export function createNewCustomer(
  customerData: Partial<Customer>, 
  franchiseeId: string
): Customer {
  const now = new Date().toISOString();
  
  return {
    id: uuidv4(),
    businessName: customerData.businessName || "",
    name: customerData.name || "",
    email: customerData.email || "",
    document: customerData.document || "",
    contactPhone: customerData.contactPhone || "",
    franchiseeId: franchiseeId,
    agentCount: 0,
    status: "active",
    createdAt: now,
    updatedAt: now,
    ...customerData
  };
}

export function generateCustomerPortalAccess(customer: Customer): CustomerPortalAccess {
  const now = new Date().toISOString();
  
  return {
    id: uuidv4(),
    customerId: customer.id,
    customerName: customer.name,
    customerEmail: customer.email,
    businessName: customer.businessName,
    accessUrl: `https://portal.exemplo.com/customer/${customer.id}`,
    username: customer.email,
    password: generateRandomPassword(),
    createdAt: now,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 dias
  };
}

function generateRandomPassword(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let password = "";
  for (let i = 0; i < 8; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

export function validateAgentData(agentData: Partial<Agent>): string[] {
  const errors: string[] = [];
  
  if (!agentData.name?.trim()) {
    errors.push("Nome do agente é obrigatório");
  }
  
  if (!agentData.sector?.trim()) {
    errors.push("Setor do agente é obrigatório");
  }
  
  if (!agentData.openAiKey?.trim()) {
    errors.push("Chave da OpenAI é obrigatória");
  } else if (!agentData.openAiKey.startsWith("sk-")) {
    errors.push("Chave da OpenAI deve começar com 'sk-'");
  }
  
  return errors;
}

export function validateCustomerData(customerData: Partial<Customer>): string[] {
  const errors: string[] = [];
  
  if (!customerData.businessName?.trim()) {
    errors.push("Nome da empresa é obrigatório");
  }
  
  if (!customerData.name?.trim()) {
    errors.push("Nome do responsável é obrigatório");
  }
  
  if (!customerData.email?.trim()) {
    errors.push("Email é obrigatório");
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerData.email)) {
      errors.push("Email deve ter formato válido");
    }
  }
  
  return errors;
}
