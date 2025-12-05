import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Play, Video, Upload, Wand2, 
  Clock, Scissors, ArrowRight, ChevronRight,
  FolderOpen, FileText,
  History, Calendar, HardDrive, Sparkles
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

// Menu item component for cleaner code
function MenuCard({ 
  icon: Icon, 
  label, 
  description, 
  onClick,
  delay = 0 
}: { 
  icon: any; 
  label: string; 
  description: string; 
  onClick: () => void;
  delay?: number;
}) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.2 }}
      onClick={onClick}
      className="w-full flex items-center gap-4 p-4 bg-card border border-border rounded-xl hover:border-primary/30 hover:shadow-md hover:bg-accent/30 transition-all duration-200 group"
    >
      <div className="w-11 h-11 rounded-xl bg-muted/80 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
        <Icon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
      </div>
      <div className="flex-1 text-left min-w-0">
        <p className="font-medium text-sm text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
    </motion.button>
  );
}

// Session card skeleton
function SessionSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4">
      <Skeleton className="w-16 h-12 rounded-lg" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-20" />
      </div>
      <Skeleton className="h-6 w-16 rounded-full" />
    </div>
  );
}

export default function StudioHubPremium() {
  const navigate = useNavigate();
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["studio-hub-stats"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { sessions: 0, clips: 0 };

      const [sessionsResult, clipsResult] = await Promise.all([
        supabase.from("studio_sessions")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id),
        supabase.from("clips")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id)
      ]);

      return {
        sessions: sessionsResult.count || 0,
        clips: clipsResult.count || 0,
      };
    },
  });

  const { data: recentSessions, isLoading: sessionsLoading } = useQuery({
    queryKey: ["studio-recent-sessions-hub"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data } = await supabase
        .from("studio_sessions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5);

      return data || [];
    },
  });

  const hubMenuItems = [
    { icon: History, label: "Past Streams", path: "/studio/past-streams", desc: "View recordings" },
    { icon: Calendar, label: "Scheduled Streams", path: "/studio/scheduled", desc: "Upcoming streams" },
    { icon: HardDrive, label: "Storage", path: "/studio/storage", desc: "All assets & files" },
    { icon: Scissors, label: "Clips & Highlights", path: "/clips-studio", desc: "AI-generated clips" },
    { icon: FolderOpen, label: "Media Library", path: "/studio/media", desc: "All your recordings" },
    { icon: FileText, label: "Templates", path: "/studio/templates", desc: "Scripts & ad reads" },
  ];

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };

  const handleDragLeave = () => {
    setIsDraggingOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    // Navigate to clips studio with files
    navigate("/clips-studio");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8 space-y-8">
        {/* Breadcrumb - hidden on mobile */}
        <nav className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
          <span>Media & Content</span>
          <ChevronRight className="w-4 h-4" />
          <span className="text-foreground font-medium">Studio Hub</span>
        </nav>

        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold text-foreground tracking-tight">Studio Hub</h1>
            <p className="text-muted-foreground mt-1">Professional content creation suite</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="font-semibold text-foreground">{statsLoading ? "–" : stats?.sessions || 0}</span>
                <span className="text-muted-foreground">Sessions</span>
              </div>
              <div className="hidden sm:block w-px h-4 bg-border" />
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span className="font-semibold text-foreground">{statsLoading ? "–" : stats?.clips || 0}</span>
                <span className="text-muted-foreground">Auto Clips</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            {/* Create New Studio */}
            <Button
              onClick={() => navigate("/studio/video")}
              className="h-16 lg:h-14 px-6 gap-3 bg-[#2C6BED] hover:bg-[#053877] text-white rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-200 justify-start"
            >
              <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                <Play className="w-5 h-5" />
              </div>
              <span className="font-semibold text-base">Create New Studio</span>
            </Button>

            {/* Upload Media */}
            <Button
              onClick={() => navigate("/studio/media?upload=true")}
              className="h-16 lg:h-14 px-6 gap-3 bg-[#F5C242] hover:bg-[#E5B232] text-black rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-200 justify-start"
            >
              <div className="w-10 h-10 rounded-lg bg-black/10 flex items-center justify-center">
                <Upload className="w-5 h-5" />
              </div>
              <span className="font-semibold text-base">Upload Media</span>
            </Button>

            {/* Generate Clips - with drag and drop */}
            <Button
              onClick={() => navigate("/clips-studio")}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={cn(
                "h-16 lg:h-14 px-6 gap-3 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-200 justify-start col-span-2 lg:col-span-1",
                isDraggingOver && "ring-4 ring-pink-300 ring-offset-2 scale-105"
              )}
            >
              <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                <Wand2 className="w-5 h-5" />
              </div>
              <div className="text-left">
                <span className="font-semibold text-base block">Generate Clips</span>
                {isDraggingOver && <span className="text-xs opacity-80">Drop to generate clips</span>}
              </div>
            </Button>
          </div>
        </motion.section>

        {/* Two Column Layout */}
        <div className="grid lg:grid-cols-5 gap-8">
          {/* Recent Sessions - Left Column */}
          <motion.section 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-3"
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-foreground">Recent Sessions</h2>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-sm text-muted-foreground hover:text-foreground" 
                onClick={() => navigate("/studio/recordings")}
              >
                View All <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
            
            <div className="bg-card border border-border rounded-2xl overflow-hidden">
              {sessionsLoading ? (
                <div className="divide-y divide-border">
                  {[1, 2, 3].map((i) => (
                    <SessionSkeleton key={i} />
                  ))}
                </div>
              ) : recentSessions && recentSessions.length > 0 ? (
                <div className="divide-y divide-border">
                  {recentSessions.map((session: any, index: number) => (
                    <motion.div
                      key={session.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => navigate(`/studio/session/${session.id}`)}
                      className="flex items-center gap-4 p-4 hover:bg-accent/50 cursor-pointer transition-colors group"
                    >
                      {/* Thumbnail */}
                      <div className="w-16 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center overflow-hidden group-hover:scale-105 transition-transform">
                        <Video className="w-5 h-5 text-primary" />
                      </div>
                      
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-foreground truncate">
                          {session.room_name || "Untitled Session"}
                        </p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                          <Clock className="w-3 h-3" />
                          {formatDistanceToNow(new Date(session.created_at), { addSuffix: true })}
                        </p>
                      </div>

                      {/* Meta */}
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground font-mono tabular-nums">
                          {session.duration_seconds 
                            ? `${Math.floor(session.duration_seconds / 60)}:${(session.duration_seconds % 60).toString().padStart(2, '0')}`
                            : "0:00"}
                        </span>
                        <Badge 
                          variant={session.status === 'ended' ? 'secondary' : 'default'} 
                          className={cn(
                            "text-xs capitalize",
                            session.status === 'active' && "bg-green-500/10 text-green-600 border-green-500/20"
                          )}
                        >
                          {session.status === 'active' ? 'Active' : 'Completed'}
                        </Badge>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
                    <Video className="w-7 h-7 text-muted-foreground" />
                  </div>
                  <p className="font-medium text-foreground mb-1">No sessions yet</p>
                  <p className="text-sm text-muted-foreground mb-6">
                    Start your first studio session to see it here
                  </p>
                  <Button onClick={() => navigate("/studio/video")} className="bg-primary hover:bg-primary/90">
                    <Play className="w-4 h-4 mr-2" /> Create New Studio
                  </Button>
                </div>
              )}
            </div>
          </motion.section>

          {/* Studio Hub Menu - Right Column */}
          <motion.section 
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2"
          >
            <h2 className="text-lg font-semibold text-foreground mb-5">Studio Hub Menu</h2>
            <div className="space-y-3">
              {hubMenuItems.map((item, index) => (
                <MenuCard
                  key={item.label}
                  icon={item.icon}
                  label={item.label}
                  description={item.desc}
                  onClick={() => navigate(item.path)}
                  delay={0.35 + index * 0.05}
                />
              ))}
            </div>
          </motion.section>
        </div>
      </div>
    </div>
  );
}
