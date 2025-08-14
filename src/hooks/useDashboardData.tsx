
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Analytics, Agent, Message, UserRole } from "@/types";
import { TopFranchisee } from "@/components/analytics/TopFranchiseesCard";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

// Função para buscar analytics reais baseado no papel do usuário
async function fetchRealAnalytics(userRole: UserRole, userId: string): Promise<Analytics> {
  if (userRole === 'admin') {
    // Admin vê dados globais
    const [agentsData, franchiseesData, customersData, messagesData, logsData] = await Promise.all([
      supabase.rpc('admin_safe_agents'),
      supabase.from('profiles').select('id, name, email').eq('role', 'franchisee'),
      supabase.from('customers').select('id').eq('role', 'customer'),
      supabase.from('whatsapp_messages').select('id, created_at').gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
      supabase.from('ai_interaction_logs').select('tokens_used, response_time_ms, created_at').gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
    ]);
    
    return {
      messageCount: messagesData.data?.length || 0,
      activeAgents: agentsData.data?.filter(a => a.is_active).length || 0,
      totalAgents: agentsData.data?.length || 0,
      responseTime: logsData.data?.length ? 
        logsData.data.reduce((acc, log) => acc + (log.response_time_ms || 0), 0) / logsData.data.length / 1000 : 0,
      tokensUsed: logsData.data?.reduce((acc, log) => acc + (log.tokens_used || 0), 0) || 0,
      franchiseeCount: franchiseesData.data?.length || 0,
      customerCount: customersData.data?.length || 0,
      revenue: 0, // Implementar cálculo de receita
      monthlyRevenue: 0 // Implementar cálculo de receita mensal
    };
  } else if (userRole === 'franchisee') {
    // Franchisee vê dados dos seus clientes/agentes
    const [agentsData, customersData, messagesData, logsData] = await Promise.all([
      supabase.from('agents').select('*').eq('franchisee_id', userId),
      supabase.from('customers').select('*').eq('franchisee_id', userId),
      supabase.from('whatsapp_messages').select('id, created_at'),
      supabase.from('ai_interaction_logs').select('tokens_used, response_time_ms')
    ]);
    
    return {
      messageCount: messagesData.data?.length || 0,
      activeAgents: agentsData.data?.filter(a => a.is_active).length || 0,
      totalAgents: agentsData.data?.length || 0,
      responseTime: logsData.data?.length ? 
        logsData.data.reduce((acc, log) => acc + (log.response_time_ms || 0), 0) / logsData.data.length / 1000 : 0,
      tokensUsed: logsData.data?.reduce((acc, log) => acc + (log.tokens_used || 0), 0) || 0,
      customerCount: customersData.data?.length || 0,
      activeCustomers: customersData.data?.length || 0,
      installationRevenue: 0,
      monthlyRevenue: 0
    };
  } else {
    // Customer vê dados dos seus próprios agentes
    const [agentsData, messagesData, logsData] = await Promise.all([
      supabase.from('agents').select('*').eq('customer_id', userId),
      supabase.from('whatsapp_messages').select('id, created_at'),
      supabase.from('ai_interaction_logs').select('tokens_used, response_time_ms')
    ]);
    
    return {
      messageCount: messagesData.data?.length || 0,
      activeAgents: agentsData.data?.filter(a => a.is_active).length || 0,
      totalAgents: agentsData.data?.length || 0,
      responseTime: logsData.data?.length ? 
        logsData.data.reduce((acc, log) => acc + (log.response_time_ms || 0), 0) / logsData.data.length / 1000 : 0,
      tokensUsed: logsData.data?.reduce((acc, log) => acc + (log.tokens_used || 0), 0) || 0
    };
  }
}

// Função para buscar mensagens da semana
async function fetchWeeklyMessages(): Promise<{ day: string; count: number }[]> {
  const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const weeklyData = [];
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const startOfDay = new Date(date.setHours(0, 0, 0, 0)).toISOString();
    const endOfDay = new Date(date.setHours(23, 59, 59, 999)).toISOString();
    
    const { data: messages } = await supabase
      .from('whatsapp_messages')
      .select('id')
      .gte('created_at', startOfDay)
      .lte('created_at', endOfDay);
    
    weeklyData.push({
      day: days[date.getDay()],
      count: messages?.length || 0
    });
  }
  
  return weeklyData;
}

