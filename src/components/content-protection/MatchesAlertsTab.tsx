import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Search, AlertTriangle, CheckCircle, Clock, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const MatchesAlertsTab = () => {
  const queryClient = useQueryClient();

  const { data: matches, isLoading } = useQuery({
    queryKey: ["content-matches"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("content_matches")
        .select("*")
        .eq("user_id", user.id)
        .order("detected_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ matchId, status }: { matchId: string; status: string }) => {
      const { error } = await supabase
        .from("content_matches")
        .update({ status, reviewed_at: new Date().toISOString() })
        .eq("id", matchId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["content-matches"] });
      toast.success("Match status updated");
    },
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case "dismissed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-red-500/10 text-red-600 border-red-200";
      case "dismissed":
        return "bg-green-500/10 text-green-600 border-green-200";
      default:
        return "bg-yellow-500/10 text-yellow-600 border-yellow-200";
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case "youtube":
        return "bg-red-500/10 text-red-600";
      case "spotify":
        return "bg-green-500/10 text-green-600";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Matches & Alerts</h2>
        <p className="text-sm text-muted-foreground">
          Review detected matches and suspected unauthorized use
        </p>
      </div>

      {matches && matches.length > 0 ? (
        <div className="grid gap-4">
          {matches.map((match) => (
            <Card key={match.id} className="p-4">
              <div className="flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    {getStatusIcon(match.status)}
                    <h3 className="font-medium">{match.external_title || "Unknown"}</h3>
                    <Badge className={getPlatformColor(match.platform)}>
                      {match.platform}
                    </Badge>
                    <Badge className={getStatusColor(match.status)}>
                      {match.status?.replace("_", " ")}
                    </Badge>
                  </div>

                  <p className="text-sm text-muted-foreground mb-2 truncate">
                    {match.external_url}
                  </p>

                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>Similarity: {match.similarity_score || "N/A"}%</span>
                    <span>Type: {match.match_type}</span>
                    <span>Detected: {new Date(match.detected_at).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <a href={match.external_url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-1" />
                      View
                    </a>
                  </Button>

                  {match.status === "pending_review" && (
                    <>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => updateStatusMutation.mutate({ matchId: match.id, status: "confirmed" })}
                      >
                        Confirm
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateStatusMutation.mutate({ matchId: match.id, status: "dismissed" })}
                      >
                        Dismiss
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-medium mb-2">No Matches Found</h3>
          <p className="text-sm text-muted-foreground">
            We haven't detected any unauthorized use of your content yet.
          </p>
        </Card>
      )}
    </div>
  );
};
