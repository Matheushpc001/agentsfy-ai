// supabase/functions/create-customer/index.ts v2

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
    console.log('Received request for franchiseeId:', franchiseeId);
    console.log('Received customerData:', customerData);

    const { businessName, name, email, document, contactPhone } = customerData;

    if (!franchiseeId || !email || !businessName || !name) {
      console.error('Missing required data for customer creation.');
      throw new Error("Dados insuficientes para criar cliente.");
    }

    // 1. Criar o usuário no Supabase Auth com uma senha temporária
    // Isso evita o problema com o inviteUserByEmail
    const tempPassword = generateTemporaryPassword();
    const { data: { user }, error: signUpError } = await supabaseAdmin.auth.signUp({
      email,
      password: tempPassword,
      options: {
        emailRedirectTo: 'https://agentsfy-ai.lovable.app/update-password'
      }
    });

    if (signUpError) {
      // Trata o erro se o usuário já existir
      if (signUpError.message.includes("already registered")) {
        throw new Error("Este email de cliente já está cadastrado.");
      }
      throw signUpError;
    }

    if (!user) {
      throw new Error("Não foi possível criar o usuário no sistema de autenticação.");
    }

    // 2. Enviar email de redefinição de senha imediatamente
    const { error: resetError } = await supabaseAdmin.auth.admin.resetPasswordForUser(email);
    if (resetError) {
      // Rollback: se falhar ao enviar o email de redefinição, deleta o usuário do Auth
      await supabaseAdmin.auth.admin.deleteUser(user.id);
      throw resetError;
    }

    // 3. Inserir os dados na tabela 'customers'
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

    return new Response(JSON.stringify({ 
      customer: newCustomer,
      message: "Cliente criado com sucesso! Um email foi enviado para o cliente definir sua senha."
    }), {
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

// Função para gerar uma senha temporária
function generateTemporaryPassword(length: number = 12): string {
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()";
  let password = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  }
  return password;
}