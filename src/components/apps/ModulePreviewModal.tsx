import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Zap, Check, ExternalLink, Image as ImageIcon, LucideIcon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface ModulePreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  module: {
    id: string;
    name: string;
    description: string;
    icon: LucideIcon;
    status: string;
    route?: string;
    recommendedWith?: string[];
  } | null;
}

const CREDIT_PACKAGES = [
  { name: 'Starter', credits: 300, price: 19 },
  { name: 'Creator', credits: 600, price: 39 },
  { name: 'Pro', credits: 1200, price: 79 },
];

export function ModulePreviewModal({ open, onOpenChange, module }: ModulePreviewModalProps) {
  const navigate = useNavigate();

  const { data: tooltip } = useQuery({
    queryKey: ['module-tooltip', module?.id],
    queryFn: async () => {
      if (!module?.id) return null;
      const { data, error } = await supabase
        .from('module_tooltips')
        .select('*')
        .eq('module_id', module.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!module?.id,
  });

  if (!module) return null;

  const Icon = module.icon;
  const creditEstimate = tooltip?.credit_estimate || 10;
  const recommendedBundle = creditEstimate <= 50 ? CREDIT_PACKAGES[0] : 
                           creditEstimate <= 100 ? CREDIT_PACKAGES[1] : CREDIT_PACKAGES[2];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Icon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-xl">{module.name}</DialogTitle>
              <Badge variant={module.status === 'coming_soon' ? 'secondary' : 'outline'} className="mt-1">
                {module.status === 'coming_soon' ? 'Coming Soon' : 'Available'}
              </Badge>
            </div>
          </div>
          <DialogDescription className="text-base">
            {tooltip?.short_description || module.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
        {/* Features List */}
          {tooltip?.unlocks && Array.isArray(tooltip.unlocks) && tooltip.unlocks.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-2">Features</h4>
              <ul className="space-y-2">
                {(tooltip.unlocks as string[]).map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Best For */}
          {tooltip?.best_for && (
            <div>
              <h4 className="text-sm font-semibold mb-1">Best for</h4>
              <p className="text-sm text-muted-foreground">{tooltip.best_for}</p>
            </div>
          )}

          {/* Screenshot Placeholder */}
          <Card className="p-8 bg-muted/30 border-dashed flex flex-col items-center justify-center text-center">
            <ImageIcon className="h-8 w-8 text-muted-foreground/50 mb-2" />
            <span className="text-sm text-muted-foreground">Module preview coming soon</span>
          </Card>

          {/* Credit Usage & Bundle */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              <span className="text-sm">Est. {creditEstimate} credits/month</span>
            </div>
            <div className="text-sm text-muted-foreground">
              Recommended: <span className="font-medium text-foreground">{recommendedBundle.name}</span>
            </div>
          </div>

          {/* Recommended With */}
          {module.recommendedWith && module.recommendedWith.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-2">Works great with</h4>
              <div className="flex flex-wrap gap-1.5">
                {module.recommendedWith.map((rec, i) => (
                  <Badge key={i} variant="secondary" className="text-xs">
                    {rec}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          {module.route && module.status !== 'coming_soon' && (
            <Button onClick={() => {
              onOpenChange(false);
              navigate(module.route!);
            }}>
              Open Module
              <ExternalLink className="h-4 w-4 ml-2" />
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}