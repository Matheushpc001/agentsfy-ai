// supabase/functions/delete-agent/index.ts

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
    const { agent_id, evolution_config_id } = await req.json();
    console.log(`[DELETE-AGENT] Início do processo para Agente ID: ${agent_id}`);

    if (!agent_id) {
      throw new Error("ID do Agente é obrigatório");
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Etapa 1: Se houver uma instância na Evolution API, excluí-la
    if (evolution_config_id) {
      console.log(`[DELETE-AGENT] Etapa 1: Excluindo instância da Evolution API (Config ID: ${evolution_config_id})`);
      const { error: evolutionError } = await supabaseAdmin.functions.invoke('evolution-api-manager', {
        body: { action: 'delete_instance', config_id: evolution_config_id },
      });

      if (evolutionError) {
        // Não bloqueia a exclusão se a instância já não existir, mas loga o erro
        console.warn(`[DELETE-AGENT] Aviso ao excluir instância da Evolution: ${evolutionError.message}. Continuando com a exclusão do agente.`);
      }
    }

    // Etapa 2: Excluir o agente do banco de dados
    console.log(`[DELETE-AGENT] Etapa 2: Excluindo agente ${agent_id} do banco de dados.`);
    const { error: dbError } = await supabaseAdmin
      .from('agents')
      .delete()
      .eq('id', agent_id);

    if (dbError) {
      console.error(`[DELETE-AGENT] Erro ao excluir agente do banco de dados:`, dbError.message);
      throw dbError;
    }

    console.log(`[DELETE-AGENT] Processo concluído com sucesso para Agente ID: ${agent_id}`);
    return new Response(JSON.stringify({ message: "Agente excluído com sucesso" }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('[DELETE-AGENT] Erro fatal no processo:', error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
