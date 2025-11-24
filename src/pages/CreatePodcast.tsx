import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ArrowLeft, Sparkles } from "lucide-react";
import ImageUpload from "@/components/ImageUpload";
import { PODCAST_CATEGORIES } from "@/lib/podcastCategories";

const CreatePodcast = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [authorEmail, setAuthorEmail] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [category, setCategory] = useState("");
  const [isExplicit, setIsExplicit] = useState(false);
  const [isPublished, setIsPublished] = useState(false);
  const [showOnProfile, setShowOnProfile] = useState(true);

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      if (!user) throw new Error("Not authenticated");
      return user;
    },
  });

  const createPodcast = useMutation({
    mutationFn: async () => {
      if (!user) {
        toast.error("Please log in to create a podcast");
        throw new Error("Not authenticated");
      }
      
      const { data, error } = await supabase
        .from("podcasts")
        .insert({
          user_id: user.id,
          title,
          description,
          cover_image_url: coverImageUrl,
          author_name: authorName,
          author_email: authorEmail,
          website_url: websiteUrl,
          category,
          is_explicit: isExplicit,
          is_published: isPublished,
          show_on_profile: showOnProfile,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast.success("Podcast created successfully!");
      navigate(`/podcasts/${data.id}`);
    },
    onError: (error) => {
      console.error(error);
      toast.error("Failed to create podcast");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please log in to create a podcast");
      return;
    }
    if (!title.trim()) {
      toast.error("Please enter a podcast title");
      return;
    }
    createPodcast.mutate();
  };

  if (userLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-6 flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-6">
      <div className="max-w-3xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate("/podcasts")}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Podcasts
        </Button>

        <Card className="p-6">
          <h1 className="text-2xl font-bold mb-6">Create New Podcast</h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Cover Image */}
            <div>
              <Label>Cover Image</Label>
              <p className="text-sm text-muted-foreground mb-2">
                Recommended: 3000x3000px, square format
              </p>
              <ImageUpload
                currentImage={coverImageUrl}
                onImageUploaded={setCoverImageUrl}
                bucket="podcast-covers"
              />
            </div>

            {/* Title */}
            <div>
              <Label htmlFor="title">Podcast Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="The Amazing Podcast"
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
                placeholder="Tell listeners what your podcast is about..."
                rows={4}
              />
            </div>

            {/* Author Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="authorName">Author Name</Label>
                <Input
                  id="authorName"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder="Your name"
                />
              </div>
              <div>
                <Label htmlFor="authorEmail">Author Email</Label>
                <Input
                  id="authorEmail"
                  type="email"
                  value={authorEmail}
                  onChange={(e) => setAuthorEmail(e.target.value)}
                  placeholder="your@email.com"
                />
              </div>
            </div>

            {/* Website & Category */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="websiteUrl">Website URL</Label>
                <Input
                  id="websiteUrl"
                  type="url"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  placeholder="https://yourwebsite.com"
                />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Label htmlFor="category">Category</Label>
                  <Badge variant="outline" className="gap-1">
                    <Sparkles className="h-3 w-3" />
                    AI Matching
                  </Badge>
                </div>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent className="bg-background">
                    {PODCAST_CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground mt-1">
                  Helps AI match your podcast with relevant advertisers
                </p>
              </div>
            </div>

            {/* Toggles */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Explicit Content</Label>
                  <p className="text-sm text-muted-foreground">
                    Does this podcast contain explicit content?
                  </p>
                </div>
                <Switch checked={isExplicit} onCheckedChange={setIsExplicit} />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Publish Podcast</Label>
                  <p className="text-sm text-muted-foreground">
                    Make podcast publicly available
                  </p>
                </div>
                <Switch checked={isPublished} onCheckedChange={setIsPublished} />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Show on Profile</Label>
                  <p className="text-sm text-muted-foreground">
                    Display this podcast on your public profile
                  </p>
                </div>
                <Switch checked={showOnProfile} onCheckedChange={setShowOnProfile} />
              </div>
            </div>

            {/* Submit */}
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/podcasts")}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createPodcast.isPending}>
                {createPodcast.isPending ? "Creating..." : "Create Podcast"}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default CreatePodcast;
