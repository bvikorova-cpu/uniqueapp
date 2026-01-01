import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar, Plus, MapPin, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { SuggestedEvents } from "@/components/events/SuggestedEvents";
import { CoverImageUpload } from "@/components/shared/CoverImageUpload";
import { Label } from "@/components/ui/label";

export default function WallEvents() {
  const { toast } = useToast();
  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventDescription, setNewEventDescription] = useState("");
  const [newEventLocation, setNewEventLocation] = useState("");
  const [newEventStartTime, setNewEventStartTime] = useState("");
  const [newEventCoverImage, setNewEventCoverImage] = useState<string | undefined>();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const { data: user } = useQuery({
    queryKey: ["current-user"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    },
  });

  const { data: myEvents = [], refetch: refetchEvents } = useQuery({
    queryKey: ["my-events", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data: events } = await supabase
        .from("events")
        .select("*")
        .eq("creator_id", user.id)
        .order("start_time", { ascending: true });

      return events || [];
    },
    enabled: !!user,
  });

  const { data: upcomingEvents = [], refetch: refetchUpcoming } = useQuery({
    queryKey: ["upcoming-events"],
    queryFn: async () => {
      const { data: events } = await supabase
        .from("events")
        .select("*")
        .gte("start_time", new Date().toISOString())
        .order("start_time", { ascending: true })
        .limit(10);

      return events || [];
    },
  });

  const createEvent = async () => {
    if (!user || !newEventTitle.trim() || !newEventStartTime) return;

    try {
      const { error } = await supabase
        .from("events")
        .insert({
          title: newEventTitle,
          description: newEventDescription,
          location: newEventLocation,
          start_time: newEventStartTime,
          end_time: newEventStartTime,
          cover_image: newEventCoverImage || null,
          creator_id: user.id,
        });

      if (error) {
        console.error("Event creation error:", error);
        toast({
          title: "Error",
          description: error.message || "Failed to create event",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Event created successfully!",
      });

      setIsCreateDialogOpen(false);
      setNewEventTitle("");
      setNewEventDescription("");
      setNewEventLocation("");
      setNewEventStartTime("");
      setNewEventCoverImage(undefined);
      refetchEvents();
      refetchUpcoming();
    } catch (error) {
      console.error("Unexpected error:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  const rsvpToEvent = async (eventId: string, status: "going" | "interested") => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("event_attendees")
        .upsert({
          event_id: eventId,
          user_id: user.id,
          status,
        }, {
          onConflict: "event_id,user_id"
        });

      if (error) {
        console.error("RSVP error:", error);
        toast({
          title: "Error",
          description: error.message || "Failed to RSVP",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: `Marked as ${status}`,
      });

      refetchUpcoming();
    } catch (error) {
      console.error("Unexpected error:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 pt-6 pb-8 space-y-6">
      {/* Suggested Events */}
      <SuggestedEvents />

      <Card className="p-6 glass-card">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Calendar className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-semibold">Events</h2>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Event
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Event</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Cover Image</Label>
                  <CoverImageUpload
                    value={newEventCoverImage}
                    onChange={setNewEventCoverImage}
                    folder="events"
                  />
                </div>
                <div>
                  <Label>Event Title</Label>
                  <Input
                    value={newEventTitle}
                    onChange={(e) => setNewEventTitle(e.target.value)}
                    placeholder="Enter event title"
                  />
                </div>
                <div>
                  <Label>Location</Label>
                  <Input
                    value={newEventLocation}
                    onChange={(e) => setNewEventLocation(e.target.value)}
                    placeholder="Add location"
                  />
                </div>
                <div>
                  <Label>Start Time</Label>
                  <Input
                    type="datetime-local"
                    value={newEventStartTime}
                    onChange={(e) => setNewEventStartTime(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={newEventDescription}
                    onChange={(e) => setNewEventDescription(e.target.value)}
                    placeholder="Tell people about this event..."
                    rows={3}
                  />
                </div>
                <Button onClick={createEvent} className="w-full">
                  Create Event
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {myEvents.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">My Events ({myEvents.length})</h3>
            <div className="space-y-4">
              {myEvents.map((event) => (
                <Card 
                  key={event.id} 
                  className="p-4 hover:shadow-md transition-shadow cursor-pointer overflow-hidden"
                  onClick={() => window.location.href = `/wall/events/${event.id}`}
                >
                  <div className="flex gap-4">
                    {event.cover_image ? (
                      <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={event.cover_image}
                          alt={event.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center bg-primary/10 rounded-lg p-3 min-w-[60px]">
                        <div className="text-2xl font-bold text-primary">
                          {format(new Date(event.start_time), "dd")}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {format(new Date(event.start_time), "MMM")}
                        </div>
                      </div>
                    )}
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg">{event.title}</h4>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        <Clock className="h-4 w-4" />
                        <span>{format(new Date(event.start_time), "PPp")}</span>
                      </div>
                      {event.location && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                          <MapPin className="h-4 w-4" />
                          <span>{event.location}</span>
                        </div>
                      )}
                      {event.description && (
                        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                          {event.description}
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        <div>
          <h3 className="text-lg font-semibold mb-4">Upcoming Events</h3>
          <div className="space-y-4">
            {upcomingEvents.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No upcoming events. Create one to get started!</p>
              </div>
            ) : (
              upcomingEvents.map((event) => (
                <Card key={event.id} className="p-4 hover:shadow-md transition-shadow cursor-pointer overflow-hidden">
                  <div className="flex gap-4" onClick={() => window.location.href = `/wall/events/${event.id}`}>
                    {event.cover_image ? (
                      <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={event.cover_image}
                          alt={event.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center bg-primary/10 rounded-lg p-3 min-w-[60px]">
                        <div className="text-2xl font-bold text-primary">
                          {format(new Date(event.start_time), "dd")}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {format(new Date(event.start_time), "MMM")}
                        </div>
                      </div>
                    )}
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg">{event.title}</h4>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        <Clock className="h-4 w-4" />
                        <span>{format(new Date(event.start_time), "PPp")}</span>
                      </div>
                      {event.location && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                          <MapPin className="h-4 w-4" />
                          <span>{event.location}</span>
                        </div>
                      )}
                      {event.description && (
                        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                          {event.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-3">
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            rsvpToEvent(event.id, "going");
                          }}
                        >
                          Going
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            rsvpToEvent(event.id, "interested");
                          }}
                        >
                          Interested
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
