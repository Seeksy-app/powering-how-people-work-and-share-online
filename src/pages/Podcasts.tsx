import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, Mic, Music, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Podcasts = () => {
  const navigate = useNavigate();

  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    },
  });

  const { data: podcasts, isLoading } = useQuery({
    queryKey: ["podcasts", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("podcasts")
        .select("*, episodes(count)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <Mic className="w-8 h-8 text-primary" />
              Podcasts
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your podcast shows and episodes
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate("/podcasts/import")}>
              <Download className="w-4 h-4 mr-2" />
              Import from RSS
            </Button>
            <Button onClick={() => navigate("/podcasts/create")}>
              <Plus className="w-4 h-4 mr-2" />
              Create Podcast
            </Button>
          </div>
        </div>

        {/* Podcasts Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="h-64 animate-pulse bg-muted/20" />
            ))}
          </div>
        ) : podcasts && podcasts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {podcasts.map((podcast) => {
              const episodeCount = podcast.episodes?.[0]?.count || 0;
              return (
                <Card
                  key={podcast.id}
                  className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => navigate(`/podcasts/${podcast.id}`)}
                >
                  {podcast.cover_image_url ? (
                    <img
                      src={podcast.cover_image_url}
                      alt={podcast.title}
                      className="w-full h-48 object-cover"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                      <Music className="w-16 h-16 text-muted-foreground" />
                    </div>
                  )}
                  
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-1 line-clamp-1">
                      {podcast.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {podcast.description || "No description"}
                    </p>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {episodeCount} episode{episodeCount !== 1 ? 's' : ''}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        podcast.is_published
                          ? 'bg-green-500/10 text-green-500'
                          : 'bg-yellow-500/10 text-yellow-500'
                      }`}>
                        {podcast.is_published ? 'Published' : 'Draft'}
                      </span>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <Mic className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No podcasts yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first podcast Seeksy and start sharing your voice
            </p>
            <Button onClick={() => navigate("/podcasts/create")}>
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Podcast
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Podcasts;
