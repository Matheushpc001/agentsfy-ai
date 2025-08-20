// supabase/functions/create-lesson-category/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

console.log("🚀 Função create-lesson-category iniciada");

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log(`Recebida requisição com método: ${req.method}`);
  if (req.method === 'OPTIONS') {
    console.log("Tratando requisição OPTIONS (preflight)");
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Criando cliente Supabase Admin");
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    console.log("Verificando autorização do usuário");
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
        console.error("Cabeçalho de autorização ausente");
        throw new Error("Cabeçalho de autorização ausente");
    }
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError) {
        console.error("Erro ao obter usuário:", userError);
        throw new Error(`Erro de autenticação: ${userError.message}`);
    }
    if (!user) {
        console.error("Usuário não autenticado");
        throw new Error("Usuário não autenticado");
    }
    console.log("Usuário autenticado:", { id: user.id, email: user.email });

    console.log(`Verificando se o usuário ${user.id} é admin`);
    const { data: isAdminData, error: isAdminError } = await supabaseAdmin.rpc('is_admin', { p_user_id: user.id });

    if (isAdminError) {
        console.error("Erro ao chamar a RPC is_admin:", isAdminError);
        throw new Error(`Erro ao verificar permissões: ${isAdminError.message}`);
    }
    console.log("Resultado da verificação de admin:", isAdminData);
    if (!isAdminData) {
        console.error("Acesso negado. Usuário não é administrador.");
        throw new Error("Acesso negado. Apenas administradores podem criar categorias.");
    }

    console.log("Processando corpo da requisição (JSON)");
    const categoryData = await req.json();
    console.log("Dados da categoria recebidos:", categoryData);

    if (!categoryData.name) {
      console.error("Validação falhou: nome da categoria é obrigatório");
      throw new Error("O nome da categoria é obrigatório.");
    }

    console.log("Inserindo categoria no banco de dados");
    const { data, error } = await supabaseAdmin
      .from('lesson_categories')
      .insert(categoryData)
      .select()
      .single();

    if (error) {
      console.error("Erro ao inserir no Supabase:", error);
      throw error;
    }

    console.log("Categoria criada com sucesso:", data);
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 201, // Created
    });

  } catch (error) {
    console.error("Erro capturado no bloco catch principal:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: error.message.includes("Acesso negado") ? 403 : 500,
    });
  }
});