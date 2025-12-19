import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format, startOfDay, endOfDay } from 'date-fns';
import { toZonedTime, fromZonedTime } from 'date-fns-tz';

// Maps trucking_call_logs to the TruckingCall interface used by analytics
export interface TruckingCall {
  id: string;
  created_at: string;
  call_provider: string | null;
  call_external_id: string | null;
  agent_name: string;
  caller_phone: string | null;
  mc_number: string | null;
  company_name: string | null;
  primary_load_id: string | null;
  load_ids_discussed: string[] | null;
  transcript_text: string | null;
  call_outcome: 'confirmed' | 'declined' | 'callback_requested' | 'incomplete' | 'error' | 'booked' | 'lead_created' | 'resolved' | 'hangup';
  handoff_requested: boolean;
  handoff_reason: string | null;
  lead_created: boolean;
  lead_create_error: string | null;
  cei_score: number;
  cei_band: '90-100' | '75-89' | '50-74' | '25-49' | '0-24';
  cei_reasons: string[] | null;
  owner_id: string | null;
  reviewed_at: string | null;
  reviewed_by: string | null;
  flagged_for_coaching: boolean | null;
  internal_notes: string | null;
  call_duration_seconds: number | null;
  audio_url: string | null;
  time_to_handoff_seconds: number | null;
  // Additional fields from trucking_call_logs for display
  summary: string | null;
  transcript: string | null;
  recording_url: string | null;
  // Sentiment fields
  sentiment_score: number | null;
  sentiment_label: string | null;
  was_high_intent: boolean | null;
  was_premium: boolean | null;
}

export interface TruckingCallEvent {
  id: string;
  call_id: string;
  created_at: string;
  event_type: string;
  severity: 'info' | 'warn' | 'error';
  source: 'agent' | 'tool' | 'system' | 'classifier';
  phrase: string | null;
  metadata: Record<string, unknown> | null;
  cei_delta: number | null;
}

export interface TruckingDailyReport {
  id: string;
  report_date: string;
  created_at: string;
  total_calls: number;
  resolved_without_handoff_pct: number;
  handoff_requested_pct: number;
  lead_created_pct: number;
  avg_cei_score: number;
  cei_band_breakdown: Record<string, number>;
  top_frustration_phrases: string[] | null;
  top_success_signals: string[] | null;
  ai_summary_text: string;
  ai_insights_json: Record<string, unknown>;
  owner_id: string | null;
  sent_to_dispatch_at: string | null;
}

// CEI Band type
type CeiBand = '90-100' | '75-89' | '50-74' | '25-49' | '0-24';

// Helper to compute CEI band from score
function getCeiBand(score: number | null): CeiBand {
  if (score === null || score === undefined) return '50-74';
  if (score >= 90) return '90-100';
  if (score >= 75) return '75-89';
  if (score >= 50) return '50-74';
  if (score >= 25) return '25-49';
  return '0-24';
}

// Map outcome string to the expected enum
function mapOutcome(outcome: string | null): TruckingCall['call_outcome'] {
  if (!outcome) return 'incomplete';
  const lower = outcome.toLowerCase();
  if (lower === 'confirmed' || lower === 'completed') return 'confirmed';
  if (lower === 'declined') return 'declined';
  if (lower === 'callback' || lower === 'callback_requested') return 'callback_requested';
  if (lower === 'error' || lower === 'failed') return 'error';
  if (lower === 'booked') return 'booked';
  if (lower === 'lead_created') return 'lead_created';
  if (lower === 'resolved') return 'resolved';
  if (lower === 'hangup') return 'hangup';
  return 'incomplete';
}

