import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
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
    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    const error = url.searchParams.get('error');

    if (error) {
      return new Response(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Erro - Google Calendar</title>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
              .error { color: red; }
            </style>
          </head>
          <body>
            <h1 class="error">Erro na Autorização</h1>
            <p>Houve um erro ao autorizar o acesso ao Google Calendar: ${error}</p>
            <p>Por favor, feche esta janela e tente novamente.</p>
          </body>
        </html>
      `, {
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
      });
    }

    if (!code || !state) {
      return new Response(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Erro - Google Calendar</title>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
              .error { color: red; }
            </style>
          </head>
          <body>
            <h1 class="error">Erro na Autorização</h1>
            <p>Parâmetros de autorização inválidos.</p>
            <p>Por favor, feche esta janela e tente novamente.</p>
          </body>
        </html>
      `, {
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
      });
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Decodificar state para obter customerId e franchiseeId
    const { customerId, franchiseeId } = JSON.parse(state);

    const clientId = Deno.env.get('GOOGLE_CLIENT_ID') || '98233404583-nl4nicefn19jic2877vsge2hdj43qvqp.apps.googleusercontent.com';
    const clientSecret = Deno.env.get('GOOGLE_CLIENT_SECRET') || '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';
    const redirectUri = `${Deno.env.get('SUPABASE_URL')}/functions/v1/google-calendar-oauth-callback`;

    // Trocar código por tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error('Erro ao obter tokens: ' + await tokenResponse.text());
    }

    const tokens = await tokenResponse.json();

    if (!tokens.access_token) {
      throw new Error('Não foi possível obter token de acesso');
    }

    // Obter informações do usuário do Google
    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${tokens.access_token}`,
      },
    });

    if (!userInfoResponse.ok) {
      throw new Error('Erro ao obter informações do usuário');
    }

    const userInfo = await userInfoResponse.json();

    // Salvar tokens no perfil do usuário
    const { error: profileError } = await supabaseClient
      .from('profiles')
      .update({
        google_calendar_token: tokens.access_token,
        google_calendar_refresh_token: tokens.refresh_token,
        google_calendar_email: userInfo.email,
      })
      .eq('id', customerId);

    if (profileError) throw profileError;

    // Criar configuração do Google Calendar
    const { error: configError } = await supabaseClient
      .from('google_calendar_configs')
      .upsert({
        franchisee_id: franchiseeId,
        customer_id: customerId,
        google_calendar_id: 'primary',
        is_active: true,
      });

    if (configError) throw configError;

    // Página de sucesso
    return new Response(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Sucesso - Google Calendar</title>
          <meta charset="utf-8">
          <style>
            body { 
              font-family: Arial, sans-serif; 
              text-align: center; 
              padding: 50px; 
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
            }
            .success { 
              background: rgba(255,255,255,0.1); 
              padding: 30px; 
              border-radius: 10px; 
              max-width: 500px; 
              margin: 0 auto;
            }
            .checkmark { font-size: 60px; color: #4CAF50; margin-bottom: 20px; }
            h1 { margin-bottom: 20px; }
            p { margin: 10px 0; line-height: 1.6; }
            .close-btn {
              background: #4CAF50;
              color: white;
              border: none;
              padding: 12px 24px;
              border-radius: 5px;
              cursor: pointer;
              font-size: 16px;
              margin-top: 20px;
            }
            .close-btn:hover { background: #45a049; }
          </style>
        </head>
        <body>
          <div class="success">
            <div class="checkmark">✓</div>
            <h1>Google Calendar Conectado!</h1>
            <p>Sua conta Google Calendar foi conectada com sucesso.</p>
            <p>Email: <strong>${userInfo.email}</strong></p>
            <p>Agora seus agendamentos serão automaticamente sincronizados com seu Google Calendar.</p>
            <button class="close-btn" onclick="window.close()">Fechar Janela</button>
          </div>
          <script>
            // Fechar automaticamente após 5 segundos se não fechar manualmente
            setTimeout(() => {
              window.close();
            }, 5000);
          </script>
        </body>
      </html>
    `, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });

  } catch (error) {
    console.error('Erro no callback OAuth:', error);
    
    return new Response(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Erro - Google Calendar</title>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
            .error { color: red; }
          </style>
        </head>
        <body>
          <h1 class="error">Erro na Conexão</h1>
          <p>Houve um erro ao conectar com o Google Calendar: ${error.message}</p>
          <p>Por favor, feche esta janela e tente novamente.</p>
        </body>
      </html>
    `, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });
  }
});