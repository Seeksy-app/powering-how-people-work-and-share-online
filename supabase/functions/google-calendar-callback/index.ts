import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  try {
    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state'); // user_id
    const error = url.searchParams.get('error');

    if (error) {
      console.error('OAuth error:', error);
      return new Response(null, {
        status: 302,
        headers: { Location: `https://seeksy.io/integrations?error=oauth_failed` }
      });
    }

    if (!code || !state) {
      throw new Error('Missing code or state');
    }

    const clientId = Deno.env.get('GOOGLE_CALENDAR_CLIENT_ID');
    const clientSecret = Deno.env.get('GOOGLE_CALENDAR_CLIENT_SECRET');
    const redirectUri = `${Deno.env.get('SUPABASE_URL')}/functions/v1/google-calendar-callback`;

    // Exchange code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId!,
        client_secret: clientSecret!,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Token exchange failed:', errorText);
      throw new Error('Failed to exchange token');
    }

    const tokens = await tokenResponse.json();
    console.log('Received tokens for user:', state);

    // Get user's calendar email
    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` }
    });
    
    const userInfo = await userInfoResponse.json();
    const calendarEmail = userInfo.email;

    // Store tokens in database
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const expiryDate = new Date(Date.now() + (tokens.expires_in * 1000));

    // Check if connection already exists
    const { data: existing } = await supabaseAdmin
      .from('calendar_connections')
      .select('id')
      .eq('user_id', state)
      .eq('provider', 'google')
      .single();

    if (existing) {
      // Update existing
      const { error: updateError } = await supabaseAdmin
        .from('calendar_connections')
        .update({
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          token_expiry: expiryDate.toISOString(),
          calendar_email: calendarEmail,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id);

      if (updateError) throw updateError;
    } else {
      // Insert new
      const { error: insertError } = await supabaseAdmin
        .from('calendar_connections')
        .insert({
          user_id: state,
          provider: 'google',
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          token_expiry: expiryDate.toISOString(),
          calendar_email: calendarEmail,
        });

      if (insertError) throw insertError;
    }

    console.log('Successfully stored calendar connection for user:', state);

    // Redirect back to integrations page on custom domain
    return new Response(null, {
      status: 302,
      headers: { Location: `https://seeksy.io/integrations?google_success=true` }
    });
  } catch (error) {
    console.error('Error in google-calendar-callback:', error);
    return new Response(null, {
      status: 302,
      headers: { Location: `https://seeksy.io/integrations?error=google_connection_failed` }
    });
  }
});
