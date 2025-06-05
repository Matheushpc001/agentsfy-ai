
import { supabase } from "@/integrations/supabase/client";
import { Agent, Customer } from "@/types";

export interface CreateAgentRequest {
  name: string;
  sector: string;
  prompt?: string;
  open_ai_key: string;
  enable_voice_recognition?: boolean;
  knowledge_base?: string;
  customer_id: string;
  phone_number?: string;
}

export interface CreateCustomerRequest {
  business_name: string;
  name: string;
  email: string;
  document?: string;
  contact_phone?: string;
}

export const agentService = {
  async createAgent(agentData: CreateAgentRequest, franchiseeId: string): Promise<Agent> {
    const { data, error } = await supabase
      .from('agents')
      .insert({
        name: agentData.name,
        sector: agentData.sector,
        prompt: agentData.prompt || '',
        open_ai_key: agentData.open_ai_key,
        enable_voice_recognition: agentData.enable_voice_recognition || false,
        knowledge_base: agentData.knowledge_base || '',
        customer_id: agentData.customer_id,
        franchisee_id: franchiseeId,
        phone_number: agentData.phone_number || '',
        whatsapp_connected: false,
        is_active: true,
        message_count: 0,
        response_time: 0
      })
      .select('*')
      .single();

    if (error) {
      console.error('Error creating agent:', error);
      throw new Error(`Failed to create agent: ${error.message}`);
    }

    // Update customer agent count
    await supabase
      .from('customers')
      .update({ agent_count: supabase.sql`agent_count + 1` })
      .eq('id', agentData.customer_id);

    return this.mapAgentFromDB(data);
  },

  async updateAgent(agentId: string, updates: Partial<CreateAgentRequest>): Promise<Agent> {
    const { data, error } = await supabase
      .from('agents')
      .update({
        name: updates.name,
        sector: updates.sector,
        prompt: updates.prompt,
        open_ai_key: updates.open_ai_key,
        enable_voice_recognition: updates.enable_voice_recognition,
        knowledge_base: updates.knowledge_base,
        phone_number: updates.phone_number
      })
      .eq('id', agentId)
      .select('*')
      .single();

    if (error) {
      console.error('Error updating agent:', error);
      throw new Error(`Failed to update agent: ${error.message}`);
    }

    return this.mapAgentFromDB(data);
  },

  async getAgents(franchiseeId: string): Promise<Agent[]> {
    const { data, error } = await supabase
      .from('agents')
      .select('*')
      .eq('franchisee_id', franchiseeId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching agents:', error);
      throw new Error(`Failed to fetch agents: ${error.message}`);
    }

    return data.map(this.mapAgentFromDB);
  },

  async updateAgentWhatsAppStatus(agentId: string, connected: boolean): Promise<void> {
    const { error } = await supabase
      .from('agents')
      .update({ whatsapp_connected: connected })
      .eq('id', agentId);

    if (error) {
      console.error('Error updating WhatsApp status:', error);
      throw new Error(`Failed to update WhatsApp status: ${error.message}`);
    }
  },

  mapAgentFromDB(dbAgent: any): Agent {
    return {
      id: dbAgent.id,
      name: dbAgent.name,
      sector: dbAgent.sector,
      prompt: dbAgent.prompt || '',
      openAiKey: dbAgent.open_ai_key,
      enableVoiceRecognition: dbAgent.enable_voice_recognition,
      knowledgeBase: dbAgent.knowledge_base || '',
      customerId: dbAgent.customer_id,
      franchiseeId: dbAgent.franchisee_id,
      whatsappConnected: dbAgent.whatsapp_connected,
      createdAt: dbAgent.created_at,
      isActive: dbAgent.is_active,
      messageCount: dbAgent.message_count,
      responseTime: dbAgent.response_time,
      phoneNumber: dbAgent.phone_number,
      demoUrl: dbAgent.demo_url
    };
  }
};

export const customerService = {
  async createCustomer(customerData: CreateCustomerRequest, franchiseeId: string): Promise<Customer> {
    const { data, error } = await supabase
      .from('customers')
      .insert({
        business_name: customerData.business_name,
        name: customerData.name,
        email: customerData.email,
        document: customerData.document || '',
        contact_phone: customerData.contact_phone || '',
        franchisee_id: franchiseeId,
        agent_count: 0,
        role: 'customer'
      })
      .select('*')
      .single();

    if (error) {
      console.error('Error creating customer:', error);
      throw new Error(`Failed to create customer: ${error.message}`);
    }

    return this.mapCustomerFromDB(data);
  },

  async getCustomers(franchiseeId: string): Promise<Customer[]> {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('franchisee_id', franchiseeId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching customers:', error);
      throw new Error(`Failed to fetch customers: ${error.message}`);
    }

    return data.map(this.mapCustomerFromDB);
  },

  mapCustomerFromDB(dbCustomer: any): Customer {
    return {
      id: dbCustomer.id,
      businessName: dbCustomer.business_name,
      name: dbCustomer.name,
      email: dbCustomer.email,
      document: dbCustomer.document,
      contactPhone: dbCustomer.contact_phone,
      franchiseeId: dbCustomer.franchisee_id,
      agentCount: dbCustomer.agent_count,
      createdAt: dbCustomer.created_at,
      role: dbCustomer.role as "customer",
      logo: dbCustomer.logo,
      portalUrl: dbCustomer.portal_url
    };
  }
};
