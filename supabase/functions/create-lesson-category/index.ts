// ARQUIVO FINAL E ROBUSTO: supabase/functions/create-lesson-category/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

console.log("🚀 Função create-lesson-category v4.0 (robusta) iniciada");

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
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
      throw { status: 401, message: "Cabeçalho de autorização ausente" };
    }

    const supabaseUserClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user } } = await supabaseUserClient.auth.getUser();
    if (!user) {
      throw { status: 401, message: "Usuário não autenticado" };
    }
    console.log("Usuário autenticado:", { id: user.id, email: user.email });

    const { data: isAdmin, error: rpcError } = await supabaseAdmin.rpc('is_admin', { user_id: user.id });
    if (rpcError) throw rpcError;
    
    if (!isAdmin) {
      console.error("Acesso negado. Usuário não é administrador.");
      throw { status: 403, message: "Acesso negado. Apenas administradores podem criar categorias." };
    }
    console.log("Permissão de administrador confirmada.");

    const categoryData = await req.json();
    console.log("Dados da categoria recebidos:", categoryData);
    if (!categoryData.name || String(categoryData.name).trim() === '') {
      throw { status: 400, message: "O nome da categoria é obrigatório." };
    }

    console.log("Inserindo categoria no banco de dados...");
    const { data, error: insertError } = await supabaseAdmin
      .from('lesson_categories')
      .insert(categoryData)
      .select()
      .single();

    if (insertError) {
      console.error("Erro do Supabase ao inserir:", insertError);
      // Lança o erro do Supabase para ser capturado pelo catch principal
      throw { status: 500, message: `Erro no banco de dados: ${insertError.message}` };
    }

    console.log("Categoria criada com sucesso:", data);
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 201, // Created
    });

  } catch (error) {
    // Bloco catch aprimorado para lidar com qualquer tipo de erro
    const errorMessage = error.message || "Ocorreu um erro inesperado.";
    const errorStatus = error.status || 500;
    
    console.error(`Erro capturado no bloco catch principal (Status: ${errorStatus}):`, errorMessage);
    console.error("Detalhes do erro:", error); // Loga o objeto de erro completo

    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: errorStatus,
    });
  }
});