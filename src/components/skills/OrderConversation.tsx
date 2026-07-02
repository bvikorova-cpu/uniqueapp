import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
interface Props {
  offeringId: string;
  orderId?: string;
  otherUserId: string;
}

type Msg = {
  id: string;
  sender_id: string;
  receiver_id: string;
  message: string;
  created_at: string;
};

export default function OrderConversation({ offeringId, orderId, otherUserId }: Props) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [profiles, setProfiles] = useState<Record<string, { full_name: string | null; avatar_url: string | null }>>({});
  const endRef = useRef<HTMLDivElement>(null);

  const load = async () => {
    let q = supabase
      .from("marketplace_responses")
      .select("id,sender_id,receiver_id,message,created_at")
      .order("created_at", { ascending: true });
    if (orderId) q = q.eq("order_id", orderId);
    else q = q.eq("offering_id", offeringId).is("order_id", null);
    const { data } = await q;
    setMessages((data as Msg[]) || []);
  };

  useEffect(() => {
    load();
    if (!orderId && !offeringId) return;
    const ch = supabase
      .channel(`mp-resp-${orderId ?? offeringId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "marketplace_responses" },
        (p: any) => {
          const r = p.new;
          if (orderId ? r.order_id === orderId : r.offering_id === offeringId && !r.order_id) {
            setMessages((prev) => (prev.find((m) => m.id === r.id) ? prev : [...prev, r]));
          }
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [offeringId, orderId]);

  useEffect(() => {
    const ids = [...new Set(messages.map((m) => m.sender_id))];
    if (ids.length === 0) return;
    (async () => {
      const { data } = await supabase.from("profiles").select("id,full_name,avatar_url").in("id", ids);
      const map: any = {};
      (data || []).forEach((p: any) => (map[p.id] = p));
      setProfiles(map);
    })();
  }, [messages]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages.length]);

  const send = async () => {
    if (!user) return;
    const value = text.trim();
    if (value.length < 1) return;
    setSending(true);
    const payload: any = {
      offering_id: offeringId,
      sender_id: user.id,
      receiver_id: otherUserId,
      message: value,
    };
    if (orderId) payload.order_id = orderId;
    const { error } = await supabase.from("marketplace_responses").insert(payload);
    setSending(false);
    if (error) { toast({ title: "Failed", description: error.message, variant: "destructive" }); return; }
    setText("");
  };

  return (
    <>
      <FloatingHowItWorks title="How Order Conversation works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Filter, list, buy, sell or manage.' },
          { title: 'Review results', desc: 'Track progress, orders or messages.' },
          { title: 'Iterate', desc: 'Come back anytime — data is saved.' },
        ]} />
      <div className="space-y-3">
      <div className="border rounded-lg p-3 bg-muted/30 max-h-80 overflow-y-auto space-y-3">
        {messages.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-6">No messages yet. Say hello.</p>
        )}
        {messages.map((m) => {
          const mine = m.sender_id === user?.id;
          const p = profiles[m.sender_id];
          return (
            <div key={m.id} className={`flex gap-2 ${mine ? "flex-row-reverse" : ""}`}>
              <Avatar className="h-7 w-7 flex-shrink-0">
                <AvatarImage src={p?.avatar_url ?? undefined} />
                <AvatarFallback>{(p?.full_name || "U").slice(0, 1).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${mine ? "bg-primary text-primary-foreground" : "bg-card border"}`}>
                <p className="whitespace-pre-wrap">{m.message}</p>
                <p className={`text-[10px] mt-1 ${mine ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                  {formatDistanceToNow(new Date(m.created_at), { addSuffix: true })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>
      <div className="flex gap-2">
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write a message…"
          rows={2}
          maxLength={1000}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); send(); }
          }}
        />
        <Button onClick={send} disabled={sending || !text.trim()} className="self-end gap-2">
          <Send className="h-4 w-4" /> Send
        </Button>
      </div>
    </div>
    </>
    );
}
