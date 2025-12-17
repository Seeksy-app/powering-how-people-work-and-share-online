import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Sparkles, TrendingUp, Lightbulb, AlertTriangle, RefreshCw, Phone, Clock, CheckCircle2, CalendarIcon } from "lucide-react";
import { format, subDays } from "date-fns";
import TruckingAnalytics from "@/components/trucking/TruckingAnalytics";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { TruckingPageWrapper } from "@/components/trucking/TruckingPageWrapper";

interface DailyBrief {
  id: string;
  date_local: string;
  executive_summary: string;
  insights: any[];
  short_term_recs: any[];
  flags: any[];
  long_term_index?: { close_rate_trend?: string; engagement_quality?: string; rate_acceptance?: string };
  total_calls: number;
  answered_calls: number;
  missed_calls: number;
  voicemails: number;
  avg_call_seconds: number;
  loads_active: number;
  loads_confirmed: number;
  loads_pending: number;
  created_at: string;
}

type DatePreset = "all" | "today" | "7d" | "30d" | "custom";

export default function TruckingAnalyticsPage() {
  const [brief, setBrief] = useState<DailyBrief | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [datePreset, setDatePreset] = useState<DatePreset>("all");
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date } | undefined>(undefined);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        const { data } = await supabase.from("ai_daily_briefs").select("*").eq("owner_id", user.id).order("created_at", { ascending: false }).limit(1).maybeSingle();
        setBrief(data as DailyBrief | null);
      }
      setLoading(false);
    };
    init();
  }, []);

  const handlePresetChange = (preset: DatePreset) => {
    setDatePreset(preset);
    const today = new Date();
    switch (preset) {
      case "all":
        setDateRange(undefined);
        break;
      case "today":
        setDateRange({ from: today, to: today });
        break;
      case "7d":
        setDateRange({ from: subDays(today, 7), to: today });
        break;
      case "30d":
        setDateRange({ from: subDays(today, 30), to: today });
        break;
    }
  };

  const generateBrief = async () => {
    if (!userId) return;
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-trucking-generate-daily-brief", { body: { owner_id: userId } });
      if (error) throw error;
      if (data?.brief) { setBrief(data.brief); toast.success("Daily brief generated"); }
    } catch (err) {
      toast.error("Failed to generate brief");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <TruckingPageWrapper
      title="Analytics & Insights"
      description="Master analytics, call behavior, and AI-powered daily briefs"
      action={
        <div className="flex items-center gap-2">
          {/* Date Range Presets */}
          <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
            {[
              { key: "all", label: "All Time" },
              { key: "today", label: "Today" },
              { key: "7d", label: "7 Days" },
              { key: "30d", label: "30 Days" },
            ].map(({ key, label }) => (
              <Button
                key={key}
                size="sm"
                variant={datePreset === key ? "secondary" : "ghost"}
                className={cn("h-7 text-xs", datePreset === key && "bg-background shadow-sm")}
                onClick={() => handlePresetChange(key as DatePreset)}
              >
                {label}
              </Button>
            ))}
          </div>
          <Button onClick={generateBrief} disabled={generating} variant="outline" size="sm" className="gap-2">
            {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            Generate Brief
          </Button>
        </div>
      }
    >

      {loading ? (
        <Card><CardContent className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></CardContent></Card>
      ) : brief ? (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2 grid grid-cols-2 md:grid-cols-5 gap-3">
            <Card className="p-3"><div className="flex items-center gap-2"><Phone className="h-4 w-4 text-blue-500" /><div><p className="text-xs text-muted-foreground">Total Calls</p><p className="text-lg font-semibold">{brief.total_calls || 0}</p></div></div></Card>
            <Card className="p-3"><div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /><div><p className="text-xs text-muted-foreground">Answered</p><p className="text-lg font-semibold">{brief.answered_calls || 0}</p></div></div></Card>
            <Card className="p-3"><div className="flex items-center gap-2"><Clock className="h-4 w-4 text-purple-500" /><div><p className="text-xs text-muted-foreground">Avg Duration</p><p className="text-lg font-semibold">{brief.avg_call_seconds ? `${Math.floor(brief.avg_call_seconds / 60)}:${(brief.avg_call_seconds % 60).toString().padStart(2, '0')}` : '0:00'}</p></div></div></Card>
            <Card className="p-3"><div className="flex items-center gap-2"><TrendingUp className="h-4 w-4 text-emerald-500" /><div><p className="text-xs text-muted-foreground">Confirmed</p><p className="text-lg font-semibold">{brief.loads_confirmed || 0}</p></div></div></Card>
            <Card className="p-3"><div className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-yellow-500" /><div><p className="text-xs text-muted-foreground">Active Loads</p><p className="text-lg font-semibold">{brief.loads_active || 0}</p></div></div></Card>
          </div>

          <Card className="md:col-span-2">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base"><Sparkles className="h-4 w-4 text-yellow-500" />AI Daily Brief</CardTitle>
                <Badge variant="secondary">{format(new Date(brief.date_local), "MMM d, yyyy")}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed">{brief.executive_summary || "No summary available."}</p>
              {brief.long_term_index && (
                <div className="mt-4 pt-4 border-t flex flex-wrap gap-4 text-xs">
                  <span>Close Rate: {brief.long_term_index.close_rate_trend}</span>
                  <span>Engagement: {brief.long_term_index.engagement_quality}</span>
                  <span>Rate Acceptance: {brief.long_term_index.rate_acceptance}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {brief.insights?.length > 0 && (
            <Card>
              <CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 text-base"><Lightbulb className="h-4 w-4 text-blue-500" />Key Insights</CardTitle></CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {brief.insights.slice(0, 6).map((ins: any, i: number) => (
                    <li key={i} className="text-sm flex items-start gap-2">
                      <TrendingUp className="h-3 w-3 mt-1 text-blue-500 flex-shrink-0" />
                      <span>{ins.title ? `${ins.title}: ` : ''}{ins.detail || ins.text || ins.message || ins}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {brief.short_term_recs?.length > 0 && (
            <Card>
              <CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 text-base"><TrendingUp className="h-4 w-4 text-green-500" />Recommendations</CardTitle></CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {brief.short_term_recs.slice(0, 6).map((rec: any, i: number) => (
                    <li key={i} className="text-sm flex items-start gap-2">
                      <span className="text-primary font-medium">{rec.priority || i + 1}.</span>
                      <span>{rec.action || rec.text || rec}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {brief.flags?.length > 0 && (
            <Card className="md:col-span-2">
              <CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 text-base"><AlertTriangle className="h-4 w-4 text-orange-500" />Alerts</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {brief.flags.map((flag: any, i: number) => (
                    <div key={i} className="flex items-center gap-2">
                      <Badge variant="outline" className={flag.type === 'warning' ? 'text-orange-600' : flag.type === 'success' ? 'text-green-600' : 'text-blue-600'}>{flag.type || 'info'}</Badge>
                      <span className="text-sm text-muted-foreground">{flag.message}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Sparkles className="h-8 w-8 text-muted-foreground mb-3" />
            <p className="text-muted-foreground mb-4">No AI daily brief available yet.</p>
            <Button onClick={generateBrief} disabled={generating} className="gap-2">
              {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              Generate First Brief
            </Button>
          </CardContent>
        </Card>
      )}

      <TruckingAnalytics dateRange={dateRange} />
    </TruckingPageWrapper>
  );
}
