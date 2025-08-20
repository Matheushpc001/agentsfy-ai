// src/services/franchiseeService.ts

import { supabase } from "@/integrations/supabase/client";
import { Franchisee } from "@/types";
import { toast } from "sonner";

// Mapeia os dados do RPC para o tipo Franchisee do frontend.
// Esta função permanece a mesma, pois é para leitura de dados.
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
  /**
   * Busca os detalhes dos franqueados de forma segura usando uma função RPC.
   * Esta função é segura para ser chamada do cliente.
   */
  async getFranchisees(): Promise<Franchisee[]> {
    const { data, error } = await supabase.rpc('get_franchisees_details');

    if (error) {
      console.error("Erro ao buscar franqueados:", error);
      toast.error("Não foi possível carregar os franqueados.");
      throw new Error(error.message);
    }
    return (data || []).map(mapFranchiseeFromDB);
  },

  /**
   * Cria um novo franqueado invocando uma Edge Function segura.
   * A função lida com a criação do usuário no Auth e no Profiles.
   */
  async createFranchisee(data: { name: string; email: string }): Promise<void> {
    const { error } = await supabase.functions.invoke('create-franchisee', {
      body: data,
    });

    if (error) {
      // Tenta extrair a mensagem de erro específica da resposta da função
      const errorBody = await error.context.json();
      throw new Error(errorBody.error || 'Falha ao criar franqueado via Edge Function.');
    }
  },
  
  /**
   * Atualiza os dados de um franqueado invocando uma Edge Function segura.
   * O email não é atualizado para manter a consistência com o `auth.users`.
   */
  async updateFranchisee(id: string, data: { name: string; isActive: boolean }): Promise<void> {
    const { error } = await supabase.functions.invoke('update-franchisee', {
      body: { franchiseeId: id, franchiseeData: data },
    });

    if (error) {
      const errorBody = await error.context.json();
      throw new Error(errorBody.error || 'Falha ao atualizar franqueado via Edge Function.');
    }
  },

  /**
   * A exclusão de um franqueado é uma operação destrutiva e complexa.
   * Ela deve ser implementada em uma Edge Function dedicada que remove o usuário do
   * `auth.users`, `profiles`, `user_roles` e lida com os dados relacionados (clientes, agentes).
   */
  async deleteFranchisee(id: string): Promise<void> {
    toast.warning(`A exclusão segura para o franqueado ${id} precisa ser implementada.`, {
      description: "Esta ação requer uma Edge Function para garantir a remoção completa e segura dos dados.",
    });
    console.warn("A função deleteFranchisee precisa invocar uma Edge Function dedicada.");
    // Exemplo de como a chamada seria:
    // const { error } = await supabase.functions.invoke('delete-franchisee', { body: { franchiseeId: id } });
    // if (error) throw new Error(...)
  },
};