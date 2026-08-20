import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarDays, MapPin, Users, Check, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface PostEventCardProps {
  eventId: string;
}

const fmt = (iso: string) =>
  new Date(iso).toLocaleString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit" });

/**
 * Real event card rendered inside a post: date, place, capacity and
 * working Going / Can't go RSVP (event_attendees).
 */
export const PostEventCard = ({ eventId }: PostEventCardProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data } = useQuery({
    queryKey: ["post-event", eventId],
    queryFn: async () => {
      const [{ data: event }, { data: attendees }] = await Promise.all([
        supabase.from("events").select("*").eq("id", eventId).maybeSingle(),
        supabase.from("event_attendees").select("user_id, status").eq("event_id", eventId) ]);
      return { event, attendees: attendees || [] };
    } });

  const event = data?.event as any;
  if (!event) return null;

  const going = (data?.attendees || []).filter((a: any) => a.status === "going");
  const mine = (data?.attendees || []).find((a: any) => a.user_id === user?.id) as any;
  const full = event.max_attendees ? going.length >= event.max_attendees : false;

  const rsvp = async (status: "going" | "declined") => {
    if (!user) {
      toast({ title: "Sign in to RSVP", variant: "destructive" });
      return;
    }
    if (status === "going" && full && mine?.status !== "going") {
      toast({ title: "Event is full", variant: "destructive" });
      return;
    }
    const { error } = await supabase
      .from("event_attendees")
      .upsert({ event_id: eventId, user_id: user.id, status }, { onConflict: "event_id,user_id" });
    if (error) {
      toast({ title: "RSVP failed", description: error.message, variant: "destructive" });
      return;
    }
    qc.invalidateQueries({ queryKey: ["post-event", eventId] });
    toast({ title: status === "going" ? "You're going! 🎉" : "RSVP updated" });
  };

  return (
    <div className="mt-3 rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5 overflow-hidden">
      {event.cover_image && (
        <img src={event.cover_image} alt={event.title} loading="lazy" className="w-full h-40 object-cover" />
      )}
      <div className="p-4 space-y-3">
        <div className="flex items-start gap-3">
          <div className="shrink-0 w-11 h-11 rounded-xl bg-primary/10 flex flex-col items-center justify-center leading-none">
            <span className="text-[10px] uppercase text-primary font-semibold">
              {new Date(event.start_time).toLocaleString(undefined, { month: "short" })}
            </span>
            <span className="text-base font-black text-primary">
              {new Date(event.start_time).getDate()}
            </span>
          </div>
          <div className="min-w-0">
            <h4 className="font-semibold truncate">{event.title}</h4>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <CalendarDays className="w-3 h-3" /> {fmt(event.start_time)}
            </p>
            {event.location && (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <MapPin className="w-3 h-3" /> {event.location}
              </p>
            )}
          </div>
        </div>

        {event.description && (
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">{event.description}</p>
        )}

        <div className="flex items-center justify-between gap-2 flex-wrap">
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Users className="w-3 h-3" />
            {going.length} going{event.max_attendees ? ` / ${event.max_attendees}` : ""}
          </span>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={mine?.status === "going" ? "default" : "outline"}
              onClick={() => rsvp("going")}
            >
              <Check className="w-3.5 h-3.5 mr-1" /> Going
            </Button>
            <Button
              size="sm"
              variant={mine?.status === "declined" ? "secondary" : "ghost"}
              onClick={() => rsvp("declined")}
            >
              <X className="w-3.5 h-3.5 mr-1" /> Can't go
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
