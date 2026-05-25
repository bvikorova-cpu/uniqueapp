import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Event {
  id: string;
  creator_id: string;
  title: string;
  description: string | null;
  location: string | null;
  start_time: string;
  end_time: string;
  cover_image: string | null;
  is_public: boolean;
  max_attendees: number | null;
  created_at: string;
}

export const useEvents = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: events, isLoading } = useQuery({
    queryKey: ["events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*, event_attendees(count)")
        .eq("is_public", true)
        .gte("end_time", new Date().toISOString())
        .order("start_time", { ascending: true });
      if (error) throw error;

      const creatorIds = Array.from(new Set((data || []).map((e: any) => e.creator_id).filter(Boolean)));
      let profilesById: Record<string, any> = {};
      if (creatorIds.length > 0) {
        const { data: profs } = await (supabase as any)
          .from("profiles_public")
          .select("id, full_name, avatar_url, username")
          .in("id", creatorIds);
        profilesById = Object.fromEntries((profs || []).map((p: any) => [p.id, p]));
      }
      return (data || []).map((e: any) => ({ ...e, profiles: profilesById[e.creator_id] || null }));
    },
  });

  const createEvent = useMutation({
    mutationFn: async (eventData: Omit<Event, "id" | "creator_id" | "created_at">) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("events").insert({
        ...eventData,
        creator_id: user.id,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      toast({ title: "Event created!" });
    },
  });

  const attendEvent = useMutation({
    mutationFn: async ({ eventId, status }: { eventId: string; status: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("event_attendees").upsert({
        event_id: eventId,
        user_id: user.id,
        status,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      toast({ title: "RSVP updated!" });
    },
  });

  return {
    events: events || [],
    isLoading,
    createEvent: createEvent.mutate,
    attendEvent: attendEvent.mutate,
  };
};
