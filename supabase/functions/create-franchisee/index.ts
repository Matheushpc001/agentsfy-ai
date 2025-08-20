// supabase/functions/create-franchisee/index.ts
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

    const { name, email } = await req.json();
    if (!name || !email) {
      throw new Error("Nome e email são obrigatórios.");
    }

    // 1. Convidar o usuário para criar a conta no auth.users
    const { data: { user }, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
      redirectTo: `${Deno.env.get('SUPABASE_URL')!.replace('.co', '.app')}/update-password`,
    });

    if (inviteError) {
      if (inviteError.message.includes("User already registered")) {
        return new Response(JSON.stringify({ error: "Este e-mail já está cadastrado." }), { status: 409, headers: corsHeaders });
      }
      throw inviteError;
    }
    if (!user) throw new Error("Não foi possível criar o usuário no sistema.");

    // 2. Atualizar o perfil com o nome (a trigger já cria o perfil)
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({ name: name })
      .eq('id', user.id);
    if (profileError) throw profileError;

    // 3. Atribuir a role 'franchisee'
    const { error: roleError } = await supabaseAdmin
      .from('user_roles')
      .upsert({ user_id: user.id, role: 'franchisee' });
    if (roleError) throw roleError;
    
    return new Response(JSON.stringify({ message: "Franqueado convidado com sucesso!" }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});