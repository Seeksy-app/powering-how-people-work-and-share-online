import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Plus, MoreVertical, User, Users, 
  LayoutGrid, Monitor, Eye, GripVertical,
  Video, Image, Timer, ChevronDown
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export type SceneLayout = "host-only" | "host-guest" | "side-by-side" | "grid" | "speaker" | "screen-share" | "media" | "countdown";
export type SceneType = "camera" | "media" | "countdown";

export interface Scene {
  id: string;
  name: string;
  layout: SceneLayout;
  sceneType?: SceneType;
  thumbnail?: string;
  mediaId?: string;
  countdownSeconds?: number;
}

interface VideoStudioScenesResizableProps {
  scenes: Scene[];
  activeSceneId: string | null;
  onSceneSelect: (sceneId: string) => void;
  onAddScene: (type?: SceneType) => void;
  onSceneMenu: (sceneId: string) => void;
  onDeleteScene?: (sceneId: string) => void;
  onRenameScene?: (sceneId: string, name: string) => void;
  onReorderScenes?: (scenes: Scene[]) => void;
}

const layoutIcons: Record<SceneLayout, typeof User> = {
  "host-only": User,
  "host-guest": Users,
  "side-by-side": LayoutGrid,
  "grid": LayoutGrid,
  "speaker": Eye,
  "screen-share": Monitor,
  "media": Image,
  "countdown": Timer,
};

const sceneTypeIcons: Record<SceneType, typeof Video> = {
  camera: Video,
  media: Image,
  countdown: Timer,
};

export function VideoStudioScenesResizable({
  scenes,
  activeSceneId,
  onSceneSelect,
  onAddScene,
  onSceneMenu,
  onDeleteScene,
  onRenameScene,
  onReorderScenes,
}: VideoStudioScenesResizableProps) {
  const [width, setWidth] = useState(200);
  const [isResizing, setIsResizing] = useState(false);
  const [draggedScene, setDraggedScene] = useState<string | null>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    
    const startX = e.clientX;
    const startWidth = width;
    
    const handleMouseMove = (e: MouseEvent) => {
      const delta = e.clientX - startX;
      const newWidth = Math.min(Math.max(startWidth + delta, 160), 320);
      setWidth(newWidth);
    };
    
    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
    
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleDragStart = (e: React.DragEvent, sceneId: string) => {
    setDraggedScene(sceneId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, targetSceneId: string) => {
    e.preventDefault();
    if (!draggedScene || draggedScene === targetSceneId) return;
    
    const draggedIndex = scenes.findIndex(s => s.id === draggedScene);
    const targetIndex = scenes.findIndex(s => s.id === targetSceneId);
    
    if (draggedIndex === -1 || targetIndex === -1) return;
    
    const newScenes = [...scenes];
    const [removed] = newScenes.splice(draggedIndex, 1);
    newScenes.splice(targetIndex, 0, removed);
    
    onReorderScenes?.(newScenes);
    setDraggedScene(null);
  };

  const handleDragEnd = () => {
    setDraggedScene(null);
  };

  const handleRename = (sceneId: string, currentName: string) => {
    const newName = prompt("Enter scene name:", currentName);
    if (newName && newName.trim()) {
      onRenameScene?.(sceneId, newName.trim());
    }
  };

  return (
    <div 
      className="bg-[#16181c] border-r border-white/10 flex flex-col relative"
      style={{ width: `${width}px` }}
    >
      {/* Resize Handle */}
      <div
        onMouseDown={handleMouseDown}
        className={cn(
          "absolute top-0 right-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-500/50 transition-colors z-10",
          isResizing && "bg-blue-500"
        )}
      />

      {/* Header with Add Scene Dropdown */}
      <div className="p-3 border-b border-white/10">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-between text-white/70 hover:text-white hover:bg-white/10"
            >
              <span className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Add Scene
              </span>
              <ChevronDown className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            align="start" 
            className="w-48 bg-[#1a1d21] border-white/10"
          >
            <DropdownMenuItem 
              onClick={() => onAddScene("camera")}
              className="flex items-center gap-3 cursor-pointer text-white hover:bg-white/10 focus:bg-white/10"
            >
              <Video className="w-4 h-4" />
              <span>Camera</span>
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => onAddScene("media")}
              className="flex items-center gap-3 cursor-pointer text-white hover:bg-white/10 focus:bg-white/10"
            >
              <Image className="w-4 h-4" />
              <span>Media</span>
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => onAddScene("countdown")}
              className="flex items-center gap-3 cursor-pointer text-white hover:bg-white/10 focus:bg-white/10"
            >
              <Timer className="w-4 h-4" />
              <span>Countdown</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Scene List */}
      <div className="flex-1 p-2 space-y-2 overflow-y-auto">
        {scenes.map((scene) => {
          const isActive = scene.id === activeSceneId;
          const LayoutIcon = layoutIcons[scene.layout] || User;
          const TypeIcon = scene.sceneType ? sceneTypeIcons[scene.sceneType] : Video;

          return (
            <div
              key={scene.id}
              draggable
              onDragStart={(e) => handleDragStart(e, scene.id)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, scene.id)}
              onDragEnd={handleDragEnd}
              onClick={() => onSceneSelect(scene.id)}
              className={cn(
                "group relative rounded-lg overflow-hidden cursor-pointer transition-all",
                isActive 
                  ? "ring-2 ring-blue-500" 
                  : "hover:ring-1 hover:ring-white/30",
                draggedScene === scene.id && "opacity-50"
              )}
            >
              {/* Scene Thumbnail */}
              <div className="aspect-video bg-gradient-to-br from-indigo-900/50 to-purple-900/50 relative">
                {/* Drag Handle */}
                <div className="absolute top-1 left-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab">
                  <GripVertical className="w-4 h-4 text-white/40" />
                </div>

                {/* Scene Type Badge */}
                {scene.sceneType && (
                  <div className="absolute top-1 right-8 px-1.5 py-0.5 bg-black/50 rounded text-[10px] text-white/70 flex items-center gap-1">
                    <TypeIcon className="w-3 h-3" />
                  </div>
                )}

                {/* Layout Icon Overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <LayoutIcon className="w-8 h-8 text-white/30" />
                </div>

                {/* Active Indicator */}
                {isActive && (
                  <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-green-500" />
                )}

                {/* Menu Button */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      onClick={(e) => e.stopPropagation()}
                      className="absolute bottom-1 right-1 p-1 rounded bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <MoreVertical className="w-3 h-3 text-white" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-[#1a1d21] border-white/10">
                    <DropdownMenuItem 
                      className="text-white hover:bg-white/10 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRename(scene.id, scene.name);
                      }}
                    >
                      Rename
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="text-white hover:bg-white/10 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSceneMenu(scene.id);
                      }}
                    >
                      Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="text-red-400 hover:bg-white/10 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteScene?.(scene.id);
                      }}
                    >
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Scene Name */}
              <div className="p-2 bg-black/40">
                <p className="text-xs text-white truncate">{scene.name}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
