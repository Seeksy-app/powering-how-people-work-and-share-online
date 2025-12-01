import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Zap } from "lucide-react";

export function CreditsBadge() {
  const [credits, setCredits] = useState<number | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadCredits();
  }, []);

  const loadCredits = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Stub: Default to 4 credits to show low state
      // TODO: Load from billing table when implemented
      setCredits(4);
    } catch (error) {
      console.error("Error loading credits:", error);
      setCredits(4);
    }
  };

  const handleClick = () => {
    navigate("/settings/billing");
  };

  if (credits === null) return null;

  // Color logic: >20 blue, 5-20 yellow, ≤4 red
  const getVariant = () => {
    if (credits > 20) return "default"; // blue
    if (credits >= 5) return "secondary"; // yellow
    return "destructive"; // red
  };

  const isLow = credits <= 4;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            variant={getVariant()}
            className={`cursor-pointer hover:scale-105 transition-all duration-200 flex items-center gap-1.5 px-3 py-1.5 ${
              isLow ? 'animate-pulse' : ''
            }`}
            onClick={handleClick}
          >
            <Zap className="h-3.5 w-3.5" />
            <span className="font-semibold">{credits}</span>
            {isLow && <span className="text-xs opacity-90">Low!</span>}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-sm">Credits power your AI, email, and media tools.</p>
          <p className="text-sm font-semibold mt-1">You have {credits} credits remaining.</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
