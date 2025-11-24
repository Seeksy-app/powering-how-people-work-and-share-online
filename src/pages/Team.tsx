import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { UserPlus, Trash2, Mail, Loader2, ArrowLeft } from "lucide-react";

type TeamMember = {
  id: string;
  user_id: string;
  role: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
};

type AppRole = "member" | "manager" | "scheduler" | "sales";

export default function Team() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<AppRole>("member");
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [inviting, setInviting] = useState(false);

  useEffect(() => {
    checkAuth();
    loadTeamMembers();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
    }
  };

  const loadTeamMembers = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get the current user's team, create one if it doesn't exist
      let { data: team } = await supabase
        .from("teams")
        .select("id")
        .eq("owner_id", user.id)
        .maybeSingle();

      if (!team) {
        // Create team for this user
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name, username")
          .eq("id", user.id)
          .single();

        const teamName = `${profile?.full_name || profile?.username || 'User'}'s Team`;
        
        const { data: newTeam, error: createError } = await supabase
          .from("teams")
          .insert({
            owner_id: user.id,
            name: teamName,
          })
          .select()
          .single();

        if (createError) throw createError;

        // Add owner as team member
        await supabase
          .from("team_members")
          .insert({
            team_id: newTeam.id,
            user_id: user.id,
            role: 'owner',
          });

        team = newTeam;
      }

      // Get team members from team_members table
      const { data: members, error } = await supabase
        .from("team_members")
        .select(`
          id,
          user_id,
          role,
          joined_at
        `)
        .eq("team_id", team.id);

      if (error) throw error;

      // Get profile info for each member
      if (!members || members.length === 0) {
        setTeamMembers([]);
        setLoading(false);
        return;
      }

      const memberIds = members.map(m => m.user_id);
      
      // Get profiles
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, account_full_name, full_name, username, avatar_url")
        .in("id", memberIds);
      
      // Get emails from auth.users using admin client would require service role
      // For now, we'll fetch from user metadata or leave empty
      const membersWithDetails: TeamMember[] = members.map(member => {
        const profile = profiles?.find(p => p.id === member.user_id);
        
        return {
          id: member.id,
          user_id: member.user_id,
          role: member.role,
          email: "", // Will be populated by edge function if needed
          full_name: profile?.account_full_name || profile?.full_name || profile?.username || null,
          avatar_url: profile?.avatar_url || null,
          created_at: member.joined_at,
        };
      });

      setTeamMembers(membersWithDetails);
    } catch (error) {
      console.error("Error loading team members:", error);
      toast({
        title: "Error",
        description: "Failed to load team members",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async () => {
    if (!inviteEmail) {
      toast({
        title: "Email required",
        description: "Please enter an email address",
        variant: "destructive",
      });
      return;
    }

    setInviting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Get the current user's team
      const { data: team } = await supabase
        .from("teams")
        .select("id")
        .eq("owner_id", user.id)
        .single();

      if (!team) throw new Error("Team not found");

      // Use edge function to handle invitation (since we can't use admin API from client)
      const { data, error } = await supabase.functions.invoke("send-team-invitation", {
        body: {
          invitee_email: inviteEmail,
          role: inviteRole,
          team_id: team.id,
        },
      });

      if (error) throw error;

      if (data.user_exists) {
        toast({
          title: "Member added",
          description: `${inviteEmail} has been added to your team`,
        });
        loadTeamMembers();
      } else {
        toast({
          title: "Invitation sent",
          description: `Invited ${inviteEmail} to join your team`,
        });
      }

      setShowInviteDialog(false);
      setInviteEmail("");
      setInviteRole("member");
    } catch (error) {
      console.error("Error sending invitation:", error);
      toast({
        title: "Error",
        description: "Failed to add team member",
        variant: "destructive",
      });
    } finally {
      setInviting(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    try {
      // Remove from team_members
      const { error } = await supabase
        .from("team_members")
        .delete()
        .eq("id", memberId);

      if (error) throw error;

      toast({
        title: "Member removed",
        description: "Team member has been removed from the team and team chat",
      });

      loadTeamMembers();
    } catch (error) {
      console.error("Error removing member:", error);
      toast({
        title: "Error",
        description: "Failed to remove team member",
        variant: "destructive",
      });
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "manager":
        return "bg-blue-500";
      case "scheduler":
        return "bg-green-500";
      case "sales":
        return "bg-purple-500";
      default:
        return "bg-muted";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Button 
              variant="ghost" 
              onClick={() => navigate('/dashboard')}
              className="mb-2 -ml-2"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h1 className="text-3xl font-bold mb-2">Team Management</h1>
            <p className="text-muted-foreground">
              Invite and manage team members for your creator account
            </p>
          </div>

          <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Invite Member
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite Team Member</DialogTitle>
                <DialogDescription>
                  Send an invitation to join your team
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="member@example.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select value={inviteRole} onValueChange={(value: AppRole) => setInviteRole(value)}>
                    <SelectTrigger id="role">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="member">Member</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="scheduler">Scheduler</SelectItem>
                      <SelectItem value="sales">Sales</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    {inviteRole === "member" && "Basic access to view and create content"}
                    {inviteRole === "manager" && "Can manage content and view analytics"}
                    {inviteRole === "scheduler" && "Can manage schedules and meetings"}
                    {inviteRole === "sales" && "Can view sales data and manage campaigns"}
                  </p>
                </div>
                <Button onClick={handleInvite} disabled={inviting} className="w-full">
                  {inviting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail className="h-4 w-4 mr-2" />
                      Send Invitation
                    </>
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Team Members</CardTitle>
            <CardDescription>
              {teamMembers.length} {teamMembers.length === 1 ? "member" : "members"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {teamMembers.length === 0 ? (
              <div className="text-center py-12">
                <UserPlus className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">No team members yet</h3>
                <p className="text-muted-foreground mb-4">
                  Invite team members to collaborate on your content
                </p>
                <Button onClick={() => setShowInviteDialog(true)}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Invite Your First Member
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teamMembers.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {member.avatar_url ? (
                            <img
                              src={member.avatar_url}
                              alt={member.full_name || "Member"}
                              className="h-8 w-8 rounded-full object-cover"
                            />
                          ) : (
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="text-xs font-medium">
                                {member.full_name?.[0]?.toUpperCase() || member.email[0].toUpperCase()}
                              </span>
                            </div>
                          )}
                          <span className="font-medium">
                            {member.full_name || "Unnamed"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{member.email}</TableCell>
                      <TableCell>
                        <Badge className={getRoleBadgeColor(member.role)}>
                          {member.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(member.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveMember(member.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
