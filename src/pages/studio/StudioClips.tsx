import { useState, useRef, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Play, Pause, Scissors, Wand2, Download, Share2, 
  ChevronLeft, Clock, Sparkles, Volume2, 
  Instagram, Youtube, Music2, Maximize2, Flag,
  Zap, MessageSquare, Heart, TrendingUp, Loader2
} from "lucide-react";

interface ClipSuggestion {
  id: string;
  start: number;
  end: number;
  title: string;
  type: "emotion" | "keyword" | "manual" | "ai";
  confidence: number;
  transcript?: string;
}

export default function StudioClips() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const mediaId = searchParams.get("mediaId");
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [selectedClip, setSelectedClip] = useState<ClipSuggestion | null>(null);
  const [markers, setMarkers] = useState<number[]>([]);
  const [clipStart, setClipStart] = useState(0);
  const [clipEnd, setClipEnd] = useState(30);
  const [isRendering, setIsRendering] = useState(false);
  const [renderProgress, setRenderProgress] = useState(0);
  const [previewFormat, setPreviewFormat] = useState<"9:16" | "1:1" | "16:9">("9:16");

  // Mock clip suggestions
  const [clipSuggestions] = useState<ClipSuggestion[]>([
    { id: "1", start: 12, end: 42, title: "Emotional moment", type: "emotion", confidence: 94, transcript: "This is the moment that changed everything..." },
    { id: "2", start: 65, end: 95, title: "Key insight", type: "keyword", confidence: 88, transcript: "The three things you need to know about..." },
    { id: "3", start: 120, end: 150, title: "Viral hook", type: "ai", confidence: 91, transcript: "Here's what nobody tells you about..." },
    { id: "4", start: 200, end: 230, title: "Strong opener", type: "ai", confidence: 87, transcript: "Stop scrolling. This is important..." },
  ]);

  const { data: mediaFile } = useQuery({
    queryKey: ["media-file", mediaId],
    queryFn: async () => {
      if (!mediaId) return null;
      const { data } = await supabase
        .from("media_files")
        .select("*")
        .eq("id", mediaId)
        .single();
      return data as unknown as { 
        id: string; 
        file_name: string; 
        cloudflare_download_url: string | null;
        duration_seconds: number | null;
      } | null;
    },
    enabled: !!mediaId,
  });

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    const handleLoadedMetadata = () => setDuration(video.duration);

    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("loadedmetadata", handleLoadedMetadata);

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
    };
  }, []);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    setIsPlaying(!isPlaying);
  };

  const addMarker = () => {
    setMarkers([...markers, currentTime]);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getTypeIcon = (type: ClipSuggestion["type"]) => {
    switch (type) {
      case "emotion": return Heart;
      case "keyword": return MessageSquare;
      case "ai": return Sparkles;
      case "manual": return Flag;
      default: return Zap;
    }
  };

  const handleCreateClip = () => {
    setIsRendering(true);
    setRenderProgress(0);
    
    const interval = setInterval(() => {
      setRenderProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsRendering(false);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 500);
  };

  const exportFormats = [
    { id: "tiktok", label: "TikTok", icon: Music2, ratio: "9:16" },
    { id: "reels", label: "Reels", icon: Instagram, ratio: "9:16" },
    { id: "shorts", label: "YouTube Shorts", icon: Youtube, ratio: "9:16" },
    { id: "horizontal", label: "Full Episode", icon: Maximize2, ratio: "16:9" },
  ];

  const aspectRatioClass = {
    "9:16": "aspect-[9/16] max-w-xs",
    "1:1": "aspect-square max-w-sm",
    "16:9": "aspect-video max-w-lg",
  };

  return (
    <div className="h-screen flex flex-col bg-[#0B0F14]">
      {/* Top Bar */}
      <div className="h-14 border-b border-white/10 px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/studio")} className="text-white/60 hover:text-white hover:bg-white/10">
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <span className="text-white/40">‹</span>
          <span className="text-white/60 text-sm cursor-pointer hover:text-white" onClick={() => navigate("/studio")}>Back to Studio Home</span>
        </div>
        <div className="flex items-center gap-3">
          <h1 className="font-semibold text-white">AI Clip Generator</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2 border-white/20 text-white hover:bg-white/10">
            <Download className="w-4 h-4" />
            Export All
          </Button>
          <Button size="sm" className="gap-2 bg-violet-500 hover:bg-violet-600">
            <Share2 className="w-4 h-4" />
            Publish
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Video Preview */}
        <div className="w-1/2 border-r border-white/10 flex flex-col">
          {/* Video Player */}
          <div className="flex-1 bg-black/50 flex items-center justify-center p-6">
            <div className={`relative ${aspectRatioClass[previewFormat]} w-full bg-[#1a1f2e] rounded-xl overflow-hidden border border-white/10`}>
              {mediaFile?.cloudflare_download_url ? (
                <video
                  ref={videoRef}
                  src={mediaFile.cloudflare_download_url}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center">
                    <Wand2 className="w-12 h-12 text-white/20 mx-auto mb-3" />
                    <p className="text-sm text-white/40">Select a video to generate clips</p>
                  </div>
                </div>
              )}
              
              {/* PiP Overlay */}
              {previewFormat === "9:16" && (
                <div className="absolute bottom-4 right-4 w-20 h-12 bg-black/60 rounded-lg border border-white/20 backdrop-blur-sm flex items-center justify-center">
                  <span className="text-[10px] text-white/50">16:9</span>
                </div>
              )}

              {/* Rendering overlay */}
              {isRendering && (
                <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center">
                  <Loader2 className="w-10 h-10 text-violet-400 animate-spin mb-4" />
                  <p className="text-white font-medium mb-2">Rendering clip...</p>
                  <div className="w-48">
                    <Progress value={renderProgress} className="h-2" />
                  </div>
                  <p className="text-white/60 text-sm mt-2">{Math.round(renderProgress)}%</p>
                </div>
              )}
            </div>
          </div>

          {/* Format Preview Selector */}
          <div className="px-4 py-3 border-t border-white/10 flex items-center gap-2">
            <span className="text-xs text-white/50 mr-2">Preview:</span>
            {(["9:16", "1:1", "16:9"] as const).map((format) => (
              <Button
                key={format}
                variant="ghost"
                size="sm"
                onClick={() => setPreviewFormat(format)}
                className={`text-xs ${previewFormat === format ? "bg-violet-500/20 text-violet-400" : "text-white/60 hover:text-white"}`}
              >
                {format}
              </Button>
            ))}
          </div>

          {/* Video Controls */}
          <div className="p-4 border-t border-white/10 space-y-4">
            {/* Timeline */}
            <div className="relative">
              <Slider
                value={[currentTime]}
                max={duration || 100}
                step={0.1}
                onValueChange={([val]) => {
                  setCurrentTime(val);
                  if (videoRef.current) videoRef.current.currentTime = val;
                }}
                className="w-full"
              />
              {/* Markers on timeline */}
              <div className="absolute inset-0 pointer-events-none">
                {markers.map((marker, i) => (
                  <div
                    key={i}
                    className="absolute top-0 w-0.5 h-full bg-violet-500"
                    style={{ left: `${(marker / (duration || 100)) * 100}%` }}
                  />
                ))}
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={togglePlay} className="border-white/20 text-white hover:bg-white/10">
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </Button>
                <span className="text-sm tabular-nums text-white/60">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="gap-1.5 border-white/20 text-white hover:bg-white/10" onClick={addMarker}>
                  <Flag className="w-3.5 h-3.5" />
                  Add Marker (M)
                </Button>
                <Button variant="outline" size="icon" className="border-white/20 text-white hover:bg-white/10">
                  <Volume2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Clip Range Selector */}
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-white">Clip Range</span>
                <span className="text-xs text-white/50">{formatTime(clipEnd - clipStart)} duration</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label className="text-xs text-white/50">Start</label>
                  <input 
                    type="text" 
                    value={formatTime(clipStart)} 
                    className="w-full mt-1 px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-sm text-white"
                    readOnly
                  />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-white/50">End</label>
                  <input 
                    type="text" 
                    value={formatTime(clipEnd)} 
                    className="w-full mt-1 px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-sm text-white"
                    readOnly
                  />
                </div>
                <Button size="sm" className="gap-1.5 mt-5 bg-violet-500 hover:bg-violet-600" onClick={handleCreateClip} disabled={isRendering}>
                  <Scissors className="w-3.5 h-3.5" />
                  Create Clip
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - AI Suggestions & Export */}
        <div className="w-1/2 flex flex-col bg-[#0d1117]">
          <Tabs defaultValue="suggestions" className="flex-1 flex flex-col">
            <TabsList className="w-full justify-start px-4 h-12 rounded-none border-b border-white/10 bg-transparent">
              <TabsTrigger value="suggestions" className="gap-2 text-white/60 data-[state=active]:text-white data-[state=active]:bg-white/10">
                <Sparkles className="w-4 h-4" />
                AI Suggestions
              </TabsTrigger>
              <TabsTrigger value="clips" className="gap-2 text-white/60 data-[state=active]:text-white data-[state=active]:bg-white/10">
                <Scissors className="w-4 h-4" />
                My Clips
              </TabsTrigger>
              <TabsTrigger value="export" className="gap-2 text-white/60 data-[state=active]:text-white data-[state=active]:bg-white/10">
                <Download className="w-4 h-4" />
                Export
              </TabsTrigger>
            </TabsList>

            <TabsContent value="suggestions" className="flex-1 m-0 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-white/60">
                      {clipSuggestions.length} clips detected
                    </p>
                    <Button variant="outline" size="sm" className="gap-1.5 border-white/20 text-white hover:bg-white/10">
                      <Wand2 className="w-3.5 h-3.5" />
                      Re-analyze
                    </Button>
                  </div>

                  {clipSuggestions.map((clip) => {
                    const TypeIcon = getTypeIcon(clip.type);
                    return (
                      <div
                        key={clip.id}
                        onClick={() => {
                          setSelectedClip(clip);
                          setClipStart(clip.start);
                          setClipEnd(clip.end);
                        }}
                        className={`p-4 rounded-xl border transition-all cursor-pointer ${
                          selectedClip?.id === clip.id 
                            ? "border-violet-500 bg-violet-500/10" 
                            : "border-white/10 hover:border-violet-500/50 bg-white/5"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-16 h-24 rounded-lg bg-white/10 shrink-0 flex items-center justify-center">
                            <Play className="w-5 h-5 text-white/40" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-medium text-sm text-white">{clip.title}</h3>
                              <Badge variant="outline" className="text-xs gap-1 border-white/20 text-white/70">
                                <TypeIcon className="w-3 h-3" />
                                {clip.type}
                              </Badge>
                            </div>
                            <p className="text-xs text-white/50 mb-2 line-clamp-2">
                              {clip.transcript}
                            </p>
                            <div className="flex items-center gap-3 text-xs text-white/40">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatTime(clip.start)} - {formatTime(clip.end)}
                              </span>
                              <span className="flex items-center gap-1">
                                <TrendingUp className="w-3 h-3" />
                                {clip.confidence}% match
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="clips" className="flex-1 m-0 p-4">
              <div className="h-full flex items-center justify-center text-center">
                <div>
                  <Scissors className="w-12 h-12 text-white/20 mx-auto mb-3" />
                  <p className="font-medium mb-1 text-white">No clips created yet</p>
                  <p className="text-sm text-white/50">Select from AI suggestions or create manually</p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="export" className="flex-1 m-0 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="p-4 space-y-4">
                  <p className="text-sm text-white/60">Choose export format for your clips</p>
                  
                  <div className="grid grid-cols-2 gap-3">
                    {exportFormats.map((format) => (
                      <button
                        key={format.id}
                        className="p-4 rounded-xl border border-white/10 bg-white/5 hover:border-violet-500/50 hover:bg-white/10 transition-all text-left"
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                            <format.icon className="w-5 h-5 text-white/70" />
                          </div>
                          <div>
                            <p className="font-medium text-sm text-white">{format.label}</p>
                            <p className="text-xs text-white/50">{format.ratio}</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-white/10">
                    <h3 className="font-medium mb-3 text-white">Export Options</h3>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm text-white/70">
                        <input type="checkbox" className="rounded bg-white/10 border-white/20" defaultChecked />
                        Include captions
                      </label>
                      <label className="flex items-center gap-2 text-sm text-white/70">
                        <input type="checkbox" className="rounded bg-white/10 border-white/20" defaultChecked />
                        Add Seeksy watermark
                      </label>
                      <label className="flex items-center gap-2 text-sm text-white/70">
                        <input type="checkbox" className="rounded bg-white/10 border-white/20" />
                        Auto-publish to My Page
                      </label>
                    </div>
                  </div>

                  <Button className="w-full gap-2 bg-violet-500 hover:bg-violet-600">
                    <Download className="w-4 h-4" />
                    Export Selected Clips
                  </Button>
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
