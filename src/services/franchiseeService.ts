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
  
  async updateFranchisee(id: string, data: { name: string; email: string; isActive: boolean }): Promise<void> {
    console.log('Atualizando franqueado:', id, data);

    const { error } = await supabase
      .from('profiles')
      .update({
        name: data.name,
        email: data.email,
        is_active: data.isActive,
      })
      .eq('id', id);

    if (error) {
      console.error('Erro ao atualizar franqueado:', error);
      toast.error('Erro ao atualizar franqueado no banco de dados.');
      throw new Error(error.message);
    }

    console.log('Franqueado atualizado com sucesso!');
  },

  async deleteFranchisee(id: string): Promise<void> {
    console.log('Excluindo franqueado:', id);

    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erro ao excluir franqueado:', error);
      toast.error('Erro ao excluir franqueado do banco de dados.');
      throw new Error(error.message);
    }

    console.log('Franqueado excluído com sucesso!');
  },
};