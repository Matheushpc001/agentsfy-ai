
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Analytics, Agent, Message, UserRole } from "@/types";
import { TopFranchisee } from "@/components/analytics/TopFranchiseesCard";

// Mock data for demonstration
const MOCK_ANALYTICS: Record<UserRole, Analytics> = {
  admin: {
    messageCount: 12548,
    activeAgents: 42,
    totalAgents: 50,
    responseTime: 2.4,
    tokensUsed: 1458962,
    franchiseeCount: 8,
    customerCount: 24,
    revenue: 11980.50,
    monthlyRevenue: 45600.75
  },
  franchisee: {
    messageCount: 3245,
    activeAgents: 8,
    totalAgents: 10,
    responseTime: 2.1,
    tokensUsed: 387429,
    customerCount: 5,
    activeCustomers: 4,
    installationRevenue: 2500.00,
    monthlyRevenue: 4800.50
  },
  customer: {
    messageCount: 876,
    activeAgents: 2,
    totalAgents: 2,
    responseTime: 1.9,
    tokensUsed: 98421
  }
};

const MOCK_WEEKLY_MESSAGES = [
  { day: "Dom", count: 345 },
  { day: "Seg", count: 456 },
  { day: "Ter", count: 523 },
  { day: "Qua", count: 578 },
  { day: "Qui", count: 498 },
  { day: "Sex", count: 467 },
  { day: "Sáb", count: 389 }
];

const MOCK_MESSAGES: Message[] = [{
  id: "1",
  sender: "+5511999999999",
  content: "Olá, gostaria de saber mais sobre os serviços oferecidos.",
  timestamp: new Date(Date.now() - 25 * 60000).toISOString(),
  agentId: "agent1",
  isAi: false
}, {
  id: "2",
  sender: "Agente IA",
  content: "Olá! Claro, posso ajudar. Nossa empresa oferece diversos serviços incluindo consultoria, desenvolvimento de software e suporte técnico. Em qual serviço você tem interesse?",
  timestamp: new Date(Date.now() - 24 * 60000).toISOString(),
  agentId: "agent1",
  isAi: true
}, {
  id: "3",
  sender: "+5511999999999",
  content: "Estou interessado em desenvolvimento de software. Vocês desenvolvem aplicativos para iOS?",
  timestamp: new Date(Date.now() - 10 * 60000).toISOString(),
  agentId: "agent1",
  isAi: false
}, {
  id: "4",
  sender: "Agente IA",
  content: "Sim, desenvolvemos aplicativos para iOS, Android e também web apps. Posso explicar nossas metodologias de desenvolvimento, prazos e orçamentos. Você já tem alguma ideia específica para o aplicativo que gostaria de desenvolver?",
  timestamp: new Date(Date.now() - 9 * 60000).toISOString(),
  agentId: "agent1",
  isAi: true
}, {
  id: "5",
  sender: "+5511999999999",
  content: "Tenho sim. Preciso de um app para gerenciar meu pequeno negócio.",
  timestamp: new Date(Date.now() - 2 * 60000).toISOString(),
  agentId: "agent1",
  isAi: false
}];

const MOCK_AGENTS: Agent[] = [{
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
  messageCount: 450,
  phoneNumber: "+5511999999999",
  responseTime: 2.3,
  demoUrl: "https://demo.whatsapp.com/agent1"
}, {
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
  messageCount: 230,
  phoneNumber: "+5511888888888",
  responseTime: 1.8,
  demoUrl: "https://demo.whatsapp.com/agent2"
}];

const MOCK_TOP_FRANCHISEES: TopFranchisee[] = [
  {
    id: "franchisee1",
    name: "João Silva",
    revenue: 45600.75,
    agentCount: 12,
    isActive: true
  },
  {
    id: "franchisee2",
    name: "Márcia Oliveira",
    revenue: 38750.30,
    agentCount: 9,
    isActive: true
  },
  {
    id: "franchisee3",
    name: "Roberto Santos",
    revenue: 32340.20,
    agentCount: 8,
    isActive: true
  },
  {
    id: "franchisee4",
    name: "Ana Costa",
    revenue: 28970.35,
    agentCount: 6,
    isActive: false
  },
  {
    id: "franchisee5",
    name: "Carlos Ferreira",
    revenue: 25600.75,
    agentCount: 5,
    isActive: true
  }
];

// Function to generate random variations for mock data
const generateRandomVariation = (baseValue: number, variationPercent: number = 0.1) => {
  const variation = baseValue * variationPercent;
  return baseValue + (Math.random() - 0.5) * 2 * variation;
};

