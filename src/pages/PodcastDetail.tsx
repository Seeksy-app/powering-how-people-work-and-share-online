import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft, Plus, Copy, Rss, Edit, Trash2, Music2, Clock, RefreshCw } from "lucide-react";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const PodcastDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [episodeToDelete, setEpisodeToDelete] = useState<string | null>(null);

  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    },
  });

  const { data: podcast } = useQuery({
    queryKey: ["podcast", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("podcasts")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
  });

  const { data: episodes } = useQuery({
    queryKey: ["episodes", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("episodes")
        .select("*")
        .eq("podcast_id", id)
        .order("publish_date", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const deleteEpisode = useMutation({
    mutationFn: async (episodeId: string) => {
      // Get episode details first to track storage
      const { data: episode } = await supabase
        .from("episodes")
        .select("file_size_bytes")
        .eq("id", episodeId)
        .single();
      
      // Delete the episode
      const { error } = await supabase
        .from("episodes")
        .delete()
        .eq("id", episodeId);
      
      if (error) throw error;
      
      // Decrement storage usage if we have the file size and user
      if (episode?.file_size_bytes && user) {
        const fileSizeMB = Math.ceil(episode.file_size_bytes / (1024 * 1024));
        try {
          await supabase.rpc('increment_usage', {
            _user_id: user.id,
            _feature_type: 'podcast_storage_mb',
            _increment: -fileSizeMB // Negative to decrement
          });
        } catch (usageError) {
          console.error("Failed to update storage usage:", usageError);
          // Don't fail the delete if usage tracking fails
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["episodes", id] });
      toast.success("Episode deleted");
      setEpisodeToDelete(null);
    },
    onError: () => {
      toast.error("Failed to delete episode");
    },
  });

  const syncRssFeed = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke("sync-rss-feed", {
        body: { podcastId: id },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["episodes", id] });
      if (data.newEpisodesCount === 0) {
        toast.success("No new episodes found");
      } else {
        toast.success(`Imported ${data.newEpisodesCount} new episodes!`);
      }
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to sync RSS feed");
    },
  });

  const rssUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/podcast-rss?userId=${podcast?.user_id}&podcastId=${id}`;

  const copyRssUrl = () => {
    navigator.clipboard.writeText(rssUrl);
    toast.success("RSS feed URL copied!");
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!podcast) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-6">
      <div className="max-w-7xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate("/podcasts")}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Podcasts
        </Button>

        {/* Podcast Header */}
        <Card className="p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-6">
            {podcast.cover_image_url ? (
              <img
                src={podcast.cover_image_url}
                alt={podcast.title}
                className="w-48 h-48 rounded-lg object-cover"
              />
            ) : (
              <div className="w-48 h-48 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                <Music2 className="w-16 h-16 text-muted-foreground" />
              </div>
            )}
            
            <div className="flex-1">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold mb-2">{podcast.title}</h1>
                  <p className="text-muted-foreground">{podcast.description}</p>
                </div>
                <Button onClick={() => navigate(`/podcasts/${id}/edit`)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {podcast.category && (
                  <span className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full">
                    {podcast.category}
                  </span>
                )}
                {podcast.is_explicit && (
                  <span className="px-3 py-1 bg-destructive/10 text-destructive text-sm rounded-full">
                    Explicit
                  </span>
                )}
                <span className={`px-3 py-1 text-sm rounded-full ${
                  podcast.is_published
                    ? 'bg-green-500/10 text-green-500'
                    : 'bg-yellow-500/10 text-yellow-500'
                }`}>
                  {podcast.is_published ? 'Published' : 'Draft'}
                </span>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={copyRssUrl}>
                  <Rss className="w-4 h-4 mr-2" />
                  Copy RSS Feed
                </Button>
                {podcast.rss_feed_url && (
                  <Button 
                    variant="outline" 
                    onClick={() => syncRssFeed.mutate()}
                    disabled={syncRssFeed.isPending}
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${syncRssFeed.isPending ? 'animate-spin' : ''}`} />
                    {syncRssFeed.isPending ? 'Syncing...' : 'Sync from RSS'}
                  </Button>
                )}
                <Button onClick={() => navigate(`/podcasts/${id}/upload`)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Upload Episode
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Episodes */}
        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-4">Episodes</h2>
          
          {episodes && episodes.length > 0 ? (
            <div className="space-y-4">
              {episodes.map((episode) => (
                <Card key={episode.id} className="p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {episode.episode_number && (
                          <span className="text-sm text-muted-foreground">
                            #{episode.episode_number}
                          </span>
                        )}
                        <h3 className="font-semibold">{episode.title}</h3>
                        <span className={`px-2 py-0.5 text-xs rounded-full ${
                          episode.is_published
                            ? 'bg-green-500/10 text-green-500'
                            : 'bg-yellow-500/10 text-yellow-500'
                        }`}>
                          {episode.is_published ? 'Published' : 'Draft'}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                        {episode.description}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {episode.duration_seconds 
                            ? formatDuration(episode.duration_seconds)
                            : 'Unknown'}
                        </span>
                        <span>
                          {new Date(episode.publish_date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/podcasts/${id}/episodes/${episode.id}/edit`)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEpisodeToDelete(episode.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {episode.audio_url && (
                    <audio controls className="w-full mt-3">
                      <source src={episode.audio_url} type="audio/mpeg" />
                    </audio>
                  )}
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Music2 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">No episodes yet</p>
              <Button onClick={() => navigate(`/podcasts/${id}/upload`)}>
                <Plus className="w-4 h-4 mr-2" />
                Upload Your First Episode
              </Button>
            </div>
          )}
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!episodeToDelete} onOpenChange={() => setEpisodeToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Episode?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this episode. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => episodeToDelete && deleteEpisode.mutate(episodeToDelete)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PodcastDetail;
