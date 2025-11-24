import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { 
  Palette, 
  Type, 
  QrCode, 
  Music, 
  FileText, 
  MessageSquare,
  X,
  DollarSign,
  Scissors,
  Radio,
  Play,
  Pause,
  Volume2,
} from "lucide-react";
import { FaFacebook, FaLinkedin, FaTiktok, FaTwitch, FaYoutube } from "react-icons/fa";
import { cn } from "@/lib/utils";
import { StudioGuestPanel } from "./StudioGuestPanel";
import { StudioIntroOutroPanel } from "./StudioIntroOutroPanel";
import { StudioMusicPanel } from "./StudioMusicPanel";

interface StudioRightSidebarProps {
  currentViewerCount: number;
  onAdSelect: (ad: any, type: string) => void;
  selectedAd: any;
  markers: any[];
  onAddMarker: (type: 'ad' | 'clip') => void;
  isRecording: boolean;
  selectedChannels: {
    myPage: boolean;
    facebook: boolean;
    linkedin: boolean;
    tiktok: boolean;
    twitch: boolean;
    youtube: boolean;
  };
  onToggleChannel: (channel: string) => void;
  channelsExpanded: boolean;
  onToggleChannelsExpanded: () => void;
  profileImageUrl?: string;
  sessionId?: string;
}

