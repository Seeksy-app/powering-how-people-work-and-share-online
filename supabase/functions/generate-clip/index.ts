import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { mediaId, fileUrl, startTime, endTime, title, hook } = await req.json();
    
    console.log("Generating clip:", { mediaId, startTime, endTime, title });

    // Get auth token from request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error("Not authenticated");

    // Create authenticated client
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    // Get authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) throw new Error("Not authenticated");

    // Create a clip record
    const clipFileName = `clip_${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${Date.now()}.mp4`;
    
    const { data: clipData, error: clipError } = await supabase
      .from('media_files')
      .insert({
        user_id: user.id,
        file_name: clipFileName,
        file_url: fileUrl, // Store original URL for now
        file_type: 'video',
        source: 'clip',
        clip_metadata: {
          source_media_id: mediaId,
          start_time: startTime,
          end_time: endTime,
          title: title,
          hook: hook,
          aspect_ratio: '9:16',
          status: 'pending_processing'
        }
      })
      .select()
      .single();

    if (clipError) throw clipError;

    // For now, return URL with timestamp fragment for preview
    // Format: video.mp4#t=start,end (HTML5 video players will seek to this time)
    const previewUrl = `${fileUrl}#t=${startTime},${endTime}`;

    return new Response(
      JSON.stringify({
        success: true,
        clipUrl: previewUrl,
        clipId: clipData.id,
        message: "Clip marked for processing. Download will extract the time segment.",
        timeRange: { start: startTime, end: endTime },
        format: "9:16 vertical",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in generate-clip:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
