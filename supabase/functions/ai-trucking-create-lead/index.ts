import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const body = await req.json();
    console.log('=== CREATE LEAD CALLED ===');
    console.log('Raw body:', JSON.stringify(body, null, 2));

    // ElevenLabs sends parameters at top level OR nested
    const params = body.parameters || body;
    
    // Extract all possible fields from your ElevenLabs config
    const { 
      load_id,           // From your config (required)
      load_number,       // Alternative name
      company_name,      // Required in your config
      rate_offered,      // Required in your config  
      contact_number,    // From your config
      mc_number,
      phone,
      action,           // Constant value from your config
      // Legacy fields for backwards compatibility
      dot_number,
      contact_name,
      email,
      truck_type,
      rate_requested,
      notes 
    } = params;

    console.log('Parsed params:', { 
      load_id, 
      load_number,
      company_name, 
      rate_offered, 
      contact_number, 
      mc_number, 
      phone,
      action 
    });

    // Use load_id from ElevenLabs (this is actually the load_number string)
    const searchLoadNumber = load_id || load_number;
    
    // Find the load by load_number to get the actual UUID and owner_id
    let actualLoadId = null;
    let owner_id = null;
    
    if (searchLoadNumber) {
      // Normalize the load number by removing dashes, spaces, and other non-alphanumeric chars
      const normalizedLoadNumber = String(searchLoadNumber).replace(/[^a-zA-Z0-9]/g, '');
      console.log('Searching for load with normalized number:', normalizedLoadNumber);
      
      const { data: loadData, error: loadError } = await supabase
        .from('trucking_loads')
        .select('id, owner_id, load_number')
        .ilike('load_number', `%${normalizedLoadNumber}%`)
        .limit(1)
        .single();
      
      if (loadData) {
        actualLoadId = loadData.id;
        owner_id = loadData.owner_id;
        console.log('Found load:', loadData);
      } else {
        console.log('Load not found for:', searchLoadNumber, loadError?.message);
      }
    }

    // Use rate_offered from ElevenLabs, fallback to rate_requested
    const rateValue = rate_offered || rate_requested;
    // Use contact_number or phone from ElevenLabs
    const phoneValue = contact_number || phone;

    // Create the lead
    const leadData = {
      owner_id,
      load_id: actualLoadId,
      company_name: company_name || null,
      mc_number: mc_number || null,
      dot_number: dot_number || null,
      contact_name: contact_name || company_name || null, // Use company_name as fallback
      phone: phoneValue || null,
      email: email || null,
      truck_type: truck_type || null,
      rate_requested: rateValue ? parseFloat(String(rateValue).replace(/[^0-9.]/g, '')) : null,
      notes: notes || `Rate offered: ${rateValue || 'N/A'}`,
      source: 'ai_voice_agent',
      status: 'new',
      is_confirmed: false,
      requires_callback: true,
      call_source: 'inbound'
    };
    
    console.log('Creating lead with data:', JSON.stringify(leadData, null, 2));

    console.log('Creating lead with data:', leadData);

    const { data: lead, error } = await supabase
      .from('trucking_carrier_leads')
      .insert(leadData)
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return new Response(JSON.stringify({
        success: false,
        message: "Error creating lead",
        error: error.message
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('Lead created successfully:', lead.id);

    return new Response(JSON.stringify({
      success: true,
      message: `Lead created successfully for ${company_name || contact_name || 'carrier'}. The broker will follow up shortly.`,
      lead_id: lead.id
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: unknown) {
    console.error('Error in ai-trucking-create-lead:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({
      success: false,
      message: "An error occurred while creating the lead",
      error: errorMessage
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
