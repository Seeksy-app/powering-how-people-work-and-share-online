import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ScenarioConfig {
  scenario_key: string;
  label: string;
  revenue_growth_multiplier: number;
  market_adoption_multiplier: number;
  churn_multiplier: number;
  cac_multiplier: number;
  impressions_multiplier: number;
  cpm_multiplier: number;
  fill_rate_multiplier: number;
  platform_revshare_adjustment: number;
}

interface Benchmark {
  metric_key: string;
  value: number;
  unit: string;
  confidence: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('[ProForma] Starting forecast generation...');
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    
    if (!lovableApiKey) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const { scenarioKey, years = [2025, 2026, 2027], cfoOverrides = {} } = await req.json();
    console.log('[ProForma] Generating for scenario:', scenarioKey, 'years:', years);

    // Fetch scenario config
    const { data: scenarioConfig, error: scenarioError } = await supabase
      .from('scenario_configs')
      .select('*')
      .eq('scenario_key', scenarioKey)
      .single();

    if (scenarioError || !scenarioConfig) {
      console.error('[ProForma] Scenario error:', scenarioError);
      throw new Error(`Scenario not found: ${scenarioKey}`);
    }

    // Fetch all benchmarks
    const { data: benchmarks, error: benchmarksError } = await supabase
      .from('rd_benchmarks')
      .select('metric_key, value, unit, confidence');

    if (benchmarksError) {
      console.error('[ProForma] Benchmarks error:', benchmarksError);
      throw new Error(`Failed to fetch benchmarks: ${benchmarksError.message}`);
    }

    console.log('[ProForma] Loaded', benchmarks?.length, 'benchmarks');

    // Convert benchmarks to a lookup map
    const benchmarkMap: Record<string, number> = {};
    benchmarks?.forEach((b: Benchmark) => {
      benchmarkMap[b.metric_key] = Number(b.value);
    });

    // Apply CFO overrides
    Object.entries(cfoOverrides).forEach(([key, value]) => {
      if (typeof value === 'number') {
        benchmarkMap[key] = value;
      }
    });

    // Helper to get benchmark with fallback
    const getBenchmark = (key: string, fallback: number = 0) => benchmarkMap[key] ?? fallback;

    // Build prompt for AI
    const systemPrompt = `You are a CFO AI assistant for Seeksy, a creator economy platform. Generate detailed financial projections based on the provided benchmarks and scenario multipliers.

IMPORTANT: You must return ONLY valid JSON, no markdown, no explanations. The JSON must follow this exact structure:
{
  "years": [
    {
      "year": 2025,
      "revenue": {
        "subscriptions": { "free": 0, "pro": X, "business": X, "enterprise": X, "total": X },
        "aiCredits": { "clips": X, "postProduction": X, "transcription": X, "total": X },
        "podcastHosting": { "hosting": X, "storage": X, "total": X },
        "advertising": {
          "hostReadAudio": { "impressions": X, "cpm": X, "fillRate": X, "revenue": X, "platformShare": X },
          "programmaticAudio": { "impressions": X, "cpm": X, "fillRate": X, "revenue": X, "platformShare": X },
          "videoPreroll": { "impressions": X, "cpm": X, "fillRate": X, "revenue": X, "platformShare": X },
          "videoMidroll": { "impressions": X, "cpm": X, "fillRate": X, "revenue": X, "platformShare": X },
          "brandDeals": { "deals": X, "avgValue": X, "revenue": X, "platformShare": X },
          "newsletter": { "impressions": X, "cpm": X, "revenue": X, "platformShare": X },
          "display": { "impressions": X, "cpm": X, "revenue": X, "platformShare": X },
          "total": X,
          "totalPlatformRevenue": X
        },
        "events": { "tickets": X, "sponsorships": X, "livestream": X, "total": X },
        "licensing": { "whiteLabel": X, "enterprise": X, "total": X },
        "totalRevenue": X
      },
      "expenses": {
        "cogs": X,
        "salesMarketing": X,
        "rd": X,
        "ga": X,
        "total": X
      },
      "ebitda": X,
      "ebitdaMargin": X,
      "creatorCount": X,
      "subscriberCount": X,
      "churnRate": X,
      "cac": X,
      "ltv": X
    }
  ],
  "breakEvenYear": X,
  "commentary": "Brief 2-3 sentence analysis of the projections"
}`;

