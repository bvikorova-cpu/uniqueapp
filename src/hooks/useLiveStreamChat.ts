import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface LiveStreamMessage {
  id: string;
  live_post_id: string;
  user_id: string;
  content: string;
  created_at: string;
}

export function useLiveStreamChat(livePostId: string | null) {
  const [messages, setMessages] = useState<LiveStreamMessage[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (!livePostId) return;
    let cancelled = false;
    (async () => {
      const { data } = await (supabase as any)
        .from("live_stream_messages")
        .select("*")
        .eq("live_post_id", livePostId)
        .order("created_at", { ascending: true })
        .limit(200);
      if (!cancelled) setMessages((data ?? []) as LiveStreamMessage[]);
    })();

    const channel = supabase
      .channel(`live-chat-${livePostId}`)
      .on("postgres_changes", {
        event: "INSERT", schema: "public", table: "live_stream_messages",
        filter: `live_post_id=eq.${livePostId}`,
      }, (payload) => {
        setMessages((prev) => [...prev, payload.new as LiveStreamMessage]);
      })
      .subscribe();

    return () => { cancelled = true; supabase.removeChannel(channel); };
  }, [livePostId]);

  const send = async (content: string) => {
    if (!livePostId || !content.trim()) return;
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) { toast({ title: "Sign in required", variant: "destructive" }); return; }
    const { error } = await (supabase as any).from("live_stream_messages").insert({
      live_post_id: livePostId, user_id: u.user.id, content: content.trim(),
    });
    if (error) toast({ title: "Failed", description: error.message, variant: "destructive" });
  };

  return { messages, send };
}
