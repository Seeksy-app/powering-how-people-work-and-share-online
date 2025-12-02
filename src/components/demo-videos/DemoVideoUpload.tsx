import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload, Video, Image as ImageIcon } from "lucide-react";

const CATEGORIES = [
  'Creator Tools',
  'Advertiser Tools',
  'Monetization',
  'Onboarding',
  'AI Features',
  'Platform Overview',
];

interface DemoVideoUploadProps {
  onSuccess?: () => void;
}

export function DemoVideoUpload({ onSuccess }: DemoVideoUploadProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<string>("Platform Overview");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [orderIndex, setOrderIndex] = useState<number>(0);
  const [isFeatured, setIsFeatured] = useState(false);

  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!videoFile || !title) {
        throw new Error("Video file and title are required");
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Upload video file
      const videoFileName = `${Date.now()}_${videoFile.name}`;
      const { error: videoError, data: videoData } = await supabase.storage
        .from('demo-videos')
        .upload(videoFileName, videoFile);

      if (videoError) throw videoError;

      const { data: { publicUrl: videoUrl } } = supabase.storage
        .from('demo-videos')
        .getPublicUrl(videoFileName);

      // Upload thumbnail if provided
      let thumbnailUrl: string | null = null;
      if (thumbnailFile) {
        const thumbnailFileName = `thumb_${Date.now()}_${thumbnailFile.name}`;
        const { error: thumbError } = await supabase.storage
          .from('demo-videos')
          .upload(thumbnailFileName, thumbnailFile);

        if (thumbError) throw thumbError;

        const { data: { publicUrl } } = supabase.storage
          .from('demo-videos')
          .getPublicUrl(thumbnailFileName);

        thumbnailUrl = publicUrl;
      }

      // Create database entry
      const { error: dbError } = await supabase
        .from('demo_videos')
        .insert({
          title,
          description: description || null,
          category,
          video_url: videoUrl,
          thumbnail_url: thumbnailUrl,
          order_index: orderIndex,
          is_featured: isFeatured,
          created_by: user.id,
        });

      if (dbError) throw dbError;
    },
    onSuccess: () => {
      toast({
        title: "Video Uploaded",
        description: "Demo video has been uploaded successfully",
      });
      
      // Reset form
      setTitle("");
      setDescription("");
      setCategory("Platform Overview");
      setVideoFile(null);
      setThumbnailFile(null);
      setOrderIndex(0);
      setIsFeatured(false);

      // Refresh videos list
      queryClient.invalidateQueries({ queryKey: ['demo-videos'] });
      
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description: error.message,
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    uploadMutation.mutate();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Demo Video</CardTitle>
        <CardDescription>
          Add a new board-ready demo video to the library
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Video Title *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., AI Clip Generator Demo"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger id="category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe what this demo showcases..."
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="order">Display Order</Label>
                  <Input
                    id="order"
                    type="number"
                    value={orderIndex}
                    onChange={(e) => setOrderIndex(parseInt(e.target.value) || 0)}
                    placeholder="0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="featured">Featured?</Label>
                  <Select value={isFeatured ? "yes" : "no"} onValueChange={(v) => setIsFeatured(v === "yes")}>
                    <SelectTrigger id="featured">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="no">No</SelectItem>
                      <SelectItem value="yes">Yes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="video">Video File *</Label>
                <div className="border-2 border-dashed rounded-lg p-6 text-center hover:bg-accent/50 transition-colors cursor-pointer">
                  <input
                    id="video"
                    type="file"
                    accept="video/*"
                    onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                    className="hidden"
                    required
                  />
                  <label htmlFor="video" className="cursor-pointer block">
                    {videoFile ? (
                      <div className="space-y-2">
                        <Video className="h-10 w-10 mx-auto text-primary" />
                        <p className="text-sm font-medium">{videoFile.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(videoFile.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Video className="h-10 w-10 mx-auto text-muted-foreground" />
                        <p className="text-sm font-medium">Click to upload video</p>
                        <p className="text-xs text-muted-foreground">MP4, MOV, or WebM</p>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="thumbnail">Thumbnail (Optional)</Label>
                <div className="border-2 border-dashed rounded-lg p-6 text-center hover:bg-accent/50 transition-colors cursor-pointer">
                  <input
                    id="thumbnail"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                  <label htmlFor="thumbnail" className="cursor-pointer block">
                    {thumbnailFile ? (
                      <div className="space-y-2">
                        <ImageIcon className="h-10 w-10 mx-auto text-primary" />
                        <p className="text-sm font-medium">{thumbnailFile.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(thumbnailFile.size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <ImageIcon className="h-10 w-10 mx-auto text-muted-foreground" />
                        <p className="text-sm font-medium">Click to upload thumbnail</p>
                        <p className="text-xs text-muted-foreground">JPG, PNG, or WebP</p>
                      </div>
                    )}
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setTitle("");
                setDescription("");
                setVideoFile(null);
                setThumbnailFile(null);
              }}
            >
              Clear
            </Button>
            <Button
              type="submit"
              disabled={uploadMutation.isPending || !videoFile || !title}
            >
              {uploadMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Video
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}