// supabase/functions/update-customer/index.ts

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
    console.log('[UPDATE-CUSTOMER] Início do processo.');
    
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { customerId, customerData } = await req.json();
    console.log(`[UPDATE-CUSTOMER] Recebido pedido para atualizar cliente ID: ${customerId}`);
    console.log('[UPDATE-CUSTOMER] Dados para atualização:', JSON.stringify(customerData, null, 2));

    if (!customerId || !customerData) {
      console.error('[UPDATE-CUSTOMER] Erro: ID do cliente ou dados para atualização não fornecidos.');
      return new Response(JSON.stringify({ error: 'Dados insuficientes para atualizar o cliente.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    // O email não deve ser alterado por esta função para manter a consistência com o Auth.
    if (customerData.email) {
        delete customerData.email;
        console.log('[UPDATE-CUSTOMER] Campo de e-mail removido dos dados de atualização por segurança.');
    }

    const { data: updatedCustomer, error } = await supabaseAdmin
      .from('customers')
      .update(customerData)
      .eq('id', customerId)
      .select()
      .single();

    if (error) {
      console.error(`[UPDATE-CUSTOMER] Erro ao atualizar cliente ${customerId} no banco de dados:`, error.message);
      throw error;
    }

    console.log(`[UPDATE-CUSTOMER] Cliente ${customerId} atualizado com sucesso.`);
    console.log('[UPDATE-CUSTOMER] Processo concluído.');

    return new Response(JSON.stringify({ customer: updatedCustomer }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('[UPDATE-CUSTOMER] Erro fatal no processo:', error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
