// supabase/functions/create-lesson-category/index.ts
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
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Verificação de autorização (essencial em Edge Functions)
    const { data: { user } } = await createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    ).auth.getUser();

    if (!user) throw new Error("Usuário não autenticado");

    const { data: { is_admin } } = await supabaseAdmin.rpc('is_admin', { user_id: user.id });
    if (!is_admin) throw new Error("Acesso negado. Apenas administradores podem criar categorias.");

    const categoryData = await req.json();

    if (!categoryData.name) {
      throw new Error("O nome da categoria é obrigatório.");
    }

    const { data, error } = await supabaseAdmin
      .from('lesson_categories')
      .insert(categoryData)
      .select()
      .single();

    if (error) throw error;

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 201, // Created
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: error.message.includes("Acesso negado") ? 403 : 500,
    });
  }
});