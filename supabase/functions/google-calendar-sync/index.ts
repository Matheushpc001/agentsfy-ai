import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { GoogleAuth } from "https://esm.sh/google-auth-library@10.0.0";
import { calendar_v3 as CalendarV3 } from "https://esm.sh/googleapis@148.0.0";

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
        return await initiateGoogleOAuth(supabaseClient, user.id, customerId);
      
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

    try {
      // Configurar autenticação OAuth2
      const auth = new GoogleAuth();
      const oauth2Client = new auth.OAuth2(
        Deno.env.get('GOOGLE_CLIENT_ID'),
        Deno.env.get('GOOGLE_CLIENT_SECRET')
      );

      oauth2Client.setCredentials({
        access_token: profile.google_calendar_token,
        refresh_token: profile.google_calendar_refresh_token,
      });

      // Criar instância da API do Google Calendar
      const calendar = new CalendarV3.Calendar({ auth: oauth2Client });

      // Criar evento no Google Calendar
      const event = {
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
            { method: 'email', minutes: 24 * 60 }, // 1 dia antes
            { method: 'popup', minutes: 15 }, // 15 min antes
          ],
        },
      };

      const response = await calendar.events.insert({
        calendarId: googleConfig.google_calendar_id || 'primary',
        resource: event,
        sendUpdates: 'all', // Enviar convites aos participantes
      });

      return new Response(
        JSON.stringify({ 
          success: true, 
          google_event_id: response.data.id,
          message: 'Evento criado no Google Calendar com sucesso!',
          event_link: response.data.htmlLink
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } catch (authError: any) {
      console.error('Erro de autenticação Google:', authError);
      
      // Se token expirou, tentar refresh
      if (authError.code === 401) {
        try {
          const refreshed = await refreshGoogleToken(supabase, customerId, profile.google_calendar_refresh_token);
          if (refreshed) {
            // Tentar novamente com novo token
            return await createGoogleCalendarEvent(supabase, franchiseeId, eventData, customerId);
          }
        } catch (refreshError) {
          console.error('Erro ao renovar token:', refreshError);
        }
      }
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Erro de autenticação com Google Calendar. Reconecte sua conta.'
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

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
    // Criar URL de autorização OAuth2
    const auth = new GoogleAuth();
    const oauth2Client = new auth.OAuth2(
      Deno.env.get('GOOGLE_CLIENT_ID'),
      Deno.env.get('GOOGLE_CLIENT_SECRET'),
      `${Deno.env.get('SUPABASE_URL')}/functions/v1/google-calendar-oauth-callback`
    );

    const scopes = [
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/calendar.events',
    ];

    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline', // Para obter refresh token
      scope: scopes,
      state: JSON.stringify({ customerId, franchiseeId }), // Para identificar o usuário
      prompt: 'consent', // Forçar tela de consentimento para obter refresh token
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        auth_url: authUrl,
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
    const auth = new GoogleAuth();
    const oauth2Client = new auth.OAuth2(
      Deno.env.get('GOOGLE_CLIENT_ID'),
      Deno.env.get('GOOGLE_CLIENT_SECRET')
    );

    oauth2Client.setCredentials({
      refresh_token: refreshToken,
    });

    const { credentials } = await oauth2Client.refreshAccessToken();
    
    if (credentials.access_token) {
      // Salvar novo token
      await supabase
        .from('profiles')
        .update({ 
          google_calendar_token: credentials.access_token,
          google_calendar_refresh_token: credentials.refresh_token || refreshToken
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