import { useQuery } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Mail, TrendingUp, MousePointerClick, AlertCircle, Eye } from "lucide-react";
import { format } from "date-fns";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function CampaignDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: campaign } = useQuery({
    queryKey: ["campaign", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("email_campaigns")
        .select("*")
        .eq("id", id)
        .single();
      
      if (error) throw error;
      return data;
    },
  });

  const { data: events } = useQuery({
    queryKey: ["campaign-events", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("email_events")
        .select("*")
        .eq("campaign_id", id)
        .order("occurred_at", { ascending: true });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!id,
  });

  if (!campaign) {
    return (
      <div className="container mx-auto p-6">
        <p className="text-muted-foreground">Loading campaign...</p>
      </div>
    );
  }

  const stats = {
    sent: campaign.total_sent || 0,
    delivered: campaign.total_delivered || campaign.total_sent || 0,
    opened: campaign.total_opened || 0,
    clicked: campaign.total_clicked || 0,
    bounced: campaign.total_bounced || 0,
  };

  const rates = {
    deliveryRate: stats.sent > 0 ? ((stats.delivered / stats.sent) * 100).toFixed(1) : "0.0",
    openRate: stats.sent > 0 ? ((stats.opened / stats.sent) * 100).toFixed(1) : "0.0",
    clickRate: stats.sent > 0 ? ((stats.clicked / stats.sent) * 100).toFixed(1) : "0.0",
    bounceRate: stats.sent > 0 ? ((stats.bounced / stats.sent) * 100).toFixed(1) : "0.0",
  };

  // Group events by day for chart
  const eventsByDay = events?.reduce((acc: any, event: any) => {
    const day = format(new Date(event.occurred_at), "MMM d");
    if (!acc[day]) {
      acc[day] = { date: day, opened: 0, clicked: 0, bounced: 0 };
    }
    if (event.event_type === "opened") acc[day].opened++;
    if (event.event_type === "clicked") acc[day].clicked++;
    if (event.event_type === "bounced") acc[day].bounced++;
    return acc;
  }, {});

  const chartData = Object.values(eventsByDay || {});

  const overviewData = [
    { name: "Sent", value: stats.sent },
    { name: "Delivered", value: stats.delivered },
    { name: "Opened", value: stats.opened },
    { name: "Clicked", value: stats.clicked },
    { name: "Bounced", value: stats.bounced },
  ];

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <Button 
        variant="ghost" 
        onClick={() => navigate("/email-campaigns")}
        className="mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Campaigns
      </Button>

      <div className="mb-6">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h1 className="text-3xl font-bold">{campaign.subject}</h1>
            {campaign.preheader && (
              <p className="text-muted-foreground mt-1">{campaign.preheader}</p>
            )}
          </div>
          <Badge variant={campaign.status === "sent" ? "default" : campaign.status === "scheduled" ? "secondary" : "outline"}>
            {campaign.status}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          {campaign.sent_at 
            ? `Sent on ${format(new Date(campaign.sent_at), "MMM d, yyyy 'at' h:mm a")}`
            : campaign.scheduled_send_at
            ? `Scheduled for ${format(new Date(campaign.scheduled_send_at), "MMM d, yyyy 'at' h:mm a")}`
            : "Draft"}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Sent</p>
                <p className="text-2xl font-bold">{stats.sent}</p>
              </div>
              <Mail className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Delivered</p>
                <p className="text-2xl font-bold">{stats.delivered}</p>
                <p className="text-xs text-muted-foreground">{rates.deliveryRate}%</p>
              </div>
              <Eye className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Opened</p>
                <p className="text-2xl font-bold">{stats.opened}</p>
                <p className="text-xs text-muted-foreground">{rates.openRate}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Clicked</p>
                <p className="text-2xl font-bold">{stats.clicked}</p>
                <p className="text-xs text-muted-foreground">{rates.clickRate}%</p>
              </div>
              <MousePointerClick className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Bounced</p>
                <p className="text-2xl font-bold">{stats.bounced}</p>
                <p className="text-xs text-muted-foreground">{rates.bounceRate}%</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Campaign Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={overviewData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Engagement Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="opened" stroke="#3b82f6" name="Opens" />
                <Line type="monotone" dataKey="clicked" stroke="#8b5cf6" name="Clicks" />
                <Line type="monotone" dataKey="bounced" stroke="#ef4444" name="Bounces" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Email Content Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Email Content</CardTitle>
        </CardHeader>
        <CardContent>
          <div 
            className="border rounded-lg p-6 bg-background"
            dangerouslySetInnerHTML={{ __html: campaign.html_content || "" }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
