import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { ArrowLeft, Upload } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const UploadEpisode = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [episodeNumber, setEpisodeNumber] = useState("");
  const [seasonNumber, setSeasonNumber] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    },
  });

  const uploadEpisode = useMutation({
    mutationFn: async () => {
      if (!user || !audioFile) throw new Error("Missing required data");
      
      // Upload audio file
      const fileExt = audioFile.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from("podcast-audio")
        .upload(fileName, audioFile);
      
      if (uploadError) throw uploadError;
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("podcast-audio")
        .getPublicUrl(fileName);
      
      // Create episode record
      const { data, error } = await supabase
        .from("episodes")
        .insert({
          podcast_id: id,
          title,
          description,
          audio_url: publicUrl,
          episode_number: episodeNumber ? parseInt(episodeNumber) : null,
          season_number: seasonNumber ? parseInt(seasonNumber) : null,
          file_size_bytes: audioFile.size,
          is_published: isPublished,
          publish_date: new Date().toISOString(),
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Track storage usage (convert bytes to MB)
      const fileSizeMB = Math.ceil(audioFile.size / (1024 * 1024));
      try {
        await supabase.rpc('increment_usage', {
          _user_id: user.id,
          _feature_type: 'podcast_storage_mb',
          _increment: fileSizeMB
        });
      } catch (usageError) {
        console.error("Failed to track storage usage:", usageError);
        // Don't fail the upload if usage tracking fails
      }
      
      return data;
    },
    onSuccess: () => {
      toast.success("Episode uploaded successfully!");
      navigate(`/podcasts/${id}`);
    },
    onError: (error) => {
      console.error(error);
      toast.error("Failed to upload episode");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Please enter an episode title");
      return;
    }
    if (!audioFile) {
      toast.error("Please select an audio file");
      return;
    }
    uploadEpisode.mutate();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file type
      if (!file.type.startsWith('audio/')) {
        toast.error("Please select an audio file");
        return;
      }
      setAudioFile(file);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-6">
      <div className="max-w-3xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate(`/podcasts/${id}`)}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Podcast
        </Button>

        <Card className="p-6">
          <h1 className="text-2xl font-bold mb-6">Upload New Episode</h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Audio File */}
            <div>
              <Label htmlFor="audioFile">Audio File *</Label>
              <p className="text-sm text-muted-foreground mb-2">
                Supported formats: MP3, WAV, M4A
              </p>
              <Input
                id="audioFile"
                type="file"
                accept="audio/*"
                onChange={handleFileChange}
                required
              />
              {audioFile && (
                <p className="text-sm text-muted-foreground mt-2">
                  Selected: {audioFile.name} ({(audioFile.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              )}
              {uploadProgress > 0 && uploadProgress < 100 && (
                <Progress value={uploadProgress} className="mt-2" />
              )}
            </div>

            {/* Title */}
            <div>
              <Label htmlFor="title">Episode Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Episode 1: Introduction"
                required
              />
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What's this episode about?"
                rows={4}
              />
            </div>

            {/* Episode & Season Numbers */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="episodeNumber">Episode Number</Label>
                <Input
                  id="episodeNumber"
                  type="number"
                  value={episodeNumber}
                  onChange={(e) => setEpisodeNumber(e.target.value)}
                  placeholder="1"
                  min="1"
                />
              </div>
              <div>
                <Label htmlFor="seasonNumber">Season Number</Label>
                <Input
                  id="seasonNumber"
                  type="number"
                  value={seasonNumber}
                  onChange={(e) => setSeasonNumber(e.target.value)}
                  placeholder="1"
                  min="1"
                />
              </div>
            </div>

            {/* Publish Toggle */}
            <div className="flex items-center justify-between">
              <div>
                <Label>Publish Episode</Label>
                <p className="text-sm text-muted-foreground">
                  Make episode publicly available
                </p>
              </div>
              <Switch checked={isPublished} onCheckedChange={setIsPublished} />
            </div>

            {/* Submit */}
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(`/podcasts/${id}`)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={uploadEpisode.isPending}>
                {uploadEpisode.isPending ? "Uploading..." : "Upload Episode"}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default UploadEpisode;
