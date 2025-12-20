import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GOOGLE_CLIENT_ID = Deno.env.get('GOOGLE_BUSINESS_CLIENT_ID');
const GOOGLE_CLIENT_SECRET = Deno.env.get('GOOGLE_BUSINESS_CLIENT_SECRET');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);
  
  try {
    // Check if this is an OAuth callback (has code parameter)
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state'); // Contains user_id
    const error = url.searchParams.get('error');

    console.log('Google Business callback received:', { 
      hasCode: !!code, 
      hasState: !!state, 
      error 
    });

    if (error) {
      console.error('OAuth error from Google:', error);
      return Response.redirect(`${SUPABASE_URL?.replace('.supabase.co', '')}/integrations?error=${encodeURIComponent(error)}`);
    }

    if (!code || !state) {
      return new Response(JSON.stringify({ error: 'Missing code or state parameter' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Parse state to get user_id and redirect URL
    let stateData;
    try {
      stateData = JSON.parse(atob(state));
    } catch {
      stateData = { user_id: state, redirect_url: 'https://seeksy.io/integrations' };
    }

    const { user_id, redirect_url } = stateData;

    if (!user_id) {
      return new Response(JSON.stringify({ error: 'Invalid state - missing user_id' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Exchange code for tokens
    const tokenUrl = 'https://oauth2.googleapis.com/token';
    const redirectUri = `${SUPABASE_URL}/functions/v1/google-business-callback`;

    console.log('Exchanging code for tokens...');

    const tokenResponse = await fetch(tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID!,
        client_secret: GOOGLE_CLIENT_SECRET!,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      console.error('Token exchange error:', tokenData);
      return Response.redirect(`${redirect_url || 'https://seeksy.io/integrations'}?error=${encodeURIComponent(tokenData.error_description || tokenData.error)}`);
    }

    console.log('Token exchange successful, storing tokens...');

    // Calculate expiry time
    const expiresAt = new Date(Date.now() + (tokenData.expires_in * 1000)).toISOString();

    // Store tokens in database
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    const { error: upsertError } = await supabase
      .from('google_business_tokens')
      .upsert({
        user_id,
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        token_type: tokenData.token_type || 'Bearer',
        expires_at: expiresAt,
        scope: tokenData.scope,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id',
      });

    if (upsertError) {
      console.error('Error storing tokens:', upsertError);
      return Response.redirect(`${redirect_url || 'https://seeksy.io/integrations'}?error=${encodeURIComponent('Failed to store tokens')}`);
    }

    console.log('Tokens stored successfully, redirecting user...');

    // Redirect back to the app
    return Response.redirect(`${redirect_url || 'https://seeksy.io/integrations'}?gbp_connected=true`);

  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
    console.error('Google Business callback error:', errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