// Transform view row to TruckingCall
function transformCallLog(log: Record<string, unknown>): TruckingCall {
  const durationSeconds = (log.duration_seconds as number | null) ?? 0;
  
  // Use CEI score from database (computed by the view/function) or calculate fallback
  let ceiScore = log.cei_score as number | null;
  if (ceiScore === null || ceiScore === undefined) {
    // Fallback: Estimate CEI score based on call success and duration
    ceiScore = 50; // Base score
    if (log.call_successful === true) ceiScore += 30;
    if (log.lead_id) ceiScore += 20;
    if (durationSeconds > 60) ceiScore += 10;
    if (durationSeconds < 15) ceiScore -= 20;
    ceiScore = Math.max(0, Math.min(100, ceiScore));
  }
  
  const ceiBand = (log.cei_band as CeiBand) || getCeiBand(ceiScore);
  
  return {
    id: log.id as string,
    created_at: (log.call_started_at as string) || (log.created_at as string),
    call_provider: (log.source as string) || 'elevenlabs',
    call_external_id: (log.elevenlabs_conversation_id as string) || (log.twilio_call_sid as string) || null,
    agent_name: 'Jess', // Default agent name
    caller_phone: log.carrier_phone as string | null,
    mc_number: null, // Not stored directly in call_logs
    company_name: null, // Would need to join with lead
    primary_load_id: log.load_id as string | null,
    load_ids_discussed: log.load_id ? [log.load_id as string] : null,
    transcript_text: (log.transcript as string) || null,
    call_outcome: mapOutcome((log.call_outcome as string) || (log.outcome as string)),
    handoff_requested: false, // Would need separate tracking
    handoff_reason: null,
    lead_created: !!log.lead_id,
    lead_create_error: null,
    cei_score: ceiScore,
    cei_band: ceiBand,
    cei_reasons: null,
    owner_id: log.owner_id as string | null,
    reviewed_at: null,
    reviewed_by: null,
    flagged_for_coaching: null,
    internal_notes: null,
    call_duration_seconds: durationSeconds,
    audio_url: log.recording_url as string | null,
    time_to_handoff_seconds: null,
    summary: log.summary as string | null,
    transcript: log.transcript as string | null,
    recording_url: log.recording_url as string | null,
    sentiment_score: log.sentiment_score as number | null,
    sentiment_label: log.sentiment_label as string | null,
    was_high_intent: log.was_high_intent as boolean | null,
    was_premium: log.was_premium as boolean | null,
  };
}

export function useTruckingCalls(date: Date) {
  return useQuery({
    queryKey: ['trucking-calls', format(date, 'yyyy-MM-dd')],
    queryFn: async () => {
      // Format date for CST comparison
      const cstTz = 'America/Chicago';
      const dateInCst = toZonedTime(date, cstTz);
      const dateStr = format(dateInCst, 'yyyy-MM-dd');
      
      // Query the v_trucking_calls_daily_cst view with call_date_cst filter
      const { data, error } = await supabase
        .from('v_trucking_calls_daily_cst')
        .select(`
          id,
          carrier_phone,
          receiver_number,
          call_started_at,
          created_at,
          duration_seconds,
          outcome,
          call_outcome,
          was_high_intent,
          was_premium,
          sentiment_label,
          sentiment_score,
          cei_score,
          cei_band,
          elevenlabs_conversation_id,
          twilio_call_sid,
          load_id,
          lead_id,
          transcript,
          summary,
          recording_url,
          source,
          owner_id,
          call_date_cst
        `)
        .eq('call_date_cst', dateStr)
        .order('call_started_at', { ascending: false });
      
      if (error) throw error;
      
      // Transform to TruckingCall interface
      return (data || []).map(log => transformCallLog(log as Record<string, unknown>));
    },
  });
}