    const userPrompt = `Generate a ${scenarioConfig.label} scenario financial projection for Seeksy for years ${years.join(', ')}.

SCENARIO MULTIPLIERS:
- Revenue Growth: ${scenarioConfig.revenue_growth_multiplier}x
- Market Adoption: ${scenarioConfig.market_adoption_multiplier}x
- Churn: ${scenarioConfig.churn_multiplier}x (higher = worse)
- CAC: ${scenarioConfig.cac_multiplier}x (higher = worse)
- Impressions: ${scenarioConfig.impressions_multiplier}x
- CPM: ${scenarioConfig.cpm_multiplier}x
- Fill Rate: ${scenarioConfig.fill_rate_multiplier}x
- Platform RevShare Adjustment: ${scenarioConfig.platform_revshare_adjustment}

KEY BENCHMARKS (from rd_benchmarks table):
- Creator TAM 2027: $${((getBenchmark('creator_tam_2027', 480000000000)) / 1e9).toFixed(1)}B
- Podcast Ad CAGR: ${getBenchmark('podcast_ad_cagr', 15)}%

AUDIO CPMs:
- Host-Read Pre-Roll: $${getBenchmark('audio_hostread_preroll_cpm_low', 18)}-$${getBenchmark('audio_hostread_preroll_cpm_high', 25)}
- Host-Read Mid-Roll: $${getBenchmark('audio_hostread_midroll_cpm_low', 22)}-$${getBenchmark('audio_hostread_midroll_cpm_high', 30)}
- Programmatic: $${getBenchmark('audio_programmatic_cpm_low', 8)}-$${getBenchmark('audio_programmatic_cpm_high', 15)}

VIDEO CPMs:
- Pre-Roll: $${getBenchmark('video_preroll_cpm_low', 10)}-$${getBenchmark('video_preroll_cpm_high', 20)}
- Mid-Roll: $${getBenchmark('video_midroll_cpm_low', 15)}-$${getBenchmark('video_midroll_cpm_high', 28)}

OTHER CHANNELS:
- Newsletter CPM: $${getBenchmark('newsletter_cpm_avg', 35)}
- Display CPM: $${getBenchmark('display_cpm_avg', 5)}
- Livestream CPM: $${getBenchmark('livestream_cpm_blended', 18)}

FILL RATES:
- Audio: ${getBenchmark('audio_fill_rate', 65)}%
- Video: ${getBenchmark('video_fill_rate', 55)}%
- Newsletter: ${getBenchmark('newsletter_fill_rate', 80)}%
- Livestream: ${getBenchmark('livestream_fill_rate', 45)}%

AD LOAD:
- Audio Ad Slots per Episode: ${getBenchmark('audio_ad_slots_per_episode', 3)}
- Video Ad Slots per Video: ${getBenchmark('video_ad_slots_per_video', 2)}
- Livestream Ad Slots per Hour: ${getBenchmark('livestream_ad_slots_per_hour', 4)}

REVENUE SHARES (Creator vs Platform):
- Host-Read: ${getBenchmark('hostread_creator_share', 70)}% / ${getBenchmark('hostread_platform_share', 30)}%
- Programmatic: ${getBenchmark('programmatic_creator_share', 60)}% / ${getBenchmark('programmatic_platform_share', 40)}%
- Brand Deals: ${getBenchmark('brand_deal_creator_share', 80)}% / ${getBenchmark('brand_deal_platform_share', 20)}%
- Newsletter: ${getBenchmark('newsletter_creator_share', 75)}% / ${getBenchmark('newsletter_platform_share', 25)}%
- Livestream: ${getBenchmark('livestream_creator_share', 65)}% / ${getBenchmark('livestream_platform_share', 35)}%

SUBSCRIPTIONS:
- Pro ARPU: $${getBenchmark('creator_subscription_arpu_pro', 29)}
- Business ARPU: $${getBenchmark('creator_subscription_arpu_business', 79)}
- Enterprise ARPU: $${getBenchmark('creator_subscription_arpu_enterprise', 299)}

UNIT ECONOMICS:
- Creator CAC (Organic): $${getBenchmark('creator_cac_organic', 15)}
- Creator CAC (Paid): $${getBenchmark('creator_cac_paid', 45)}
- Monthly Churn: ${getBenchmark('creator_monthly_churn', 5)}%

CREATOR SEGMENTS (Monthly Impressions):
- Small Podcasters: ${getBenchmark('podcaster_small_monthly_impressions_low', 500)}-${getBenchmark('podcaster_small_monthly_impressions_high', 5000)}
- Mid Podcasters: ${getBenchmark('podcaster_mid_monthly_impressions_low', 5000)}-${getBenchmark('podcaster_mid_monthly_impressions_high', 50000)}
- Large Podcasters: ${getBenchmark('podcaster_large_monthly_impressions_low', 50000)}-${getBenchmark('podcaster_large_monthly_impressions_high', 500000)}
- Video Creator (Small): ${getBenchmark('video_creator_small_monthly_views_low', 1000)}-${getBenchmark('video_creator_small_monthly_views_high', 10000)}
- Video Creator (Mid): ${getBenchmark('video_creator_mid_monthly_views_low', 10000)}-${getBenchmark('video_creator_mid_monthly_views_high', 100000)}
- Video Creator (Large): ${getBenchmark('video_creator_large_monthly_views_low', 100000)}-${getBenchmark('video_creator_large_monthly_views_high', 1000000)}

BRAND DEALS:
- Flat Fee Range: $${getBenchmark('brand_deal_flat_fee_low', 250)}-$${getBenchmark('brand_deal_flat_fee_high', 10000)}
- Avg Sponsorship Rate: $${getBenchmark('creator_sponsorship_rate_avg', 500)}

STARTING ASSUMPTIONS (Year 1):
- Starting Creators: 5,000
- Starting Paid Subscribers: 500
- Starting Ad-Enabled Creators: 250
- Average Episodes/Month: 4

Apply the scenario multipliers to generate realistic projections. For advertising revenue, calculate:
1. Total Impressions = Creator Count × Monthly Impressions (by segment) × Fill Rate
2. Revenue = (Impressions / 1000) × CPM × Scenario Multiplier
3. Platform Share = Revenue × Platform RevShare %

Show year-over-year growth aligned with the scenario type. Return ONLY the JSON object.`;

