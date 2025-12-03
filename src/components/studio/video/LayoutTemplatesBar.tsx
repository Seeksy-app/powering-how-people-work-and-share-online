import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { User, Users, LayoutGrid, Monitor, PictureInPicture, Presentation, Rows, GalleryVertical } from "lucide-react";

export type LayoutTemplate = 
  | "fullscreen" 
  | "side-by-side" 
  | "pip-bottom-right" 
  | "pip-bottom-left" 
  | "grid-2x2" 
  | "presentation" 
  | "speaker-focus" 
  | "gallery";

interface LayoutTemplatesBarProps {
  currentLayout: LayoutTemplate;
  onLayoutChange: (layout: LayoutTemplate) => void;
  sceneType?: "camera" | "media" | "countdown";
}

const LAYOUT_TEMPLATES: {
  id: LayoutTemplate;
  name: string;
  icon: React.ReactNode;
  description: string;
  sceneTypes: Array<"camera" | "media" | "countdown">;
}[] = [
  {
    id: "fullscreen",
    name: "Fullscreen",
    icon: (
      <div className="w-full h-full bg-gradient-to-br from-purple-500/50 to-purple-700/50 rounded" />
    ),
    description: "Single source fills screen",
    sceneTypes: ["camera", "media", "countdown"],
  },
  {
    id: "side-by-side",
    name: "Side by Side",
    icon: (
      <div className="w-full h-full flex gap-0.5">
        <div className="flex-1 bg-gradient-to-br from-purple-500/50 to-purple-700/50 rounded-l" />
        <div className="flex-1 bg-gradient-to-br from-blue-500/50 to-blue-700/50 rounded-r" />
      </div>
    ),
    description: "Two sources equal width",
    sceneTypes: ["camera"],
  },
  {
    id: "pip-bottom-right",
    name: "PiP Right",
    icon: (
      <div className="w-full h-full relative">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/50 to-purple-700/50 rounded" />
        <div className="absolute bottom-0.5 right-0.5 w-1/3 h-1/3 bg-gradient-to-br from-blue-500/60 to-blue-700/60 rounded shadow-sm border border-white/20" />
      </div>
    ),
    description: "Main with small overlay",
    sceneTypes: ["camera", "media"],
  },
  {
    id: "pip-bottom-left",
    name: "PiP Left",
    icon: (
      <div className="w-full h-full relative">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/50 to-purple-700/50 rounded" />
        <div className="absolute bottom-0.5 left-0.5 w-1/3 h-1/3 bg-gradient-to-br from-blue-500/60 to-blue-700/60 rounded shadow-sm border border-white/20" />
      </div>
    ),
    description: "Main with left overlay",
    sceneTypes: ["camera", "media"],
  },
  {
    id: "grid-2x2",
    name: "Grid 2×2",
    icon: (
      <div className="w-full h-full grid grid-cols-2 grid-rows-2 gap-0.5">
        <div className="bg-gradient-to-br from-purple-500/50 to-purple-700/50 rounded-tl" />
        <div className="bg-gradient-to-br from-blue-500/50 to-blue-700/50 rounded-tr" />
        <div className="bg-gradient-to-br from-green-500/50 to-green-700/50 rounded-bl" />
        <div className="bg-gradient-to-br from-orange-500/50 to-orange-700/50 rounded-br" />
      </div>
    ),
    description: "Four equal quadrants",
    sceneTypes: ["camera"],
  },
  {
    id: "presentation",
    name: "Presentation",
    icon: (
      <div className="w-full h-full flex gap-0.5">
        <div className="w-3/4 bg-gradient-to-br from-purple-500/50 to-purple-700/50 rounded-l" />
        <div className="w-1/4 bg-gradient-to-br from-blue-500/50 to-blue-700/50 rounded-r" />
      </div>
    ),
    description: "Content + small host",
    sceneTypes: ["camera", "media"],
  },
  {
    id: "speaker-focus",
    name: "Speaker Focus",
    icon: (
      <div className="w-full h-full flex flex-col gap-0.5">
        <div className="flex-1 bg-gradient-to-br from-purple-500/50 to-purple-700/50 rounded-t" />
        <div className="h-1/4 flex gap-0.5">
          <div className="flex-1 bg-gradient-to-br from-blue-500/30 to-blue-700/30 rounded-bl" />
          <div className="flex-1 bg-gradient-to-br from-green-500/30 to-green-700/30" />
          <div className="flex-1 bg-gradient-to-br from-orange-500/30 to-orange-700/30 rounded-br" />
        </div>
      </div>
    ),
    description: "Active speaker large",
    sceneTypes: ["camera"],
  },
  {
    id: "gallery",
    name: "Gallery",
    icon: (
      <div className="w-full h-full grid grid-cols-3 grid-rows-2 gap-0.5">
        {[...Array(6)].map((_, i) => (
          <div 
            key={i} 
            className={cn(
              "bg-gradient-to-br",
              i % 3 === 0 ? "from-purple-500/40 to-purple-700/40" :
              i % 3 === 1 ? "from-blue-500/40 to-blue-700/40" :
              "from-green-500/40 to-green-700/40",
              i === 0 && "rounded-tl",
              i === 2 && "rounded-tr",
              i === 3 && "rounded-bl",
              i === 5 && "rounded-br"
            )} 
          />
        ))}
      </div>
    ),
    description: "Multiple participants",
    sceneTypes: ["camera"],
  },
];

export function LayoutTemplatesBar({ 
  currentLayout, 
  onLayoutChange, 
  sceneType = "camera" 
}: LayoutTemplatesBarProps) {
  const filteredLayouts = LAYOUT_TEMPLATES.filter(l => l.sceneTypes.includes(sceneType));

  return (
    <div className="h-24 bg-[#0d0f12] border-t border-white/10 px-4 flex items-center gap-3 overflow-x-auto">
      <span className="text-xs text-white/40 uppercase tracking-wider font-medium shrink-0">
        Layouts
      </span>
      <div className="h-8 w-px bg-white/10 shrink-0" />
      
      <div className="flex items-center gap-2">
        {filteredLayouts.map((layout) => (
          <button
            key={layout.id}
            onClick={() => onLayoutChange(layout.id)}
            className={cn(
              "flex flex-col items-center gap-1.5 p-2 rounded-lg transition-all group",
              currentLayout === layout.id 
                ? "bg-primary/20 ring-2 ring-primary" 
                : "hover:bg-white/10"
            )}
            title={layout.description}
          >
            <div className={cn(
              "w-16 h-10 rounded border transition-colors",
              currentLayout === layout.id 
                ? "border-primary bg-black/40" 
                : "border-white/20 bg-black/20 group-hover:border-white/30"
            )}>
              <div className="w-full h-full p-1">
                {layout.icon}
              </div>
            </div>
            <span className={cn(
              "text-[10px] font-medium transition-colors",
              currentLayout === layout.id ? "text-primary" : "text-white/50 group-hover:text-white/70"
            )}>
              {layout.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}