// Hook to fetch KPIs from the view
export function useTruckingKPIs(date: Date) {
  return useQuery({
    queryKey: ['trucking-kpis', format(date, 'yyyy-MM-dd')],
    queryFn: async () => {
      const cstTz = 'America/Chicago';
      const dateInCst = toZonedTime(date, cstTz);
      const dateStr = format(dateInCst, 'yyyy-MM-dd');
      
      const { data, error } = await supabase
        .from('v_trucking_call_kpis_by_day_cst')
        .select('*')
        .eq('call_date_cst', dateStr)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
  });
}

// Hook to fetch CEI band breakdown from the view
export function useTruckingCEIBands(date: Date) {
  return useQuery({
    queryKey: ['trucking-cei-bands', format(date, 'yyyy-MM-dd')],
    queryFn: async () => {
      const cstTz = 'America/Chicago';
      const dateInCst = toZonedTime(date, cstTz);
      const dateStr = format(dateInCst, 'yyyy-MM-dd');
      
      const { data, error } = await supabase
        .from('v_trucking_cei_band_by_day_cst')
        .select('*')
        .eq('call_date_cst', dateStr)
        .order('cei_band');
      
      if (error) throw error;
      return data || [];
    },
  });
}

// Hook to fetch emotions breakdown from the view
export function useTruckingEmotions(date: Date) {
  return useQuery({
    queryKey: ['trucking-emotions', format(date, 'yyyy-MM-dd')],
    queryFn: async () => {
      const cstTz = 'America/Chicago';
      const dateInCst = toZonedTime(date, cstTz);
      const dateStr = format(dateInCst, 'yyyy-MM-dd');
      
      const { data, error } = await supabase
        .from('v_trucking_emotions_by_day_cst')
        .select('*')
        .eq('call_date_cst', dateStr)
        .order('calls', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
  });
}

export function useTruckingCallEvents(callId: string | null) {
  return useQuery({
    queryKey: ['trucking-call-events', callId],
    queryFn: async () => {
      if (!callId) return [];
      
      const { data, error } = await supabase
        .from('trucking_call_events')
        .select('*')
        .eq('call_id', callId)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data as TruckingCallEvent[];
    },
    enabled: !!callId,
  });
}

export function useTruckingDailyReport(date: Date) {
  return useQuery({
    queryKey: ['trucking-daily-report', format(date, 'yyyy-MM-dd')],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('trucking_daily_reports')
        .select('*')
        .eq('report_date', format(date, 'yyyy-MM-dd'))
        .maybeSingle();
      
      if (error) throw error;
      return data as TruckingDailyReport | null;
    },
  });
}

export function useMarkCallReviewed() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ callId, userId }: { callId: string; userId: string }) => {
      console.warn('Mark reviewed not yet supported for trucking_call_logs');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trucking-calls'] });
    },
  });
}

export function useFlagCallForCoaching() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ callId, flagged }: { callId: string; flagged: boolean }) => {
      console.warn('Flag for coaching not yet supported for trucking_call_logs');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trucking-calls'] });
    },
  });
}

export function useUpdateCallNotes() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ callId, notes }: { callId: string; notes: string }) => {
      console.warn('Call notes not yet supported for trucking_call_logs');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trucking-calls'] });
    },
  });
}

