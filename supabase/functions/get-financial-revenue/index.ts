import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const url = new URL(req.url);
    const queryType = url.searchParams.get('type'); // 'by-episode', 'by-podcast', 'ad-spend', 'forecasts', 'cpm-tiers', 'creator-payouts'
    const entityId = url.searchParams.get('id');
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');

    let result;

    switch (queryType) {
      case 'by-episode':
        if (!entityId) throw new Error('Episode ID required');
        const { data: episodeRevenue } = await supabase
          .from('revenue_events')
          .select('*')
          .eq('episode_id', entityId)
          .order('created_at', { ascending: false });
        result = { episodes: episodeRevenue };
        break;

      case 'by-podcast':
        if (!entityId) throw new Error('Podcast ID required');
        const { data: podcastRevenue } = await supabase
          .from('revenue_events')
          .select('*')
          .eq('podcast_id', entityId)
          .order('created_at', { ascending: false });
        
        // Aggregate stats
        const totalRevenue = podcastRevenue?.reduce((sum, r) => sum + parseFloat(r.revenue_amount || 0), 0) || 0;
        const totalImpressions = podcastRevenue?.reduce((sum, r) => sum + (r.metadata?.impressions || 0), 0) || 0;
        const totalAdReads = podcastRevenue?.reduce((sum, r) => sum + (r.metadata?.ad_read_count || 0), 0) || 0;
        
        result = {
          podcast_id: entityId,
          total_revenue: totalRevenue,
          total_impressions: totalImpressions,
          total_ad_reads: totalAdReads,
          episodes: podcastRevenue,
        };
        break;

      case 'ad-spend':
        const adSpendQuery = supabase
          .from('ad_revenue_events')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (startDate) adSpendQuery.gte('created_at', startDate);
        if (endDate) adSpendQuery.lte('created_at', endDate);
        
        const { data: adSpendData } = await adSpendQuery;
        
        const totalSpend = adSpendData?.reduce((sum, r) => sum + parseFloat(r.revenue_amount || 0), 0) || 0;
        const totalImps = adSpendData?.reduce((sum, r) => sum + (r.impressions || 0), 0) || 0;
        
        result = {
          total_ad_spend: totalSpend,
          total_impressions: totalImps,
          events: adSpendData,
        };
        break;

      case 'forecasts':
        const { data: forecasts } = await supabase
          .from('revenue_forecasts')
          .select('*')
          .order('forecast_date', { ascending: false })
          .limit(30);
        result = { forecasts };
        break;

      case 'cpm-tiers':
        const { data: cpmTiers } = await supabase
          .from('cpm_tiers')
          .select('*')
          .eq('is_active', true)
          .order('base_cpm', { ascending: false });
        result = { cpm_tiers: cpmTiers };
        break;

      case 'creator-payouts':
        if (!entityId) throw new Error('Creator ID required');
        const { data: payouts } = await supabase
          .from('creator_payouts')
          .select('*')
          .eq('creator_id', entityId)
          .order('created_at', { ascending: false });
        result = { payouts };
        break;

      default:
        throw new Error('Invalid query type');
    }

    return new Response(
      JSON.stringify({ success: true, data: result }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Financial revenue query error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});