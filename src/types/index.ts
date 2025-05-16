
import { ReactNode } from "react";

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
  planId?: string; // Reference to the plan
  planType?: "monthly" | "annual";
  planExpiresAt?: string;
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
  description?: string;
  price: number;
  billingCycle: "monthly" | "annual";
  agentLimit: number;
  features?: string[];
  recommended?: boolean;
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
  activeCustomers?: number;
  revenue?: number;
  monthlyRevenue?: number;
  installationRevenue?: number;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

// Interface for Sidebar navigation items
export interface NavItem {
  label: string;
  icon: React.ComponentType<any>; // Changed from ReactNode to ComponentType
  href: string;
}

// Interfaces for WhatsApp connections (Evolution API)
export interface WhatsAppConnection {
  id: string;
  name: string;
  phoneNumber: string;
  customerId: string;
  customerName: string;
  status: "connected" | "disconnected" | "pending";
  lastActive: string;
  messageCount: number;
}

export interface WhatsAppSession {
  id: string;
  connectionId: string;
  sessionName: string;
  jwt?: string;
  qrCode?: string;
  state: "CONNECTING" | "CONNECTED" | "DISCONNECTED" | "TIMEOUT" | "CONFLICT";
  createdAt: string;
  updatedAt: string;
}

// Interface para configuração do agente de IA
export interface AIAgentConfig {
  id: string;
  name: string;
  instructions: string;
  openAIApiKey?: string;
  enableVoice: boolean;
  voiceModel?: string;
  personalityType: "informative" | "friendly" | "professional" | "creative";
  knowledgeBase?: string;
  maxResponseTokens: number;
  temperature: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
  avgResponseTime: number;
  associatedWhatsAppId?: string;
}

// Interface para configurações de voz com Eleven Labs
export interface ElevenLabsVoiceConfig {
  voiceId: string;
  modelId: string;
  stability: number;
  similarityBoost: number;
  style: number;
  speakerBoost: boolean;
}

export interface ElevenLabsVoice {
  id: string;
  name: string;
  preview_url: string;
  category: string;
  description?: string;
  labels?: Record<string, string>;
}
