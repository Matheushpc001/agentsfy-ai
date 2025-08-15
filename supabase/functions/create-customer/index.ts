// supabase/functions/create-customer/index.ts

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

    const { franchiseeId, customerData } = await req.json();
    const { businessName, name, email, document, contactPhone } = customerData;

    if (!franchiseeId || !email || !businessName || !name) {
      throw new Error("Dados insuficientes para criar cliente.");
    }

    // 1. Criar o usuário no Supabase Auth via convite
    // O cliente receberá um email para definir sua senha
    const { data: { user }, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
      redirectTo: 'https://agentsfy-ai.lovable.app/auth'
    });

    if (inviteError) {
      // Trata o erro se o usuário já existir
      if (inviteError.message.includes("already registered")) {
        throw new Error("Este email de cliente já está cadastrado.");
      }
      throw inviteError;
    }

    if (!user) {
      throw new Error("Não foi possível criar o usuário no sistema de autenticação.");
    }

    // 2. Inserir os dados na tabela 'customers'
    const { data: newCustomer, error: customerError } = await supabaseAdmin
      .from('customers')
      .insert({
        id: user.id, // O ID do cliente SERÁ o mesmo ID do usuário autenticado
        franchisee_id: franchiseeId,
        business_name: businessName,
        name: name,
        email: email,
        document: document,
        contact_phone: contactPhone,
        role: 'customer'
      })
      .select()
      .single();

    if (customerError) {
      // Rollback: se falhar ao criar o perfil, deleta o usuário do Auth
      await supabaseAdmin.auth.admin.deleteUser(user.id);
      throw customerError;
    }

    return new Response(JSON.stringify({ customer: newCustomer }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});