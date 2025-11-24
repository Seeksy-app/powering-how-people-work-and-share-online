import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, User, Users2, Clock } from "lucide-react";
import { Scene } from "./StudioScenes";
import { cn } from "@/lib/utils";

interface StudioLeftSidebarProps {
  scenes: Scene[];
  activeSceneId: string | null;
  onSceneChange: (sceneId: string) => void;
  onAddScene: () => void;
  cameraEnabled: boolean;
  profileImageUrl: string;
}

export function StudioLeftSidebar({
  scenes,
  activeSceneId,
  onSceneChange,
  onAddScene,
  cameraEnabled,
  profileImageUrl,
}: StudioLeftSidebarProps) {
  const getSceneIcon = (layout: string) => {
    switch (layout) {
      case 'single-speaker':
        return <User className="h-4 w-4" />;
      case 'both-speakers':
        return <Users2 className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  return (
    <div className="w-full border-r border-border/50 bg-background/50 backdrop-blur-sm flex flex-col h-full">
      <div className="p-2 border-b border-border/50">
        <Button
          onClick={onAddScene}
          variant="outline"
          size="sm"
          className="w-full text-xs h-8"
        >
          <Plus className="h-3 w-3 mr-1" />
          Add
        </Button>
      </div>

      <ScrollArea className="flex-1 p-2">
        <div className="space-y-2">
          {/* Countdown Scene */}
          <Card
            className={cn(
              "p-2 cursor-pointer transition-all hover:border-primary/50 bg-gradient-to-br from-primary/10 to-background"
            )}
          >
            <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary/5 rounded flex items-center justify-center mb-1">
              <Clock className="h-5 w-5 text-primary" />
            </div>
            <p className="text-[10px] font-medium truncate">Countdown</p>
          </Card>

          {/* Greeting Scene */}
          <Card
            className={cn(
              "p-2 cursor-pointer transition-all hover:border-primary/50 bg-gradient-to-br from-primary/10 to-background"
            )}
          >
            <div className="aspect-video bg-gradient-to-br from-brand-blue/20 to-brand-navy/20 rounded flex items-center justify-center mb-1">
              <User className="h-5 w-5 text-primary" />
            </div>
            <p className="text-[10px] font-medium truncate">Greeting</p>
          </Card>

          {/* Custom Scenes */}
          {scenes.map((scene) => (
            <Card
              key={scene.id}
              onClick={() => onSceneChange(scene.id)}
              className={cn(
                "p-2 cursor-pointer transition-all hover:border-primary/50",
                activeSceneId === scene.id
                  ? "border-2 border-primary bg-primary/5"
                  : "bg-gradient-to-br from-card to-background"
              )}
            >
              <div className="aspect-video bg-gradient-to-br from-brand-navy/40 to-brand-blue/20 rounded flex items-center justify-center mb-1 relative overflow-hidden">
                {scene.layout === 'play-video' && scene.videoUrl ? (
                  <div className="absolute inset-0 bg-brand-navy/60 flex items-center justify-center">
                    <span className="text-[9px] text-muted-foreground">Video</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-1">
                    {getSceneIcon(scene.layout)}
                  </div>
                )}
              </div>
              <p className="text-[10px] font-medium truncate">{scene.name}</p>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
