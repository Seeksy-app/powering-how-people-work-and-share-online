import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { listId, accountId, subject, htmlContent, userId } = await req.json();

    if (!listId || !accountId || !subject || !htmlContent) {
      throw new Error("Missing required fields");
    }

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY not configured");
    }

    const { data: account, error: accountError } = await supabase
      .from("email_accounts")
      .select("*")
      .eq("id", accountId)
      .eq("user_id", userId)
      .single();

    if (accountError || !account) {
      throw new Error("Email account not found");
    }

    const { data: listMembers, error: membersError } = await supabase
      .from("contact_list_members")
      .select("contact_id")
      .eq("list_id", listId);

    if (membersError) throw membersError;

    const contactIds = listMembers?.map(m => m.contact_id) || [];

    if (contactIds.length === 0) {
      throw new Error("No contacts in this list");
    }

    const { data: contacts, error: contactsError } = await supabase
      .from("contacts")
      .select("id, email, name")
      .in("id", contactIds);

    if (contactsError) throw contactsError;

    const { data: campaign, error: campaignError } = await supabase
      .from("email_campaigns")
      .insert({
        name: subject,
        subject,
        html_content: htmlContent,
        from_email_account_id: accountId,
        recipient_list_id: listId,
        status: "sending",
        user_id: userId,
        total_recipients: contacts?.length || 0,
        total_sent: 0,
      })
      .select()
      .single();

    if (campaignError) throw campaignError;

    let successCount = 0;

    for (const contact of contacts || []) {
      try {
        const response = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: `${account.display_name} <${account.email_address}>`,
            to: [contact.email],
            subject,
            html: htmlContent,
            tags: [
              { name: "user_id", value: userId },
              { name: "campaign_id", value: campaign.id },
              { name: "category", value: "campaign" },
            ],
          }),
        });

        if (response.ok) {
          successCount++;
        }
      } catch (error) {
        console.error(`Failed to send to ${contact.email}:`, error);
      }
    }

    await supabase
      .from("email_campaigns")
      .update({
        status: "sent",
        total_sent: successCount,
        sent_at: new Date().toISOString(),
      })
      .eq("id", campaign.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        campaignId: campaign.id,
        recipientCount: successCount 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
