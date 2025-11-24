import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Instagram, Facebook, TrendingUp, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export function SocialAccountsBanner() {
  const navigate = useNavigate();
  // Initialize from localStorage to prevent flash
  const [dismissed, setDismissed] = useState(() => {
    return localStorage.getItem("socialAccountsBannerDismissed") === "true";
  });

  const handleDismiss = () => {
    localStorage.setItem("socialAccountsBannerDismissed", "true");
    setDismissed(true);
  };

  const { data: accounts, isLoading } = useQuery({
    queryKey: ['social-media-accounts-check'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('social_media_accounts')
        .select('platform')
        .limit(1);
      
      if (error) throw error;
      return data;
    },
  });

  // Don't show while loading, if dismissed, or if they have accounts connected
  if (isLoading || dismissed || (accounts && accounts.length > 0)) {
    return null;
  }

  return (
    <Alert className="mb-6 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-5 w-5 text-yellow-600" />
            <AlertTitle className="text-yellow-900 dark:text-yellow-100">
              Unlock Social Media Campaign Opportunities
            </AlertTitle>
          </div>
          <AlertDescription className="text-yellow-800 dark:text-yellow-200 mb-3">
            Connect your Instagram and Facebook accounts to receive campaign invitations from advertisers and track your ad impressions to earn revenue.
          </AlertDescription>
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => navigate('/integrations')}
              className="bg-yellow-600 hover:bg-yellow-700"
            >
              <Instagram className="h-4 w-4 mr-2" />
              Connect Accounts
            </Button>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDismiss}
          className="text-yellow-600 hover:text-yellow-700"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </Alert>
  );
}
