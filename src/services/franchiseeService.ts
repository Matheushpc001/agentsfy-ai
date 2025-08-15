// src/services/franchiseeService.ts

import { supabase } from "@/integrations/supabase/client";
import { Franchisee } from "@/types";
import { toast } from "sonner";

// Mapeia os dados do RPC para o tipo Franchisee do frontend
const mapFranchiseeFromDB = (dbFranchisee: any): Franchisee => ({
  id: dbFranchisee.id,
  name: dbFranchisee.name,
  email: dbFranchisee.email,
  role: 'franchisee',
  agentCount: dbFranchisee.agent_count || 0,
  customerCount: dbFranchisee.customer_count || 0,
  revenue: dbFranchisee.revenue || 0,
  isActive: dbFranchisee.is_active,
  createdAt: dbFranchisee.created_at,
});

export const franchiseeService = {
  async getFranchisees(): Promise<Franchisee[]> {
    console.log('Buscando franqueados do banco de dados...');

    const { data, error } = await supabase.rpc('get_franchisees_details');

    if (error) {
      console.error("Erro ao buscar franqueados:", error);
      toast.error("Não foi possível carregar os franqueados. Verifique o console.");
      throw new Error(error.message);
    }

    // ### CORREÇÃO APLICADA AQUI ###
    // Garante que sempre retornamos um array, mesmo se 'data' for null.
    return (data || []).map(mapFranchiseeFromDB);
  },
  
  // Aqui adicionar outras funções como create, update, delete...
};