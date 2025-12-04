import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { ModuleTooltip } from "./ModuleTooltip";

export interface ModuleCardProps {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  status: "active" | "available" | "coming_soon";
  recommendedWith?: string[];
  route?: string;
  onClick?: () => void;
  onPreview?: () => void;
  compact?: boolean;
  tooltipData?: {
    description: string;
    bestFor: string;
    unlocks: string[];
    creditEstimate: number;
  };
}

export function ModuleCard({
  id,
  name,
  description,
  icon: Icon,
  status,
  recommendedWith,
  onClick,
  onPreview,
  compact = false,
  tooltipData,
}: ModuleCardProps) {
  const isDisabled = status === "coming_soon";

  const handleClick = (e: React.MouseEvent) => {
    if (isDisabled) return;
    if (onPreview) {
      onPreview();
    } else if (onClick) {
      onClick();
    }
  };

  const cardContent = compact ? (
    <Card
      className={cn(
        "group relative p-4 transition-all duration-200 border-border/50",
        !isDisabled && "cursor-pointer hover:shadow-md hover:border-primary/30",
        isDisabled && "opacity-60 cursor-not-allowed"
      )}
      onClick={handleClick}
    >
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/15 transition-colors">
          <Icon className="h-4 w-4 text-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2 mb-0.5">
            <h3 className="font-medium text-sm truncate">{name}</h3>
            <span className={cn(
              "text-[10px] text-muted-foreground shrink-0",
              status === "coming_soon" && "text-muted-foreground/70"
            )}>
              {status === "coming_soon" ? "Coming Soon" : "Available"}
            </span>
          </div>
          <p className="text-xs text-muted-foreground line-clamp-1">{description}</p>
        </div>
      </div>
    </Card>
  ) : (
    <Card
      className={cn(
        "group relative p-5 transition-all duration-200 border-border/50 flex flex-col",
        !isDisabled && "cursor-pointer hover:shadow-lg hover:border-primary/30 hover:-translate-y-0.5",
        isDisabled && "opacity-60 cursor-not-allowed"
      )}
      onClick={handleClick}
    >
      {/* Status Label - Top Right (subtle text instead of badge) */}
      <span className={cn(
        "absolute top-4 right-4 text-[10px] font-medium",
        status === "coming_soon" ? "text-muted-foreground/70" : "text-muted-foreground"
      )}>
        {status === "coming_soon" ? "Coming Soon" : "Available"}
      </span>

      {/* Icon */}
      <div className="mb-4">
        <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/15 transition-colors">
          <Icon className="h-5 w-5 text-primary" />
        </div>
      </div>

      {/* Name */}
      <h3 className="font-semibold text-base mb-1.5 pr-16">{name}</h3>

      {/* Description */}
      <p className="text-sm text-muted-foreground leading-relaxed mb-3 line-clamp-2">
        {description}
      </p>

      {/* Recommended With Pills */}
      {recommendedWith && recommendedWith.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-auto pt-2">
          {recommendedWith.slice(0, 2).map((rec) => (
            <span
              key={rec}
              className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 font-medium"
            >
              + {rec}
            </span>
          ))}
        </div>
      )}
    </Card>
  );

  // Wrap with tooltip
  return (
    <ModuleTooltip moduleId={id} fallbackData={tooltipData}>
      {cardContent}
    </ModuleTooltip>
  );
}