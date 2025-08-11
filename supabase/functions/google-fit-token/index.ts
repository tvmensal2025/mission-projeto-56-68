import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

// Criar cliente Supabase
const supabaseClient = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization header' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    let requestBody;
    try { requestBody = await req.json(); } catch { throw new Error('Body da requisição inválido'); }
    const { code, testSecrets, redirect_uri: redirectUriFromClient } = requestBody;

    if (testSecrets) {
      const clientId = Deno.env.get('GOOGLE_FIT_CLIENT_ID');
      const clientSecret = Deno.env.get('GOOGLE_FIT_CLIENT_SECRET');
      return new Response(JSON.stringify({ secretsTest: true, clientIdDefined: !!clientId, clientSecretDefined: !!clientSecret, timestamp: new Date().toISOString() }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    if (!code) throw new Error('Código de autorização é obrigatório');

    const clientId = Deno.env.get('GOOGLE_FIT_CLIENT_ID');
    const clientSecret = Deno.env.get('GOOGLE_FIT_CLIENT_SECRET');
    if (!clientId || !clientSecret) throw new Error('Credenciais do Google não configuradas no Supabase');

    const referer = req.headers.get('referer') || req.headers.get('origin') || '';
    const allowedRedirects = new Set<string>([
      'http://localhost:8083/google-fit-callback',
      'https://institutodossonhos.com.br/google-fit-callback',
      'https://eb451b44-5d36-4bf7-8628-481a619af74a.lovableproject.com/google-fit-callback',
    ]);
    const detectedRedirect = referer.includes('localhost') || referer.includes('127.0.0.1')
      ? 'http://localhost:8083/google-fit-callback'
      : (referer.includes('institutodossonhos.com.br')
          ? 'https://institutodossonhos.com.br/google-fit-callback'
          : 'https://eb451b44-5d36-4bf7-8628-481a619af74a.lovableproject.com/google-fit-callback');
    const redirectUri = (redirectUriFromClient && allowedRedirects.has(redirectUriFromClient)) ? redirectUriFromClient : detectedRedirect;

    // Trocar código por tokens
    const tokenBody = new URLSearchParams({ client_id: clientId, client_secret: clientSecret, code, grant_type: 'authorization_code', redirect_uri: redirectUri });
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: tokenBody });
    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      return new Response(JSON.stringify({ success: false, stage: 'token_exchange', status: tokenResponse.status, error: errorData }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const tokenData = await tokenResponse.json();

    // Descobrir usuário
    const userToken = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabaseClient.auth.getUser(userToken);

    if (user) {
      // Caso o Google não devolva refresh_token (ocorre quando já foi concedido antes), reusar o existente
      let refreshToSave: string | null = tokenData.refresh_token || null;
      if (!refreshToSave) {
        const { data: existing } = await supabaseClient
          .from('google_fit_tokens')
          .select('refresh_token')
          .eq('user_id', user.id)
          .maybeSingle();
        refreshToSave = existing?.refresh_token || null;
      }

      if (!refreshToSave) {
        // Como a coluna é NOT NULL, registrar erro descritivo
        return new Response(JSON.stringify({ success: false, error: 'refresh_token ausente. Garanta access_type=offline e prompt=consent na autorização.' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      const tokenRecord = {
        user_id: user.id,
        access_token: tokenData.access_token,
        refresh_token: refreshToSave,
        expires_at: new Date(Date.now() + (tokenData.expires_in * 1000)).toISOString(),
        scope: tokenData.scope,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      } as const;

      const { error: upsertErr } = await supabaseClient
        .from('google_fit_tokens')
        .upsert(tokenRecord, { onConflict: 'user_id' });

      if (upsertErr) {
        return new Response(JSON.stringify({ success: false, error: 'Falha ao salvar tokens', details: upsertErr }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
    }

    return new Response(JSON.stringify({ access_token: tokenData.access_token, refresh_token: tokenData.refresh_token || null, expires_in: tokenData.expires_in, scope: tokenData.scope, saved_to_db: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message, timestamp: new Date().toISOString(), type: 'edge-function-error' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
