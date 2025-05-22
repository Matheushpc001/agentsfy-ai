
import { Agent, Customer, CustomerPortalAccess } from "@/types";

// Mock data for the current franchisee with plan info
export const MOCK_FRANCHISEE = {
  id: "franchisee1",
  name: "João Silva",
  email: "joao@exemplo.com",
  role: "franchisee" as const,
  agentCount: 2,
  revenue: 1500,
  isActive: true,
  createdAt: "2023-01-15",
  customerCount: 5,
  planId: "starter-monthly",
  planType: "monthly" as const,
  planExpiresAt: "2023-12-31"
};

// Mock agents data
export const MOCK_AGENTS: Agent[] = [
  {
    id: "agent1",
    name: "Atendente Virtual",
    sector: "Atendimento ao Cliente",
    prompt: "Você é um atendente virtual especializado em responder dúvidas sobre produtos e serviços da empresa.",
    isActive: true,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    customerId: "customer1",
    franchiseeId: "franchisee1",
    openAiKey: "sk-xxxxxxxxxxxxxxxxxxxx",
    whatsappConnected: true,
    messageCount: 2540,
    phoneNumber: "+5511999999999",
    responseTime: 2.3,
    demoUrl: "https://demo.whatsapp.com/agent1"
  },
  {
    id: "agent2",
    name: "Vendedor Virtual",
    sector: "Vendas",
    prompt: "Você é um vendedor virtual especializado em oferecer produtos e serviços da empresa.",
    isActive: true,
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    customerId: "customer2",
    franchiseeId: "franchisee1",
    openAiKey: "sk-xxxxxxxxxxxxxxxxxxxx",
    whatsappConnected: true,
    messageCount: 1820,
    phoneNumber: "+5511888888888",
    responseTime: 1.8,
    demoUrl: "https://demo.whatsapp.com/agent2"
  }
];

// Mock customers data
export const MOCK_CUSTOMERS: Customer[] = [
  {
    id: "customer1",
    name: "Cliente Empresa A",
    email: "contato@empresaa.com",
    businessName: "Empresa A",
    role: "customer",
    franchiseeId: "franchisee1",
    agentCount: 2,
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    logo: "https://ui-avatars.com/api/?name=Empresa+A&background=0D8ABC&color=fff",
    document: "12.345.678/0001-90",
    contactPhone: "+5511977777777",
    portalUrl: "https://cliente.plataforma.com/customer1"
  },
  {
    id: "customer2",
    name: "Cliente Empresa B",
    email: "contato@empresab.com",
    businessName: "Empresa B",
    role: "customer",
    franchiseeId: "franchisee1",
    agentCount: 1,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    document: "98.765.432/0001-21",
    contactPhone: "+5511966666666"
  }
];
