import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, MoreVertical, CheckCircle2, XCircle, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const IdentityStatusWidget = () => {
  const navigate = useNavigate();

  const { data: identityStatus } = useQuery({
    queryKey: ["identity-status-widget"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { face: false, voice: false, overall: "Not set", faceExplorerUrl: null, voiceExplorerUrl: null };

      // Check face identity - include cert_explorer_url
      const { data: faceAssets } = await (supabase as any)
        .from("identity_assets")
        .select("id, cert_status, cert_explorer_url")
        .eq("user_id", user.id)
        .eq("identity_type", "face")
        .eq("cert_status", "minted")
        .is("revoked_at", null)
        .maybeSingle();

      // Check voice identity - profile + blockchain certificate (active and verified)
      const { data: voiceProfile } = await (supabase as any)
        .from("creator_voice_profiles")
        .select("id, is_verified")
        .eq("user_id", user.id)
        .eq("is_verified", true)
        .maybeSingle();

      const { data: voiceCert } = await (supabase as any)
        .from("voice_blockchain_certificates")
        .select("id, certification_status, is_active, cert_explorer_url")
        .eq("creator_id", user.id)
        .eq("certification_status", "verified")
        .eq("is_active", true)
        .maybeSingle();

      const faceVerified = !!faceAssets;
      const voiceVerified = !!(voiceProfile && voiceCert);

      let overall = "Not set";
      if (faceVerified && voiceVerified) overall = "Verified";
      else if (faceVerified || voiceVerified) overall = "Partially verified";

      return { 
        face: faceVerified, 
        voice: voiceVerified, 
        overall,
        faceExplorerUrl: faceAssets?.cert_explorer_url || null,
        voiceExplorerUrl: voiceCert?.cert_explorer_url || null,
      };
    },
  });

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Shield className="h-4 w-4 text-muted-foreground" />
            Identity Status
          </CardTitle>
          <CardDescription className="text-xs mt-1">
            Face and voice verification
          </CardDescription>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Hide widget</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
            <span className="text-sm font-medium">Face</span>
            <div className="flex items-center gap-2">
              {identityStatus?.face ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span className="text-xs text-muted-foreground">Verified</span>
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Not verified</span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
            <span className="text-sm font-medium">Voice</span>
            <div className="flex items-center gap-2">
              {identityStatus?.voice ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span className="text-xs text-muted-foreground">Verified</span>
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Not verified</span>
                </>
              )}
            </div>
          </div>

          <div className="pt-2">
            <p className="text-xs text-muted-foreground mb-3">
              Overall: <span className="font-medium">{identityStatus?.overall}</span>
            </p>

            {/* View on Polygon links */}
            {(identityStatus?.faceExplorerUrl || identityStatus?.voiceExplorerUrl) && (
              <div className="space-y-1 mb-3">
                {identityStatus?.faceExplorerUrl && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-xs h-7"
                    onClick={() => window.open(identityStatus.faceExplorerUrl!, "_blank")}
                  >
                    <ExternalLink className="h-3 w-3 mr-2" />
                    Face on Polygon
                  </Button>
                )}
                {identityStatus?.voiceExplorerUrl && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-xs h-7"
                    onClick={() => window.open(identityStatus.voiceExplorerUrl!, "_blank")}
                  >
                    <ExternalLink className="h-3 w-3 mr-2" />
                    Voice on Polygon
                  </Button>
                )}
              </div>
            )}

            <Button size="sm" className="w-full" onClick={() => navigate("/identity")}>
              Complete Identity
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
