// ARQUIVO CORRIGIDO: supabase/functions/create-lesson-category/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

console.log("🚀 Função create-lesson-category v2.0 iniciada");

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
    // 1. Criar cliente Supabase com a chave de administrador (service_role)
    console.log("Criando cliente Supabase Admin");
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // 2. Obter o usuário a partir do token JWT da requisição
    console.log("Verificando autorização do usuário");
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error("Cabeçalho de autorização ausente");
      throw new Error("Cabeçalho de autorização ausente");
    }
    
    // Criar um cliente temporário para validar o JWT do usuário
    const supabaseUserClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabaseUserClient.auth.getUser();

    if (userError) {
      console.error("Erro ao obter usuário:", userError.message);
      throw new Error(`Erro de autenticação: ${userError.message}`);
    }
    if (!user) {
      console.error("Usuário não autenticado");
      throw new Error("Usuário não autenticado");
    }
    console.log("Usuário autenticado:", { id: user.id, email: user.email });

    // 3. Verificar se o usuário tem a role 'admin' usando a função RPC
    console.log(`Verificando se o usuário ${user.id} é admin via RPC 'is_admin'`);
    const { data: isAdmin, error: isAdminError } = await supabaseAdmin.rpc('is_admin', { user_id: user.id });

    if (isAdminError) {
      console.error("Erro ao chamar a RPC is_admin:", isAdminError);
      throw new Error(`Erro ao verificar permissões: ${isAdminError.message}`);
    }
    
    console.log(`Resultado da verificação de admin: ${isAdmin}`);

    // ========================================================================
    // --- CORREÇÃO PRINCIPAL APLICADA AQUI ---
    // A função RPC `is_admin` retorna um booleano (true/false).
    // A verificação deve ser diretamente sobre esse valor.
    // ========================================================================
    if (!isAdmin) {
      console.error("Acesso negado. Usuário não é administrador.");
      return new Response(JSON.stringify({ error: "Acesso negado. Apenas administradores podem criar categorias." }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 403, // Forbidden
      });
    }

    // 4. Processar o corpo da requisição
    console.log("Processando corpo da requisição (JSON)");
    const categoryData = await req.json();
    console.log("Dados da categoria recebidos:", categoryData);

    if (!categoryData.name || typeof categoryData.name !== 'string' || categoryData.name.trim() === '') {
      console.error("Validação falhou: nome da categoria é obrigatório e não pode ser vazio");
      throw new Error("O nome da categoria é obrigatório.");
    }

    // 5. Inserir a nova categoria no banco de dados
    console.log("Inserindo categoria no banco de dados");
    const { data, error: insertError } = await supabaseAdmin
      .from('lesson_categories')
      .insert(categoryData)
      .select()
      .single();

    if (insertError) {
      // MELHORIA DE LOG: Loga o erro de forma mais detalhada
      console.error("Erro ao inserir no Supabase:", insertError.message);
      throw insertError;
    }

    console.log("Categoria criada com sucesso:", data);
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 201, // Created
    });

  } catch (error) {
    // MELHORIA DE LOG: Loga a mensagem do erro, que é mais informativa
    console.error("Erro capturado no bloco catch principal:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      // Ajusta o status code com base no tipo de erro
      status: error.message.includes("autentica") || error.message.includes("Acesso negado") ? 403 : 
              error.message.includes("obrigatório") ? 400 : 500,
    });
  }
});