import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Link2, Check, UserCircle } from "lucide-react";
import { useState } from "react";
import { CreateTicketDialog } from "./CreateTicketDialog";
import { TicketDetailDialog } from "./TicketDetailDialog";
import { useToast } from "@/hooks/use-toast";

interface TicketsTabProps {
  userId: string;
}

export const TicketsTab = ({ userId }: TicketsTabProps) => {
  const { toast } = useToast();
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);
  const [supportLinkCopied, setSupportLinkCopied] = useState(false);
  const [leadLinkCopied, setLeadLinkCopied] = useState(false);

  const publicTicketUrl = `${window.location.origin}/submit-ticket`;
  const personalLeadUrl = `${window.location.origin}/lead-form/${userId}`;

  const { data: tickets, refetch } = useQuery({
    queryKey: ["tickets", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("client_tickets")
        .select(`
          *,
          contacts(name, company, email)
        `)
        .or(`user_id.eq.${userId},assigned_to.eq.${userId}`)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const handleCopySupportLink = async () => {
    try {
      await navigator.clipboard.writeText(publicTicketUrl);
      setSupportLinkCopied(true);
      toast({
        title: "Link Copied!",
        description: "Customer Support form link copied to clipboard.",
      });
      setTimeout(() => setSupportLinkCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy link. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCopyLeadLink = async () => {
    try {
      await navigator.clipboard.writeText(personalLeadUrl);
      setLeadLinkCopied(true);
      toast({
        title: "Link Copied!",
        description: "Your personal Lead Form link copied to clipboard.",
      });
      setTimeout(() => setLeadLinkCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy link. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "destructive";
      case "medium": return "default";
      case "low": return "secondary";
      default: return "outline";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open": return "default";
      case "in_progress": return "secondary";
      case "resolved": return "outline";
      case "closed": return "outline";
      default: return "default";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center gap-4">
        <h2 className="text-2xl font-semibold">Support Tickets</h2>
        <div className="flex gap-2">
          <Button onClick={handleCopyLeadLink} variant="secondary">
            {leadLinkCopied ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Copied!
              </>
            ) : (
              <>
                <UserCircle className="w-4 h-4 mr-2" />
                My Lead Form
              </>
            )}
          </Button>
          <Button onClick={handleCopySupportLink} variant="outline">
            {supportLinkCopied ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Copied!
              </>
            ) : (
              <>
                <Link2 className="w-4 h-4 mr-2" />
                Support Form
              </>
            )}
          </Button>
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Ticket
          </Button>
        </div>
      </div>

      <div className="grid gap-4">
        {tickets?.map((ticket) => (
          <Card 
            key={ticket.id} 
            className="cursor-pointer hover:border-primary transition-colors"
            onClick={() => setSelectedTicket(ticket.id)}
          >
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg">#{ticket.id.slice(0, 8)}</CardTitle>
                    <Badge variant={getPriorityColor(ticket.priority)}>{ticket.priority}</Badge>
                    <Badge variant={getStatusColor(ticket.status)}>{ticket.status}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{ticket.title}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center text-sm text-muted-foreground">
                <span>
                  {ticket.contacts?.company || ticket.contacts?.name || "No contact"}
                </span>
                <span>{new Date(ticket.created_at).toLocaleDateString()}</span>
              </div>
            </CardContent>
          </Card>
        ))}

        {tickets?.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No tickets yet. Create your first support ticket to get started.
            </CardContent>
          </Card>
        )}
      </div>

      <CreateTicketDialog 
        open={createOpen} 
        onOpenChange={setCreateOpen}
        onSuccess={refetch}
        userId={userId}
      />

      {selectedTicket && (
        <TicketDetailDialog
          ticketId={selectedTicket}
          open={!!selectedTicket}
          onOpenChange={(open) => !open && setSelectedTicket(null)}
          onUpdate={refetch}
        />
      )}
    </div>
  );
};
