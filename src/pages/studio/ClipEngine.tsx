import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { 
  Upload, Link2, Film, Sparkles, ChevronLeft,
  Download, Loader2, Play, Heart, ThumbsDown,
  Calendar, Folder, Scissors, X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCredits } from "@/hooks/useCredits";

// Platform icons for export
const PlatformIcons = {
  tiktok: () => <span className="text-[10px]">🎵</span>,
  instagram: () => <span className="text-[10px]">📸</span>,
  youtube: () => <span className="text-[10px]">▶️</span>,
  facebook: () => <span className="text-[10px]">📘</span>,
  x: () => <span className="text-[10px]">✖</span>,
};

interface GeneratedClip {
  id: string;
  title: string;
  score: number;
  duration: number;
  startTime: number;
  endTime: number;
  thumbnailUrl: string;
  caption: string;
  speaker?: string;
  platformVersions: {
    tiktok_9x16?: string;
    instagram_9x16?: string;
    youtube_shorts_9x16?: string;
    facebook_1x1?: string;
    x_9x16?: string;
    youtube_16x9?: string;
  };
  liked?: boolean;
  disliked?: boolean;
}

interface MediaFile {
  id: string;
  file_name: string | null;
  file_url: string | null;
  cloudflare_download_url: string | null;
  duration_seconds: number | null;
}

type Step = "intake" | "processing" | "gallery";

