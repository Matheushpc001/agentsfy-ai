//supabase/functions/delete-customer/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('[DELETE-CUSTOMER] Início do processo.');

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { customerId } = await req.json();
    console.log(`[DELETE-CUSTOMER] Recebido pedido para excluir cliente ID: ${customerId}`);

    if (!customerId) {
      console.error('[DELETE-CUSTOMER] Erro: ID do cliente não fornecido.');
      return new Response(JSON.stringify({ error: 'ID do cliente é obrigatório.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    // Etapa 1: Excluir o usuário do Supabase Auth
    console.log(`[DELETE-CUSTOMER] Etapa 1: Excluindo usuário ${customerId} do Supabase Auth.`);
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(customerId);

    if (authError) {
      // Se o usuário não for encontrado no Auth, podemos considerar isso um sucesso parcial e continuar
      if (authError.message.includes('User not found')) {
        console.warn(`[DELETE-CUSTOMER] Usuário ${customerId} não encontrado no Auth, mas continuando para excluir da tabela.`);
      } else {
        console.error(`[DELETE-CUSTOMER] Erro ao excluir usuário ${customerId} do Auth:`, authError.message);
        throw authError;
      }
    }
    console.log(`[DELETE-CUSTOMER] Usuário ${customerId} excluído do Auth com sucesso.`);

    // Etapa 2: Excluir o cliente da tabela 'customers'
    console.log(`[DELETE-CUSTOMER] Etapa 2: Excluindo cliente ${customerId} da tabela 'customers'.`);
    const { error: dbError } = await supabaseAdmin
      .from('customers')
      .delete()
      .eq('id', customerId);

    if (dbError) {
      console.error(`[DELETE-CUSTOMER] Erro ao excluir cliente ${customerId} da tabela:`, dbError.message);
      throw dbError;
    }
    console.log(`[DELETE-CUSTOMER] Cliente ${customerId} excluído da tabela 'customers' com sucesso.`);

    console.log('[DELETE-CUSTOMER] Processo concluído com sucesso.');

    return new Response(JSON.stringify({ message: 'Cliente excluído com sucesso.' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('[DELETE-CUSTOMER] Erro fatal no processo:', error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
