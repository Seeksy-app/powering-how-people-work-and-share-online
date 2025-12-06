import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { BarChart3, Eye, MousePointer, Users } from "lucide-react";

interface SignatureAnalyticsProps {
  signatures: any[];
}

export function SignatureAnalytics({ signatures }: SignatureAnalyticsProps) {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSignature, setSelectedSignature] = useState<string>("all");

  useEffect(() => {
    fetchEvents();
  }, [selectedSignature]);

  const fetchEvents = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      let query = supabase
        .from("signature_tracking_events")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(500);

      if (selectedSignature !== "all") {
        query = query.eq("signature_id", selectedSignature);
      }

      const { data } = await query;
      setEvents(data || []);
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  };

  const opens = events.filter(e => e.event_type === "open").length;
  const bannerClicks = events.filter(e => e.event_type === "banner_click").length;
  const socialClicks = events.filter(e => e.event_type === "social_click").length;
  const linkClicks = events.filter(e => e.event_type === "link_click").length;
  const totalClicks = bannerClicks + socialClicks + linkClicks;
  const ctr = opens > 0 ? ((totalClicks / opens) * 100).toFixed(1) : "0";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Signature Analytics</h2>
        <Select value={selectedSignature} onValueChange={setSelectedSignature}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All signatures" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All signatures</SelectItem>
            {signatures.map(s => (
              <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Eye className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{opens}</p>
                <p className="text-sm text-muted-foreground">Opens</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <MousePointer className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{totalClicks}</p>
                <p className="text-sm text-muted-foreground">Clicks</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <BarChart3 className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">{ctr}%</p>
                <p className="text-sm text-muted-foreground">CTR</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">{bannerClicks}</p>
                <p className="text-sm text-muted-foreground">Banner Clicks</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : events.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No tracking events yet. Send some emails with your signature!
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
