import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * PHASE 1: Generate both vertical (9:16) and thumbnail clips
 * Orchestrates FFmpeg processing for complete OpusClip-style output
 */

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { mediaId, fileUrl, startTime, endTime, title, hook, transcript, caption } = await req.json();
    
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

    console.log("Generating clips for:", { mediaId, startTime, endTime, title, userId: user.id });

    // Create clip record in database
    const { data: clipData, error: clipError } = await supabase
      .from('clips')
      .insert({
        user_id: user.id,
        source_media_id: mediaId,
        start_seconds: startTime,
        end_seconds: endTime,
        title: title,
        suggested_caption: caption || hook,
        status: 'processing'
      })
      .select()
      .single();

    if (clipError) {
      console.error("Error creating clip record:", clipError);
      throw clipError;
    }

    console.log("Created clip record:", clipData.id);

    // Process BOTH formats sequentially (vertical first, then thumbnail)
    // This ensures reliable completion and proper error handling
    
    try {
      // Process vertical clip (9:16)
      console.log("Starting vertical clip processing...");
      const { data: verticalData, error: verticalError } = await supabase.functions.invoke("process-clip-ffmpeg", {
        body: {
          clipId: clipData.id,
          sourceVideoUrl: fileUrl,
          startTime,
          endTime,
          title,
          caption: caption || hook,
          transcript,
          outputFormat: 'vertical'
        }
      });
      
      if (verticalError) {
        console.error("Vertical clip error:", verticalError);
      } else {
        console.log("Vertical clip complete:", verticalData?.clipUrl);
      }

      // Process thumbnail clip (square)
      console.log("Starting thumbnail clip processing...");
      const { data: thumbnailData, error: thumbnailError } = await supabase.functions.invoke("process-clip-ffmpeg", {
        body: {
          clipId: clipData.id,
          sourceVideoUrl: fileUrl,
          startTime,
          endTime,
          title,
          caption: caption || hook,
          transcript,
          outputFormat: 'thumbnail_square'
        }
      });
      
      if (thumbnailError) {
        console.error("Thumbnail clip error:", thumbnailError);
      } else {
        console.log("Thumbnail clip complete:", thumbnailData?.clipUrl);
      }

      // Update final status
      const bothSucceeded = !verticalError && !thumbnailError;
      const oneSucceeded = (!verticalError && thumbnailError) || (verticalError && !thumbnailError);
      
      await supabase
        .from('clips')
        .update({
          status: bothSucceeded ? 'ready' : (oneSucceeded ? 'partial' : 'failed'),
          vertical_url: verticalData?.clipUrl || null,
          thumbnail_url: thumbnailData?.clipUrl || null,
          error_message: verticalError || thumbnailError ? 
            `Vertical: ${verticalError?.message || 'OK'}, Thumbnail: ${thumbnailError?.message || 'OK'}` : null
        })
        .eq('id', clipData.id);

    } catch (processingError) {
      console.error("Clip processing failed:", processingError);
      await supabase
        .from('clips')
        .update({
          status: 'failed',
          error_message: processingError instanceof Error ? processingError.message : 'Unknown processing error'
        })
        .eq('id', clipData.id);
    }

    // Return clip info
    return new Response(
      JSON.stringify({
        success: true,
        clipId: clipData.id,
        message: "Clip generation started. Processing vertical and thumbnail formats...",
        timeRange: { start: startTime, end: endTime },
        status: "processing",
        formats: ["vertical", "thumbnail"]
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
