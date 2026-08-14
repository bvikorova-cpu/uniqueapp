import { useEffect } from "react";
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
        .eq("status", "paid")
        .order("created_at", { ascending: false })
        .limit(50);
      return (data || []) as unknown as SuperChat[];
    } });

  // Verify a returned Stripe Checkout session (fallback to the webhook).
  useEffect(() => {
    if (!streamId) return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("super_chat") !== "success") return;
    const sessionId = params.get("session_id");
    if (!sessionId) return;
    (async () => {
      try {
        await supabase.functions.invoke("create-checkout", {
          body: { product: "super_chat", action: "verify", streamId, amountCents: 100, sessionId } });
        toast({ title: "Super Chat sent! 🎉" });
        qc.invalidateQueries({ queryKey: ["super-chats", streamId] });
      } catch {
        /* webhook will settle it */
      }
      params.delete("super_chat");
      params.delete("session_id");
      const url = `${window.location.pathname}${params.toString() ? `?${params}` : ""}`;
      window.history.replaceState({}, "", url);
    })();
  }, [streamId, qc, toast]);

  const sendSuperChat = useMutation({
    mutationFn: async ({ amountCents, message }: { amountCents: number; message?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Please sign in to send a Super Chat");
      if (!streamId) throw new Error("Missing stream");
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { product: "super_chat", streamId, amountCents, message } });
      if (error) throw error;
      const url = (data as any)?.url;
      if (!url) throw new Error((data as any)?.error || "Could not start checkout");
      window.location.href = url;
    },
    onError: (e: any) => toast({ title: "Payment failed", description: e.message, variant: "destructive" }) });

  return { superChats, sendSuperChat: sendSuperChat.mutate, isSending: sendSuperChat.isPending };
};
