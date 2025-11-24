import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Music library endpoint called");
    
    // ElevenLabs doesn't have a public music library listing API
    // They only support music generation via prompts
    // Return empty array for now - users can add their own music or we can implement generation
    
    return new Response(JSON.stringify({ 
      music: [],
      message: "Music library browsing not available. Use music generation or upload your own tracks."
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in elevenlabs-get-music:", error);
    return new Response(
      JSON.stringify({ 
        music: [],
        error: error instanceof Error ? error.message : "Unknown error" 
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
