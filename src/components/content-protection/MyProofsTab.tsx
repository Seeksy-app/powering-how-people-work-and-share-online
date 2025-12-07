import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, FileAudio, FileVideo, FileText, Shield, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const MyProofsTab = () => {
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    contentType: "audio",
    fileUrl: "",
  });

  const { data: protectedContent, isLoading } = useQuery({
    queryKey: ["protected-content"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("protected_content")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  const addContentMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.id) throw new Error("Not authenticated");

      const fileHash = await generateHash(data.fileUrl || data.title);

      const { data: newContent, error } = await supabase
        .from("protected_content")
        .insert({
          user_id: user.id,
          title: data.title,
          content_type: data.contentType,
          file_url: data.fileUrl || null,
          file_hash: fileHash,
        })
        .select()
        .single();

      if (error) throw error;
      return newContent;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["protected-content"] });
      setIsAddDialogOpen(false);
      setFormData({ title: "", contentType: "audio", fileUrl: "" });
      toast.success("Content registered for protection");
    },
    onError: (error) => {
      toast.error("Failed to register content: " + error.message);
    },
  });

  const generateHash = async (input: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(input + Date.now());
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
  };

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case "audio":
        return FileAudio;
      case "video":
        return FileVideo;
      default:
        return FileText;
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">My Protected Content</h2>
          <p className="text-sm text-muted-foreground">
            Register your content to protect it from unauthorized use
          </p>
        </div>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Protect Content
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Register Content for Protection</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  placeholder="Episode title, video name, etc."
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Content Type</Label>
                <Select
                  value={formData.contentType}
                  onValueChange={(value) => setFormData({ ...formData, contentType: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="audio">Audio (Podcast, Music)</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="transcript">Transcript</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>File URL (optional)</Label>
                <Input
                  placeholder="https://..."
                  value={formData.fileUrl}
                  onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })}
                />
              </div>

              <Button
                className="w-full"
                onClick={() => addContentMutation.mutate(formData)}
                disabled={!formData.title || addContentMutation.isPending}
              >
                {addContentMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Registering...
                  </>
                ) : (
                  <>
                    <Shield className="h-4 w-4 mr-2" />
                    Register & Protect
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {protectedContent && protectedContent.length > 0 ? (
        <div className="grid gap-4">
          {protectedContent.map((content) => {
            const Icon = getContentTypeIcon(content.content_type);
            return (
              <Card key={content.id} className="p-4">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium truncate">{content.title}</h3>
                      {content.file_hash && (
                        <Badge variant="outline" className="text-xs">
                          Fingerprinted
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span>Type: {content.content_type}</span>
                      <span>
                        Registered: {new Date(content.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-medium mb-2">No Protected Content Yet</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Register your podcasts, videos, and recordings to protect them.
          </p>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Protect Your First Content
          </Button>
        </Card>
      )}
    </div>
  );
};
