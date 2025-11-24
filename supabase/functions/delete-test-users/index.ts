import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
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

    // Verify the requesting user is an admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);

    if (userError || !user) {
      throw new Error("Invalid token");
    }

    // Check if user has admin role
    const { data: roles, error: roleError } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .single();

    if (roleError || !roles) {
      return new Response(
        JSON.stringify({ error: "Unauthorized: Admin access required" }),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log(`Admin ${user.id} (${user.email}) is deleting all test users`);

    // Get all users
    const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();

    if (listError) {
      throw listError;
    }

    // Delete all users except the current admin
    const deletedUsers = [];
    const errors = [];

    for (const targetUser of users || []) {
      if (targetUser.id !== user.id) {
        try {
          const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(
            targetUser.id
          );

          if (deleteError) {
            errors.push({ id: targetUser.id, email: targetUser.email, error: deleteError.message });
          } else {
            deletedUsers.push({ id: targetUser.id, email: targetUser.email });
            console.log(`Deleted user: ${targetUser.email} (${targetUser.id})`);
          }
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : String(err);
          errors.push({ id: targetUser.id, email: targetUser.email, error: errorMessage });
        }
      }
    }

    console.log(`Successfully deleted ${deletedUsers.length} users`);
    if (errors.length > 0) {
      console.log(`Failed to delete ${errors.length} users:`, errors);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Deleted ${deletedUsers.length} test users`,
        deletedUsers,
        errors: errors.length > 0 ? errors : undefined,
        keptUser: { id: user.id, email: user.email }
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error deleting test users:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
