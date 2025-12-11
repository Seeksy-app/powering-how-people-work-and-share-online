import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckCircle2, Eye } from "lucide-react";

export interface IntakeData {
  status: string;
  branch: string;
  claimStatus: string;
  primaryGoals: string[];
}

interface ClaimsIntakeFlowProps {
  onComplete: (data: IntakeData) => void;
  onShowSample?: () => void;
}

const STATUS_OPTIONS = [
  { value: "veteran", label: "Veteran" },
  { value: "active_duty", label: "Active Duty" },
  { value: "guard_reserve", label: "Guard or Reserve" },
  { value: "spouse_caregiver", label: "Military Spouse or Caregiver" },
  { value: "federal_employee", label: "Federal Civilian Employee" },
  { value: "other", label: "Other" },
];

const BRANCH_OPTIONS = [
  { value: "army", label: "Army" },
  { value: "navy", label: "Navy" },
  { value: "air_force", label: "Air Force" },
  { value: "marine_corps", label: "Marine Corps" },
  { value: "space_force", label: "Space Force" },
  { value: "coast_guard", label: "Coast Guard" },
  { value: "multiple_other", label: "Multiple / Other" },
];

const CLAIM_STATUS_OPTIONS = [
  { value: "not_filed", label: "I haven't filed anything yet" },
  { value: "need_intent", label: "I need to file an Intent to File" },
  { value: "has_intent", label: "I already filed an Intent to File" },
  { value: "submitted_claim", label: "I've submitted an initial claim" },
  { value: "supplemental", label: "I'm working on a supplemental or increase" },
  { value: "not_sure", label: "I'm not sure" },
];

const PRIMARY_GOAL_OPTIONS = [
  { value: "understand_benefits", label: "Understanding my benefits" },
  { value: "decide_filing", label: "Deciding whether to file" },
  { value: "file_intent", label: "Filing an Intent to File" },
  { value: "prepare_claim", label: "Preparing for an initial claim" },
  { value: "understand_rating", label: "Understanding a current rating or decision" },
];

export function ClaimsIntakeFlow({ onComplete, onShowSample }: ClaimsIntakeFlowProps) {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<IntakeData>({
    status: "",
    branch: "",
    claimStatus: "",
    primaryGoals: [],
  });

  const handleStatusSelect = (status: string) => {
    setData(prev => ({ ...prev, status }));
    setStep(2);
  };

  const handleBranchSelect = (branch: string) => {
    setData(prev => ({ ...prev, branch }));
    setStep(3);
  };

  const handleClaimStatusSelect = (claimStatus: string) => {
    setData(prev => ({ ...prev, claimStatus }));
    setStep(4);
  };

  const handleGoalToggle = (goal: string) => {
    setData(prev => ({
      ...prev,
      primaryGoals: prev.primaryGoals.includes(goal)
        ? prev.primaryGoals.filter(g => g !== goal)
        : [...prev.primaryGoals, goal],
    }));
  };

  const handleComplete = () => {
    if (data.primaryGoals.length === 0) return;
    onComplete(data);
  };

  return (
    <div className="flex flex-col items-center justify-center h-full p-6">
      {/* Progress Indicator */}
      <div className="flex items-center gap-2 mb-8">
        {[1, 2, 3, 4].map((s) => (
          <div key={s} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
              step > s 
                ? "bg-green-500 text-white" 
                : step === s 
                  ? "bg-orange-500 text-white" 
                  : "bg-muted text-muted-foreground"
            }`}>
              {step > s ? <CheckCircle2 className="w-4 h-4" /> : s}
            </div>
            {s < 4 && (
              <div className={`w-8 h-1 mx-1 rounded ${step > s ? "bg-green-500" : "bg-muted"}`} />
            )}
          </div>
        ))}
      </div>

      <Card className="w-full max-w-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">
            {step === 1 && "First, what best describes you?"}
            {step === 2 && "Which branch did you serve in or are you serving in?"}
            {step === 3 && "Where are you in the VA claim process?"}
            {step === 4 && "What would you like help with today?"}
          </CardTitle>
          {step === 4 && (
            <p className="text-sm text-muted-foreground mt-2">Select all that apply</p>
          )}
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {step === 1 && STATUS_OPTIONS.map((option) => (
              <Button
                key={option.value}
                variant={data.status === option.value ? "default" : "outline"}
                className="w-full justify-start h-auto py-3 px-4"
                onClick={() => handleStatusSelect(option.value)}
              >
                {option.label}
              </Button>
            ))}
            
            {step === 2 && BRANCH_OPTIONS.map((option) => (
              <Button
                key={option.value}
                variant={data.branch === option.value ? "default" : "outline"}
                className="w-full justify-start h-auto py-3 px-4"
                onClick={() => handleBranchSelect(option.value)}
              >
                {option.label}
              </Button>
            ))}
            
            {step === 3 && CLAIM_STATUS_OPTIONS.map((option) => (
              <Button
                key={option.value}
                variant={data.claimStatus === option.value ? "default" : "outline"}
                className="w-full justify-start h-auto py-3 px-4"
                onClick={() => handleClaimStatusSelect(option.value)}
              >
                {option.label}
              </Button>
            ))}

            {step === 4 && (
              <>
                {PRIMARY_GOAL_OPTIONS.map((option) => (
                  <label
                    key={option.value}
                    className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                      data.primaryGoals.includes(option.value)
                        ? "bg-primary/10 border-primary"
                        : "hover:bg-muted"
                    }`}
                  >
                    <Checkbox
                      checked={data.primaryGoals.includes(option.value)}
                      onCheckedChange={() => handleGoalToggle(option.value)}
                    />
                    <span>{option.label}</span>
                  </label>
                ))}
                <Button
                  className="mt-4"
                  onClick={handleComplete}
                  disabled={data.primaryGoals.length === 0}
                >
                  Continue
                </Button>
              </>
            )}
          </div>
          
          {/* View Sample Button */}
          {onShowSample && step === 1 && (
            <div className="mt-6 pt-4 border-t">
              <Button 
                variant="ghost" 
                className="w-full text-muted-foreground hover:text-foreground"
                onClick={onShowSample}
              >
                <Eye className="w-4 h-4 mr-2" />
                View Sample Results
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
