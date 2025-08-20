// Edge Function para deletar categorias de aulas
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

console.log("🗑️ Função delete-lesson-category iniciada");

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

    // Verificar se é admin
    const { data: isAdmin, error: rpcError } = await supabaseAdmin.rpc('is_admin', { user_id: user.id });
    if (rpcError) throw rpcError;
    
    if (!isAdmin) {
      throw { status: 403, message: "Acesso negado. Apenas administradores podem deletar categorias." };
    }

    // Obter category_id do body
    const { categoryId } = await req.json();
    
    if (!categoryId) {
      throw { status: 400, message: "ID da categoria é obrigatório" };
    }

    console.log("Deletando categoria:", categoryId);

    // Verificar se a categoria tem aulas associadas
    const { data: lessonsCount, error: countError } = await supabaseAdmin
      .from('lessons')
      .select('id', { count: 'exact', head: true })
      .eq('category_id', categoryId);

    if (countError) {
      console.error("Erro ao verificar aulas:", countError);
      throw { status: 500, message: `Erro ao verificar aulas: ${countError.message}` };
    }

    // Se tem aulas, não pode deletar
    if (lessonsCount && lessonsCount.length > 0) {
      throw { status: 400, message: "Não é possível deletar categoria que possui aulas. Delete as aulas primeiro." };
    }

    // Deletar categoria
    const { data, error: deleteError } = await supabaseAdmin
      .from('lesson_categories')
      .delete()
      .eq('id', categoryId)
      .select()
      .single();

    if (deleteError) {
      console.error("Erro ao deletar categoria:", deleteError);
      const errorMessage = deleteError.message || deleteError.details || deleteError.hint || 'Erro desconhecido ao deletar categoria';
      throw { status: 500, message: `Erro no banco de dados: ${errorMessage}` };
    }

    if (!data) {
      throw { status: 404, message: "Categoria não encontrada" };
    }

    console.log("Categoria deletada com sucesso:", data);
    return new Response(JSON.stringify({ message: "Categoria deletada com sucesso", data }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error("Erro completo capturado:", error);
    
    let errorMessage = "Ocorreu um erro inesperado.";
    let errorStatus = 500;
    
    if (error && typeof error === 'object') {
      errorMessage = error.message || error.details || error.hint || error.error || JSON.stringify(error);
      errorStatus = error.status || 500;
    } else if (typeof error === 'string') {
      errorMessage = error;
    }
    
    console.error(`Erro capturado no bloco catch principal (Status: ${errorStatus}):`, errorMessage);

    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: errorStatus,
    });
  }
});