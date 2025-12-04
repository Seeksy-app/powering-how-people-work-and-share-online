import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Zap, Users, Unlock, Info } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ModuleTooltipData {
  short_description: string;
  best_for: string;
  unlocks: string[];
  credit_estimate: number;
}

interface ModuleTooltipProps {
  moduleId: string;
  children: React.ReactNode;
  fallbackData?: {
    description: string;
    bestFor: string;
    unlocks: string[];
    creditEstimate: number;
  };
}

export function ModuleTooltip({ moduleId, children, fallbackData }: ModuleTooltipProps) {
  const { data: tooltip } = useQuery({
    queryKey: ['module-tooltip', moduleId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('module_tooltips')
        .select('*')
        .eq('module_id', moduleId)
        .maybeSingle();
      
      if (error) throw error;
      return data as ModuleTooltipData | null;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  const data = tooltip || (fallbackData ? {
    short_description: fallbackData.description,
    best_for: fallbackData.bestFor,
    unlocks: fallbackData.unlocks,
    credit_estimate: fallbackData.creditEstimate,
  } : null);

  if (!data) {
    return <>{children}</>;
  }

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          {children}
        </TooltipTrigger>
        <TooltipContent 
          side="right" 
          align="start"
          className="w-72 p-4 bg-popover border border-border shadow-lg"
        >
          <div className="space-y-3">
            {/* Description */}
            <p className="text-sm text-foreground leading-relaxed">
              {data.short_description}
            </p>

            {/* Best For */}
            <div className="flex items-start gap-2">
              <Users className="h-4 w-4 text-primary mt-0.5 shrink-0" />
              <div>
                <span className="text-xs font-semibold text-muted-foreground">Best for:</span>
                <p className="text-sm text-foreground">{data.best_for}</p>
              </div>
            </div>

            {/* What it unlocks */}
            {data.unlocks && data.unlocks.length > 0 && (
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                  <Unlock className="h-3.5 w-3.5" />
                  Unlocks:
                </div>
                <ul className="space-y-1">
                  {data.unlocks.map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <span className="w-1 h-1 rounded-full bg-primary" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Credit Estimate */}
            {data.credit_estimate > 0 && (
              <div className="pt-2 border-t border-border">
                <Badge variant="secondary" className="gap-1.5">
                  <Zap className="h-3 w-3" />
                  ~{data.credit_estimate} credits/month
                </Badge>
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}