export function useTruckingCallsStats(date: Date) {
  const { data: calls, isLoading: callsLoading } = useTruckingCalls(date);
  const { data: kpis, isLoading: kpisLoading } = useTruckingKPIs(date);
  const { data: ceiBands, isLoading: bandsLoading } = useTruckingCEIBands(date);
  
  const isLoading = callsLoading || kpisLoading || bandsLoading;
  
  const emptyStats = {
    isLoading,
    totalCalls: 0,
    resolvedWithoutHandoffPct: 0,
    handoffRequestedPct: 0,
    leadCreatedPct: 0,
    avgCeiScore: 0,
    ceiBandBreakdown: { '90-100': 0, '75-89': 0, '50-74': 0, '25-49': 0, '0-24': 0 },
    // Engagement metrics
    avgDurationSeconds: 0,
    engagedCallsCount: 0,
    quickHangupsCount: 0,
    avgTimeToHandoffSeconds: null as number | null,
    // KPI view data
    connectedCalls: 0,
    leadsCreated: 0,
    successfulOutcomes: 0,
    booked: 0,
    callbackRequested: 0,
    highIntentCalls: 0,
    negativeCalls: 0,
    neutralCalls: 0,
    positiveCalls: 0,
  };

  if (isLoading || !calls) {
    return emptyStats;
  }
  
  const totalCalls = kpis?.total_calls || calls.length;
  if (totalCalls === 0) {
    return { ...emptyStats, isLoading: false };
  }
  
  // Use KPIs from view if available
  const connectedCalls = kpis?.connected_calls || 0;
  const quickHangups = kpis?.quick_hangups || 0;
  const leadsCreated = kpis?.leads_created || 0;
  const successfulOutcomes = kpis?.successful_outcomes || 0;
  const booked = kpis?.booked || 0;
  const callbackRequested = kpis?.callback_requested || 0;
  const highIntentCalls = kpis?.high_intent_calls || 0;
  const avgCei = kpis?.avg_cei || 0;
  const negativeCalls = kpis?.negative_calls || 0;
  const neutralCalls = kpis?.neutral_calls || 0;
  const positiveCalls = kpis?.positive_calls || 0;
  
  // Build CEI band breakdown from view data
  const ceiBandBreakdown: Record<string, number> = {
    '90-100': 0,
    '75-89': 0,
    '50-74': 0,
    '25-49': 0,
    '0-24': 0,
  };
  
  if (ceiBands) {
    ceiBands.forEach((band: { cei_band: string; calls: number }) => {
      if (band.cei_band && ceiBandBreakdown.hasOwnProperty(band.cei_band)) {
        ceiBandBreakdown[band.cei_band] = band.calls;
      }
    });
  }
  
  // Calculate engagement metrics from calls data
  const callsWithDuration = calls.filter(c => c.call_duration_seconds != null && c.call_duration_seconds > 0);
  const avgDurationSeconds = callsWithDuration.length > 0 
    ? callsWithDuration.reduce((sum, c) => sum + (c.call_duration_seconds || 0), 0) / callsWithDuration.length
    : 0;
  
  const engagedCallsCount = calls.filter(c => (c.call_duration_seconds || 0) > 90).length;
  const quickHangupsCount = quickHangups || calls.filter(c => (c.call_duration_seconds || 0) < 30 && (c.call_duration_seconds || 0) > 0).length;
  
  // Calculate percentages
  const resolvedWithoutHandoff = calls.filter(c => !c.handoff_requested).length;
  const handoffRequested = calls.filter(c => c.handoff_requested).length;
  const leadCreatedCount = leadsCreated || calls.filter(c => c.lead_created).length;
  
  return {
    isLoading: false,
    totalCalls,
    resolvedWithoutHandoffPct: totalCalls > 0 ? (resolvedWithoutHandoff / totalCalls) * 100 : 0,
    handoffRequestedPct: totalCalls > 0 ? (handoffRequested / totalCalls) * 100 : 0,
    leadCreatedPct: totalCalls > 0 ? (leadCreatedCount / totalCalls) * 100 : 0,
    avgCeiScore: Math.round(avgCei),
    ceiBandBreakdown: {
      '90-100': ceiBandBreakdown['90-100'] || 0,
      '75-89': ceiBandBreakdown['75-89'] || 0,
      '50-74': ceiBandBreakdown['50-74'] || 0,
      '25-49': ceiBandBreakdown['25-49'] || 0,
      '0-24': ceiBandBreakdown['0-24'] || 0,
    },
    // Engagement metrics
    avgDurationSeconds,
    engagedCallsCount,
    quickHangupsCount,
    avgTimeToHandoffSeconds: null,
    // From KPI view
    connectedCalls,
    leadsCreated: leadCreatedCount,
    successfulOutcomes,
    booked,
    callbackRequested,
    highIntentCalls,
    negativeCalls,
    neutralCalls,
    positiveCalls,
  };
}

// Hook to get calls for a date range (last 7 days, week, etc.)
export function useTruckingCallsRange(startDate: Date, endDate: Date) {
  return useQuery({
    queryKey: ['trucking-calls-range', format(startDate, 'yyyy-MM-dd'), format(endDate, 'yyyy-MM-dd')],
    queryFn: async () => {
      const cstTz = 'America/Chicago';
      const startInCst = toZonedTime(startDate, cstTz);
      const endInCst = toZonedTime(endDate, cstTz);
      const startStr = format(startInCst, 'yyyy-MM-dd');
      const endStr = format(endInCst, 'yyyy-MM-dd');
      
      const { data, error } = await supabase
        .from('v_trucking_calls_daily_cst')
        .select('*')
        .gte('call_date_cst', startStr)
        .lte('call_date_cst', endStr)
        .order('call_started_at', { ascending: false });
      
      if (error) throw error;
      return (data || []).map(log => transformCallLog(log as Record<string, unknown>));
    },
  });
}

// Hook to check if calls exist outside the current date
export function useTruckingCallsExist() {
  return useQuery({
    queryKey: ['trucking-calls-exist'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('trucking_call_logs')
        .select('*', { count: 'exact', head: true })
        .is('deleted_at', null);
      
      if (error) throw error;
      return (count || 0) > 0;
    },
  });
}
