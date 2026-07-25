import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ShieldAlert } from "lucide-react";

interface Props {
  streamId: string;
  userId: string | null;
}

export function ChatMuteBanner({ streamId, userId }: Props) {
  const [mutedUntil, setMutedUntil] = useState<Date | null>(null);
  const [reason, setReason] = useState<string>("");
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;

    const load = async () => {
      const { data } = await supabase
        .from("stream_chat_timeouts")
        .select("muted_until, reason")
        .eq("stream_id", streamId)
        .eq("user_id", userId)
        .maybeSingle();
      if (cancelled) return;
      if (data && new Date(data.muted_until).getTime() > Date.now()) {
        setMutedUntil(new Date(data.muted_until));
        setReason(data.reason);
      } else {
        setMutedUntil(null);
      }
    };

    load();
    const poll = setInterval(load, 15000);
    const tick = setInterval(() => setNow(Date.now()), 1000);

    const channel = supabase
      .channel(`chat-timeout-${streamId}-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "stream_chat_timeouts",
          filter: `user_id=eq.${userId}`,
        },
        () => load()
      )
      .subscribe();

    return () => {
      cancelled = true;
      clearInterval(poll);
      clearInterval(tick);
      supabase.removeChannel(channel);
    };
  }, [streamId, userId]);

  if (!mutedUntil) return null;
  const remainingSec = Math.max(0, Math.round((mutedUntil.getTime() - now) / 1000));
  if (remainingSec === 0) return null;

  const mins = Math.floor(remainingSec / 60);
  const secs = remainingSec % 60;

  return (
    <Alert variant="destructive" className="mb-2">
      <ShieldAlert className="h-4 w-4" />
      <AlertDescription>
        You are muted in this chat ({reason}). Try again in{" "}
        <strong>
          {mins}:{secs.toString().padStart(2, "0")}
        </strong>
        .
      </AlertDescription>
    </Alert>
  );
}
