import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, FileCheck, Loader2, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const CertificatesTab = () => {
  const { data: protectedContent, isLoading } = useQuery({
    queryKey: ["protected-content-certificates"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("protected_content")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  const copyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    toast.success("Hash copied to clipboard");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Proof Certificates</h2>
        <p className="text-sm text-muted-foreground">
          Verifiable proof certificates for your protected content
        </p>
      </div>

      {protectedContent && protectedContent.length > 0 ? (
        <div className="grid gap-4">
          {protectedContent.map((content) => (
            <Card key={content.id} className="p-4">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <FileCheck className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium">{content.title}</h3>
                    {content.blockchain_tx_hash ? (
                      <Badge className="bg-green-500/10 text-green-600">Certified</Badge>
                    ) : (
                      <Badge variant="outline">Pending</Badge>
                    )}
                  </div>

                  {content.file_hash && (
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs text-muted-foreground">Hash:</span>
                      <code className="text-xs bg-muted px-2 py-1 rounded truncate max-w-[200px]">
                        {content.file_hash}
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => copyHash(content.file_hash)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  )}

                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    <span>Type: {content.content_type}</span>
                    <span>Registered: {new Date(content.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-medium mb-2">No Content to Certify</h3>
          <p className="text-sm text-muted-foreground">
            Register content in "My Proofs" tab first.
          </p>
        </Card>
      )}
    </div>
  );
};
