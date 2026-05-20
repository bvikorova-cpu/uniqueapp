import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Header envelope icon that shows unread Messenger messages and links to /messenger.
 */
const MessagesBell = () => {
  const { user } = useAuth();
  const [unread, setUnread] = useState(0);
  const convIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    const loadUnread = async () => {
      const { data: parts } = await supabase
        .from("conversation_participants")
        .select("conversation_id, last_read_at")
        .eq("user_id", user.id);

      if (cancelled || !parts) return;

      convIdsRef.current = new Set(parts.map((p: any) => p.conversation_id));

      let total = 0;
      for (const p of parts as any[]) {
        const q = supabase
          .from("messages")
          .select("id", { count: "exact", head: true })
          .eq("conversation_id", p.conversation_id)
          .neq("sender_id", user.id);
        if (p.last_read_at) q.gt("created_at", p.last_read_at);
        const { count } = await q;
        total += count || 0;
      }
      if (!cancelled) setUnread(total);
    };

    loadUnread();

    let ch: ReturnType<typeof supabase.channel> | null = null;
    try {
      ch = supabase
        .channel(`messages-bell-${user.id}-${Math.random().toString(36).slice(2, 10)}-${Date.now()}`)
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "messages" },
          (payload) => {
            const m: any = payload.new;
            if (!m || m.sender_id === user.id) return;
            if (!convIdsRef.current.has(m.conversation_id)) return;
            setUnread((n) => n + 1);
          },
        )
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "conversation_participants",
            filter: `user_id=eq.${user.id}`,
          },
          () => loadUnread(),
        )
        .subscribe();
    } catch (err) {
      // Realtime channel collision must never crash the navbar
      console.warn("MessagesBell realtime setup failed", err);
    }

    return () => {
      cancelled = true;
      if (ch) {
        try { supabase.removeChannel(ch); } catch {}
      }
    };
  }, [user?.id]);

  if (!user) return null;

  return (
    <Button asChild variant="ghost" size="icon" className="relative" aria-label="Messages">
      <Link to="/messenger">
        <Mail className="h-5 w-5" />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </Link>
    </Button>
  );
};

export default MessagesBell;
