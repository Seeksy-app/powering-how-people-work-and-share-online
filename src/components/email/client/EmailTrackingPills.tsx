import { Badge } from "@/components/ui/badge";
import { Eye, MousePointer, AlertTriangle, Zap } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { calculateEngagementStats, getEngagementTag, getEngagementColor, EngagementTag } from "@/utils/emailEngagement";

interface EmailEvent {
  event_type: string;
  occurred_at: string;
  device_type?: string;
  ip_address?: string;
  clicked_url?: string;
}

interface EmailTrackingPillsProps {
  events: EmailEvent[];
  sentAt: string;
  onClick?: () => void;
}

export function EmailTrackingPills({ events, sentAt, onClick }: EmailTrackingPillsProps) {
  const daysSinceSent = Math.floor((Date.now() - new Date(sentAt).getTime()) / (1000 * 60 * 60 * 24));
  const stats = calculateEngagementStats(events, sentAt);
  const engagementTag = getEngagementTag(stats, daysSinceSent);

  const tooltipContent = (
    <div className="space-y-2 text-xs">
      <div>
        <strong>Opens:</strong> {stats.opens}
        {stats.opens > 0 && stats.firstOpenMinutes !== null && (
          <div className="text-muted-foreground">
            First opened {stats.firstOpenMinutes} minutes after sending
          </div>
        )}
      </div>
      <div>
        <strong>Clicks:</strong> {stats.clicks}
      </div>
      {stats.devices.size > 0 && (
        <div>
          <strong>Devices:</strong> {Array.from(stats.devices).join(", ")}
        </div>
      )}
      {engagementTag && (
        <div className="pt-1 border-t border-border">
          <strong>AI Tag:</strong> {engagementTag}
        </div>
      )}
    </div>
  );

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-1 cursor-pointer" onClick={onClick}>
            {/* Open count */}
            {stats.opens > 0 && (
              <Badge variant="secondary" className="text-xs px-1.5 py-0.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 border-0">
                <Eye className="h-3 w-3 mr-1" />
                {stats.opens}
              </Badge>
            )}

            {/* Click count */}
            {stats.clicks > 0 && (
              <Badge variant="secondary" className="text-xs px-1.5 py-0.5 bg-purple-500/10 text-purple-600 dark:text-purple-400 border-0">
                <MousePointer className="h-3 w-3 mr-1" />
                {stats.clicks}
              </Badge>
            )}

            {/* Bounce indicator */}
            {stats.bounces > 0 && (
              <Badge variant="secondary" className="text-xs px-1.5 py-0.5 bg-red-500/10 text-red-600 dark:text-red-400 border-0">
                <AlertTriangle className="h-3 w-3" />
              </Badge>
            )}

            {/* AI Engagement Tag */}
            {engagementTag && (
              <Badge variant="secondary" className={`text-xs px-1.5 py-0.5 border-0 ${getEngagementColor(engagementTag)}`}>
                <Zap className="h-3 w-3 mr-1" />
                {engagementTag}
              </Badge>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          {tooltipContent}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
