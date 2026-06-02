import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar, Plus, MapPin, Clock, Sparkles, Star, CalendarDays } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { CoverImageUpload } from "@/components/shared/CoverImageUpload";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { SuggestedEvents } from "@/components/events/SuggestedEvents";

export default function WallEvents() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventDescription, setNewEventDescription] = useState("");
  const [newEventLocation, setNewEventLocation] = useState("");
  const [newEventStartTime, setNewEventStartTime] = useState("");
  const [newEventEndTime, setNewEventEndTime] = useState("");
  const [newEventCoverImage, setNewEventCoverImage] = useState<string | undefined>();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const { data: user } = useQuery({
    queryKey: ["current-user"],
    queryFn: async () => { const { data: { user } } = await supabase.auth.getUser(); return user; },
  });

  const { data: myEvents = [], refetch: refetchEvents } = useQuery({
    queryKey: ["my-events", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data: events } = await supabase.from("events").select("*").eq("creator_id", user.id).order("start_time", { ascending: true });
      return events || [];
    },
    enabled: !!user,
  });

  const { data: upcomingEvents = [], refetch: refetchUpcoming } = useQuery({
    queryKey: ["upcoming-events"],
    queryFn: async () => {
      const { data: events } = await supabase.from("events").select("*").gte("start_time", new Date().toISOString()).order("start_time", { ascending: true }).limit(10);
      return events || [];
    },
  });

  const createEvent = async () => {
    if (!user || !newEventTitle.trim() || !newEventStartTime) return;
    const endTime = newEventEndTime || newEventStartTime;
    if (new Date(endTime) < new Date(newEventStartTime)) {
      toast({ title: "Invalid time", description: "End time must be after start time", variant: "destructive" });
      return;
    }
    try {
      const { error } = await supabase.from("events").insert({
        title: newEventTitle, description: newEventDescription, location: newEventLocation,
        start_time: newEventStartTime, end_time: endTime, cover_image: newEventCoverImage || null, creator_id: user.id,
      });
      if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
      toast({ title: "Success", description: "Event created!" });
      setIsCreateDialogOpen(false); setNewEventTitle(""); setNewEventDescription(""); setNewEventLocation(""); setNewEventStartTime(""); setNewEventEndTime(""); setNewEventCoverImage(undefined);
      refetchEvents(); refetchUpcoming();
    } catch { toast({ title: "Error", description: "An unexpected error occurred", variant: "destructive" }); }
  };

  const rsvpToEvent = async (eventId: string, status: "going" | "interested") => {
    if (!user) return;
    const { error } = await supabase.from("event_attendees").upsert({ event_id: eventId, user_id: user.id, status }, { onConflict: "event_id,user_id" });
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: `Marked as ${status}` }); refetchUpcoming();
  };

  const gradients = [
    "from-blue-600 via-indigo-500 to-violet-500",
    "from-purple-600 via-pink-500 to-rose-400",
    "from-emerald-500 via-teal-500 to-cyan-400",
    "from-orange-500 via-amber-500 to-yellow-400",
    "from-primary via-purple-500 to-accent",
  ];

  const EventCard = ({ event, showRsvp = false, index = 0 }: { event: any; showRsvp?: boolean; index?: number }) => {
    const startDate = new Date(event.start_time);
    const grad = gradients[index % gradients.length];
    const isToday = new Date().toDateString() === startDate.toDateString();
    return (
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.06, type: "spring", stiffness: 200 }} whileHover={{ y: -2 }}>
        <Card className="group overflow-hidden border-border/40 bg-card/80 backdrop-blur-sm hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 cursor-pointer"
          onClick={() => navigate(`/wall/events/${event.id}`)}>
          <div className="flex">
            {event.cover_image ? (
              <div className="w-28 sm:w-36 shrink-0 relative overflow-hidden">
                <img src={event.cover_image} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
              </div>
            ) : (
              <div className={`w-24 sm:w-28 shrink-0 bg-gradient-to-br ${grad} flex flex-col items-center justify-center text-white p-3 relative overflow-hidden`}>
                <span className="text-3xl font-black relative z-10">{format(startDate, "dd")}</span>
                <span className="text-sm font-bold uppercase relative z-10">{format(startDate, "MMM")}</span>
                {isToday && <Badge className="mt-1 bg-white/20 text-white border-0 text-[9px] px-1.5">TODAY</Badge>}
              </div>
            )}
            <CardContent className="flex-1 p-4">
              <h4 className="font-black text-base group-hover:text-primary transition-colors line-clamp-1">{event.title}</h4>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1.5">
                <Clock className="h-3.5 w-3.5 text-primary/60" />
                <span>{format(startDate, "EEE, MMM d · h:mm a")}</span>
              </div>
              {event.location && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                  <MapPin className="h-3.5 w-3.5 text-accent/60" />
                  <span className="truncate">{event.location}</span>
                </div>
              )}
              {event.description && <p className="text-xs text-muted-foreground mt-2 line-clamp-2 leading-relaxed">{event.description}</p>}
              {showRsvp && (
                <div className="flex items-center gap-2 mt-3">
                  <Button size="sm" className="text-xs bg-gradient-to-r from-primary to-accent text-white hover:opacity-90 shadow-lg shadow-primary/20 active:scale-95"
                    onClick={(e) => { e.stopPropagation(); rsvpToEvent(event.id, "going"); }}>✓ Going</Button>
                  <Button variant="outline" size="sm" className="text-xs hover:border-primary/30"
                    onClick={(e) => { e.stopPropagation(); rsvpToEvent(event.id, "interested"); }}>
                    <Star className="w-3 h-3 mr-1" /> Interested
                  </Button>
                </div>
              )}
            </CardContent>
          </div>
        </Card>
      </motion.div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto px-4 pt-6 pb-8 space-y-6">
      {/* Hero Banner */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500/15 via-primary/10 to-accent/5 border border-primary/20 p-6 sm:p-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-primary/15 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <motion.div className="p-4 rounded-2xl bg-gradient-to-br from-primary to-accent shadow-xl shadow-primary/30" whileHover={{ rotate: 5, scale: 1.05 }}>
              <CalendarDays className="h-7 w-7 text-white" />
            </motion.div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">Events</h1>
              <p className="text-sm text-muted-foreground mt-0.5">Discover & create events in your community</p>
            </div>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-primary to-accent text-white hover:opacity-90 gap-2 shadow-xl shadow-primary/25 active:scale-[0.97]">
                <Plus className="h-4 w-4" /> Create Event
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto border-primary/20">
              <DialogHeader><DialogTitle className="flex items-center gap-2 text-lg"><Sparkles className="w-5 h-5 text-primary" /> Create New Event</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div><Label>Cover Image</Label><CoverImageUpload value={newEventCoverImage} onChange={setNewEventCoverImage} folder="events" /></div>
                <div><Label>Event Title</Label><Input value={newEventTitle} onChange={(e) => setNewEventTitle(e.target.value)} placeholder="Enter event title" /></div>
                <div><Label>Location</Label><Input value={newEventLocation} onChange={(e) => setNewEventLocation(e.target.value)} placeholder="Add location" /></div>
                <div><Label>Start Time</Label><Input type="datetime-local" value={newEventStartTime} onChange={(e) => setNewEventStartTime(e.target.value)} /></div>
                <div><Label>End Time</Label><Input type="datetime-local" value={newEventEndTime} onChange={(e) => setNewEventEndTime(e.target.value)} min={newEventStartTime || undefined} /></div>
                <div><Label>Description</Label><Textarea value={newEventDescription} onChange={(e) => setNewEventDescription(e.target.value)} placeholder="Tell people about this event..." rows={3} /></div>
                <Button onClick={createEvent} className="w-full bg-gradient-to-r from-primary to-accent text-white shadow-lg">Create Event</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <div className="relative flex items-center gap-6 mt-6">
          {[
            { icon: <Star className="w-4 h-4" />, label: "My Events", value: myEvents.length },
            { icon: <Calendar className="w-4 h-4" />, label: "Upcoming", value: upcomingEvents.length },
          ].map((stat, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.1 }} className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-primary/10 text-primary">{stat.icon}</div>
              <div>
                <p className="text-lg font-black">{stat.value}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* AI Suggested Events */}
      <SuggestedEvents />

      {/* My Events */}
      {myEvents.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Star className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-black">My Events</h2>
            <Badge variant="secondary" className="text-xs bg-primary/10 text-primary border-0">{myEvents.length}</Badge>
          </div>
          <div className="space-y-3">
            {myEvents.map((event, i) => <EventCard key={event.id} event={event} index={i} />)}
          </div>
        </section>
      )}

      {/* Upcoming */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-accent" />
          <h2 className="text-lg font-black">Upcoming Events</h2>
        </div>
        {upcomingEvents.length === 0 ? (
          <Card className="border-dashed border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-background to-accent/5 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 rounded-full blur-3xl" />
            <CardContent className="py-16 text-center relative">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }} className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mx-auto mb-5">
                <CalendarDays className="h-10 w-10 text-primary" />
              </motion.div>
              <h3 className="text-xl font-black mb-2">No upcoming events</h3>
              <p className="text-sm text-muted-foreground mb-5">Create an event and invite your community!</p>
              <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2 bg-gradient-to-r from-primary to-accent text-white shadow-lg">
                <Plus className="w-4 h-4" /> Create Event
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {upcomingEvents.map((event, i) => <EventCard key={event.id} event={event} showRsvp index={i} />)}
          </div>
        )}
      </section>
    </div>
  );
}
