import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const DEFAULT_WORKSPACE_ID = "00000000-0000-0000-0000-000000000001";

interface PageMetrics {
  gsc: { clicks: number; impressions: number; position: number } | null;
  ga4: { sessions: number; engagementRate: number } | null;
}

function normalizeRoutePath(path: string): string {
  return path.replace(/\/$/, '') || '/';
}

export function useSeoAnalyticsConnection() {
  return useQuery({
    queryKey: ['google-connection-check', DEFAULT_WORKSPACE_ID],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('google_connections')
        .select('id, access_token')
        .eq('workspace_id', DEFAULT_WORKSPACE_ID)
        .eq('provider', 'google')
        .maybeSingle();
      if (error) throw error;
      return !!data?.access_token;
    },
    staleTime: 60000 // 1 minute
  });
}

export function useSeoListMetrics(routePaths: string[]) {
  const { data: isConnected } = useSeoAnalyticsConnection();
  
  return useQuery({
    queryKey: ['seo-list-metrics', routePaths],
    queryFn: async () => {
      if (routePaths.length === 0) return new Map<string, PageMetrics>();
      
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const dateStr = sevenDaysAgo.toISOString().split('T')[0];

      const normalizedPaths = routePaths.map(normalizeRoutePath);

      const [gscRes, ga4Res] = await Promise.all([
        supabase
          .from('gsc_page_daily')
          .select('page, clicks, impressions, position')
          .eq('workspace_id', DEFAULT_WORKSPACE_ID)
          .in('page', normalizedPaths)
          .gte('date', dateStr),
        supabase
          .from('ga4_page_daily')
          .select('page_path, sessions, engagement_rate')
          .eq('workspace_id', DEFAULT_WORKSPACE_ID)
          .in('page_path', normalizedPaths)
          .gte('date', dateStr)
      ]);

      const gscData = gscRes.data || [];
      const ga4Data = ga4Res.data || [];

      // Aggregate by page
      const gscByPage = new Map<string, { clicks: number; impressions: number; positions: number[] }>();
      gscData.forEach(row => {
        const existing = gscByPage.get(row.page) || { clicks: 0, impressions: 0, positions: [] };
        existing.clicks += row.clicks || 0;
        existing.impressions += row.impressions || 0;
        if (row.position) existing.positions.push(Number(row.position));
        gscByPage.set(row.page, existing);
      });

      const ga4ByPage = new Map<string, { sessions: number; engagementRates: number[] }>();
      ga4Data.forEach(row => {
        const existing = ga4ByPage.get(row.page_path) || { sessions: 0, engagementRates: [] };
        existing.sessions += row.sessions || 0;
        if (row.engagement_rate) existing.engagementRates.push(Number(row.engagement_rate));
        ga4ByPage.set(row.page_path, existing);
      });

      // Build result map
      const result = new Map<string, PageMetrics>();
      routePaths.forEach(path => {
        const normalized = normalizeRoutePath(path);
        const gscAgg = gscByPage.get(normalized);
        const ga4Agg = ga4ByPage.get(normalized);

        result.set(path, {
          gsc: gscAgg ? {
            clicks: gscAgg.clicks,
            impressions: gscAgg.impressions,
            position: gscAgg.positions.length > 0 
              ? gscAgg.positions.reduce((a, b) => a + b, 0) / gscAgg.positions.length 
              : 0
          } : null,
          ga4: ga4Agg ? {
            sessions: ga4Agg.sessions,
            engagementRate: ga4Agg.engagementRates.length > 0 
              ? ga4Agg.engagementRates.reduce((a, b) => a + b, 0) / ga4Agg.engagementRates.length 
              : 0
          } : null
        });
      });

      return result;
    },
    enabled: isConnected === true && routePaths.length > 0,
    staleTime: 60000 // 1 minute
  });
}
