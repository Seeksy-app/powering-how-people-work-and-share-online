import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Send, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const CampaignBuilder = () => {
  const queryClient = useQueryClient();
  const [subject, setSubject] = useState("");
  const [htmlContent, setHtmlContent] = useState("");
  const [selectedList, setSelectedList] = useState("");
  const [selectedAccount, setSelectedAccount] = useState("");

  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    },
  });

  const { data: accounts } = useQuery({
    queryKey: ["email-accounts", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase
        .from("email_accounts")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_active", true);
      return data || [];
    },
    enabled: !!user,
  });

  const { data: lists } = useQuery({
    queryKey: ["contact-lists", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase
        .from("contact_lists")
        .select(`
          *,
          contact_list_members(count)
        `)
        .eq("user_id", user.id);
      return data || [];
    },
    enabled: !!user,
  });

  const sendCampaign = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not authenticated");
      if (!selectedList || !selectedAccount || !subject || !htmlContent) {
        throw new Error("Please fill in all required fields");
      }

      const { data, error } = await supabase.functions.invoke("send-campaign-email", {
        body: {
          listId: selectedList,
          accountId: selectedAccount,
          subject,
          htmlContent,
          userId: user.id,
        },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["email-campaigns"] });
      toast.success(`Campaign sent to ${data.recipientCount} contacts`);
      setSubject("");
      setHtmlContent("");
      setSelectedList("");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to send campaign");
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Email Campaign</CardTitle>
        <CardDescription>
          Send targeted emails to your contact lists
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>From Email Account</Label>
          <Select value={selectedAccount} onValueChange={setSelectedAccount}>
            <SelectTrigger>
              <SelectValue placeholder="Select email account" />
            </SelectTrigger>
            <SelectContent>
              {accounts?.map((account) => (
                <SelectItem key={account.id} value={account.id}>
                  {account.email_address} {account.is_default && "(Default)"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>To Contact List</Label>
          <Select value={selectedList} onValueChange={setSelectedList}>
            <SelectTrigger>
              <SelectValue placeholder="Select contact list" />
            </SelectTrigger>
            <SelectContent>
              {lists?.map((list) => (
                <SelectItem key={list.id} value={list.id}>
                  {list.name} ({list.contact_list_members?.[0]?.count || 0} contacts)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Subject</Label>
          <Input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Your email subject"
          />
        </div>

        <div className="space-y-2">
          <Label>Message</Label>
          <Textarea
            value={htmlContent}
            onChange={(e) => setHtmlContent(e.target.value)}
            placeholder="Your email message (HTML supported)"
            rows={8}
          />
        </div>

        <Button
          onClick={() => sendCampaign.mutate()}
          disabled={sendCampaign.isPending || !selectedList || !selectedAccount || !subject || !htmlContent}
          className="w-full"
        >
          {sendCampaign.isPending ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Sending Campaign...
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Send Campaign
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
