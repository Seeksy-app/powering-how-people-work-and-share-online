import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { 
  ArrowLeft, Calendar, Edit2, ChevronDown, 
  Circle, Radio, MonitorPlay, Sparkles, Focus
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type StudioMode = "record" | "live";

interface VideoStudioHeaderProps {
  sessionTitle: string;
  onBack: () => void;
  isRecording: boolean;
  studioMode: StudioMode;
  onModeChange: (mode: StudioMode) => void;
  onStartSession: () => void;
  onStopSession: () => void;
  onChannels: () => void;
  onSchedule: () => void;
  onEditTitle: () => void;
  recordingTime?: number;
  channelCount?: number;
  activeChannelCount?: number;
  realtimeAIClips?: boolean;
  onRealtimeAIClipsChange?: (value: boolean) => void;
  aiCameraFocus?: boolean;
  onAiCameraFocusChange?: (value: boolean) => void;
}

export function VideoStudioHeader({
  sessionTitle,
  onBack,
  isRecording,
  studioMode,
  onModeChange,
  onStartSession,
  onStopSession,
  onChannels,
  onSchedule,
  onEditTitle,
  recordingTime = 0,
  channelCount = 0,
  activeChannelCount = 0,
  realtimeAIClips = false,
  onRealtimeAIClipsChange,
  aiCameraFocus = false,
  onAiCameraFocusChange,
}: VideoStudioHeaderProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(sessionTitle);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleTitleSubmit = () => {
    setIsEditingTitle(false);
    onEditTitle();
  };

  return (
    <header className="h-16 bg-[#1a1d21] border-b border-white/10 px-4 flex items-center justify-between shrink-0">
      {/* Left Section: Exit + AI Toggles */}
      <div className="flex items-center gap-4">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onBack} 
          className="border-white/20 text-white hover:bg-white/10 hover:text-white gap-2 font-medium rounded-lg h-9"
        >
          <ArrowLeft className="w-4 h-4" />
          Exit Studio
        </Button>
        
        <div className="h-6 w-px bg-white/20" />
        
        {/* AI Toggles - Restream Style */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
            <Sparkles className="w-4 h-4 text-pink-400" />
            <span className="text-xs text-white/70 whitespace-nowrap">AI Clips</span>
            <Switch 
              checked={realtimeAIClips} 
              onCheckedChange={onRealtimeAIClipsChange}
              className="scale-75 data-[state=checked]:bg-pink-500"
            />
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
            <Focus className="w-4 h-4 text-blue-400" />
            <span className="text-xs text-white/70 whitespace-nowrap">AI Focus</span>
            <Switch 
              checked={aiCameraFocus} 
              onCheckedChange={onAiCameraFocusChange}
              className="scale-75 data-[state=checked]:bg-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Center Section: Session Title + Recording */}
      <div className="flex items-center gap-3 flex-1 justify-center max-w-md">
        {isRecording && (
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/20 border border-red-500/30">
            <Circle className="w-2.5 h-2.5 fill-red-500 text-red-500 animate-pulse" />
            <span className="text-red-400 text-sm font-medium tabular-nums">
              {formatTime(recordingTime)}
            </span>
          </div>
        )}
        
        {isEditingTitle ? (
          <Input 
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            onBlur={handleTitleSubmit}
            onKeyDown={(e) => e.key === 'Enter' && handleTitleSubmit()}
            className="h-8 w-64 text-sm font-medium bg-white/10 border-white/20 text-white"
            autoFocus
          />
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-white text-sm font-medium truncate max-w-[240px]">
              {sessionTitle}
            </span>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsEditingTitle(true)}
              className="text-white/40 hover:text-white hover:bg-white/10 h-6 w-6"
              disabled={isRecording}
            >
              <Edit2 className="w-3 h-3" />
            </Button>
          </div>
        )}
      </div>

      {/* Right Section: Channels + Mode + Go Live */}
      <div className="flex items-center gap-2">
        {/* Channels Button with Counter */}
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onChannels}
          className="border-white/20 text-white hover:bg-white/10 hover:text-white gap-2 rounded-lg h-9"
          disabled={isRecording}
        >
          <span className="text-lg leading-none">+</span>
          Channels
          {channelCount > 0 && (
            <span className="px-1.5 py-0.5 text-[10px] rounded bg-white/10 text-white/70">
              {activeChannelCount}/{channelCount}
            </span>
          )}
        </Button>

        {/* Schedule Button */}
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onSchedule}
          className="border-white/20 text-white hover:bg-white/10 hover:text-white gap-2 rounded-lg h-9"
          disabled={isRecording}
        >
          <Calendar className="w-4 h-4" />
        </Button>

        {/* Mode Selector Pill */}
        <div className="flex items-center rounded-lg overflow-hidden border border-white/20 h-9">
          <button
            onClick={() => onModeChange("record")}
            className={cn(
              "px-3 h-full flex items-center gap-1.5 text-xs font-medium transition-colors",
              studioMode === "record" 
                ? "bg-white/15 text-white" 
                : "bg-transparent text-white/50 hover:text-white hover:bg-white/5"
            )}
            disabled={isRecording}
          >
            <MonitorPlay className="w-3.5 h-3.5" />
            Record
          </button>
          <div className="w-px h-4 bg-white/20" />
          <button
            onClick={() => onModeChange("live")}
            className={cn(
              "px-3 h-full flex items-center gap-1.5 text-xs font-medium transition-colors",
              studioMode === "live" 
                ? "bg-white/15 text-white" 
                : "bg-transparent text-white/50 hover:text-white hover:bg-white/5"
            )}
            disabled={isRecording}
          >
            <Radio className="w-3.5 h-3.5" />
            Live
          </button>
        </div>

        {/* Go Live / Stop Button */}
        {isRecording ? (
          <Button 
            onClick={onStopSession}
            className="gap-2 px-5 h-9 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold"
          >
            <Circle className="w-3.5 h-3.5 fill-current" />
            Stop
          </Button>
        ) : (
          <Button 
            onClick={onStartSession}
            className={cn(
              "gap-2 px-5 h-9 rounded-lg font-semibold text-white",
              studioMode === "live"
                ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500"
                : "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500"
            )}
          >
            {studioMode === "live" ? (
              <>
                <Radio className="w-3.5 h-3.5" />
                Go Live
              </>
            ) : (
              <>
                <Circle className="w-3.5 h-3.5 fill-current" />
                Start Recording
              </>
            )}
          </Button>
        )}
      </div>
    </header>
  );
}