export function StudioRightSidebar({
  currentViewerCount,
  onAdSelect,
  selectedAd,
  markers,
  onAddMarker,
  isRecording,
  selectedChannels,
  onToggleChannel,
  channelsExpanded,
  onToggleChannelsExpanded,
  profileImageUrl,
  sessionId,
}: StudioRightSidebarProps) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [openPanel, setOpenPanel] = useState<string | null>(null);
  const [animatingButton, setAnimatingButton] = useState<string | null>(null);

  const socialPlatforms = [
    { id: 'facebook', icon: FaFacebook, label: 'Facebook', color: '#1877F2', enabled: false, needsPairing: true },
    { id: 'linkedin', icon: FaLinkedin, label: 'LinkedIn', color: '#0A66C2', enabled: false, needsPairing: true },
    { id: 'tiktok', icon: FaTiktok, label: 'TikTok', color: '#000000', enabled: false, needsPairing: true },
    { id: 'twitch', icon: FaTwitch, label: 'Twitch', color: '#9146FF', enabled: false, needsPairing: true },
    { id: 'youtube', icon: FaYoutube, label: 'YouTube', color: '#FF0000', enabled: false, needsPairing: true },
  ];

  const tools = [
    { id: 'channels', icon: Radio, label: 'Channels' },
    { id: 'branding', icon: Palette, label: 'Branding' },
    { id: 'lower-thirds', icon: Type, label: 'Lower Thirds' },
    { id: 'intro', icon: Play, label: 'Intro' },
    { id: 'outro', icon: Pause, label: 'Outro' },
    { id: 'qr-codes', icon: QrCode, label: 'QR Codes' },
    { id: 'music', icon: Music, label: 'Music' },
    { id: 'chat', icon: MessageSquare, label: 'Chat' },
  ];

  const handlePanelChange = (toolId: string) => {
    setOpenPanel(openPanel === toolId ? null : toolId);
  };

  const handleToolClick = (toolId: string) => {
    setOpenPanel(openPanel === toolId ? null : toolId);
  };

  const handleToggleAttempt = (platformId: string, isPaired: boolean, isConnected: boolean) => {
    if (!isPaired && !isConnected) {
      // Auto-toggle off and animate the Pair button
      setAnimatingButton(platformId);
      setTimeout(() => setAnimatingButton(null), 600);
      
      toast({
        title: "Pairing Required",
        description: `Please pair your ${platformId.charAt(0).toUpperCase() + platformId.slice(1)} account first to enable streaming.`,
        duration: 3000,
      });
    } else {
      onToggleChannel(platformId);
    }
  };

  const renderPanelContent = () => {
    switch (openPanel) {
      case 'channels':
        return (
          <div className="space-y-3">
            <div>
              <h3 className="text-base font-semibold mb-1">Streaming Channels</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Select which platforms to broadcast to
              </p>
            </div>

            {/* My Page Channel */}
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    {profileImageUrl ? (
                      <img 
                        src={profileImageUrl} 
                        alt="Profile" 
                        className="h-9 w-9 rounded-full object-cover shrink-0"
                      />
                    ) : (
                      <div className="h-9 w-9 rounded-full bg-primary flex items-center justify-center shrink-0">
                        <span className="text-white font-bold text-[10px]">MP</span>
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-foreground truncate">My Page</p>
                      <p className="text-[10px] text-muted-foreground">
                        {selectedChannels.myPage ? 'Active' : 'Inactive'}
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={selectedChannels.myPage}
                    onCheckedChange={() => onToggleChannel('myPage')}
                    className="data-[state=checked]:bg-primary shrink-0"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Social Media Channels */}
            <div className="space-y-2">
              {socialPlatforms.map((platform) => {
                const PlatformIcon = platform.icon;
                const isConnected = selectedChannels[platform.id as keyof typeof selectedChannels];
                const isPaired = platform.enabled;
                
                return (
                  <Card key={platform.id} className="border-border/40 hover:border-border/80 transition-colors">
                     <CardContent className="p-3">
                       <div className="flex flex-col gap-3">
                         <div className="flex items-center gap-2.5">
                           <div className="h-9 w-9 rounded-full flex items-center justify-center shrink-0 bg-muted/80">
                             <PlatformIcon 
                               className="h-4 w-4" 
                               color="#ffffff"
                             />
                           </div>
                           <div className="min-w-0 flex-1">
                             <p className="text-sm font-semibold text-foreground truncate">{platform.label}</p>
                             <p className="text-[10px] text-muted-foreground">
                               {isPaired ? (isConnected ? 'Active' : 'Inactive') : 'Not paired'}
                             </p>
                           </div>
                         </div>
                         <div className="flex items-center gap-2 w-full">
                           <div className="flex items-center gap-2 flex-1">
                             <Switch
                               checked={isConnected}
                               onCheckedChange={() => handleToggleAttempt(platform.id, isPaired, isConnected)}
                               disabled={!isPaired}
                               className="shrink-0"
                             />
                             <span className="text-xs text-muted-foreground">
                               {isConnected ? 'Streaming' : 'Off'}
                             </span>
                           </div>
                           {!isPaired && (
                             <Button
                               variant="outline"
                               size="sm"
                               className={cn(
                                 "text-xs h-8 px-3 shrink-0 transition-all",
                                 animatingButton === platform.id && "animate-[scale-in_0.3s_ease-out,pulse_0.6s_ease-out]"
                               )}
                               onClick={() => {
                                 navigate('/integrations');
                               }}
                             >
                               Pair Account
                             </Button>
                           )}
                         </div>
                       </div>
                     </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        );
      case 'branding':
        return (
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-semibold mb-1">Branding</h3>
              <p className="text-xs text-muted-foreground">Configure your stream branding and overlays</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium mb-2 block">Brand Colors</Label>
                <p className="text-xs text-muted-foreground mb-3">Customize your stream's color scheme</p>
                <Button variant="outline" size="sm" className="w-full">
                  Configure Colors
                </Button>
              </div>
              
              <div>
                <Label className="text-sm font-medium mb-2 block">Logo & Graphics</Label>
                <p className="text-xs text-muted-foreground mb-3">Upload your brand logo and graphics</p>
                <Button variant="outline" size="sm" className="w-full">
                  Upload Logo
                </Button>
              </div>
              
              <div>
                <Label className="text-sm font-medium mb-2 block">Overlays</Label>
                <p className="text-xs text-muted-foreground mb-3">Manage stream overlay templates</p>
                <Button variant="outline" size="sm" className="w-full">
                  Manage Overlays
                </Button>
              </div>
            </div>
          </div>
        );
      case 'lower-thirds':
        return (
          <div className="space-y-3">
            <div>
              <h3 className="text-base font-semibold mb-1">Lower Thirds & Guests</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Manage guest information for lower thirds during live streams
              </p>
            </div>
            <StudioGuestPanel studioSessionId={sessionId || ""} />
          </div>
        );
      case 'qr-codes':
        return (
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-semibold mb-1">QR Codes</h3>
              <p className="text-xs text-muted-foreground">Display QR codes on your stream</p>
            </div>
          </div>
        );
      case 'music':
        return (
          <div className="space-y-4">
            <StudioMusicPanel />
          </div>
        );
      case 'intro':
      case 'outro':
        return (
          <div className="space-y-4">
            {!sessionId ? (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground">
                  Please start a studio session first
                </p>
              </div>
            ) : (
              <StudioIntroOutroPanel 
                key={`${openPanel}-${sessionId}`}
                type={openPanel as 'intro' | 'outro'} 
                sessionId={sessionId} 
              />
            )}
          </div>
        );
      case 'chat':
        return (
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-semibold mb-1">Live Chat</h3>
              <p className="text-xs text-muted-foreground">View and interact with live chat</p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
      {/* Dialog for panel content */}
      <Dialog open={!!openPanel} onOpenChange={(open) => !open && setOpenPanel(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              {tools.find(t => t.id === openPanel)?.label}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {renderPanelContent()}
          </div>
        </DialogContent>
      </Dialog>

      {/* Icon Bar - Always Visible on the right */}
      <div className="flex h-full relative overflow-visible">
        <div className="w-full h-full border-l border-border/40 bg-gradient-to-b from-background via-background to-muted/20 flex flex-col items-center py-6 gap-1 relative z-[101]">
          <TooltipProvider delayDuration={100}>
            {tools.map((tool) => (
              <Tooltip key={tool.id}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => handleToolClick(tool.id)}
                    className={cn(
                      "group relative flex flex-col items-center justify-center w-[68px] h-[68px] rounded-xl transition-all duration-200",
                      openPanel === tool.id 
                        ? "bg-primary shadow-lg shadow-primary/20 scale-105" 
                        : "hover:bg-muted/60 hover:scale-105"
                    )}
                  >
                    <tool.icon className={cn(
                      "h-6 w-6 mb-1 transition-all duration-200",
                      openPanel === tool.id 
                        ? "text-primary-foreground scale-110" 
                        : "text-foreground/70 group-hover:text-foreground group-hover:scale-110"
                    )} />
                    <span className={cn(
                      "text-[10px] font-medium leading-tight text-center px-1.5 transition-all duration-200",
                      openPanel === tool.id 
                        ? "text-primary-foreground font-semibold" 
                        : "text-foreground/60 group-hover:text-foreground"
                    )}>
                      {tool.label}
                    </span>
                    {openPanel === tool.id && (
                      <div className="absolute -right-[1px] top-1/2 -translate-y-1/2 w-1 h-14 bg-primary rounded-l-full shadow-lg shadow-primary/30" />
                    )}
                  </button>
                </TooltipTrigger>
                <TooltipContent 
                  side="left" 
                  className="bg-popover text-popover-foreground border-border shadow-xl px-4 py-2 text-sm font-medium"
                  sideOffset={10}
                >
                  <p>{tool.label}</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </TooltipProvider>
        </div>
      </div>
    </>
  );
}