// Função para buscar mensagens recentes
async function fetchRecentMessages(): Promise<Message[]> {
  const { data: messages } = await supabase
    .from('whatsapp_messages')
    .select(`
      id,
      content,
      created_at,
      sender_type,
      is_from_me,
      whatsapp_conversations (
        contact_number,
        agent_id
      )
    `)
    .order('created_at', { ascending: false })
    .limit(10);

  return messages?.map((msg: any) => ({
    id: msg.id,
    sender: msg.is_from_me ? 'Agente IA' : msg.whatsapp_conversations?.contact_number || 'Desconhecido',
    content: msg.content,
    timestamp: msg.created_at,
    agentId: msg.whatsapp_conversations?.agent_id || '',
    isAi: msg.is_from_me
  })) || [];
}

// Dados de fallback para quando não há dados reais
const FALLBACK_MESSAGES: Message[] = [{
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

// Função para buscar agentes baseado no papel do usuário
async function fetchTopAgents(userRole: UserRole, userId: string): Promise<Agent[]> {
  let query = supabase.from('agents').select('*');
  
  if (userRole === 'franchisee') {
    query = query.eq('franchisee_id', userId);
  } else if (userRole === 'customer') {
    query = query.eq('customer_id', userId);
  }
  
  const { data: agents } = await query
    .order('message_count', { ascending: false })
    .limit(3);

  return agents?.map((agent: any) => ({
    id: agent.id,
    name: agent.name,
    sector: agent.sector,
    prompt: agent.prompt,
    isActive: agent.is_active,
    createdAt: agent.created_at,
    customerId: agent.customer_id,
    franchiseeId: agent.franchisee_id,
    openAiKey: agent.open_ai_key,
    whatsappConnected: agent.whatsapp_connected,
    messageCount: agent.message_count || 0,
    phoneNumber: agent.phone_number,
    responseTime: agent.response_time || 0,
    demoUrl: agent.demo_url
  })) || [];
}

// Dados de fallback
const FALLBACK_AGENTS: Agent[] = [{
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

// Função para buscar top franchisees (apenas admin)
async function fetchTopFranchisees(): Promise<TopFranchisee[]> {
  const { data: franchisees } = await supabase
    .rpc('get_franchisees_details')
    .order('revenue', { ascending: false })
    .limit(5);

  return franchisees?.map((franchisee: any) => ({
    id: franchisee.id,
    name: franchisee.name,
    revenue: franchisee.revenue || 0,
    agentCount: franchisee.agent_count || 0,
    isActive: franchisee.is_active
  })) || [];
}

// Dados de fallback
const FALLBACK_TOP_FRANCHISEES: TopFranchisee[] = [
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


export function useDashboardData() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [recentMessages, setRecentMessages] = useState<Message[]>([]);
  const [topAgents, setTopAgents] = useState<Agent[]>([]);
  const [topFranchisees, setTopFranchisees] = useState<TopFranchisee[]>([]);
  const [weeklyMessages, setWeeklyMessages] = useState<{ day: string; count: number }[]>([]);
  const [isLoadingResults, setIsLoadingResults] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  useEffect(() => {
    if (user) {
      console.log("Dashboard: Loading initial data for user:", user.role);
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    if (!user) return;
    
    try {
      setIsInitialLoading(true);
      
      // Carregar analytics
      const analyticsData = await fetchRealAnalytics(user.role, user.id);
      setAnalytics(analyticsData);
      
      // Carregar mensagens recentes
      const messages = await fetchRecentMessages();
      setRecentMessages(messages.length > 0 ? messages : FALLBACK_MESSAGES);
      
      // Carregar top agentes
      const agents = await fetchTopAgents(user.role, user.id);
      setTopAgents(agents.length > 0 ? agents : FALLBACK_AGENTS.slice(0, 3));
      
      // Carregar dados semanais
      const weekly = await fetchWeeklyMessages();
      setWeeklyMessages(weekly);
      
      // Carregar top franchisees se for admin
      if (user.role === "admin") {
        const franchisees = await fetchTopFranchisees();
        setTopFranchisees(franchisees.length > 0 ? franchisees : FALLBACK_TOP_FRANCHISEES);
      }
      
      console.log("Dashboard: Initial load complete");
    } catch (error) {
      console.error("Dashboard: Error loading data:", error);
      // Usar dados de fallback em caso de erro
      setRecentMessages(FALLBACK_MESSAGES);
      setTopAgents(FALLBACK_AGENTS.slice(0, 3));
      if (user.role === "admin") {
        setTopFranchisees(FALLBACK_TOP_FRANCHISEES);
      }
    } finally {
      setIsInitialLoading(false);
    }
  };

  const handleRefreshResults = async () => {
    if (isLoadingResults || !user) return;
    
    console.log("Dashboard: Starting refresh");
    setIsLoadingResults(true);
    
    try {
      // Recarregar todos os dados reais
      await loadDashboardData();
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
