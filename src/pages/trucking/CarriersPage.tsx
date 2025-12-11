import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit, Trash2, Phone, Mail, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { formatPhoneNumber } from "@/utils/phoneFormat";
import { TruckingPageWrapper, TruckingContentCard, TruckingEmptyState } from "@/components/trucking/TruckingPageWrapper";

interface Carrier {
  id: string;
  company_name: string;
  mc_number: string;
  dot_number: string;
  contact_name: string;
  phone: string;
  email: string;
  equipment_types: string;
  notes: string;
}

export default function CarriersPage() {
  const [carriers, setCarriers] = useState<Carrier[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCarrier, setEditingCarrier] = useState<Carrier | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    company_name: "",
    mc_number: "",
    dot_number: "",
    contact_name: "",
    phone: "",
    email: "",
    equipment_types: "",
    notes: "",
  });

  useEffect(() => {
    fetchCarriers();
  }, []);

  const fetchCarriers = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("trucking_carriers")
        .select("*")
        .eq("owner_id", user.id)
        .order("company_name");

      if (error) throw error;
      setCarriers(data || []);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const carrierData = {
        owner_id: user.id,
        ...formData,
      };

      if (editingCarrier) {
        const { error } = await supabase
          .from("trucking_carriers")
          .update(carrierData)
          .eq("id", editingCarrier.id);
        if (error) throw error;
        toast({ title: "Carrier updated" });
      } else {
        const { error } = await supabase
          .from("trucking_carriers")
          .insert(carrierData);
        if (error) throw error;
        toast({ title: "Carrier added" });
      }

      setDialogOpen(false);
      resetForm();
      fetchCarriers();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleEdit = (carrier: Carrier) => {
    setEditingCarrier(carrier);
    setFormData({
      company_name: carrier.company_name || "",
      mc_number: carrier.mc_number || "",
      dot_number: carrier.dot_number || "",
      contact_name: carrier.contact_name || "",
      phone: carrier.phone || "",
      email: carrier.email || "",
      equipment_types: carrier.equipment_types || "",
      notes: carrier.notes || "",
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this carrier?")) return;
    
    try {
      const { error } = await supabase.from("trucking_carriers").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "Carrier deleted" });
      fetchCarriers();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const resetForm = () => {
    setEditingCarrier(null);
    setFormData({
      company_name: "",
      mc_number: "",
      dot_number: "",
      contact_name: "",
      phone: "",
      email: "",
      equipment_types: "",
      notes: "",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <TruckingPageWrapper 
      title="Carriers" 
      description="Your carrier directory"
      action={
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl">
              <Plus className="h-4 w-4 mr-2" />
              Add Carrier
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingCarrier ? "Edit Carrier" : "Add Carrier"}</DialogTitle>
              <DialogDescription>Add carrier details to your directory</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Company Name *</Label>
                <Input
                  value={formData.company_name}
                  onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                  required
                  className="mt-1"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>MC Number</Label>
                  <Input
                    value={formData.mc_number}
                    onChange={(e) => setFormData({ ...formData, mc_number: e.target.value })}
                    placeholder="MC-123456"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>DOT Number</Label>
                  <Input
                    value={formData.dot_number}
                    onChange={(e) => setFormData({ ...formData, dot_number: e.target.value })}
                    placeholder="1234567"
                    className="mt-1"
                  />
                </div>
              </div>
              <div>
                <Label>Contact Name</Label>
                <Input
                  value={formData.contact_name}
                  onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Phone</Label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: formatPhoneNumber(e.target.value) })}
                    type="tel"
                    placeholder="405-444-4444"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    type="email"
                    className="mt-1"
                  />
                </div>
              </div>
              <div>
                <Label>Equipment Types</Label>
                <Input
                  value={formData.equipment_types}
                  onChange={(e) => setFormData({ ...formData, equipment_types: e.target.value })}
                  placeholder="Dry Van, Reefer, Flatbed"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Notes</Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="mt-1"
                />
              </div>
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                {editingCarrier ? "Update Carrier" : "Add Carrier"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      }
    >
      <TruckingContentCard noPadding>
        {carriers.length === 0 ? (
          <TruckingEmptyState
            icon={<Users className="h-6 w-6 text-slate-400" />}
            title="No carriers yet"
            description="Add carriers you like working with to your directory."
            action={
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={() => setDialogOpen(true)}>
                Add Carrier
              </Button>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-slate-200">
                  <TableHead className="text-slate-500 font-medium">Company</TableHead>
                  <TableHead className="text-slate-500 font-medium">MC / DOT</TableHead>
                  <TableHead className="text-slate-500 font-medium">Contact</TableHead>
                  <TableHead className="text-slate-500 font-medium">Equipment</TableHead>
                  <TableHead className="text-slate-500 font-medium text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {carriers.map((carrier) => (
                  <TableRow key={carrier.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <TableCell className="font-medium text-slate-900">{carrier.company_name}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {carrier.mc_number && <div className="text-slate-900">MC# {carrier.mc_number}</div>}
                        {carrier.dot_number && <div className="text-slate-500">DOT# {carrier.dot_number}</div>}
                        {!carrier.mc_number && !carrier.dot_number && <span className="text-slate-400">—</span>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-slate-900">{carrier.contact_name || "—"}</div>
                      <div className="text-xs text-slate-500">{carrier.phone}</div>
                    </TableCell>
                    <TableCell>
                      {carrier.equipment_types ? (
                        <div className="flex flex-wrap gap-1">
                          {carrier.equipment_types.split(",").map((type, i) => (
                            <Badge key={i} variant="outline" className="bg-slate-50 text-slate-600 border-slate-200 text-xs">
                              {type.trim()}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        {carrier.phone && (
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-blue-600" asChild>
                            <a href={`tel:${carrier.phone}`}>
                              <Phone className="h-4 w-4" />
                            </a>
                          </Button>
                        )}
                        {carrier.email && (
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-blue-600" asChild>
                            <a href={`mailto:${carrier.email}`}>
                              <Mail className="h-4 w-4" />
                            </a>
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-blue-600" onClick={() => handleEdit(carrier)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-red-600" onClick={() => handleDelete(carrier.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
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
