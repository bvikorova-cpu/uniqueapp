import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export type RsvpStatus = "going" | "waitlist" | "declined";

export interface EventRsvp {
  id: string;
  event_id: string;
  user_id: string;
  status: RsvpStatus;
  waitlist_position: number | null;
  created_at: string;
}

export const useEventRsvps = (eventId?: string, capacity?: number) => {
  const qc = useQueryClient();
  const { toast } = useToast();

  const { data: rsvps = [], isLoading } = useQuery({
    queryKey: ["event-rsvps", eventId],
    enabled: !!eventId,
    queryFn: async () => {
      const { data } = await supabase
        .from("event_rsvps" as any)
        .select("*")
        .eq("event_id", eventId)
        .order("created_at", { ascending: true });
      return (data || []) as unknown as EventRsvp[];
    },
  });

  const goingCount = rsvps.filter((r) => r.status === "going").length;
  const waitlistCount = rsvps.filter((r) => r.status === "waitlist").length;

  const setRsvp = useMutation({
    mutationFn: async (status: RsvpStatus) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !eventId) throw new Error("Missing context");

      let finalStatus = status;
      let waitlist_position: number | null = null;

      if (status === "going" && capacity && goingCount >= capacity) {
        finalStatus = "waitlist";
        waitlist_position = waitlistCount + 1;
      }

      const { error } = await supabase.from("event_rsvps" as any).upsert(
        {
          event_id: eventId,
          user_id: user.id,
          status: finalStatus,
          waitlist_position,
        } as any,
        { onConflict: "event_id,user_id" }
      );
      if (error) throw error;
      return finalStatus;
    },
    onSuccess: (finalStatus) => {
      qc.invalidateQueries({ queryKey: ["event-rsvps", eventId] });
      toast({
        title:
          finalStatus === "waitlist"
            ? "Added to waitlist"
            : finalStatus === "going"
            ? "You're going! 🎉"
            : "RSVP updated",
      });
    },
  });

  const cancelRsvp = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !eventId) throw new Error("Missing context");
      const { error } = await supabase
        .from("event_rsvps" as any)
        .delete()
        .eq("event_id", eventId)
        .eq("user_id", user.id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["event-rsvps", eventId] }),
  });

  return { rsvps, isLoading, goingCount, waitlistCount, setRsvp: setRsvp.mutate, cancelRsvp: cancelRsvp.mutate };
};
