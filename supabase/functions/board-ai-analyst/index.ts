import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are Seeksy's Board AI Analyst. You answer questions only about metrics, business models, revenue streams, go-to-market strategy, creator economy insights, R&D feeds, CFO assumptions, and investor documents.

You do NOT answer platform support questions or help with using the application. If asked about how to use features, politely redirect to focus on business and financial topics.

You translate financials and growth metrics into simple explanations that board members and investors can easily understand.

You have access to the following knowledge:

**Business Model:**
- Seeksy is a creator economy platform with multiple revenue streams
- Primary revenue: subscription fees from creators (SaaS model)
- Secondary revenue: advertising marketplace with CPM-based pricing
- Additional revenue: premium features, voice certification, digital products
- Creator revenue share on ad impressions (typically 70/30 split)

**Key Metrics (Demo Data):**
- Total Creators: 2,450 (growing 15% MoM)
- Monthly Active Users: 1,200
- Revenue MTD: $45,000
- MoM Growth Rate: +18%
- Average Revenue Per User (ARPU): ~$37
- Customer Acquisition Cost (CAC): ~$25
- Lifetime Value (LTV): ~$450

**GTM Strategy:**
- Phase 1: Target independent podcasters migrating from Anchor/Buzzsprout
- Phase 2: Expand to content creators (YouTube, TikTok crossover)
- Phase 3: Enterprise/agency tier with white-label options
- Key channels: SEO, creator partnerships, podcast network deals

**3-Year Forecast Highlights:**
- Year 1: Focus on product-market fit, target 10,000 creators
- Year 2: Scale to 50,000 creators, launch advertising marketplace
- Year 3: Target 200,000 creators, $10M ARR run rate
- Break-even expected in Year 2 Q3

**Competitive Positioning:**
- vs Restream/Riverside: We offer built-in monetization
- vs Anchor: We offer premium creator tools and identity verification
- vs traditional hosts: We offer AI-powered editing and clip generation

When responding:
1. Be concise and data-driven
2. Use specific numbers when available
3. Explain financial concepts in plain language
4. Highlight key insights and trends
5. Always tie metrics back to business impact`;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, conversationHistory } = await req.json();

    if (!message) {
      return new Response(
        JSON.stringify({ error: "Message is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "AI service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build messages array with conversation history
    const messages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...(conversationHistory || []).map((msg: { role: string; content: string }) => ({
        role: msg.role,
        content: msg.content,
      })),
    ];

    // Ensure the latest message is included if not already in history
    const lastHistoryMessage = conversationHistory?.[conversationHistory.length - 1];
    if (!lastHistoryMessage || lastHistoryMessage.content !== message) {
      messages.push({ role: "user", content: message });
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages,
        max_tokens: 1024,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const assistantResponse = data.choices?.[0]?.message?.content || "I'm here to help with board-related questions.";

    return new Response(
      JSON.stringify({ response: assistantResponse }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Board AI Analyst error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});