import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Phone, Mail, UserCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { TruckingPageWrapper, TruckingContentCard, TruckingEmptyState } from "@/components/trucking/TruckingPageWrapper";

interface Lead {
  id: string;
  company_name: string;
  mc_number: string;
  dot_number: string;
  contact_name: string;
  phone: string;
  email: string;
  truck_type: string;
  rate_offered: number;
  rate_requested: number;
  status: string;
  source: string;
  notes: string;
  created_at: string;
  trucking_loads?: { load_number: string; origin_city: string; destination_city: string } | null;
}

const statusOptions = ["interested", "countered", "booked", "declined", "no_answer"];

export default function CarrierLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const { toast } = useToast();

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("trucking_carrier_leads")
        .select("*, trucking_loads(load_number, origin_city, destination_city)")
        .eq("owner_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setLeads(data || []);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("trucking_carrier_leads")
        .update({ status: newStatus })
        .eq("id", id);

      if (error) throw error;
      toast({ title: "Status updated" });
      fetchLeads();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      interested: "bg-yellow-100 text-yellow-700",
      countered: "bg-orange-100 text-orange-700",
      booked: "bg-green-100 text-green-700",
      declined: "bg-red-100 text-red-700",
      no_answer: "bg-slate-100 text-slate-600",
    };
    return colors[status] || "bg-slate-100 text-slate-600";
  };

  const filteredLeads = filter === "all" ? leads : leads.filter((l) => l.status === filter);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <TruckingPageWrapper 
      title="Carrier Leads" 
      description="Carriers interested in your loads"
      action={
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-40 bg-white border-slate-200">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Leads</SelectItem>
            {statusOptions.map((status) => (
              <SelectItem key={status} value={status} className="capitalize">
                {status.replace("_", " ")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      }
    >
      <TruckingContentCard noPadding>
        {filteredLeads.length === 0 ? (
          <TruckingEmptyState
            icon={<UserCheck className="h-6 w-6 text-slate-400" />}
            title={filter === "all" ? "No leads yet" : `No ${filter.replace("_", " ")} leads`}
            description="Carriers will appear here when they call your AITrucking line about a load."
          />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-slate-200">
                  <TableHead className="text-slate-500 font-medium">Carrier</TableHead>
                  <TableHead className="text-slate-500 font-medium">Load / Route</TableHead>
                  <TableHead className="text-slate-500 font-medium">Offered</TableHead>
                  <TableHead className="text-slate-500 font-medium">Requested</TableHead>
                  <TableHead className="text-slate-500 font-medium">Source</TableHead>
                  <TableHead className="text-slate-500 font-medium">Status</TableHead>
                  <TableHead className="text-slate-500 font-medium">Date</TableHead>
                  <TableHead className="text-slate-500 font-medium text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLeads.map((lead) => (
                  <TableRow key={lead.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <TableCell>
                      <div className="font-medium text-slate-900">{lead.company_name || lead.contact_name}</div>
                      {lead.mc_number && (
                        <div className="text-xs text-slate-500">MC# {lead.mc_number}</div>
                      )}
                    </TableCell>
                    <TableCell>
                      {lead.trucking_loads ? (
                        <div>
                          <div className="font-medium text-slate-900">{lead.trucking_loads.load_number}</div>
                          <div className="text-xs text-slate-500">
                            {lead.trucking_loads.origin_city} → {lead.trucking_loads.destination_city}
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </TableCell>
                    <TableCell className="font-medium text-slate-900">
                      ${lead.rate_offered?.toLocaleString() || "—"}
                    </TableCell>
                    <TableCell>
                      {lead.rate_requested ? (
                        <span className="text-orange-600 font-medium">${lead.rate_requested.toLocaleString()}</span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200">
                        {lead.source || "ai_call"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={lead.status}
                        onValueChange={(value) => updateStatus(lead.id, value)}
                      >
                        <SelectTrigger className="h-8 w-28 border-0 bg-transparent p-0">
                          <Badge className={getStatusBadge(lead.status)}>{lead.status}</Badge>
                        </SelectTrigger>
                        <SelectContent>
                          {statusOptions.map((status) => (
                            <SelectItem key={status} value={status} className="capitalize">
                              {status.replace("_", " ")}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-slate-500">
                      {format(new Date(lead.created_at), "MMM d, h:mm a")}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        {lead.phone && (
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-blue-600" asChild>
                            <a href={`tel:${lead.phone}`}>
                              <Phone className="h-4 w-4" />
                            </a>
                          </Button>
                        )}
                        {lead.email && (
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-blue-600" asChild>
                            <a href={`mailto:${lead.email}`}>
                              <Mail className="h-4 w-4" />
                            </a>
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </TruckingContentCard>
    </TruckingPageWrapper>
  );
}
