// supabase/functions/create-customer/index.ts (v4 - Refatorado com invite e verificação)

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
    console.log('[CREATE-CUSTOMER] Início do processo.');
    
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { franchiseeId, customerData } = await req.json();
    console.log(`[CREATE-CUSTOMER] Dados recebidos para o franqueado ID: ${franchiseeId}`);
    
    const { businessName, name, email, document, contactPhone } = customerData;

    if (!franchiseeId || !email || !businessName || !name) {
      console.error('[CREATE-CUSTOMER] Erro: Dados insuficientes.', { franchiseeId, email, businessName, name });
      return new Response(JSON.stringify({ error: 'Dados insuficientes para criar cliente.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }
    console.log(`[CREATE-CUSTOMER] Validação inicial de dados concluída para o email: ${email}`);

    // 1. Verificar se o cliente já existe na tabela 'customers'
    console.log(`[CREATE-CUSTOMER] Etapa 1: Verificando se o cliente com email ${email} já existe.`);
    const { data: existingCustomer, error: existingCustomerError } = await supabaseAdmin
      .from('customers')
      .select('id')
      .eq('email', email)
      .single();

    if (existingCustomerError && existingCustomerError.code !== 'PGRST116') { // PGRST116: 'exact-one-row-not-found'
      console.error('[CREATE-CUSTOMER] Erro ao verificar cliente existente:', existingCustomerError);
      throw new Error('Erro ao verificar cliente existente.');
    }

    if (existingCustomer) {
      console.warn(`[CREATE-CUSTOMER] Conflito: Cliente com email ${email} já cadastrado.`);
      return new Response(JSON.stringify({ error: 'Cliente com este e-mail já está cadastrado.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 409, // Conflict
      });
    }
    console.log(`[CREATE-CUSTOMER] Verificação concluída. O email ${email} está disponível.`);

    // 2. Convidar o usuário via Supabase Auth
    console.log(`[CREATE-CUSTOMER] Etapa 2: Convidando usuário com email ${email} via Supabase Auth.`);
    const { data: { user }, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
      redirectTo: 'https://agentsfy-ai.lovable.app/update-password',
    });

    if (inviteError) {
      console.error(`[CREATE-CUSTOMER] Erro ao convidar usuário no Auth para ${email}:`, inviteError.message);
      if (inviteError.message.includes("User already registered")) {
        return new Response(JSON.stringify({ error: 'Este e-mail já está registrado no sistema de autenticação.' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 409,
        });
      }
      throw inviteError;
    }

    if (!user) {
      console.error(`[CREATE-CUSTOMER] Falha crítica: Não foi possível criar o usuário ${email} no Auth.`);
      throw new Error("Não foi possível criar o usuário no sistema de autenticação.");
    }
    console.log(`[CREATE-CUSTOMER] Usuário convidado com sucesso no Auth. User ID: ${user.id}`);

    // 3. Inserir os dados na tabela 'customers'
    console.log(`[CREATE-CUSTOMER] Etapa 3: Inserindo dados na tabela 'customers' para o User ID: ${user.id}`);
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
    
    const { data: newCustomer, error: customerError } = await supabaseAdmin
      .from('customers')
      .insert(customerRecord)
      .select()
      .single();

    if (customerError) {
      console.error(`[CREATE-CUSTOMER] Erro ao inserir cliente na tabela 'customers' para User ID ${user.id}:`, customerError.message);
      console.error('[CREATE-CUSTOMER] Dados que causaram o erro:', JSON.stringify(customerRecord, null, 2));
      // Rollback: se falhar ao criar o perfil, deleta o usuário do Auth para evitar inconsistência.
      await supabaseAdmin.auth.admin.deleteUser(user.id);
      console.log(`[CREATE-CUSTOMER] Rollback executado: Usuário ${user.id} deletado do Auth.`);
      throw customerError;
    }
    
    console.log(`[CREATE-CUSTOMER] Cliente inserido com sucesso na tabela 'customers'. Customer ID: ${newCustomer.id}`);
    console.log('[CREATE-CUSTOMER] Processo concluído com sucesso.');
    
    return new Response(JSON.stringify({ 
      customer: newCustomer,
      message: "Convite enviado com sucesso! O cliente receberá um e-mail para definir sua senha e acessar a plataforma."
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('[CREATE-CUSTOMER] Erro fatal no processo:', error.message);
    return new Response(JSON.stringify({ 
      error: error.message,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});