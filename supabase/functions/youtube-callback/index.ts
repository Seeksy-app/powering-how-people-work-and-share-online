import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

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
    const error = url.searchParams.get('error');

    if (error) {
      throw new Error(`OAuth error: ${error}`);
    }

    if (!code) {
      throw new Error('No authorization code received');
    }

    const clientId = Deno.env.get('YOUTUBE_CLIENT_ID');
    const clientSecret = Deno.env.get('YOUTUBE_CLIENT_SECRET');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');

    if (!clientId || !clientSecret || !supabaseUrl) {
      throw new Error('Missing YouTube credentials');
    }

    const redirectUri = `${supabaseUrl}/functions/v1/youtube-callback`;

    // Exchange code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error('Token exchange failed:', errorData);
      throw new Error('Failed to exchange authorization code');
    }

    const tokens = await tokenResponse.json();

    // Redirect back to app with success
    const redirectUrl = new URL('/blog', supabaseUrl.replace('.supabase.co', '.lovableproject.com'));
    redirectUrl.searchParams.set('youtube_connected', 'true');
    
    return new Response(null, {
      status: 302,
      headers: {
        'Location': redirectUrl.toString(),
      },
    });
  } catch (error) {
    console.error('YouTube callback error:', error);
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const redirectUrl = new URL('/blog', supabaseUrl.replace('.supabase.co', '.lovableproject.com'));
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    redirectUrl.searchParams.set('youtube_error', errorMessage);
    
    return new Response(null, {
      status: 302,
      headers: {
        'Location': redirectUrl.toString(),
      },
    });
  }
});
