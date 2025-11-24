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
    const { mediaId, fileUrl, duration, transcript } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Analyzing video for clips:", { mediaId, duration, hasTranscript: !!transcript });

    // Build context for AI - use transcript if available
    let analysisContext = `Analyze a ${duration || 'unknown'}-second video and identify 3-5 viral-worthy clips.`;
    
    if (transcript) {
      analysisContext += `\n\nVideo Transcript:\n${transcript}\n\nUse this transcript to identify specific moments with compelling quotes or topics.`;
    } else {
      analysisContext += `\n\nNo transcript available - suggest general clip segments based on typical video content patterns.`;
    }

    // AI analyzes the video to find viral-worthy moments
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are an expert at finding viral-worthy moments in video content for TikTok and Instagram Reels. 
You identify clips that:
- Have a strong hook in the first 3 seconds
- Tell a complete micro-story (15-60 seconds)
- Have emotional impact or surprising moments
- Are self-contained and don't need context
- Have natural start/end points

Return clips in order of virality potential.`
          },
          {
            role: "user",
            content: `${analysisContext}

For each clip, provide:
1. start_time (seconds)
2. end_time (seconds, clips should be 15-60s)
3. title (catchy, 5-8 words)
4. description (why this moment is viral-worthy)
5. virality_score (0-100, how likely to go viral)
6. hook (the first line/moment that grabs attention)

Video duration: ${duration || 'unknown'} seconds`
          }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "identify_clips",
              description: "Identify viral-worthy video clips",
              parameters: {
                type: "object",
                properties: {
                  clips: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        start_time: { type: "number", description: "Start time in seconds" },
                        end_time: { type: "number", description: "End time in seconds" },
                        title: { type: "string", description: "Catchy clip title" },
                        description: { type: "string", description: "Why this is viral-worthy" },
                        virality_score: { type: "number", description: "Virality score 0-100" },
                        hook: { type: "string", description: "The attention-grabbing opening" }
                      },
                      required: ["start_time", "end_time", "title", "description", "virality_score", "hook"]
                    }
                  }
                },
                required: ["clips"]
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "identify_clips" } }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI API error:", response.status, errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    
    if (!toolCall) {
      throw new Error("No clips identified by AI");
    }

    const result = JSON.parse(toolCall.function.arguments);
    console.log("Clips identified:", result.clips.length);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in analyze-clips:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
