import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CalendarEvent {
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  location?: string;
  customer_email?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { action, eventData, customerId } = await req.json();

    switch (action) {
      case 'create_event':
        return await createGoogleCalendarEvent(supabaseClient, user.id, eventData, customerId);
      
      case 'connect_calendar':
        return await simulateGoogleConnection(supabaseClient, user.id, customerId);
      
      case 'sync_appointments':
        return await syncAppointmentsWithCalendar(supabaseClient, user.id);
      
      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

  } catch (error) {
    console.error('Error in google-calendar-sync:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function createGoogleCalendarEvent(
  supabase: any,
  franchiseeId: string,
  eventData: CalendarEvent,
  customerId: string
) {
  try {
    // Verificar se o cliente tem Google Calendar configurado
    const { data: googleConfig } = await supabase
      .from('google_calendar_configs')
      .select('*')
      .eq('franchisee_id', franchiseeId)
      .eq('customer_id', customerId)
      .eq('is_active', true)
      .single();

    if (!googleConfig) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Cliente não tem Google Calendar configurado'
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Simular criação de evento no Google Calendar
    // Em produção real, aqui seria feita a chamada para a API do Google Calendar
    const simulatedEventId = `sim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    console.log('Simulando criação de evento no Google Calendar:', {
      eventData,
      googleConfig,
      simulatedEventId
    });

    // Simular delay de API
    await new Promise(resolve => setTimeout(resolve, 500));

    return new Response(
      JSON.stringify({ 
        success: true, 
        google_event_id: simulatedEventId,
        message: 'Evento sincronizado com Google Calendar (simulação)'
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error creating Google Calendar event:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

async function simulateGoogleConnection(
  supabase: any,
  franchiseeId: string,
  customerId: string
) {
  try {
    // Simular token de acesso
    const simulatedToken = `sim_token_${Date.now()}_${Math.random().toString(36).substr(2, 16)}`;
    const simulatedRefreshToken = `sim_refresh_${Date.now()}_${Math.random().toString(36).substr(2, 16)}`;
    
    // Atualizar perfil do cliente com tokens simulados
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ 
        google_calendar_token: simulatedToken,
        google_calendar_refresh_token: simulatedRefreshToken,
        google_calendar_email: 'cliente@email.com' // Em produção seria o email real do OAuth
      })
      .eq('id', customerId);

    if (profileError) throw profileError;

    // Criar ou atualizar configuração do Google Calendar
    const { error: configError } = await supabase
      .from('google_calendar_configs')
      .upsert({
        franchisee_id: franchiseeId,
        customer_id: customerId,
        google_calendar_id: 'primary',
        is_active: true,
      });

    if (configError) throw configError;

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Google Calendar conectado com sucesso (simulação)',
        token: simulatedToken
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error simulating Google connection:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

async function syncAppointmentsWithCalendar(
  supabase: any,
  franchiseeId: string
) {
  try {
    // Buscar agendamentos sem google_event_id
    const { data: appointments } = await supabase
      .from('appointments')
      .select(`
        *,
        customers (
          id,
          name,
          business_name,
          email
        )
      `)
      .eq('franchisee_id', franchiseeId)
      .is('google_event_id', null)
      .eq('status', 'scheduled');

    let syncedCount = 0;

    for (const appointment of appointments || []) {
      // Verificar se o cliente tem Google Calendar ativo
      const { data: googleConfig } = await supabase
        .from('google_calendar_configs')
        .select('*')
        .eq('customer_id', appointment.customer_id)
        .eq('is_active', true)
        .single();

      if (googleConfig) {
        // Simular criação no Google Calendar
        const simulatedEventId = `sync_${appointment.id}_${Date.now()}`;
        
        // Atualizar agendamento com ID do evento do Google
        await supabase
          .from('appointments')
          .update({ google_event_id: simulatedEventId })
          .eq('id', appointment.id);

        syncedCount++;
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        synced_count: syncedCount,
        message: `${syncedCount} agendamentos sincronizados com Google Calendar`
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error syncing appointments:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}