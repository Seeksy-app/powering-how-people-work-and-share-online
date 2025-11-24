import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Calendar, MapPin, Users, Loader2, Pencil, DollarSign } from "lucide-react";
import { EventSponsorshipPackageManager } from "@/components/events/EventSponsorshipPackageManager";

interface Event {
  id: string;
  title: string;
  description: string;
  event_date: string;
  location: string;
  capacity: number;
  is_published: boolean;
  image_url?: string;
  user_id: string;
}

interface Registration {
  id: string;
  attendee_name: string;
  attendee_email: string;
  checked_in: boolean;
  registered_at: string;
}

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [user, setUser] = useState<User | null>(null);
  const [event, setEvent] = useState<Event | null>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  
  const [attendeeName, setAttendeeName] = useState("");
  const [attendeeEmail, setAttendeeEmail] = useState("");

  const isOwner = user?.id === event?.user_id;

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (id) {
      loadEvent();
      if (user && isOwner) {
        loadRegistrations();
      }
    }
  }, [id, user]);

  const loadEvent = async () => {
    try {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      setEvent(data);
    } catch (error: any) {
      toast({
        title: "Error loading event",
        description: error.message,
        variant: "destructive",
      });
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const loadRegistrations = async () => {
    try {
      const { data, error } = await supabase
        .from("event_registrations")
        .select("*")
        .eq("event_id", id)
        .order("registered_at", { ascending: false });

      if (error) throw error;
      setRegistrations(data || []);
    } catch (error: any) {
      console.error("Error loading registrations:", error);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegistering(true);

    try {
      const { error } = await supabase
        .from("event_registrations")
        .insert([
          {
            event_id: id,
            attendee_name: attendeeName,
            attendee_email: attendeeEmail,
          },
        ]);

      if (error) throw error;

      // Send confirmation email
      try {
        await supabase.functions.invoke("send-event-registration-email", {
          body: {
            attendeeName,
            attendeeEmail,
            eventTitle: event?.title,
            eventDate: event?.event_date,
            eventLocation: event?.location,
            eventDescription: event?.description,
            userId: event?.user_id,
            eventId: event?.id,
          },
        });
      } catch (emailError) {
        console.error("Error sending confirmation email:", emailError);
      }

      toast({
        title: "Registration successful!",
        description: "You're all set for this event. Check your email for confirmation.",
      });

      setAttendeeName("");
      setAttendeeEmail("");
      
      if (isOwner) {
        loadRegistrations();
      }
    } catch (error: any) {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setRegistering(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!event) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        {event.image_url && (
          <div className="mb-8 rounded-xl overflow-hidden shadow-soft">
            <img
              src={event.image_url}
              alt={event.title}
              className="w-full h-80 object-cover"
            />
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <div>
              <div className="flex items-start justify-between mb-4">
                <h1 className="text-4xl font-bold">{event.title}</h1>
                {isOwner && (
                  <Button
                    variant="outline"
                    onClick={() => navigate(`/event/${event.id}/edit`)}
                  >
                    <Pencil className="h-4 w-4 mr-2" />
                    Edit Event
                  </Button>
                )}
              </div>
              <p className="text-lg text-muted-foreground">{event.description}</p>
            </div>

            <Card className="p-6 space-y-4">
              <div className="flex items-center gap-3 text-muted-foreground">
                <Calendar className="h-5 w-5" />
                <span>{new Date(event.event_date).toLocaleString()}</span>
              </div>
              
              {event.location && (
                <div className="flex items-center gap-3 text-muted-foreground">
                  <MapPin className="h-5 w-5" />
                  <span>{event.location}</span>
                </div>
              )}
              
              {event.capacity && (
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Users className="h-5 w-5" />
                  <span>
                    {registrations.length} / {event.capacity} registered
                  </span>
                </div>
              )}
            </Card>
          </div>

          <div>
            {event.is_published ? (
              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-4">Register for this event</h3>
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Your Name *</Label>
                    <Input
                      id="name"
                      value={attendeeName}
                      onChange={(e) => setAttendeeName(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Your Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={attendeeEmail}
                      onChange={(e) => setAttendeeEmail(e.target.value)}
                      required
                    />
                  </div>
                  
                  <Button type="submit" className="w-full" disabled={registering}>
                    {registering && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Register Now
                  </Button>
                </form>
              </Card>
            ) : (
              <Card className="p-6 text-center">
                <p className="text-muted-foreground">
                  This event is not yet published.
                </p>
              </Card>
            )}
          </div>
        </div>

        {isOwner && (
          <Tabs defaultValue="registrations" className="mt-8">
            <TabsList>
              <TabsTrigger value="registrations">
                <Users className="h-4 w-4 mr-2" />
                Registrations ({registrations.length})
              </TabsTrigger>
              <TabsTrigger value="sponsorships">
                <DollarSign className="h-4 w-4 mr-2" />
                Sponsorships
              </TabsTrigger>
            </TabsList>

            <TabsContent value="registrations">
              {registrations.length > 0 ? (
                <Card className="p-6">
                  <div className="space-y-2">
                    {registrations.map((reg) => (
                      <div
                        key={reg.id}
                        className="flex items-center justify-between p-4 bg-muted rounded-lg"
                      >
                        <div>
                          <p className="font-medium">{reg.attendee_name}</p>
                          <p className="text-sm text-muted-foreground">{reg.attendee_email}</p>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(reg.registered_at).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </Card>
              ) : (
                <Card className="p-12 text-center">
                  <p className="text-muted-foreground">No registrations yet</p>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="sponsorships">
              <EventSponsorshipPackageManager eventId={event.id} />
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  );
};

export default EventDetail;
