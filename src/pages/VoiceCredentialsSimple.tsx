import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  LineChart, 
  MapPin, 
  TrendingUp, 
  DollarSign, 
  CheckCircle, 
  XCircle, 
  Clock,
  Shield,
  Globe,
  Download,
  ExternalLink,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

export default function VoiceCredentials() {
  const [loading, setLoading] = useState(true);
  const [voiceProfiles, setVoiceProfiles] = useState<any[]>([]);
  const [listenAnalytics, setListenAnalytics] = useState<any[]>([]);
  const [proposals, setProposals] = useState<any[]>([]);
  const [socialDetections, setSocialDetections] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [profiles, analytics, props, detections] = await Promise.all([
        supabase
          .from("creator_voice_profiles")
          .select("*")
          .eq("creator_id", user.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("voice_listen_analytics")
          .select("*")
          .eq("creator_id", user.id)
          .order("listened_at", { ascending: false })
          .limit(100),
        supabase
          .from("voice_licensing_proposals")
          .select("*")
          .eq("creator_id", user.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("voice_social_detections")
          .select("*")
          .eq("creator_id", user.id)
          .order("detected_at", { ascending: false }),
      ]);

      setVoiceProfiles(profiles.data || []);
      setListenAnalytics(analytics.data || []);
      setProposals(props.data || []);
      setSocialDetections(detections.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleProposalResponse = async (proposalId: string, status: string) => {
    const { error } = await supabase
      .from("voice_licensing_proposals")
      .update({
        status,
        responded_at: new Date().toISOString(),
      })
      .eq("id", proposalId);

    if (error) {
      toast.error("Failed to update proposal");
      return;
    }

    toast.success(status === "accepted" ? "Proposal accepted!" : "Proposal declined");
    fetchData();
  };

  const totalListens = listenAnalytics.length;
  const uniqueCountries = new Set(listenAnalytics.map((a) => a.country)).size;
  const pendingProposals = proposals.filter((p) => p.status === "pending").length;
  const totalEarnings = proposals
    .filter((p) => p.status === "accepted")
    .reduce((sum, p) => sum + Number(p.proposed_price), 0);

  if (loading) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
          <Shield className="h-8 w-8 text-primary" />
          Voice Credentials
        </h1>
        <p className="text-muted-foreground">
          Monitor your voice usage, manage licensing proposals, and track authenticity across platforms
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Listens</p>
              <p className="text-3xl font-bold">{totalListens}</p>
            </div>
            <LineChart className="h-8 w-8 text-primary" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Countries</p>
              <p className="text-3xl font-bold">{uniqueCountries}</p>
            </div>
            <MapPin className="h-8 w-8 text-primary" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Pending Proposals</p>
              <p className="text-3xl font-bold">{pendingProposals}</p>
            </div>
            <Clock className="h-8 w-8 text-amber-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Earnings</p>
              <p className="text-3xl font-bold">${totalEarnings.toFixed(2)}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-500" />
          </div>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="analytics">
        <TabsList className="mb-6">
          <TabsTrigger value="analytics">Listen Analytics</TabsTrigger>
          <TabsTrigger value="proposals">
            Licensing Proposals
            {pendingProposals > 0 && (
              <Badge variant="destructive" className="ml-2 h-5 px-1.5">
                {pendingProposals}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="social">Social Monitor</TabsTrigger>
          <TabsTrigger value="certificates">Certificates</TabsTrigger>
        </TabsList>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Recent Listens</h3>
            <div className="space-y-3">
              {listenAnalytics.slice(0, 10).map((listen: any) => (
                <div key={listen.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{listen.city || "Unknown"}, {listen.country || "Unknown"}</p>
                      <p className="text-sm text-muted-foreground">{listen.platform || "Web"}</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(listen.listened_at), "MMM dd, h:mm a")}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* Proposals Tab */}
        <TabsContent value="proposals">
          <div className="space-y-4">
            {proposals.map((proposal: any) => (
              <Card key={proposal.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">{proposal.advertiser_company || proposal.advertiser_name}</h3>
                    <p className="text-sm text-muted-foreground">{proposal.advertiser_email}</p>
                  </div>
                  <Badge variant={proposal.status === "pending" ? "secondary" : "default"}>
                    {proposal.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Proposed Price</p>
                    <p className="text-2xl font-bold text-green-600">${proposal.proposed_price}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Created</p>
                    <p className="font-medium">{format(new Date(proposal.created_at), "MMM dd, yyyy")}</p>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm font-medium mb-1">Usage Description</p>
                  <p className="text-sm text-muted-foreground">{proposal.usage_description}</p>
                </div>

                {proposal.status === "pending" && (
                  <div className="flex gap-2">
                    <Button onClick={() => handleProposalResponse(proposal.id, "accepted")} className="flex-1">
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Accept
                    </Button>
                    <Button onClick={() => handleProposalResponse(proposal.id, "declined")} variant="destructive" className="flex-1">
                      <XCircle className="mr-2 h-4 w-4" />
                      Decline
                    </Button>
                  </div>
                )}
              </Card>
            ))}
            {proposals.length === 0 && (
              <Card className="p-12 text-center">
                <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Proposals Yet</h3>
                <p className="text-muted-foreground">Licensing proposals from advertisers will appear here</p>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Social Monitor Tab */}
        <TabsContent value="social">
          <div className="space-y-4">
            {socialDetections.map((detection: any) => (
              <Card key={detection.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Globe className="h-5 w-5" />
                    <div>
                      <h3 className="text-lg font-semibold capitalize">{detection.platform}</h3>
                      <p className="text-sm text-muted-foreground">
                        Detected {format(new Date(detection.detected_at), "MMM dd, yyyy")}
                      </p>
                    </div>
                  </div>
                  <Badge variant={detection.is_authorized ? "default" : "destructive"}>
                    {detection.is_authorized ? "Authorized" : "Unauthorized"}
                  </Badge>
                </div>

                {detection.post_url && (
                  <div className="mb-4">
                    <Button variant="outline" size="sm" asChild>
                      <a href={detection.post_url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        View Post
                      </a>
                    </Button>
                  </div>
                )}

                <div className="flex items-center gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Confidence: </span>
                    <span className="font-medium">{detection.confidence_score}%</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Status: </span>
                    <span className="font-medium capitalize">{detection.verification_status}</span>
                  </div>
                </div>
              </Card>
            ))}
            {socialDetections.length === 0 && (
              <Card className="p-12 text-center">
                <Globe className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Detections Yet</h3>
                <p className="text-muted-foreground">Voice usage across social platforms will appear here</p>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Certificates Tab */}
        <TabsContent value="certificates">
          <div className="space-y-4">
            {voiceProfiles.map((profile: any) => (
              <Card key={profile.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">{profile.voice_name}</h3>
                    <p className="text-sm text-muted-foreground">
                      Created {format(new Date(profile.created_at), "MMM dd, yyyy")}
                    </p>
                  </div>
                  <Badge variant="default" className="gap-1">
                    <Shield className="h-3 w-3" />
                    Certified
                  </Badge>
                </div>

                {profile.profile_image_url && (
                  <img
                    src={profile.profile_image_url}
                    alt={profile.voice_name}
                    className="w-20 h-20 rounded-full object-cover mb-4"
                  />
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Price per Use</p>
                    <p className="text-xl font-bold">${profile.price_per_ad}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <p className="font-medium">
                      {profile.is_available_for_ads ? "Available" : "Not Available"}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Download Certificate
                  </Button>
                  <Button variant="outline" size="sm">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    View QR Code
                  </Button>
                </div>
              </Card>
            ))}
            {voiceProfiles.length === 0 && (
              <Card className="p-12 text-center">
                <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Voice Profiles</h3>
                <p className="text-muted-foreground mb-4">Create a voice profile to get started with voice credentials</p>
                <Button asChild>
                  <a href="/voice-protection">Create Voice Profile</a>
                </Button>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
