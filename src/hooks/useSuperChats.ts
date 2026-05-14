import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface SuperChat {
  id: string;
  stream_id: string;
  sender_id: string;
  amount_cents: number;
  message: string | null;
  highlight_color: string;
  duration_seconds: number;
  created_at: string;
}

const tierColor = (cents: number) => {
  if (cents >= 5000) return "#ef4444";
  if (cents >= 2000) return "#f97316";
  if (cents >= 1000) return "#eab308";
  if (cents >= 500) return "#a855f7";
  return "#3b82f6";
};

export const useSuperChats = (streamId?: string) => {
  const qc = useQueryClient();
  const { toast } = useToast();

  const { data: superChats = [] } = useQuery({
    queryKey: ["super-chats", streamId],
    enabled: !!streamId,
    queryFn: async () => {
      const { data } = await supabase
        .from("live_super_chats" as any)
        .select("*")
        .eq("stream_id", streamId)
        .order("created_at", { ascending: false })
        .limit(50);
      return (data || []) as unknown as SuperChat[];
    },
  });

  const sendSuperChat = useMutation({
    mutationFn: async ({ amountCents, message }: { amountCents: number; message?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !streamId) throw new Error("Missing context");
      const { error } = await supabase.from("live_super_chats" as any).insert({
        stream_id: streamId,
        sender_id: user.id,
        amount_cents: amountCents,
        message,
        highlight_color: tierColor(amountCents),
        duration_seconds: Math.min(300, 30 + Math.floor(amountCents / 100)),
      } as any);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["super-chats", streamId] });
      toast({ title: "Super chat sent! 🎉" });
    },
    onError: (e: any) => toast({ title: "Failed", description: e.message, variant: "destructive" }),
  });

  return { superChats, sendSuperChat: sendSuperChat.mutate };
};