export function useDashboardData() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [recentMessages, setRecentMessages] = useState<Message[]>([]);
  const [topAgents, setTopAgents] = useState<Agent[]>([]);
  const [topFranchisees, setTopFranchisees] = useState<TopFranchisee[]>([]);
  const [weeklyMessages, setWeeklyMessages] = useState(MOCK_WEEKLY_MESSAGES);
  const [isLoadingResults, setIsLoadingResults] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  useEffect(() => {
    if (user) {
      console.log("Dashboard: Loading initial data for user:", user.role);
      
      setTimeout(() => {
        setAnalytics(MOCK_ANALYTICS[user.role]);
        setRecentMessages(MOCK_MESSAGES);
        setTopAgents(MOCK_AGENTS.slice(0, 3));
        
        if (user.role === "admin") {
          setTopFranchisees(MOCK_TOP_FRANCHISEES);
        }
        
        setIsInitialLoading(false);
        console.log("Dashboard: Initial load complete");
      }, 100);
    }
  }, [user]);

  const handleRefreshResults = async () => {
    if (isLoadingResults || !user) return;
    
    console.log("Dashboard: Starting refresh");
    setIsLoadingResults(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const updatedAnalytics = { ...MOCK_ANALYTICS[user.role] };
      
      updatedAnalytics.messageCount = Math.max(1000, Math.floor(generateRandomVariation(updatedAnalytics.messageCount, 0.08)));
      updatedAnalytics.activeAgents = Math.max(1, Math.floor(generateRandomVariation(updatedAnalytics.activeAgents, 0.1)));
      updatedAnalytics.responseTime = Math.max(1, parseFloat(generateRandomVariation(updatedAnalytics.responseTime, 0.15).toFixed(1)));
      updatedAnalytics.tokensUsed = Math.max(10000, Math.floor(generateRandomVariation(updatedAnalytics.tokensUsed, 0.12)));
      
      if (user.role === "admin") {
        updatedAnalytics.monthlyRevenue = Math.max(20000, generateRandomVariation(updatedAnalytics.monthlyRevenue || 0, 0.1));
        updatedAnalytics.franchiseeCount = Math.max(1, Math.floor(generateRandomVariation(updatedAnalytics.franchiseeCount || 0, 0.15)));
        updatedAnalytics.customerCount = Math.max(1, Math.floor(generateRandomVariation(updatedAnalytics.customerCount || 0, 0.12)));
        setTopFranchisees(MOCK_TOP_FRANCHISEES.map(franchisee => ({
          ...franchisee,
          revenue: Math.max(10000, generateRandomVariation(franchisee.revenue, 0.12)),
          agentCount: Math.max(1, Math.floor(generateRandomVariation(franchisee.agentCount, 0.2)))
        })));
      } else if (user.role === "franchisee") {
        updatedAnalytics.installationRevenue = Math.max(1000, generateRandomVariation(updatedAnalytics.installationRevenue || 0, 0.15));
        updatedAnalytics.monthlyRevenue = Math.max(2000, generateRandomVariation(updatedAnalytics.monthlyRevenue || 0, 0.1));
        updatedAnalytics.customerCount = Math.max(1, Math.floor(generateRandomVariation(updatedAnalytics.customerCount || 0, 0.2)));
        updatedAnalytics.activeCustomers = Math.min(updatedAnalytics.customerCount || 0, Math.max(1, Math.floor(generateRandomVariation(updatedAnalytics.activeCustomers || 0, 0.15))));
        setTopAgents(MOCK_AGENTS.map(agent => ({
          ...agent,
          messageCount: Math.max(50, Math.floor(generateRandomVariation(agent.messageCount, 0.2))),
          responseTime: Math.max(1, parseFloat(generateRandomVariation(agent.responseTime, 0.15).toFixed(1)))
        })).slice(0, 3));
      }
      
      setWeeklyMessages(MOCK_WEEKLY_MESSAGES.map(item => ({
        ...item,
        count: Math.max(100, Math.floor(generateRandomVariation(item.count, 0.15)))
      })));
      
      const updatedMessages = MOCK_MESSAGES.map(msg => ({
        ...msg,
        timestamp: new Date(Date.now() - Math.random() * 60 * 60000).toISOString()
      }));
      setRecentMessages(updatedMessages);
      
      setAnalytics(updatedAnalytics);
      console.log("Dashboard: Refresh complete");
    } catch (error) {
      console.error("Dashboard: Refresh error:", error);
    } finally {
      setIsLoadingResults(false);
    }
  };

  return {
    analytics,
    recentMessages,
    topAgents,
    topFranchisees,
    weeklyMessages,
    isLoadingResults,
    isInitialLoading,
    handleRefreshResults
  };
}
