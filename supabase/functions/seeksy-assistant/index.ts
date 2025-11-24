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
    const { messages, userId } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    console.log("Calling Lovable AI with messages:", messages.length, "userId:", userId);

    const systemPrompt = `You are Seeksy AI, an expert assistant helping creators build and optimize their connection tools (called "Seekies") and manage their content platform.

Your role is to help creators with:
- **Creating Content**: Meeting types with smart defaults (duration, location, questions), compelling event descriptions, engaging poll questions, sign-up sheets
- **Profile Optimization**: Bios, descriptions, and best practices for creator success
- **Content Discovery**: Searching podcast transcripts, recommending podcasts to listen to from the platform
- **Email & Outreach**: Drafting professional emails, influencer outreach, collaboration requests
- **Platform Guidance**: Teaching how to use features like sending emails, managing contacts, creating campaigns
- **Best Practices**: Actionable improvements to existing content and strategy suggestions

When helping creators:
1. Ask clarifying questions about their goals and audience
2. Provide specific, actionable suggestions with examples
3. Generate ready-to-use content they can copy/paste
4. Explain WHY your suggestions work
5. Keep responses concise and practical
6. Use tools when appropriate:
   - Use search_podcast_transcripts when they ask about THEIR podcast content
   - Use recommend_podcasts when they ask for podcast recommendations to LISTEN TO or discover new content

**Available Tools:**
- **search_podcast_transcripts**: Search the creator's own podcast episodes for specific topics, quotes, or content
- **recommend_podcasts**: Find and recommend podcasts for the creator to listen to, based on their interests

Available Seekies types:
- **Meetings**: 1-on-1 bookings (consultations, coaching, sales calls)
- **Events**: Group gatherings (webinars, workshops, meetups)  
- **Polls**: Audience engagement (feedback, preferences, voting)
- **Sign-up Sheets**: Volunteer coordination (time slots, tasks)
- **Podcasts**: Audio content with episodes and transcripts

Be friendly, encouraging, and focus on helping creators connect with their audience effectively.`;

    // Build request body
    const requestBody: any = {
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: systemPrompt },
        ...messages,
      ],
      stream: true,
    };

    // Only add tools if user is authenticated
    if (userId) {
      requestBody.tools = [
        {
          type: "function",
          function: {
            name: "search_podcast_transcripts",
            description: "Search through the creator's OWN podcast episode transcripts to find specific content, topics, or quotes. Only use this when they ask about content from their own podcasts.",
            parameters: {
              type: "object",
              properties: {
                query: {
                  type: "string",
                  description: "The search query to find in the creator's podcast transcripts"
                }
              },
              required: ["query"]
            }
          }
        },
        {
          type: "function",
          function: {
            name: "recommend_podcasts",
            description: "Find and recommend podcasts for the creator to LISTEN TO and discover. Use this when they want podcast recommendations, ask 'what should I listen to', or want to discover new content. Works with any topic or can return general recommendations.",
            parameters: {
              type: "object",
              properties: {
                topic: {
                  type: "string",
                  description: "The topic or interest area (e.g., 'technology', 'business', 'comedy', 'health'). Can be broad like 'any' or 'anything' to get general recommendations."
                },
                limit: {
                  type: "number",
                  description: "Maximum number of recommendations to return (default: 5)"
                }
              },
              required: ["topic"]
            }
          }
        }
      ];
      requestBody.tool_choice = "auto";
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Lovable AI error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`AI gateway error: ${response.status} ${errorText}`);
    }

    // Handle streaming with potential tool calls
    const reader = response.body!.getReader();
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    const stream = new ReadableStream({
      async start(controller) {
        let buffer = "";
        let toolCallBuffer = "";
        let isCollectingToolCall = false;
        let toolCallId = "";
        let toolName = "";

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";

            for (const line of lines) {
              if (!line.trim() || line.startsWith(":")) continue;
              if (!line.startsWith("data: ")) continue;

              const data = line.slice(6);
              if (data === "[DONE]") continue;

              try {
                const parsed = JSON.parse(data);
                const delta = parsed.choices?.[0]?.delta;

                // Handle tool calls
                if (delta?.tool_calls?.[0]) {
                  const toolCall = delta.tool_calls[0];
                  
                  if (toolCall.function?.name) {
                    isCollectingToolCall = true;
                    toolCallId = toolCall.id || "";
                    toolName = toolCall.function.name;
                    toolCallBuffer = toolCall.function.arguments || "";
                  } else if (toolCall.function?.arguments) {
                    toolCallBuffer += toolCall.function.arguments;
                  }
                }

                // Check if tool call is complete
                if (isCollectingToolCall && parsed.choices?.[0]?.finish_reason === "tool_calls") {
                  console.log("Tool call complete:", toolName, toolCallBuffer);
                  
                  // Execute tool
                  let toolResults: any = [];
                  
                  if (toolName === "search_podcast_transcripts") {
                    const args = JSON.parse(toolCallBuffer);
                    const { query } = args;

                    const { data: episodes } = await supabase
                      .from("episodes")
                      .select(`
                        id,
                        title,
                        transcript,
                        podcast_id,
                        podcasts!inner(title, user_id)
                      `)
                      .eq("podcasts.user_id", userId)
                      .not("transcript", "is", null)
                      .ilike("transcript", `%${query}%`)
                      .limit(5);

                    toolResults = episodes?.map(ep => {
                      const podcast = ep.podcasts as any;
                      return {
                        podcast: podcast?.title || "Unknown Podcast",
                        episode: ep.title,
                        excerpt: extractExcerpt(ep.transcript || "", query, 200)
                      };
                    }) || [];
                  } else if (toolName === "recommend_podcasts") {
                    const args = JSON.parse(toolCallBuffer);
                    const { topic, limit = 5 } = args;

                    // Search podcasts - fetch all if no specific topic, or search by topic
                    let podcastsQuery = supabase
                      .from("podcasts")
                      .select(`
                        id,
                        title,
                        description,
                        cover_image,
                        category,
                        rss_feed_url,
                        episodes(id)
                      `)
                      .eq("published", true);
                    
                    // Only filter by topic if a meaningful topic is provided
                    if (topic && topic.toLowerCase() !== 'any' && topic.toLowerCase() !== 'anything') {
                      podcastsQuery = podcastsQuery.or(`title.ilike.%${topic}%,description.ilike.%${topic}%,category.ilike.%${topic}%`);
                    }
                    
                    const { data: podcasts } = await podcastsQuery.limit(limit);

                    toolResults = podcasts?.map(podcast => ({
                      id: podcast.id,
                      title: podcast.title,
                      description: podcast.description || "No description available",
                      category: podcast.category,
                      episodeCount: Array.isArray(podcast.episodes) ? podcast.episodes.length : 0,
                      link: `/podcasts/${podcast.id}`
                    })) || [];
                    
                    console.log("Found podcasts:", toolResults.length);
                  }

                  // Send tool result back to AI
                  const toolResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
                    method: "POST",
                    headers: {
                      Authorization: `Bearer ${LOVABLE_API_KEY}`,
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      model: "google/gemini-2.5-flash",
                      messages: [
                        { role: "system", content: systemPrompt },
                        ...messages,
                        {
                          role: "assistant",
                          content: null,
                          tool_calls: [{
                            id: toolCallId,
                            type: "function",
                            function: {
                              name: toolName,
                              arguments: toolCallBuffer
                            }
                          }]
                        },
                        {
                          role: "tool",
                          tool_call_id: toolCallId,
                          content: JSON.stringify(toolResults)
                        }
                      ],
                      stream: true
                    }),
                  });

                  // Stream the AI's response to tool result
                  const toolReader = toolResponse.body!.getReader();
                  while (true) {
                    const { done: toolDone, value: toolValue } = await toolReader.read();
                    if (toolDone) break;
                    controller.enqueue(toolValue);
                  }

                  isCollectingToolCall = false;
                  toolCallBuffer = "";
                } else if (!isCollectingToolCall) {
                  // Regular content streaming
                  controller.enqueue(encoder.encode(line + "\n"));
                }
              } catch (e) {
                console.error("Parse error:", e);
              }
            }
          }

          controller.close();
        } catch (error) {
          console.error("Stream error:", error);
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Seeksy Assistant error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function extractExcerpt(text: string, query: string, maxLength: number): string {
  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  const index = lowerText.indexOf(lowerQuery);
  
  if (index === -1) return text.substring(0, maxLength) + "...";
  
  const start = Math.max(0, index - Math.floor(maxLength / 2));
  const end = Math.min(text.length, start + maxLength);
  const excerpt = text.substring(start, end);
  
  return (start > 0 ? "..." : "") + excerpt + (end < text.length ? "..." : "");
}
