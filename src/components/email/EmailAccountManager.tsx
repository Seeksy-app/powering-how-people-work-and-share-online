import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, Plus, Trash2, Check } from "lucide-react";
import { toast } from "sonner";

export const EmailAccountManager = () => {
  const queryClient = useQueryClient();
  const [connecting, setConnecting] = useState(false);

  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    },
  });

  const { data: accounts, isLoading } = useQuery({
    queryKey: ["email-accounts", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("email_accounts")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const connectGmail = async () => {
    if (!user) return;
    
    setConnecting(true);
    try {
      const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
      const redirectUri = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/gmail-oauth-callback`;
      
      const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
      authUrl.searchParams.set("client_id", GOOGLE_CLIENT_ID);
      authUrl.searchParams.set("redirect_uri", redirectUri);
      authUrl.searchParams.set("response_type", "code");
      authUrl.searchParams.set("scope", "https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/userinfo.email");
      authUrl.searchParams.set("access_type", "offline");
      authUrl.searchParams.set("prompt", "consent");
      authUrl.searchParams.set("state", user.id);

      window.location.href = authUrl.toString();
    } catch (error) {
      console.error("Failed to initiate Gmail connection:", error);
      toast.error("Failed to connect Gmail");
      setConnecting(false);
    }
  };

  const setDefaultAccount = useMutation({
    mutationFn: async (accountId: string) => {
      if (!user) throw new Error("Not authenticated");
      
      // Unset all defaults first
      await supabase
        .from("email_accounts")
        .update({ is_default: false })
        .eq("user_id", user.id);
      
      // Set new default
      const { error } = await supabase
        .from("email_accounts")
        .update({ is_default: true })
        .eq("id", accountId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["email-accounts"] });
      toast.success("Default email account updated");
    },
    onError: () => {
      toast.error("Failed to set default account");
    },
  });

  const disconnectAccount = useMutation({
    mutationFn: async (accountId: string) => {
      const { error } = await supabase
        .from("email_accounts")
        .delete()
        .eq("id", accountId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["email-accounts"] });
      toast.success("Email account disconnected");
    },
    onError: () => {
      toast.error("Failed to disconnect account");
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Connected Email Accounts
        </CardTitle>
        <CardDescription>
          Manage Gmail accounts for sending campaigns
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading accounts...</p>
        ) : accounts && accounts.length > 0 ? (
          <div className="space-y-3">
            {accounts.map((account) => (
              <div
                key={account.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{account.email_address}</p>
                    <p className="text-sm text-muted-foreground">
                      {account.display_name}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {account.is_default && (
                    <Badge variant="secondary">Default</Badge>
                  )}
                  {!account.is_default && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setDefaultAccount.mutate(account.id)}
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Set Default
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => disconnectAccount.mutate(account.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            No email accounts connected yet
          </p>
        )}
        
        <Button
          onClick={connectGmail}
          disabled={connecting}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          {connecting ? "Connecting..." : "Connect Gmail Account"}
        </Button>
      </CardContent>
    </Card>
  );
};
