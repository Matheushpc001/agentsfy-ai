// ARQUIVO FINAL CORRIGIDO: supabase/functions/create-lesson-category/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

console.log("🚀 Função create-lesson-category v3.0 iniciada");

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Função para verificar se o usuário é admin
async function isUserAdmin(supabaseAdmin: SupabaseClient, userId: string): Promise<boolean> {
  console.log(`Verificando se o usuário ${userId} é admin via RPC 'is_admin'`);
  
  // Note que o nome do parâmetro deve corresponder exatamente ao da sua função SQL.
  // Se sua função espera 'p_user_id', use aqui. Se espera 'user_id', use 'user_id'.
  const { data: isAdmin, error: rpcError } = await supabaseAdmin.rpc('is_admin', { 
    user_id: userId 
  });

  if (rpcError) {
    console.error("Erro ao chamar a RPC is_admin:", rpcError.message);
    throw new Error(`Erro ao verificar permissões: ${rpcError.message}`);
  }
  
  console.log(`Resultado da verificação de admin: ${isAdmin}`);
  return isAdmin === true;
}

serve(async (req) => {
  console.log(`Recebida requisição com método: ${req.method}`);
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error("Cabeçalho de autorização ausente");
    }

    const supabaseUserClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user } } = await supabaseUserClient.auth.getUser();
    if (!user) {
      throw new Error("Usuário não autenticado");
    }
    console.log("Usuário autenticado:", { id: user.id, email: user.email });

    // Verificação de Admin
    const hasAdminRole = await isUserAdmin(supabaseAdmin, user.id);
    if (!hasAdminRole) {
      console.error("Acesso negado. Usuário não é administrador.");
      return new Response(JSON.stringify({ error: "Acesso negado. Apenas administradores podem criar categorias." }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 403, // Forbidden
      });
    }

    console.log("Processando corpo da requisição (JSON)");
    const categoryData = await req.json();
    console.log("Dados da categoria recebidos:", categoryData);

    if (!categoryData.name || typeof categoryData.name !== 'string' || categoryData.name.trim() === '') {
      throw new Error("O nome da categoria é obrigatório.");
    }

    console.log("Inserindo categoria no banco de dados...");
    const { data, error: insertError } = await supabaseAdmin
      .from('lesson_categories')
      .insert(categoryData)
      .select()
      .single();

    if (insertError) {
      console.error("Erro ao inserir no Supabase:", insertError.message);
      throw insertError;
    }

    console.log("Categoria criada com sucesso:", data);
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 201, // Created
    });

  } catch (error) {
    console.error("Erro capturado no bloco catch principal:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: error.message.includes("autentica") || error.message.includes("Acesso negado") ? 403 : 
              error.message.includes("obrigatório") ? 400 : 500,
    });
  }
});