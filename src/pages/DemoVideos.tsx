import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Play, Clock, Upload, Sparkles } from "lucide-react";
import { DemoVideoUpload } from "@/components/demo-videos/DemoVideoUpload";

interface DemoVideo {
  id: string;
  title: string;
  description: string | null;
  category: string;
  video_url: string;
  thumbnail_url: string | null;
  duration_seconds: number | null;
  order_index: number;
  is_featured: boolean;
  created_at: string;
}

export default function DemoVideos() {
  const [selectedVideo, setSelectedVideo] = useState<DemoVideo | null>(null);
  const [showUpload, setShowUpload] = useState(false);

  const { data: videos = [], isLoading } = useQuery({
    queryKey: ['demo-videos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('demo_videos')
        .select('*')
        .order('order_index', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as DemoVideo[];
    },
  });

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    },
  });

  // Auto-select first video if none selected
  useState(() => {
    if (!selectedVideo && videos.length > 0) {
      setSelectedVideo(videos[0]);
    }
  });

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return null;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const categoryColors: Record<string, string> = {
    'Creator Tools': 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    'Advertiser Tools': 'bg-purple-500/10 text-purple-500 border-purple-500/20',
    'Monetization': 'bg-green-500/10 text-green-500 border-green-500/20',
    'Onboarding': 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    'AI Features': 'bg-pink-500/10 text-pink-500 border-pink-500/20',
    'Platform Overview': 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20',
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold flex items-center gap-3">
              <Sparkles className="h-8 w-8 text-primary" />
              Demo Video Library
            </h1>
            <p className="text-muted-foreground mt-2">
              Board-ready product demos and feature showcases
            </p>
          </div>
          {user && (
            <Button
              onClick={() => setShowUpload(!showUpload)}
              size="lg"
              variant={showUpload ? "outline" : "default"}
            >
              <Upload className="mr-2 h-4 w-4" />
              {showUpload ? "Hide Upload" : "Upload Video"}
            </Button>
          )}
        </div>

        {/* Upload Section (Admin Only) */}
        {showUpload && user && (
          <DemoVideoUpload onSuccess={() => setShowUpload(false)} />
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading demo videos...</p>
            </div>
          </div>
        ) : videos.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-20">
              <Play className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No demo videos yet</h3>
              <p className="text-muted-foreground text-center max-w-md">
                Upload your first board-ready demo video to get started
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main Player */}
            <div className="lg:col-span-2 space-y-4">
              <Card className="overflow-hidden">
                <CardContent className="p-0">
                  {selectedVideo && (
                    <>
                      {/* Video Player */}
                      <div className="aspect-video bg-black relative group">
                        <video
                          key={selectedVideo.id}
                          src={selectedVideo.video_url}
                          controls
                          autoPlay
                          className="w-full h-full"
                          poster={selectedVideo.thumbnail_url || undefined}
                        >
                          Your browser does not support the video tag.
                        </video>
                      </div>

                      {/* Video Info */}
                      <div className="p-6 space-y-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <h2 className="text-2xl font-bold mb-2">{selectedVideo.title}</h2>
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge 
                                variant="outline" 
                                className={categoryColors[selectedVideo.category] || ''}
                              >
                                {selectedVideo.category}
                              </Badge>
                              {selectedVideo.duration_seconds && (
                                <Badge variant="secondary" className="gap-1">
                                  <Clock className="h-3 w-3" />
                                  {formatDuration(selectedVideo.duration_seconds)}
                                </Badge>
                              )}
                              {selectedVideo.is_featured && (
                                <Badge variant="default" className="gap-1">
                                  <Sparkles className="h-3 w-3" />
                                  Featured
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>

                        {selectedVideo.description && (
                          <div>
                            <h3 className="text-sm font-semibold text-muted-foreground mb-2">Description</h3>
                            <p className="text-sm leading-relaxed">{selectedVideo.description}</p>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Playlist */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Playlist</CardTitle>
                  <CardDescription>
                    {videos.length} {videos.length === 1 ? 'video' : 'videos'} available
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[600px] pr-4">
                    <div className="space-y-3">
                      {videos.map((video) => (
                        <button
                          key={video.id}
                          onClick={() => setSelectedVideo(video)}
                          className={`w-full text-left rounded-lg border transition-all hover:bg-accent ${
                            selectedVideo?.id === video.id
                              ? 'border-primary bg-accent/50'
                              : 'border-border'
                          }`}
                        >
                          <div className="p-3 space-y-2">
                            {/* Thumbnail */}
                            <div className="aspect-video bg-muted rounded-md overflow-hidden relative">
                              {video.thumbnail_url ? (
                                <img
                                  src={video.thumbnail_url}
                                  alt={video.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Play className="h-8 w-8 text-muted-foreground" />
                                </div>
                              )}
                              {video.duration_seconds && (
                                <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                                  {formatDuration(video.duration_seconds)}
                                </div>
                              )}
                              {selectedVideo?.id === video.id && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                                  <div className="bg-primary text-primary-foreground rounded-full p-2">
                                    <Play className="h-6 w-6" />
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Info */}
                            <div>
                              <h4 className="font-medium text-sm line-clamp-2 mb-1">
                                {video.title}
                              </h4>
                              <Badge 
                                variant="outline" 
                                className={`text-xs ${categoryColors[video.category] || ''}`}
                              >
                                {video.category}
                              </Badge>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}