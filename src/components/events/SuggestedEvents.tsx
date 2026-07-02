import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, Sparkles, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEvents } from "@/hooks/useEvents";
import { format } from "date-fns";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

export const SuggestedEvents = () => {
  const { attendEvent } = useEvents();

  const { data: suggestedEvents, isLoading } = useQuery({
    queryKey: ["suggested-events"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      let query = supabase
        .from("events")
        .select("*, event_attendees(count)")
        .eq("is_public", true)
        .gte("start_time", new Date().toISOString())
        .order("start_time", { ascending: true })
        .limit(5);

      if (user) {
        // Get events user is already attending
        const { data: userEvents } = await supabase
          .from("event_attendees")
          .select("event_id")
          .eq("user_id", user.id);
        
        const userEventIds = userEvents?.map(e => e.event_id) || [];
        
        if (userEventIds.length > 0) {
          query = query.not("id", "in", `(${userEventIds.join(",")})`);
        }
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  if (isLoading || !suggestedEvents?.length) return null;

  return (
    <>
      <FloatingHowItWorks title={"Suggested Events - How it works"} steps={[{ title: 'Open', desc: 'Access the Suggested Events section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Suggested Events.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="glass-post-card p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-primary" />
        <h3 className="font-semibold">Upcoming Events</h3>
      </div>
      <div className="space-y-3">
        {suggestedEvents.map((event) => (
          <div
            key={event.id}
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
          >
            <div className="w-12 h-12 rounded-lg overflow-hidden bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center flex-shrink-0">
              {event.cover_image ? (
                <img
                  src={event.cover_image}
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Calendar className="h-6 w-6 text-primary" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{event.title}</p>
              <p className="text-xs text-muted-foreground">
                {format(new Date(event.start_time), "MMM d, h:mm a")}
              </p>
              {event.location && (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  <span className="truncate">{event.location}</span>
                </p>
              )}
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => attendEvent({ eventId: event.id, status: "going" })}
            >
              Join
            </Button>
          </div>
        ))}
      </div>
    </div>
    </>
  );
};
