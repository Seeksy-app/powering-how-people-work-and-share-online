import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  X, Plus, ChevronDown, ChevronRight, 
  Palette, Info, Trash2, Play, Upload,
  Check
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface GraphicsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

interface GraphicItem {
  id: string;
  name: string;
  url: string;
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
}

export function GraphicsDrawer({ isOpen, onClose }: GraphicsDrawerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadSection, setUploadSection] = useState<string | null>(null);
  
  const [expandedSections, setExpandedSections] = useState<string[]>(["logo", "overlay", "clips", "background"]);
  
  // State for each section
  const [logos, setLogos] = useState<GraphicItem[]>([
    { id: "1", name: "Seeksy Logo", url: "/placeholder.svg", position: "top-left" },
  ]);
  const [overlays, setOverlays] = useState<GraphicItem[]>([
    { id: "1", name: "Please stay tuned", url: "/placeholder.svg" },
    { id: "2", name: "Time to get some chow!", url: "/placeholder.svg" },
    { id: "3", name: "Live streaming will start shortly", url: "/placeholder.svg" },
  ]);
  const [videoClips, setVideoClips] = useState<GraphicItem[]>([]);
  const [backgrounds, setBackgrounds] = useState<GraphicItem[]>([
    { id: "1", name: "Blue Gradient", url: "/placeholder.svg" },
    { id: "2", name: "Concert Lights", url: "/placeholder.svg" },
  ]);
  
  // Active items (only one per section for logos)
  const [activeLogo, setActiveLogo] = useState<string | null>(null);
  const [activeOverlay, setActiveOverlay] = useState<string | null>(null);
  const [activeBackground, setActiveBackground] = useState<string | null>(null);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const handleUpload = (section: string) => {
    setUploadSection(section);
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !uploadSection) return;

    // Create object URL for preview
    const url = URL.createObjectURL(file);
    const newItem: GraphicItem = {
      id: `${uploadSection}-${Date.now()}`,
      name: file.name,
      url,
    };

    switch (uploadSection) {
      case "logo":
        setLogos(prev => [...prev, newItem]);
        break;
      case "overlay":
        setOverlays(prev => [...prev, newItem]);
        break;
      case "clips":
        setVideoClips(prev => [...prev, newItem]);
        break;
      case "background":
        setBackgrounds(prev => [...prev, newItem]);
        break;
    }

    toast.success(`${file.name} uploaded successfully`);
    e.target.value = "";
    setUploadSection(null);
  };

  const handleDelete = (section: string, id: string) => {
    switch (section) {
      case "logo":
        setLogos(prev => prev.filter(item => item.id !== id));
        if (activeLogo === id) setActiveLogo(null);
        break;
      case "overlay":
        setOverlays(prev => prev.filter(item => item.id !== id));
        if (activeOverlay === id) setActiveOverlay(null);
        break;
      case "clips":
        setVideoClips(prev => prev.filter(item => item.id !== id));
        break;
      case "background":
        setBackgrounds(prev => prev.filter(item => item.id !== id));
        if (activeBackground === id) setActiveBackground(null);
        break;
    }
    toast.success("Item deleted");
  };

  const handlePlayClip = (clip: GraphicItem) => {
    toast.success(`Playing "${clip.name}" to canvas`);
  };

  const logoPositions: Array<{ value: GraphicItem["position"]; label: string }> = [
    { value: "top-left", label: "Top Left" },
    { value: "top-right", label: "Top Right" },
    { value: "bottom-left", label: "Bottom Left" },
    { value: "bottom-right", label: "Bottom Right" },
  ];

  if (!isOpen) return null;

  return (
    <div className="absolute top-0 right-16 bottom-0 w-[400px] bg-[#1a1d21] border-l border-white/10 flex flex-col z-20">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <h3 className="text-lg font-semibold text-white">Graphics</h3>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="text-white/70 hover:text-white">
            <Palette className="w-4 h-4 mr-2" />
            Edit Theme
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose}
            className="text-white/70 hover:text-white"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {/* Logo Section */}
          <div>
            <button
              onClick={() => toggleSection("logo")}
              className="flex items-center gap-2 w-full text-left mb-3"
            >
              {expandedSections.includes("logo") ? (
                <ChevronDown className="w-4 h-4 text-white/60" />
              ) : (
                <ChevronRight className="w-4 h-4 text-white/60" />
              )}
              <span className="text-white font-medium">Logo</span>
              <Info className="w-3.5 h-3.5 text-white/40" />
            </button>
            
            {expandedSections.includes("logo") && (
              <>
                <p className="text-xs text-white/50 mb-2">Position: Only one logo active at a time</p>
                <div className="grid grid-cols-4 gap-2 mb-3">
                  {logoPositions.map(pos => (
                    <button
                      key={pos.value}
                      onClick={() => {
                        if (activeLogo) {
                          setLogos(prev => prev.map(l => 
                            l.id === activeLogo ? { ...l, position: pos.value } : l
                          ));
                        }
                      }}
                      className={cn(
                        "text-xs py-1.5 px-2 rounded border transition-all",
                        logos.find(l => l.id === activeLogo)?.position === pos.value
                          ? "border-blue-500 bg-blue-500/20 text-blue-400"
                          : "border-white/10 text-white/60 hover:border-white/30"
                      )}
                    >
                      {pos.label}
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {logos.map(logo => (
                    <div
                      key={logo.id}
                      className={cn(
                        "relative aspect-square rounded-lg border-2 p-2 transition-all group",
                        activeLogo === logo.id
                          ? "border-blue-500 bg-blue-500/10"
                          : "border-white/10 bg-white/5 hover:bg-white/10"
                      )}
                    >
                      <button
                        onClick={() => setActiveLogo(activeLogo === logo.id ? null : logo.id)}
                        className="w-full h-full"
                      >
                        <img src={logo.url} alt={logo.name} className="w-full h-full object-contain" />
                      </button>
                      {activeLogo === logo.id && (
                        <div className="absolute top-1 right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                          <Check className="w-2.5 h-2.5 text-white" />
                        </div>
                      )}
                      <button
                        onClick={() => handleDelete("logo", logo.id)}
                        className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hidden group-hover:flex"
                      >
                        <Trash2 className="w-3 h-3 text-white" />
                      </button>
                    </div>
                  ))}
                  <button 
                    onClick={() => handleUpload("logo")}
                    className="aspect-square rounded-lg border-2 border-dashed border-white/20 flex items-center justify-center text-white/40 hover:text-white/60 hover:border-white/40 transition-all"
                  >
                    <Plus className="w-6 h-6" />
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Overlay Section */}
          <div>
            <button
              onClick={() => toggleSection("overlay")}
              className="flex items-center gap-2 w-full text-left mb-3"
            >
              {expandedSections.includes("overlay") ? (
                <ChevronDown className="w-4 h-4 text-white/60" />
              ) : (
                <ChevronRight className="w-4 h-4 text-white/60" />
              )}
              <span className="text-white font-medium">Overlay</span>
              <Info className="w-3.5 h-3.5 text-white/40" />
            </button>
            
            {expandedSections.includes("overlay") && (
              <div className="grid grid-cols-3 gap-2">
                {overlays.map(overlay => (
                  <div
                    key={overlay.id}
                    className={cn(
                      "relative aspect-video rounded-lg border-2 overflow-hidden transition-all group cursor-pointer",
                      activeOverlay === overlay.id
                        ? "border-blue-500 ring-2 ring-blue-500/30"
                        : "border-white/10 hover:border-white/30"
                    )}
                    onClick={() => setActiveOverlay(activeOverlay === overlay.id ? null : overlay.id)}
                  >
                    <div className="w-full h-full bg-gradient-to-br from-purple-900 to-pink-900 flex items-center justify-center">
                      <span className="text-[10px] text-white/80 text-center px-1">{overlay.name}</span>
                    </div>
                    {activeOverlay === overlay.id && (
                      <div className="absolute top-1 right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 text-white" />
                      </div>
                    )}
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete("overlay", overlay.id); }}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hidden group-hover:flex"
                    >
                      <Trash2 className="w-3 h-3 text-white" />
                    </button>
                  </div>
                ))}
                <button 
                  onClick={() => handleUpload("overlay")}
                  className="aspect-video rounded-lg border-2 border-dashed border-white/20 flex items-center justify-center text-white/40 hover:text-white/60 hover:border-white/40 transition-all"
                >
                  <Plus className="w-6 h-6" />
                </button>
              </div>
            )}
          </div>

          {/* Video Clips Section */}
          <div>
            <button
              onClick={() => toggleSection("clips")}
              className="flex items-center gap-2 w-full text-left mb-3"
            >
              {expandedSections.includes("clips") ? (
                <ChevronDown className="w-4 h-4 text-white/60" />
              ) : (
                <ChevronRight className="w-4 h-4 text-white/60" />
              )}
              <span className="text-white font-medium">Video Clips</span>
              <Info className="w-3.5 h-3.5 text-white/40" />
            </button>
            
            {expandedSections.includes("clips") && (
              <div className="grid grid-cols-3 gap-2">
                {videoClips.map(clip => (
                  <div
                    key={clip.id}
                    className="relative aspect-video rounded-lg border-2 border-white/10 overflow-hidden group"
                  >
                    <div className="w-full h-full bg-gradient-to-br from-indigo-900 to-blue-900 flex items-center justify-center">
                      <span className="text-[10px] text-white/80 text-center px-1">{clip.name}</span>
                    </div>
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        onClick={() => handlePlayClip(clip)}
                        className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors"
                      >
                        <Play className="w-4 h-4 text-white ml-0.5" />
                      </button>
                      <button
                        onClick={() => handleDelete("clips", clip.id)}
                        className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  </div>
                ))}
                <button 
                  onClick={() => handleUpload("clips")}
                  className="aspect-video rounded-lg border-2 border-dashed border-white/20 flex items-center justify-center text-white/40 hover:text-white/60 hover:border-white/40 transition-all flex-col gap-1"
                >
                  <Upload className="w-5 h-5" />
                  <span className="text-[10px]">Add Stinger</span>
                </button>
              </div>
            )}
          </div>

          {/* Background Section */}
          <div>
            <button
              onClick={() => toggleSection("background")}
              className="flex items-center gap-2 w-full text-left mb-3"
            >
              {expandedSections.includes("background") ? (
                <ChevronDown className="w-4 h-4 text-white/60" />
              ) : (
                <ChevronRight className="w-4 h-4 text-white/60" />
              )}
              <span className="text-white font-medium">Background</span>
              <Info className="w-3.5 h-3.5 text-white/40" />
            </button>
            
            {expandedSections.includes("background") && (
              <div className="grid grid-cols-3 gap-2">
                {backgrounds.map(bg => (
                  <div
                    key={bg.id}
                    className={cn(
                      "relative aspect-video rounded-lg border-2 overflow-hidden transition-all cursor-pointer group",
                      activeBackground === bg.id
                        ? "border-blue-500 ring-2 ring-blue-500/30"
                        : "border-white/10 hover:border-white/30"
                    )}
                    onClick={() => setActiveBackground(activeBackground === bg.id ? null : bg.id)}
                  >
                    <div className="w-full h-full bg-gradient-to-br from-blue-900 to-indigo-900" />
                    {activeBackground === bg.id && (
                      <div className="absolute top-1 right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 text-white" />
                      </div>
                    )}
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete("background", bg.id); }}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hidden group-hover:flex"
                    >
                      <Trash2 className="w-3 h-3 text-white" />
                    </button>
                  </div>
                ))}
                <button 
                  onClick={() => handleUpload("background")}
                  className="aspect-video rounded-lg border-2 border-dashed border-white/20 flex items-center justify-center text-white/40 hover:text-white/60 hover:border-white/40 transition-all"
                >
                  <Plus className="w-6 h-6" />
                </button>
              </div>
            )}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
