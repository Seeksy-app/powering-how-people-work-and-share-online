import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Mic, 
  Upload, 
  Music,
  FileAudio,
  Sparkles,
  PlayCircle,
  Radio,
  ArrowRight,
  Wand2,
  Save
} from "lucide-react";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";

interface PodcastStudioTabProps {
  podcastId: string;
  userId: string;
}

export const PodcastStudioTab = ({ podcastId, userId }: PodcastStudioTabProps) => {
  const navigate = useNavigate();
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [episodeTitle, setEpisodeTitle] = useState("");
  const [episodeDescription, setEpisodeDescription] = useState("");
  const [script, setScript] = useState("");

  const { data: podcast } = useQuery({
    queryKey: ["podcast", podcastId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("podcasts")
        .select("*")
        .eq("id", podcastId)
        .single();
      if (error) throw error;
      return data;
    },
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith('audio/')) {
        setUploadedFile(file);
        toast.success("Audio file selected");
      } else {
        toast.error("Please upload an audio file");
      }
    }
  };

  const handleGoToFullStudio = () => {
    navigate("/podcast-studio", {
      state: { podcastId }
    });
  };

  const handleCreateEpisode = () => {
    if (!uploadedFile) {
      toast.error("Please upload an audio file first");
      return;
    }
    
    navigate(`/podcasts/${podcastId}/episodes/new-from-studio`, {
      state: {
        audioFile: uploadedFile,
        title: episodeTitle,
        description: episodeDescription,
      }
    });
  };

  const handleGenerateScript = async () => {
    toast.info("AI script generation coming soon");
  };

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-background border-2 border-primary/20">
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <div className="relative p-8">
          <div className="flex items-start gap-6">
            {podcast?.cover_image_url && (
              <div className="shrink-0">
                <img 
                  src={podcast.cover_image_url} 
                  alt={podcast.title}
                  className="w-24 h-24 rounded-xl object-cover shadow-lg ring-2 ring-primary/20"
                />
              </div>
            )}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Radio className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium text-primary">Podcast Studio</span>
              </div>
              <h2 className="text-3xl font-bold mb-2">{podcast?.title}</h2>
              <p className="text-muted-foreground text-lg">
                Record, edit, and publish new episodes with AI-powered tools.
              </p>
              <div className="flex gap-3 mt-6">
                <Button onClick={handleGoToFullStudio} size="lg" className="gap-2">
                  <Mic className="w-5 h-5" />
                  Open Full Studio
                </Button>
                <Button variant="outline" size="lg" className="gap-2">
                  <PlayCircle className="w-5 h-5" />
                  View Tutorials
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Workflow */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: Episode Workflow */}
        <div className="lg:col-span-2 space-y-6">
          {/* Script Area */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FileAudio className="w-5 h-5" />
                    Episode Script
                  </CardTitle>
                  <CardDescription>Write or generate your episode script</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={handleGenerateScript} className="gap-2">
                  <Wand2 className="w-4 h-4" />
                  Generate with AI
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Textarea
                value={script}
                onChange={(e) => setScript(e.target.value)}
                placeholder="Start writing your episode script here, or use AI to generate one based on your topic..."
                rows={8}
                className="resize-none font-mono text-sm"
              />
              <div className="flex justify-between items-center mt-2">
                <p className="text-xs text-muted-foreground">
                  {script.split(/\s+/).filter(w => w).length} words
                </p>
                <Button variant="ghost" size="sm" className="gap-2">
                  <Save className="w-4 h-4" />
                  Save Script
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Audio Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Upload Audio
              </CardTitle>
              <CardDescription>
                Upload your pre-recorded audio or record directly in the full studio
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <input
                  id="audio-upload"
                  type="file"
                  accept="audio/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <label
                  htmlFor="audio-upload"
                  className="flex items-center justify-center w-full p-8 border-2 border-dashed rounded-xl cursor-pointer hover:border-primary hover:bg-primary/5 transition-all"
                >
                  <div className="text-center">
                    {uploadedFile ? (
                      <>
                        <FileAudio className="w-12 h-12 mx-auto mb-2 text-primary" />
                        <p className="font-medium">{uploadedFile.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </>
                    ) : (
                      <>
                        <Upload className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
                        <p className="font-medium">Click to upload audio file</p>
                        <p className="text-sm text-muted-foreground">MP3, WAV, M4A up to 500MB</p>
                      </>
                    )}
                  </div>
                </label>
              </div>

              {uploadedFile && (
                <>
                  <Separator />
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="episode-title">Episode Title</Label>
                      <Input
                        id="episode-title"
                        value={episodeTitle}
                        onChange={(e) => setEpisodeTitle(e.target.value)}
                        placeholder="Enter episode title"
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label htmlFor="episode-description">Episode Description</Label>
                      <Textarea
                        id="episode-description"
                        value={episodeDescription}
                        onChange={(e) => setEpisodeDescription(e.target.value)}
                        placeholder="Describe your episode..."
                        rows={4}
                        className="mt-2"
                      />
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Action Footer */}
          {uploadedFile && (
            <Card className="border-2 border-primary/20 bg-primary/5">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold mb-1">Ready to continue?</h4>
                    <p className="text-sm text-muted-foreground">
                      Send to editor or publish directly
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => toast.info("AI editor coming soon")}>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Send to AI Editor
                    </Button>
                    <Button onClick={handleCreateEpisode} className="gap-2">
                      Publish Episode
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right: Context Panel */}
        <div className="space-y-6">
          {/* AI Tools */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                AI Enhancement
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start" size="sm">
                <Music className="w-4 h-4 mr-2" />
                Remove Filler Words
              </Button>
              <Button variant="outline" className="w-full justify-start" size="sm">
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Show Notes
              </Button>
              <Button variant="outline" className="w-full justify-start" size="sm">
                <FileAudio className="w-4 h-4 mr-2" />
                Enhance Audio Quality
              </Button>
            </CardContent>
          </Card>

          {/* Episode Checklist */}
          <Card>
            <CardHeader>
              <CardTitle>Publishing Checklist</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded-full ${uploadedFile ? 'bg-green-500' : 'bg-muted'}`} />
                  <span className={uploadedFile ? 'text-foreground' : 'text-muted-foreground'}>
                    Audio file uploaded
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded-full ${episodeTitle ? 'bg-green-500' : 'bg-muted'}`} />
                  <span className={episodeTitle ? 'text-foreground' : 'text-muted-foreground'}>
                    Episode title added
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded-full ${episodeDescription ? 'bg-green-500' : 'bg-muted'}`} />
                  <span className={episodeDescription ? 'text-foreground' : 'text-muted-foreground'}>
                    Description written
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-muted" />
                  <span className="text-muted-foreground">Cover art selected</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Tips */}
          <Card className="bg-muted/50">
            <CardHeader>
              <CardTitle className="text-sm">💡 Pro Tip</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Use AI to generate show notes and timestamps automatically after uploading your audio.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};