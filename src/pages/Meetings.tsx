import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Calendar, Clock, MapPin, Plus, Users, Link as LinkIcon, Settings, Search, Filter, X, CalendarClock, Ban, Send } from "lucide-react";
import { format, parseISO } from "date-fns";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { SendInviteDialog } from "@/components/SendInviteDialog";


const Meetings = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");
  
  // Dialog states
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [rescheduleDialogOpen, setRescheduleDialogOpen] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<any>(null);
  const [newStartTime, setNewStartTime] = useState("");
  const [newEndTime, setNewEndTime] = useState("");
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [selectedMeetingType, setSelectedMeetingType] = useState<{ id: string; name: string } | null>(null);

  const { data: meetings, isLoading } = useQuery({
    queryKey: ["meetings"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("meetings")
        .select("*")
        .eq("user_id", user.id)
        .order("start_time", { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  const { data: meetingTypes, isLoading: typesLoading } = useQuery({
    queryKey: ["meeting_types"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("meeting_types")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", user.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
  });

  const now = new Date();
  const upcomingMeetings = meetings?.filter(m => new Date(m.start_time) >= now) || [];
  const pastMeetings = meetings?.filter(m => new Date(m.start_time) < now) || [];

  // Cancel meeting mutation
  const cancelMutation = useMutation({
    mutationFn: async (meetingId: string) => {
      const { error } = await supabase
        .from("meetings")
        .update({ status: "cancelled" })
        .eq("id", meetingId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meetings"] });
      toast.success("Meeting cancelled successfully");
      setCancelDialogOpen(false);
      setSelectedMeeting(null);
    },
    onError: (error: any) => {
      toast.error("Failed to cancel meeting: " + error.message);
    },
  });

  // Reschedule meeting mutation
  const rescheduleMutation = useMutation({
    mutationFn: async ({ meetingId, startTime, endTime }: { meetingId: string; startTime: string; endTime: string }) => {
      const { error } = await supabase
        .from("meetings")
        .update({ 
          start_time: startTime,
          end_time: endTime,
        })
        .eq("id", meetingId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meetings"] });
      toast.success("Meeting rescheduled successfully");
      setRescheduleDialogOpen(false);
      setSelectedMeeting(null);
      setNewStartTime("");
      setNewEndTime("");
    },
    onError: (error: any) => {
      toast.error("Failed to reschedule meeting: " + error.message);
    },
  });

  // Filter meetings based on search and filters
  const filterMeetings = (meetingsList: any[]) => {
    return meetingsList.filter(meeting => {
      const matchesSearch = searchQuery === "" || 
        meeting.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        meeting.attendee_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        meeting.attendee_email.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || meeting.status === statusFilter;
      
      const meetingDate = new Date(meeting.start_time);
      const matchesDate = dateFilter === "all" || 
        (dateFilter === "upcoming" && meetingDate >= now) ||
        (dateFilter === "past" && meetingDate < now) ||
        (dateFilter === "today" && meetingDate.toDateString() === now.toDateString()) ||
        (dateFilter === "week" && meetingDate <= new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000));
      
      return matchesSearch && matchesStatus && matchesDate;
    });
  };

  const handleCancelMeeting = (meeting: any) => {
    setSelectedMeeting(meeting);
    setCancelDialogOpen(true);
  };

  const handleRescheduleMeeting = (meeting: any) => {
    setSelectedMeeting(meeting);
    setNewStartTime(meeting.start_time);
    setNewEndTime(meeting.end_time);
    setRescheduleDialogOpen(true);
  };

  const confirmCancel = () => {
    if (selectedMeeting) {
      cancelMutation.mutate(selectedMeeting.id);
    }
  };

  const confirmReschedule = () => {
    if (selectedMeeting && newStartTime && newEndTime) {
      rescheduleMutation.mutate({
        meetingId: selectedMeeting.id,
        startTime: newStartTime,
        endTime: newEndTime,
      });
    }
  };

  const MeetingCard = ({ meeting, showActions = false }: { meeting: any; showActions?: boolean }) => {
    const isCancelled = meeting.status === "cancelled";
    const isPast = new Date(meeting.start_time) < now;
    
    return (
      <Card className={`hover:shadow-lg transition-all duration-200 ${!isCancelled && 'hover:scale-[1.02]'} ${isCancelled && 'opacity-60'}`}>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <CardTitle className="text-xl">{meeting.title}</CardTitle>
                {isCancelled && (
                  <Badge variant="destructive">Cancelled</Badge>
                )}
                {meeting.status === "scheduled" && !isPast && (
                  <Badge variant="default">Scheduled</Badge>
                )}
                {meeting.status === "completed" && (
                  <Badge variant="secondary">Completed</Badge>
                )}
              </div>
              {meeting.description && (
                <CardDescription className="mt-2">{meeting.description}</CardDescription>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>{format(new Date(meeting.start_time), "EEEE, MMMM d, yyyy")}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>
              {format(new Date(meeting.start_time), "h:mm a")} - {format(new Date(meeting.end_time), "h:mm a")}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span className="capitalize">{meeting.location_type}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="w-4 h-4" />
            <span>{meeting.attendee_name} ({meeting.attendee_email})</span>
          </div>
          
          {showActions && !isCancelled && (
            <div className="pt-4 border-t flex gap-2">
              {!isPast && (
                <>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="flex-1 gap-2"
                    onClick={() => handleRescheduleMeeting(meeting)}
                  >
                    <CalendarClock className="w-4 h-4" />
                    Reschedule
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    className="flex-1 gap-2"
                    onClick={() => handleCancelMeeting(meeting)}
                  >
                    <Ban className="w-4 h-4" />
                    Cancel
                  </Button>
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const MeetingTypeCard = ({ type }: { type: any }) => {
    const bookingUrl = `${window.location.origin}/book/${profile?.username}/${type.id}`;
    
    return (
      <Card className="hover:shadow-lg transition-all duration-200">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <CardTitle className="text-xl">{type.name}</CardTitle>
                {type.is_active ? (
                  <Badge variant="default">Active</Badge>
                ) : (
                  <Badge variant="secondary">Inactive</Badge>
                )}
              </div>
              {type.description && (
                <CardDescription>{type.description}</CardDescription>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>{type.duration} minutes</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span className="capitalize">{type.location_type}</span>
          </div>
          
          <div className="pt-4 border-t space-y-2">
            <Button 
              variant="outline" 
              className="w-full gap-2"
              onClick={() => {
                setSelectedMeetingType({ id: type.id, name: type.name });
                setInviteDialogOpen(true);
              }}
              disabled={!type.is_active}
            >
              <Send className="w-4 h-4" />
              Send Invite
            </Button>
            <Button 
              variant="outline" 
              className="w-full gap-2"
              onClick={async () => {
                const bookingUrl = `${window.location.origin}/book/${profile?.username}/${type.id}`;
                await navigator.clipboard.writeText(bookingUrl);
                toast.success("Booking link copied to clipboard!");
              }}
            >
              <LinkIcon className="w-4 h-4" />
              Copy Booking Link
            </Button>
            <Button 
              variant="outline" 
              className="w-full gap-2"
              onClick={() => navigate(`/meeting-types`)}
            >
              <Settings className="w-4 h-4" />
              Manage Types
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground flex items-center gap-3">
              <Calendar className="w-10 h-10 text-primary" />
              Meetings
            </h1>
            <p className="text-muted-foreground mt-2">
              View and manage all your scheduled meetings
            </p>
          </div>
          <div className="flex gap-2">
            {profile?.username && (
              <Button 
                onClick={() => window.open(`/book/${profile.username}`, '_blank')} 
                variant="secondary" 
                className="gap-2"
              >
                <LinkIcon className="w-4 h-4" />
                View Booking Page
              </Button>
            )}
            <Button onClick={() => navigate("/meeting-types/create")} variant="outline" className="gap-2">
              <Settings className="w-4 h-4" />
              Create Meeting Type
            </Button>
            <Button onClick={() => navigate("/meetings/create")} className="gap-2">
              <Plus className="w-4 h-4" />
              Schedule Meeting
            </Button>
          </div>
        </div>

        <Tabs defaultValue="types" className="w-full">
          <TabsList className="grid w-full max-w-3xl grid-cols-4">
            <TabsTrigger value="types">
              Meeting Types ({meetingTypes?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="upcoming">
              Upcoming ({upcomingMeetings.length})
            </TabsTrigger>
            <TabsTrigger value="past">
              Past ({pastMeetings.length})
            </TabsTrigger>
            <TabsTrigger value="all">
              All Meetings ({meetings?.length || 0})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="types" className="mt-6">
            {typesLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="h-72 animate-pulse bg-muted/20" />
                ))}
              </div>
            ) : !meetingTypes || meetingTypes.length === 0 ? (
              <Card className="p-12 text-center">
                <Settings className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No meeting types yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create meeting types that people can book with you
                </p>
                <Button onClick={() => navigate("/meeting-types/create")}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Meeting Type
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {meetingTypes.map((type) => (
                  <MeetingTypeCard key={type.id} type={type} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="upcoming" className="mt-6">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="h-64 animate-pulse bg-muted/20" />
                ))}
              </div>
            ) : upcomingMeetings.length === 0 ? (
              <Card className="p-12 text-center">
                <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No upcoming meetings</h3>
                <p className="text-muted-foreground mb-4">
                  Schedule your first meeting to get started
                </p>
                <Button onClick={() => navigate("/meetings/create")}>
                  <Plus className="w-4 h-4 mr-2" />
                  Schedule Meeting
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {upcomingMeetings.map((meeting) => (
                  <MeetingCard key={meeting.id} meeting={meeting} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="past" className="mt-6">
            {pastMeetings.length === 0 ? (
              <Card className="p-12 text-center">
                <Clock className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No past meetings</h3>
                <p className="text-muted-foreground">
                  Your completed meetings will appear here
                </p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pastMeetings.map((meeting) => (
                  <MeetingCard key={meeting.id} meeting={meeting} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="all" className="mt-6">
            {/* Filters and Search */}
            <div className="mb-6 space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by title, attendee name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                  {searchQuery && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1/2 transform -translate-y-1/2"
                      onClick={() => setSearchQuery("")}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Date Range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">Next 7 Days</SelectItem>
                    <SelectItem value="upcoming">Upcoming</SelectItem>
                    <SelectItem value="past">Past</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {(searchQuery || statusFilter !== "all" || dateFilter !== "all") && (
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Showing {filterMeetings(meetings || []).length} of {meetings?.length || 0} meetings
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSearchQuery("");
                      setStatusFilter("all");
                      setDateFilter("all");
                    }}
                  >
                    Clear Filters
                  </Button>
                </div>
              )}
            </div>

            {/* Meetings List */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="h-64 animate-pulse bg-muted/20" />
                ))}
              </div>
            ) : !meetings || meetings.length === 0 ? (
              <Card className="p-12 text-center">
                <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No meetings yet</h3>
                <p className="text-muted-foreground mb-4">
                  Your scheduled meetings will appear here
                </p>
                <Button onClick={() => navigate("/meetings/create")}>
                  <Plus className="w-4 h-4 mr-2" />
                  Schedule Meeting
                </Button>
              </Card>
            ) : filterMeetings(meetings).length === 0 ? (
              <Card className="p-12 text-center">
                <Search className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No meetings found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search or filters
                </p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filterMeetings(meetings).map((meeting) => (
                  <MeetingCard key={meeting.id} meeting={meeting} showActions={true} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Cancel Dialog */}
        <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Cancel Meeting</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to cancel this meeting with {selectedMeeting?.attendee_name}? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Keep Meeting</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmCancel}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Cancel Meeting
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Reschedule Dialog */}
        <Dialog open={rescheduleDialogOpen} onOpenChange={setRescheduleDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reschedule Meeting</DialogTitle>
              <DialogDescription>
                Update the meeting time with {selectedMeeting?.attendee_name}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="start-time">Start Time</Label>
                <Input
                  id="start-time"
                  type="datetime-local"
                  value={newStartTime ? format(parseISO(newStartTime), "yyyy-MM-dd'T'HH:mm") : ""}
                  onChange={(e) => setNewStartTime(new Date(e.target.value).toISOString())}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end-time">End Time</Label>
                <Input
                  id="end-time"
                  type="datetime-local"
                  value={newEndTime ? format(parseISO(newEndTime), "yyyy-MM-dd'T'HH:mm") : ""}
                  onChange={(e) => setNewEndTime(new Date(e.target.value).toISOString())}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setRescheduleDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={confirmReschedule}>
                Reschedule Meeting
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Send Invite Dialog */}
        {selectedMeetingType && (
          <SendInviteDialog
            open={inviteDialogOpen}
            onOpenChange={setInviteDialogOpen}
            meetingTypeId={selectedMeetingType.id}
            meetingTypeName={selectedMeetingType.name}
          />
        )}
      </div>
    </div>
  );
};

export default Meetings;
