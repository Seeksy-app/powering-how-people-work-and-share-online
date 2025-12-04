import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Zap, Package, ArrowRight, Check, Sparkles } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Module {
  id: string;
  name: string;
  category: string;
  creditEstimate: number;
}

interface CustomPackageBuilderProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  modules: Module[];
}

const CREDIT_PACKAGES = [
  { name: 'Starter', credits: 300, price: 19 },
  { name: 'Creator', credits: 600, price: 39 },
  { name: 'Pro', credits: 1200, price: 79 },
  { name: 'Power User', credits: 2500, price: 149 },
  { name: 'Studio Team', credits: 5000, price: 279 },
];

export function CustomPackageBuilder({ open, onOpenChange, modules }: CustomPackageBuilderProps) {
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1);
  const [packageName, setPackageName] = useState("My Custom Workspace");
  const [selectedModules, setSelectedModules] = useState<Set<string>>(new Set());

  const totalCredits = useMemo(() => {
    return modules
      .filter(m => selectedModules.has(m.id))
      .reduce((sum, m) => sum + (m.creditEstimate || 10), 0);
  }, [selectedModules, modules]);

  const recommendedBundle = useMemo(() => {
    const monthlyCredits = totalCredits;
    if (monthlyCredits <= 300) return CREDIT_PACKAGES[0];
    if (monthlyCredits <= 600) return CREDIT_PACKAGES[1];
    if (monthlyCredits <= 1200) return CREDIT_PACKAGES[2];
    if (monthlyCredits <= 2500) return CREDIT_PACKAGES[3];
    return CREDIT_PACKAGES[4];
  }, [totalCredits]);

  const toggleModule = (moduleId: string) => {
    setSelectedModules(prev => {
      const next = new Set(prev);
      if (next.has(moduleId)) {
        next.delete(moduleId);
      } else {
        next.add(moduleId);
      }
      return next;
    });
  };

  const groupedModules = useMemo(() => {
    const groups: Record<string, Module[]> = {};
    modules.forEach(m => {
      if (!groups[m.category]) groups[m.category] = [];
      groups[m.category].push(m);
    });
    return groups;
  }, [modules]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const { error } = await supabase
        .from('custom_packages')
        .insert({
          user_id: session.user.id,
          name: packageName,
          modules: Array.from(selectedModules),
          estimated_monthly_credits: totalCredits,
          recommended_bundle: recommendedBundle.name,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-packages'] });
      toast.success("Custom package saved!");
      onOpenChange(false);
      setStep(1);
      setSelectedModules(new Set());
    },
    onError: (error) => {
      toast.error("Failed to save package", { description: error.message });
    },
  });

  const categoryLabels: Record<string, string> = {
    creator: "Creator Tools",
    media: "Media & Content",
    marketing: "Marketing & CRM",
    business: "Business Operations",
    identity: "Identity & Profile",
    integrations: "Integrations",
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            Create Your Own Package
          </DialogTitle>
          <DialogDescription>
            {step === 1 && "Select the modules you want in your custom workspace."}
            {step === 2 && "Review your selection and save your custom package."}
          </DialogDescription>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="flex items-center gap-2 py-2">
          <div className={cn(
            "flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium",
            step >= 1 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
          )}>
            1
          </div>
          <div className={cn("h-0.5 flex-1", step >= 2 ? "bg-primary" : "bg-muted")} />
          <div className={cn(
            "flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium",
            step >= 2 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
          )}>
            2
          </div>
        </div>

        {/* Step 1: Select Modules */}
        {step === 1 && (
          <ScrollArea className="flex-1 -mx-6 px-6">
            <div className="space-y-4 pb-4">
              {Object.entries(groupedModules).map(([category, categoryModules]) => (
                <div key={category}>
                  <h4 className="text-sm font-semibold text-muted-foreground mb-2">
                    {categoryLabels[category] || category}
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {categoryModules.map(module => (
                      <label
                        key={module.id}
                        className={cn(
                          "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all",
                          selectedModules.has(module.id)
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        )}
                      >
                        <Checkbox
                          checked={selectedModules.has(module.id)}
                          onCheckedChange={() => toggleModule(module.id)}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm truncate">{module.name}</div>
                          <div className="text-xs text-muted-foreground">
                            ~{module.creditEstimate || 10} credits/mo
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}

        {/* Step 2: Review */}
        {step === 2 && (
          <div className="flex-1 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="package-name">Package Name</Label>
              <Input
                id="package-name"
                value={packageName}
                onChange={(e) => setPackageName(e.target.value)}
                placeholder="My Custom Workspace"
              />
            </div>

            <Card className="p-4 bg-muted/50">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium">Selected Modules</span>
                <Badge variant="secondary">{selectedModules.size} modules</Badge>
              </div>
              <div className="flex flex-wrap gap-1.5 mb-4">
                {Array.from(selectedModules).map(id => {
                  const mod = modules.find(m => m.id === id);
                  return mod ? (
                    <Badge key={id} variant="outline" className="text-xs">
                      {mod.name}
                    </Badge>
                  ) : null;
                })}
              </div>
              
              <div className="flex items-center justify-between pt-3 border-t border-border">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-primary" />
                  <span className="text-sm">Estimated Monthly Usage</span>
                </div>
                <span className="font-bold text-lg">{totalCredits} credits</span>
              </div>
            </Card>

            <Card className="p-4 border-primary/30 bg-primary/5">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="font-semibold">Recommended Bundle</span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-lg">{recommendedBundle.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {recommendedBundle.credits} credits for ${recommendedBundle.price}/purchase
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  View Pricing
                </Button>
              </div>
            </Card>
          </div>
        )}

        <DialogFooter className="gap-2">
          {step === 1 ? (
            <>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button 
                onClick={() => setStep(2)} 
                disabled={selectedModules.size === 0}
              >
                Continue
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button 
                onClick={() => saveMutation.mutate()}
                disabled={saveMutation.isPending}
              >
                <Check className="h-4 w-4 mr-2" />
                {saveMutation.isPending ? "Saving..." : "Save Package"}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}