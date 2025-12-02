import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ArrowLeft, Clock, Scissors, Bookmark, FileAudio, 
  Wand2, Play, Download, PlusCircle
} from "lucide-react";

export default function StudioSession() {
  const navigate = useNavigate();
  const { sessionId } = useParams();

  const { data: session, isLoading } = useQuery({
    queryKey: ["studio-session", sessionId],
    queryFn: async () => {
      if (!sessionId || sessionId === "new") {
        return {
          id: "new",
          room_name: "New Recording",
          duration_seconds: 125,
          status: "ended",
          created_at: new Date().toISOString(),
          clips_detected: 4,
          markers_count: 3,
          tracks: 2,
        };
      }
      const { data } = await supabase
        .from("studio_sessions")
        .select("*")
        .eq("id", sessionId)
        .single();
      return data;
    },
    enabled: !!sessionId,
  });

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (isLoading) {
    return (
      <div className="h-screen bg-[#0B0F14] flex items-center justify-center">
        <div className="text-white/60">Loading session...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0F14]">
      {/* Header */}
      <header className="h-14 border-b border-white/10 px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/studio")} className="text-white/60 hover:text-white hover:bg-white/10">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <span className="text-white/40">‹</span>
          <span className="text-white/60 text-sm cursor-pointer hover:text-white" onClick={() => navigate("/studio")}>Back to Studio Home</span>
        </div>
        <h1 className="font-semibold text-white">Recording Complete</h1>
        <div />
      </header>

      <div className="max-w-4xl mx-auto px-6 py-10">
        {/* Session Summary */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
            <FileAudio className="w-8 h-8 text-emerald-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">{session?.room_name || "Recording Session"}</h2>
          <Badge className="bg-emerald-500/20 text-emerald-400 border-0">Recording Saved</Badge>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-4 mb-10">
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-4 text-center">
              <Clock className="w-6 h-6 text-violet-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{formatDuration(session?.duration_seconds || 0)}</p>
              <p className="text-xs text-white/50">Duration</p>
            </CardContent>
          </Card>
        <Card className="bg-white/5 border-white/10">
            <CardContent className="p-4 text-center">
              <Scissors className="w-6 h-6 text-pink-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">4</p>
              <p className="text-xs text-white/50">Clips Detected</p>
            </CardContent>
          </Card>
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-4 text-center">
              <Bookmark className="w-6 h-6 text-amber-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">3</p>
              <p className="text-xs text-white/50">Markers</p>
            </CardContent>
          </Card>
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-4 text-center">
              <FileAudio className="w-6 h-6 text-blue-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">2</p>
              <p className="text-xs text-white/50">Tracks</p>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <Card className="bg-white/5 border-white/10 mb-6">
          <CardHeader>
            <CardTitle className="text-white">Next Steps</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              className="w-full justify-start gap-3 h-14 bg-violet-500 hover:bg-violet-600"
              onClick={() => navigate("/studio/clips")}
            >
              <Wand2 className="w-5 h-5" />
              <div className="text-left">
                <p className="font-medium">Run AI Post-Production</p>
                <p className="text-xs text-white/70">Auto-enhance, remove filler words, normalize audio</p>
              </div>
            </Button>
            
            <Button 
              variant="outline"
              className="w-full justify-start gap-3 h-14 border-white/20 text-white hover:bg-white/10"
              onClick={() => navigate("/studio/clips")}
            >
              <Scissors className="w-5 h-5" />
              <div className="text-left">
                <p className="font-medium">Generate Clips</p>
                <p className="text-xs text-white/50">Create social media clips from AI suggestions</p>
              </div>
            </Button>
            
            <Button 
              variant="outline"
              className="w-full justify-start gap-3 h-14 border-white/20 text-white hover:bg-white/10"
              onClick={() => navigate("/podcasts")}
            >
              <PlusCircle className="w-5 h-5" />
              <div className="text-left">
                <p className="font-medium">Create Podcast Episode</p>
                <p className="text-xs text-white/50">Publish this recording as an episode</p>
              </div>
            </Button>
            
            <Button 
              variant="outline"
              className="w-full justify-start gap-3 h-14 border-white/20 text-white hover:bg-white/10"
            >
              <Download className="w-5 h-5" />
              <div className="text-left">
                <p className="font-medium">Download Recording</p>
                <p className="text-xs text-white/50">Export raw audio/video files</p>
              </div>
            </Button>
          </CardContent>
        </Card>

        <div className="text-center">
          <Button variant="ghost" onClick={() => navigate("/studio")} className="text-white/60 hover:text-white">
            Return to Studio
          </Button>
        </div>
      </div>
    </div>
  );
}
