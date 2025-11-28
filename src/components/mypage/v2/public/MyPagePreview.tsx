import { MyPageTheme } from "@/config/myPageThemes";
import { cn } from "@/lib/utils";
import { VoiceCertifiedBadge } from "@/components/VoiceCertifiedBadge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Video, Mic, Calendar, Store, Share2, Eye } from "lucide-react";

interface MyPagePreviewProps {
  theme: MyPageTheme;
  mode: "edit" | "preview";
}

export function MyPagePreview({ theme, mode }: MyPagePreviewProps) {
  const bgClass = theme.backgroundType === "gradient"
    ? `bg-gradient-to-${theme.backgroundGradient?.direction || "br"}`
    : "";

  const bgStyle = theme.backgroundType === "solid"
    ? { backgroundColor: theme.backgroundColor }
    : theme.backgroundType === "gradient"
    ? {
        backgroundImage: `linear-gradient(to ${theme.backgroundGradient?.direction?.replace("to-", "") || "bottom right"}, ${theme.backgroundGradient?.from || "#ffffff"}, ${theme.backgroundGradient?.to || "#f3f4f6"})`
      }
    : theme.backgroundType === "image" && theme.backgroundImage
    ? { backgroundImage: `url(${theme.backgroundImage})`, backgroundSize: "cover" }
    : undefined;

  const cardClasses = cn(
    "transition-all duration-300",
    theme.cardStyle === "round" && "rounded-3xl",
    theme.cardStyle === "square" && "rounded-lg",
    theme.cardStyle === "shadow" && "rounded-2xl shadow-xl",
    theme.cardStyle === "glass" && "rounded-2xl backdrop-blur-lg bg-white/80 border border-white/20"
  );

  const imageClasses = cn(
    "w-32 h-32 object-cover ring-4 ring-white/50",
    theme.imageStyle === "circular" && "rounded-full",
    theme.imageStyle === "square" && "rounded-2xl",
    theme.imageStyle === "portrait" && "rounded-3xl h-40"
  );

  const enabledSections = theme.sections.filter(s => s.enabled).sort((a, b) => a.order - b.order);

  return (
    <div
      className={cn("min-h-full py-12 px-4", bgClass)}
      style={bgStyle}
    >
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Profile Header */}
        <div className="text-center space-y-4">
          {theme.profileImage ? (
            <img
              src={theme.profileImage}
              alt={theme.displayName}
              className={cn(imageClasses, "mx-auto")}
            />
          ) : (
            <div className={cn(imageClasses, "mx-auto bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center")}>
              <span className="text-4xl text-muted-foreground">
                {theme.displayName?.[0] || "?"}
              </span>
            </div>
          )}

          <div>
            <h1
              className="text-3xl font-bold mb-1"
              style={{ color: theme.titleColor }}
            >
              {theme.displayName || "Your Name"}
            </h1>
            {theme.username && (
              <p className="text-muted-foreground">@{theme.username}</p>
            )}
          </div>

          {/* Voice Badge Placeholder */}
          <div className="flex justify-center">
            <VoiceCertifiedBadge size="md" />
          </div>

          {theme.bio && (
            <p
              className="text-center max-w-md mx-auto"
              style={{ color: theme.bioColor }}
            >
              {theme.bio}
            </p>
          )}
        </div>

        {/* Sections */}
        <div className="space-y-4">
          {enabledSections.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">
                No sections enabled yet. Enable sections in the builder to see them here.
              </p>
            </Card>
          ) : (
            enabledSections.map((section) => (
              <Card key={section.id} className={cn(cardClasses, "p-6")}>
                {section.type === "stream" && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-primary">
                      <Video className="w-5 h-5" />
                      <h3 className="font-semibold">Featured Video</h3>
                    </div>
                    <div className="relative aspect-video bg-gradient-to-br from-primary/10 via-primary/5 to-background rounded-xl overflow-hidden border border-primary/20 group">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="relative">
                          <div className="w-20 h-20 rounded-full bg-primary/90 backdrop-blur-sm flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                            <div className="w-0 h-0 border-l-[16px] border-l-white border-y-[10px] border-y-transparent ml-1" />
                          </div>
                          <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
                        </div>
                      </div>
                      <div className="absolute top-3 left-3 flex items-center gap-2 text-white">
                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                        <span className="text-xs font-medium">LIVE</span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground text-center">Your featured video will appear here</p>
                  </div>
                )}

                {section.type === "meetings" && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-primary">
                      <Calendar className="w-5 h-5" />
                      <h3 className="font-semibold">Book a Meeting</h3>
                    </div>
                    <Button className="w-full">Schedule a Meeting</Button>
                  </div>
                )}

                {section.type === "social" && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-primary">
                      <Share2 className="w-5 h-5" />
                      <h3 className="font-semibold">Connect With Me</h3>
                    </div>
                    <div className="flex gap-2 justify-center">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className="w-12 h-12 rounded-full bg-muted flex items-center justify-center"
                        >
                          <Share2 className="w-5 h-5 text-muted-foreground" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {section.type === "shop" && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-primary">
                      <Store className="w-5 h-5" />
                      <h3 className="font-semibold">Shop</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Connect your Shopify store to display products
                    </p>
                  </div>
                )}
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
