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

    // Buscar token do cliente
    const { data: profile } = await supabase
      .from('profiles')
      .select('google_calendar_token, google_calendar_refresh_token')
      .eq('id', customerId)
      .single();

    if (!profile?.google_calendar_token) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Cliente precisa autenticar com Google Calendar primeiro'
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Criar evento usando fetch diretamente para a API do Google Calendar
    const calendarId = googleConfig.google_calendar_id || 'primary';
    const eventPayload = {
      summary: eventData.title,
      description: eventData.description || '',
      location: eventData.location || '',
      start: {
        dateTime: eventData.start_time,
        timeZone: 'America/Sao_Paulo',
      },
      end: {
        dateTime: eventData.end_time,
        timeZone: 'America/Sao_Paulo',
      },
      attendees: eventData.customer_email ? [{ email: eventData.customer_email }] : [],
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 },
          { method: 'popup', minutes: 15 },
        ],
      },
    };

    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${profile.google_calendar_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventPayload),
      }
    );

    if (!response.ok) {
      if (response.status === 401) {
        // Token expirado, tentar refresh
        const refreshed = await refreshGoogleToken(supabase, customerId, profile.google_calendar_refresh_token);
        if (refreshed) {
          // Tentar novamente com novo token
          return await createGoogleCalendarEvent(supabase, franchiseeId, eventData, customerId);
        }
      }
      
      const errorText = await response.text();
      console.error('Erro da API Google Calendar:', errorText);
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Erro ao criar evento no Google Calendar. Tente reconectar sua conta.'
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const eventResult = await response.json();

    return new Response(
      JSON.stringify({ 
        success: true, 
        google_event_id: eventResult.id,
        message: 'Evento criado no Google Calendar com sucesso!',
        event_link: eventResult.htmlLink
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

async function initiateGoogleOAuth(
  supabase: any,
  franchiseeId: string,
  customerId: string
) {
  try {
    const clientId = Deno.env.get('GOOGLE_CLIENT_ID') || '98233404583-nl4nicefn19jic2877vsge2hdj43qvqp.apps.googleusercontent.com';
    const redirectUri = `${Deno.env.get('SUPABASE_URL')}/functions/v1/google-calendar-oauth-callback`;
    
    const scopes = [
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/calendar.events'
    ];

    const state = JSON.stringify({ customerId, franchiseeId });
    
    const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    authUrl.searchParams.set('client_id', clientId);
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('scope', scopes.join(' '));
    authUrl.searchParams.set('access_type', 'offline');
    authUrl.searchParams.set('prompt', 'consent');
    authUrl.searchParams.set('state', state);

    return new Response(
      JSON.stringify({ 
        success: true, 
        auth_url: authUrl.toString(),
        message: 'Acesse a URL para autorizar o acesso ao Google Calendar'
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error initiating Google OAuth:', error);
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
    let errors = [];

    for (const appointment of appointments || []) {
      try {
        const eventData = {
          title: appointment.title,
          description: appointment.description,
          start_time: appointment.start_time,
          end_time: appointment.end_time,
          location: appointment.location,
          customer_email: appointment.customers?.email
        };

        const response = await createGoogleCalendarEvent(
          supabase,
          franchiseeId,
          eventData,
          appointment.customer_id
        );

        const result = await response.json();
        
        if (result.success && result.google_event_id) {
          await supabase
            .from('appointments')
            .update({ google_event_id: result.google_event_id })
            .eq('id', appointment.id);
          
          syncedCount++;
        } else {
          errors.push(`${appointment.title}: ${result.message}`);
        }
        
      } catch (error) {
        errors.push(`${appointment.title}: ${error.message}`);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        synced_count: syncedCount,
        total_appointments: appointments?.length || 0,
        errors: errors,
        message: `${syncedCount} de ${appointments?.length || 0} agendamentos sincronizados com Google Calendar`
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

// Função auxiliar para renovar token do Google
async function refreshGoogleToken(supabase: any, customerId: string, refreshToken: string) {
  try {
    const clientId = Deno.env.get('GOOGLE_CLIENT_ID') || '98233404583-nl4nicefn19jic2877vsge2hdj43qvqp.apps.googleusercontent.com';
    const clientSecret = Deno.env.get('GOOGLE_CLIENT_SECRET') || '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';

    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
    });

    if (!response.ok) {
      console.error('Erro ao renovar token:', await response.text());
      return false;
    }

    const tokenData = await response.json();
    
    if (tokenData.access_token) {
      // Salvar novo token
      await supabase
        .from('profiles')
        .update({ 
          google_calendar_token: tokenData.access_token,
          google_calendar_refresh_token: tokenData.refresh_token || refreshToken
        })
        .eq('id', customerId);
      
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Erro ao renovar token Google:', error);
    return false;
  }
}