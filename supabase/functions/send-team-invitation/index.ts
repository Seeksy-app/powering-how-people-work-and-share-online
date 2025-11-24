import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface InviteRequest {
  invitee_email: string;
  role: string;
  team_id: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);

    if (userError || !user) {
      throw new Error("Unauthorized");
    }

    const { invitee_email, role, team_id }: InviteRequest = await req.json();

    // Check if user exists with this email using admin API
    const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    if (listError) throw listError;

    const invitedUser = users?.find((u: any) => u.email === invitee_email);

    if (invitedUser) {
      // User exists, add to team_members table
      const { error: memberError } = await supabaseAdmin
        .from("team_members")
        .insert({
          team_id: team_id,
          user_id: invitedUser.id,
          role: role,
        });

      // Ignore conflict errors if already a member
      if (memberError && !memberError.message.includes("duplicate")) {
        throw memberError;
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: `User added to team as ${role}`,
          user_exists: true 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else {
      // User doesn't exist, send invitation email
      const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
      
      // Get inviter's name
      const { data: inviterProfile } = await supabaseAdmin
        .from("profiles")
        .select("account_full_name, username")
        .eq("id", user.id)
        .single();
      
      const inviterName = inviterProfile?.account_full_name || inviterProfile?.username || "A team member";
      const signupUrl = `${Deno.env.get("SUPABASE_URL")?.replace('.supabase.co', '')}/auth`;
      
      try {
        await resend.emails.send({
          from: Deno.env.get("SENDER_EMAIL") || "Seeksy <onboarding@resend.dev>",
          to: [invitee_email],
          subject: `${inviterName} invited you to join their team on Seeksy`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h1 style="color: #333;">Hi there!</h1>
              <p style="font-size: 16px; color: #555;">
                ${inviterName} has invited you to join their team on Seeksy as a <strong>${role}</strong>.
              </p>
              <p style="font-size: 16px; color: #555;">
                Seeksy is a platform for creators to manage their content, collaborate with their team, and grow their audience.
              </p>
              <div style="margin: 30px 0;">
                <a href="${signupUrl}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                  Sign Up & Get Started
                </a>
              </div>
              <p style="font-size: 14px; color: #777;">
                If you have any questions, feel free to reach out to our support team.
              </p>
              <p style="font-size: 14px; color: #777;">
                Best regards,<br>
                The Seeksy Team
              </p>
            </div>
          `,
        });
      } catch (emailError) {
        console.error("Error sending invitation email:", emailError);
        // Continue even if email fails
      }
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Invitation email sent to " + invitee_email,
          user_exists: false 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (error) {
    console.error("Error in send-team-invitation:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { 
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
