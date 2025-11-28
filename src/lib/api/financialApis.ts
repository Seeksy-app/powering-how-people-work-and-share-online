import { supabase } from "@/integrations/supabase/client";

/**
 * Financial APIs Integration
 * Connects CFO Dashboard to the Monetization Engine
 */

export interface EpisodeRevenue {
  episode_id: string;
  revenue_amount: number;
  platform_fee: number;
  creator_payout: number;
  impressions: number;
  ad_read_count: number;
  cpm_rate: number;
  created_at: string;
}

export interface PodcastRevenue {
  podcast_id: string;
  total_revenue: number;
  total_impressions: number;
  total_ad_reads: number;
  episodes: EpisodeRevenue[];
}

export interface AdSpendData {
  total_ad_spend: number;
  total_impressions: number;
  events: any[];
}

export interface ForecastData {
  forecasts: any[];
}

export interface CpmTier {
  id: string;
  tier_name: string;
  min_impressions: number;
  base_cpm: number;
  is_active: boolean;
}

export interface CreatorPayout {
  id: string;
  creator_id: string;
  amount: number;
  status: string;
  created_at: string;
}

export interface AwardsProgramRevenue {
  program_id: string;
  revenue_breakdown: {
    sponsorships: number;
    self_nominations: number;
    registrations: number;
    total: number;
  };
  transactions: any;
}

export interface AwardsSummary {
  total_revenue: number;
  program_count: number;
  programs: any[];
}

export interface AwardsSubmissions {
  total_submissions: number;
  sponsorships: number;
  nominations: number;
  registrations: number;
}

/**
 * Get revenue for a specific episode
 */
export async function getEpisodeRevenue(episodeId: string): Promise<EpisodeRevenue | null> {
  const { data, error } = await supabase.functions.invoke('get-financial-revenue', {
    body: { type: 'by-episode', id: episodeId }
  });
  
  if (error) {
    console.error('Error fetching episode revenue:', error);
    return null;
  }
  
  return data?.data?.episodes?.[0] || null;
}

/**
 * Get revenue for an entire podcast
 */
export async function getPodcastRevenue(podcastId: string): Promise<PodcastRevenue | null> {
  const { data, error } = await supabase.functions.invoke('get-financial-revenue', {
    body: { type: 'by-podcast', id: podcastId }
  });
  
  if (error) {
    console.error('Error fetching podcast revenue:', error);
    return null;
  }
  
  return data?.data || null;
}

/**
 * Get ad spend data with date filters
 */
export async function getAdSpend(startDate?: string, endDate?: string): Promise<AdSpendData | null> {
  const { data, error } = await supabase.functions.invoke('get-financial-revenue', {
    body: { 
      type: 'ad-spend',
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    }
  });
  
  if (error) {
    console.error('Error fetching ad spend:', error);
    return null;
  }
  
  return data?.data || null;
}

/**
 * Get revenue forecasts
 */
export async function getForecasts(): Promise<ForecastData | null> {
  const { data, error } = await supabase.functions.invoke('get-financial-revenue', {
    body: { type: 'forecasts' }
  });
  
  if (error) {
    console.error('Error fetching forecasts:', error);
    return null;
  }
  
  return data?.data || null;
}

/**
 * Get CPM tiers
 */
export async function getCpmTiers(): Promise<CpmTier[]> {
  const { data, error } = await supabase.functions.invoke('get-financial-revenue', {
    body: { type: 'cpm-tiers' }
  });
  
  if (error) {
    console.error('Error fetching CPM tiers:', error);
    return [];
  }
  
  return data?.data?.cpm_tiers || [];
}

/**
 * Get creator payouts
 */
export async function getCreatorPayouts(creatorId: string): Promise<CreatorPayout[]> {
  const { data, error } = await supabase.functions.invoke('get-financial-revenue', {
    body: { type: 'creator-payouts', id: creatorId }
  });
  
  if (error) {
    console.error('Error fetching creator payouts:', error);
    return [];
  }
  
  return data?.data?.payouts || [];
}

/**
 * Get revenue for a specific awards program
 */
export async function getAwardsProgramRevenue(programId: string): Promise<AwardsProgramRevenue | null> {
  const { data, error } = await supabase.functions.invoke('get-financial-revenue', {
    body: { type: 'awards-by-program', id: programId }
  });
  
  if (error) {
    console.error('Error fetching awards program revenue:', error);
    return null;
  }
  
  return data?.data || null;
}

/**
 * Get summary of all awards revenue
 */
export async function getAwardsSummary(): Promise<AwardsSummary | null> {
  const { data, error } = await supabase.functions.invoke('get-financial-revenue', {
    body: { type: 'awards-summary' }
  });
  
  if (error) {
    console.error('Error fetching awards summary:', error);
    return null;
  }
  
  return data?.data || null;
}

/**
 * Get awards submissions count
 */
export async function getAwardsSubmissions(): Promise<AwardsSubmissions | null> {
  const { data, error } = await supabase.functions.invoke('get-financial-revenue', {
    body: { type: 'awards-submissions' }
  });
  
  if (error) {
    console.error('Error fetching awards submissions:', error);
    return null;
  }
  
  return data?.data || null;
}

/**
 * Get comprehensive financial overview
 * Aggregates all revenue sources
 */
export async function getFinancialOverview() {
  try {
    const [adSpend, forecasts, cpmTiers, awardsSummary, awardsSubmissions] = await Promise.all([
      getAdSpend(),
      getForecasts(),
      getCpmTiers(),
      getAwardsSummary(),
      getAwardsSubmissions(),
    ]);
    
    return {
      adRevenue: adSpend?.total_ad_spend || 0,
      awardsRevenue: awardsSummary?.total_revenue || 0,
      totalRevenue: (adSpend?.total_ad_spend || 0) + (awardsSummary?.total_revenue || 0),
      totalImpressions: adSpend?.total_impressions || 0,
      programCount: awardsSummary?.program_count || 0,
      submissionsCount: awardsSubmissions?.total_submissions || 0,
      cpmTiers,
      forecasts: forecasts?.forecasts || [],
    };
  } catch (error) {
    console.error('Error fetching financial overview:', error);
    return null;
  }
}