export default function ClipEngine() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { deductCredit } = useCredits();
  const [searchParams] = useSearchParams();
  const mediaIdParam = searchParams.get("media");
  
  const [step, setStep] = useState<Step>("intake");
  const [selectedMediaId, setSelectedMediaId] = useState<string | null>(mediaIdParam);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [processingProgress, setProcessingProgress] = useState(0);
  const [processingStage, setProcessingStage] = useState("");
  const [generatedClips, setGeneratedClips] = useState<GeneratedClip[]>([]);
  const [showMediaSelector, setShowMediaSelector] = useState(false);

  // Fetch media library
  const { data: mediaFiles } = useQuery({
    queryKey: ["media-files-for-clips"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      
      const { data } = await supabase
        .from("media_files")
        .select("id, file_name, file_url, cloudflare_download_url, duration_seconds")
        .eq("user_id", user.id)
        .is("deleted_at", null)
        .order("created_at", { ascending: false })
        .limit(50);
      
      return (data || []) as MediaFile[];
    },
  });

  // Fetch selected media
  const { data: selectedMedia } = useQuery({
    queryKey: ["selected-media-clip", selectedMediaId],
    queryFn: async () => {
      if (!selectedMediaId) return null;
      const { data } = await supabase
        .from("media_files")
        .select("id, file_name, file_url, cloudflare_download_url, duration_seconds")
        .eq("id", selectedMediaId)
        .single();
      return data as MediaFile | null;
    },
    enabled: !!selectedMediaId,
  });

  // Auto-start processing if media selected via URL param
  useEffect(() => {
    if (mediaIdParam && selectedMedia && step === "intake") {
      handleStartProcessing();
    }
  }, [mediaIdParam, selectedMedia]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    toast({ title: "Uploading video...", description: "Please wait" });
    // For now, show a message about using media library
    toast({ 
      title: "Upload to Media Library first", 
      description: "Please upload your video in Media Library, then select it here.",
      variant: "destructive"
    });
  };

  const handleYoutubeUrl = () => {
    if (!youtubeUrl.trim()) return;
    toast({ 
      title: "YouTube import coming soon", 
      description: "This feature is being developed.",
    });
  };

  const handleSelectMedia = (media: MediaFile) => {
    setSelectedMediaId(media.id);
    setShowMediaSelector(false);
  };

  const handleStartProcessing = async () => {
    if (!selectedMediaId && !youtubeUrl) {
      toast({ title: "Please select a video first", variant: "destructive" });
      return;
    }

    setStep("processing");
    setProcessingProgress(0);

    // Simulate processing stages
    const stages = [
      { stage: "Transcribing speech...", progress: 15 },
      { stage: "Detecting speakers...", progress: 30 },
      { stage: "Analyzing key moments...", progress: 45 },
      { stage: "Scoring viral potential...", progress: 60 },
      { stage: "Generating 9:16 clips...", progress: 75 },
      { stage: "Applying smart captions...", progress: 85 },
      { stage: "Creating platform versions...", progress: 95 },
      { stage: "Finalizing...", progress: 100 },
    ];

    for (const s of stages) {
      setProcessingStage(s.stage);
      setProcessingProgress(s.progress);
      await new Promise(r => setTimeout(r, 800));
    }

    // Generate mock clips (in production, this would come from the AI)
    const mockClips: GeneratedClip[] = [
      { id: "1", title: "COVID Antibodies: BenchLink Accelerated Dru...", score: 99, duration: 29, startTime: 12, endTime: 41, thumbnailUrl: "", caption: "ACTUALLY", speaker: "Speaker 1", platformVersions: { tiktok_9x16: "", instagram_9x16: "", youtube_shorts_9x16: "" } },
      { id: "2", title: "Leaders: Don't Lose Touch With Your Customers!", score: 96, duration: 61, startTime: 45, endTime: 106, thumbnailUrl: "", caption: "AT A POINT WHEN", speaker: "Speaker 1", platformVersions: { tiktok_9x16: "", instagram_9x16: "", youtube_shorts_9x16: "" } },
      { id: "3", title: "CEO Lesson: Address Problems FAST! Don't Be...", score: 93, duration: 88, startTime: 120, endTime: 208, thumbnailUrl: "", caption: "I THINK THAT THAT'S", speaker: "Speaker 2", platformVersions: { tiktok_9x16: "", instagram_9x16: "", youtube_shorts_9x16: "" } },
      { id: "4", title: "Hiring Executives: Avoid This Critical Customer...", score: 91, duration: 148, startTime: 220, endTime: 368, thumbnailUrl: "", caption: "I THINK HIRING EXECUTIVES", speaker: "Speaker 1", platformVersions: { tiktok_9x16: "", instagram_9x16: "", youtube_shorts_9x16: "" } },
      { id: "5", title: "Founder Mode: The Ultimate Ownership Experience...", score: 88, duration: 71, startTime: 380, endTime: 451, thumbnailUrl: "", caption: "I THINK", speaker: "Speaker 2", platformVersions: { tiktok_9x16: "", instagram_9x16: "", youtube_shorts_9x16: "" } },
      { id: "6", title: "Hiring Mistakes: Don't Repeat My Leadership...", score: 85, duration: 55, startTime: 460, endTime: 515, thumbnailUrl: "", caption: "DEFINITELY I THINK", speaker: "Speaker 1", platformVersions: { tiktok_9x16: "", instagram_9x16: "", youtube_shorts_9x16: "" } },
      { id: "7", title: "Founder Truth: Uncover Hidden Ground Truths NOW!", score: 84, duration: 17, startTime: 520, endTime: 537, thumbnailUrl: "", caption: "BY THE WAY", speaker: "Speaker 1", platformVersions: { tiktok_9x16: "", instagram_9x16: "", youtube_shorts_9x16: "" } },
      { id: "8", title: "YC Funding Success: From Zero to BioTech Startup Hero", score: 83, duration: 76, startTime: 540, endTime: 616, thumbnailUrl: "", caption: "YC WAS THE ONLY", speaker: "Speaker 2", platformVersions: { tiktok_9x16: "", instagram_9x16: "", youtube_shorts_9x16: "" } },
      { id: "9", title: "Leadership: Setting Culture & Talking To Customers", score: 82, duration: 26, startTime: 620, endTime: 646, thumbnailUrl: "", caption: "I LEARNED TO", speaker: "Speaker 1", platformVersions: { tiktok_9x16: "", instagram_9x16: "", youtube_shorts_9x16: "" } },
      { id: "10", title: "Y Combinator Founders Reveal 'Founder Mode'...", score: 80, duration: 39, startTime: 650, endTime: 689, thumbnailUrl: "", caption: "THIS IS A SPECIAL", speaker: "Speaker 2", platformVersions: { tiktok_9x16: "", instagram_9x16: "", youtube_shorts_9x16: "" } },
      { id: "11", title: "Ronco Playbook: Effective Leadership & Company...", score: 79, duration: 35, startTime: 695, endTime: 730, thumbnailUrl: "", caption: "SOUNDS VERY RONCO TO ME", speaker: "Speaker 1", platformVersions: { tiktok_9x16: "", instagram_9x16: "", youtube_shorts_9x16: "" } },
      { id: "12", title: "Cut Management Layers: Trust Your Gut, As...", score: 78, duration: 33, startTime: 735, endTime: 768, thumbnailUrl: "", caption: "HAVE TOO MANY LAYERS", speaker: "Speaker 2", platformVersions: { tiktok_9x16: "", instagram_9x16: "", youtube_shorts_9x16: "" } },
    ];

    setGeneratedClips(mockClips);
    
    // Deduct credits (3 per clip)
    try {
      await deductCredit("clip_generation", `Generated ${mockClips.length} clips`, { clipCount: mockClips.length });
    } catch (e) {
      console.error("Credit deduction failed:", e);
    }

    setStep("gallery");
    toast({ title: `${mockClips.length} clips generated!`, description: "Your clips are ready." });
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const toggleLike = (clipId: string) => {
    setGeneratedClips(prev => prev.map(c => 
      c.id === clipId ? { ...c, liked: !c.liked, disliked: false } : c
    ));
  };

  const toggleDislike = (clipId: string) => {
    setGeneratedClips(prev => prev.map(c => 
      c.id === clipId ? { ...c, disliked: !c.disliked, liked: false } : c
    ));
  };

  const handleDownloadAll = () => {
    toast({ title: "Preparing download...", description: "Your clips will be ready shortly." });
  };

  const handleSaveToLibrary = () => {
    toast({ title: "Saved to Media Library", description: `${generatedClips.length} clips saved.` });
  };

  // Intake Screen
  if (step === "intake") {
    return (
      <div className="min-h-screen bg-[#0B0F14] text-white">
        {/* Header */}
        <div className="border-b border-white/10 px-6 py-4">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate("/studio/media")}
              className="text-white/60 hover:text-white hover:bg-white/10"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-semibold flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-400" />
                AI Clip Engine
              </h1>
              <p className="text-sm text-white/50">Turn long videos into viral clips automatically</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-3xl mx-auto px-6 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">Create Viral Clips in One Click</h2>
            <p className="text-white/60 text-lg">
              Drop a long video, paste a YouTube link, or choose from your recordings
            </p>
          </div>

          {/* Selected Media Preview */}
          {selectedMedia && (
            <div className="mb-8 p-4 rounded-xl bg-white/5 border border-white/10 flex items-center gap-4">
              <div className="w-20 h-14 bg-white/10 rounded-lg flex items-center justify-center">
                <Film className="w-6 h-6 text-white/40" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{selectedMedia.file_name || "Untitled"}</p>
                <p className="text-sm text-white/50">
                  {selectedMedia.duration_seconds ? formatDuration(selectedMedia.duration_seconds) : "Duration unknown"}
                </p>
              </div>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setSelectedMediaId(null)}
                className="text-white/40 hover:text-white"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}

          {/* Options Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {/* Upload */}
            <label className="group cursor-pointer">
              <input 
                type="file" 
                accept="video/*,audio/*" 
                className="hidden" 
                onChange={handleFileUpload}
              />
              <div className="h-40 rounded-xl border-2 border-dashed border-white/20 hover:border-emerald-400/50 transition-all flex flex-col items-center justify-center gap-3 group-hover:bg-white/5">
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-emerald-400/20">
                  <Upload className="w-6 h-6 text-white/60 group-hover:text-emerald-400" />
                </div>
                <span className="font-medium">Upload Video</span>
                <span className="text-xs text-white/40">MP4, MOV, MP3</span>
              </div>
            </label>

            {/* Choose from Studio */}
            <button 
              onClick={() => setShowMediaSelector(true)}
              className="group h-40 rounded-xl border-2 border-dashed border-white/20 hover:border-emerald-400/50 transition-all flex flex-col items-center justify-center gap-3 hover:bg-white/5"
            >
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-emerald-400/20">
                <Film className="w-6 h-6 text-white/60 group-hover:text-emerald-400" />
              </div>
              <span className="font-medium">Choose from Studio</span>
              <span className="text-xs text-white/40">Your recordings</span>
            </button>

            {/* Paste URL */}
            <div className="h-40 rounded-xl border-2 border-dashed border-white/20 flex flex-col items-center justify-center gap-3 p-4">
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                <Link2 className="w-6 h-6 text-white/60" />
              </div>
              <span className="font-medium">Paste URL</span>
              <Input
                placeholder="YouTube link..."
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                className="h-8 text-xs bg-white/5 border-white/20 text-white placeholder:text-white/30"
              />
            </div>
          </div>

          {/* Generate Button */}
          <div className="text-center">
            <Button 
              size="lg" 
              onClick={handleStartProcessing}
              disabled={!selectedMediaId && !youtubeUrl}
              className="gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-8"
            >
              <Sparkles className="w-5 h-5" />
              Generate Clips
            </Button>
            <p className="text-xs text-white/40 mt-3">3 credits per clip detected</p>
          </div>
        </div>

        {/* Media Selector Modal */}
        {showMediaSelector && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
            <div className="bg-[#1a1f2e] rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
              <div className="p-4 border-b border-white/10 flex items-center justify-between">
                <h3 className="font-semibold">Choose from Media Library</h3>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setShowMediaSelector(false)}
                  className="text-white/60 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
              <ScrollArea className="h-[60vh] p-4">
                <div className="grid grid-cols-2 gap-3">
                  {mediaFiles?.map(media => (
                    <button
                      key={media.id}
                      onClick={() => handleSelectMedia(media)}
                      className={cn(
                        "p-3 rounded-lg border text-left transition-all hover:bg-white/5",
                        selectedMediaId === media.id 
                          ? "border-emerald-400 bg-emerald-400/10" 
                          : "border-white/10"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center shrink-0">
                          <Film className="w-5 h-5 text-white/40" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{media.file_name || "Untitled"}</p>
                          <p className="text-xs text-white/50">
                            {media.duration_seconds ? formatDuration(media.duration_seconds) : "—"}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                  {(!mediaFiles || mediaFiles.length === 0) && (
                    <div className="col-span-2 text-center py-12 text-white/50">
                      <Film className="w-10 h-10 mx-auto mb-3 opacity-50" />
                      <p>No videos in your library yet</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Processing Screen
  if (step === "processing") {
    return (
      <div className="min-h-screen bg-[#0B0F14] text-white flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-full bg-emerald-400/20 flex items-center justify-center mx-auto mb-6">
            <Loader2 className="w-10 h-10 text-emerald-400 animate-spin" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Creating Your Clips</h2>
          <p className="text-white/60 mb-6">{processingStage}</p>
          <div className="w-full max-w-xs mx-auto">
            <Progress value={processingProgress} className="h-2" />
            <p className="text-sm text-white/40 mt-2">{processingProgress}%</p>
          </div>
        </div>
      </div>
    );
  }

  // Gallery Screen (Opus Clip style)
  return (
    <div className="min-h-screen bg-[#0B0F14] text-white">
      {/* Header */}
      <div className="border-b border-white/10 px-6 py-4 sticky top-0 bg-[#0B0F14] z-20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setStep("intake")}
              className="text-white/60 hover:text-white hover:bg-white/10"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-lg font-semibold">Original clips ({generatedClips.length})</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleSaveToLibrary}
              className="gap-2 border-white/20 text-white hover:bg-white/10"
            >
              <Folder className="w-4 h-4" />
              Save to Library
            </Button>
            <Button 
              size="sm" 
              onClick={handleDownloadAll}
              className="gap-2 bg-emerald-500 hover:bg-emerald-600"
            >
              <Download className="w-4 h-4" />
              Download All
            </Button>
          </div>
        </div>
      </div>

      {/* Clips Grid */}
      <div className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {generatedClips.map((clip) => (
            <div 
              key={clip.id} 
              className="group relative bg-white/5 rounded-xl overflow-hidden border border-white/10 hover:border-white/30 transition-all"
            >
              {/* Thumbnail */}
              <div className="aspect-[9/16] bg-gradient-to-br from-gray-800 to-gray-900 relative">
                {/* Placeholder image */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <Film className="w-8 h-8 text-white/20" />
                </div>
                
                {/* Duration badge */}
                <div className="absolute top-2 right-2 bg-black/70 px-2 py-0.5 rounded text-xs font-medium">
                  00:00 {formatDuration(clip.duration)}
                </div>

                {/* Like/Dislike buttons */}
                <div className="absolute top-2 left-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => toggleLike(clip.id)}
                    className={cn(
                      "w-7 h-7 rounded-full flex items-center justify-center transition-all",
                      clip.liked ? "bg-red-500 text-white" : "bg-black/50 text-white/70 hover:bg-black/70"
                    )}
                  >
                    <Heart className="w-3.5 h-3.5" fill={clip.liked ? "currentColor" : "none"} />
                  </button>
                  <button 
                    onClick={() => toggleDislike(clip.id)}
                    className={cn(
                      "w-7 h-7 rounded-full flex items-center justify-center transition-all",
                      clip.disliked ? "bg-gray-600 text-white" : "bg-black/50 text-white/70 hover:bg-black/70"
                    )}
                  >
                    <ThumbsDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Caption preview */}
                <div className="absolute bottom-4 left-2 right-2">
                  <div className="bg-emerald-500 text-black px-2 py-1 rounded text-xs font-bold inline-block">
                    {clip.caption}
                  </div>
                </div>

                {/* Play overlay on hover */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
                  <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
                    <Play className="w-5 h-5 text-black ml-0.5" />
                  </div>
                </div>
              </div>

              {/* Info Section */}
              <div className="p-3">
                {/* Score and Platform Icons */}
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl font-bold text-emerald-400">{clip.score}</span>
                  <div className="flex items-center gap-1.5">
                    <button className="w-6 h-6 rounded bg-red-500/20 flex items-center justify-center hover:bg-red-500/40 transition-colors">
                      <Calendar className="w-3 h-3 text-red-400" />
                    </button>
                    <button className="w-6 h-6 rounded bg-orange-500/20 flex items-center justify-center hover:bg-orange-500/40 transition-colors">
                      <Folder className="w-3 h-3 text-orange-400" />
                    </button>
                    <button className="w-6 h-6 rounded bg-blue-500/20 flex items-center justify-center hover:bg-blue-500/40 transition-colors">
                      <Scissors className="w-3 h-3 text-blue-400" />
                    </button>
                  </div>
                </div>

                {/* Title */}
                <p className="text-sm font-medium leading-tight line-clamp-2">
                  {clip.title}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
