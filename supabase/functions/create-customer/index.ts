// supabase/functions/create-customer/index.ts v3 (com logs detalhados)

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
    console.log('=== INICIANDO PROCESSO DE CRIAÇÃO DE CLIENTE ===');
    
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { franchiseeId, customerData } = await req.json();
    console.log('Dados recebidos - franchiseeId:', franchiseeId);
    console.log('Dados recebidos - customerData:', JSON.stringify(customerData, null, 2));

    const { businessName, name, email, document, contactPhone } = customerData;

    if (!franchiseeId || !email || !businessName || !name) {
      const errorMsg = 'Dados insuficientes para criar cliente.';
      console.error(errorMsg, { franchiseeId, email, businessName, name });
      throw new Error(errorMsg);
    }

    // 1. Criar o usuário no Supabase Auth com uma senha temporária
    console.log('Etapa 1: Criando usuário no Auth com senha temporária');
    const tempPassword = generateTemporaryPassword();
    console.log('Senha temporária gerada para', email);
    
    const { data: { user }, error: signUpError } = await supabaseAdmin.auth.signUp({
      email,
      password: tempPassword,
      options: {
        emailRedirectTo: 'https://agentsfy-ai.lovable.app/update-password'
      }
    });

    if (signUpError) {
      console.error('Erro ao criar usuário no Auth:', signUpError.message);
      // Trata o erro se o usuário já existir
      if (signUpError.message.includes("already registered")) {
        throw new Error("Este email de cliente já está cadastrado.");
      }
      throw signUpError;
    }

    if (!user) {
      const errorMsg = "Não foi possível criar o usuário no sistema de autenticação.";
      console.error(errorMsg);
      throw new Error(errorMsg);
    }
    
    console.log('Usuário criado com sucesso no Auth:', user.id, user.email);

    // 2. Enviar email de redefinição de senha imediatamente
    console.log('Etapa 2: Enviando email de redefinição de senha');
    const { error: resetError } = await supabaseAdmin.auth.admin.resetPasswordForUser(email);
    if (resetError) {
      console.error('Erro ao enviar email de redefinição:', resetError.message);
      // Rollback: se falhar ao enviar o email de redefinição, deleta o usuário do Auth
      await supabaseAdmin.auth.admin.deleteUser(user.id);
      throw resetError;
    }
    console.log('Email de redefinição enviado com sucesso para', email);

    // 3. Inserir os dados na tabela 'customers'
    console.log('Etapa 3: Inserindo dados na tabela customers');
    const customerRecord = {
      id: user.id,
      franchisee_id: franchiseeId,
      business_name: businessName,
      name: name,
      email: email,
      document: document,
      contact_phone: contactPhone,
      role: 'customer'
    };
    
    console.log('Dados a serem inseridos:', JSON.stringify(customerRecord, null, 2));
    
    const { data: newCustomer, error: customerError } = await supabaseAdmin
      .from('customers')
      .insert(customerRecord)
      .select()
      .single();

    if (customerError) {
      console.error('Erro ao inserir cliente na tabela customers:', customerError.message);
      console.error('Dados que causaram o erro:', JSON.stringify(customerRecord, null, 2));
      // Rollback: se falhar ao criar o perfil, deleta o usuário do Auth
      await supabaseAdmin.auth.admin.deleteUser(user.id);
      throw customerError;
    }
    
    console.log('Cliente inserido com sucesso na tabela customers:', newCustomer.id, newCustomer.email);

    console.log('=== PROCESSO DE CRIAÇÃO DE CLIENTE CONCLUÍDO COM SUCESSO ===');
    
    return new Response(JSON.stringify({ 
      customer: newCustomer,
      message: "Cliente criado com sucesso! Um email foi enviado para o cliente definir sua senha."
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('=== ERRO NO PROCESSO DE CRIAÇÃO DE CLIENTE ===');
    console.error('Erro detalhado:', error.message);
    console.error('Stack trace:', error.stack);
    
    return new Response(JSON.stringify({ 
      error: error.message,
      stack: error.stack
    }), {
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