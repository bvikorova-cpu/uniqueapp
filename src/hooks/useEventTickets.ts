import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface EventTicket {
  id: string;
  event_id: string;
  organizer_id: string;
  holder_id: string;
  qr_token: string;
  seat_label: string | null;
  checked_in_at: string | null;
  created_at: string;
}

export const useEventTickets = (eventId?: string, holderId?: string) => {
  const qc = useQueryClient();
  const { toast } = useToast();

  const { data: tickets = [], isLoading } = useQuery({
    queryKey: ["event-tickets", eventId, holderId],
    enabled: !!(eventId || holderId),
    queryFn: async () => {
      let q = supabase.from("event_tickets" as any).select("*");
      if (eventId) q = q.eq("event_id", eventId);
      if (holderId) q = q.eq("holder_id", holderId);
      const { data } = await q.order("created_at", { ascending: false });
      return (data || []) as unknown as EventTicket[];
    },
  });

  const issueTicket = useMutation({
    mutationFn: async ({ organizerId, seatLabel }: { organizerId: string; seatLabel?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !eventId) throw new Error("Missing context");
      const { data, error } = await supabase
        .from("event_tickets" as any)
        .insert({
          event_id: eventId,
          organizer_id: organizerId,
          holder_id: user.id,
          seat_label: seatLabel,
        } as any)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["event-tickets"] });
      toast({ title: "Ticket issued 🎫" });
    },
  });

  const checkIn = useMutation({
    mutationFn: async (ticketId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase
        .from("event_tickets" as any)
        .update({ checked_in_at: new Date().toISOString(), checked_in_by: user.id } as any)
        .eq("id", ticketId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["event-tickets"] });
      toast({ title: "Checked in ✓" });
    },
  });

  return { tickets, isLoading, issueTicket: issueTicket.mutate, checkIn: checkIn.mutate };
};
