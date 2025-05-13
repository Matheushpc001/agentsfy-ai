
export type UserRole = "admin" | "franchisee" | "customer";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface Admin extends User {
  role: "admin";
}

export interface Franchisee extends User {
  role: "franchisee";
  agentCount: number;
  revenue: number;
  isActive: boolean;
  createdAt: string;
  customerCount: number;
}

export interface Customer extends User {
  role: "customer";
  businessName: string;
  logo?: string;
  franchiseeId: string;
  agentCount: number;
  createdAt: string;
}

export interface Agent {
  id: string;
  name: string;
  sector: string;
  prompt: string;
  isActive: boolean;
  createdAt: string;
  customerId: string;
  franchiseeId: string;
  openAiKey: string;
  whatsappConnected: boolean;
  qrCode?: string;
  messageCount: number;
  phoneNumber?: string;
  responseTime: number;
  demoUrl?: string;
}

export interface Plan {
  id: string;
  name: string;
  price: number;
  included_agents: number;
  extra_agent_price: number;
}

export interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: string;
  agentId: string;
  isAi: boolean;
}

export interface Analytics {
  messageCount: number;
  activeAgents: number;
  totalAgents: number;
  responseTime: number;
  tokensUsed: number;
  franchiseeCount?: number;
  customerCount?: number;
  revenue?: number;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}