    console.log('[ProForma] Calling AI API...');
    
    // Call AI API
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${lovableApiKey}`,
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.3,
        max_tokens: 8000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[ProForma] AI API error:', response.status, errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const aiResult = await response.json();
    const content = aiResult.choices?.[0]?.message?.content || '';
    console.log('[ProForma] AI response received, length:', content.length);
    
    // Parse AI response
    let forecast;
    try {
      // Clean up potential markdown formatting
      const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      forecast = JSON.parse(cleanContent);
      console.log('[ProForma] Successfully parsed forecast for', forecast.years?.length, 'years');
    } catch (parseError) {
      console.error('[ProForma] Failed to parse AI response:', content.substring(0, 500));
      throw new Error('Failed to parse AI forecast response');
    }

    // Store forecast in database
    for (const yearData of forecast.years || []) {
      console.log('[ProForma] Storing forecast for year:', yearData.year);
      
      const { error: upsertError } = await supabase.from('proforma_forecasts').upsert({
        scenario_key: scenarioKey,
        forecast_year: yearData.year,
        revenue_data: yearData.revenue,
        expense_data: yearData.expenses,
        ad_revenue_breakdown: yearData.revenue?.advertising || {},
        summary_metrics: {
          ebitda: yearData.ebitda,
          ebitdaMargin: yearData.ebitdaMargin,
          creatorCount: yearData.creatorCount,
          subscriberCount: yearData.subscriberCount,
          churnRate: yearData.churnRate,
          cac: yearData.cac,
          ltv: yearData.ltv,
        },
        benchmarks_used: Object.keys(benchmarkMap),
        ai_commentary: forecast.commentary,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'scenario_key,forecast_year',
      });
      
      if (upsertError) {
        console.error('[ProForma] Upsert error for year', yearData.year, ':', upsertError);
      }
    }

    console.log('[ProForma] Forecast generation complete');

    return new Response(
      JSON.stringify({
        success: true,
        scenario: scenarioConfig.label,
        forecast,
        benchmarksUsed: benchmarks?.length || 0,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('[ProForma] Error generating forecast:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});