import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Send, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

type Msg = { id: string; user_id: string; display_name: string; body: string; created_at: string };

const MegatalentLiveChat = ({ category, userId }: { category?: string; userId: string | null }) => {
  const cat = category || "global";
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [online, setOnline] = useState(0);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [myName, setMyName] = useState<string>("Guest");
  const endRef = useRef<HTMLDivElement>(null);

  // Load name
  useEffect(() => {
    if (!userId) { setMyName("Guest"); return; }
    (supabase as any).from("profiles_public").select("full_name").eq("id", userId).maybeSingle()
      .then(({ data }) => setMyName(data?.full_name || "User"));
  }, [userId]);

  // Initial fetch + realtime
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    supabase.from("talent_chat_messages").select("*")
      .eq("category", cat).order("created_at", { ascending: false }).limit(50)
      .then(({ data }) => {
        if (!mounted) return;
        setMsgs(((data as Msg[]) || []).reverse());
        setLoading(false);
      });

    const ch = supabase
      .channel(`chat:${cat}`, { config: { presence: { key: userId || crypto.randomUUID() } } })
      .on("postgres_changes",
        { event: "INSERT", schema: "public", table: "talent_chat_messages", filter: `category=eq.${cat}` },
        (payload) => setMsgs((prev) => [...prev.slice(-100), payload.new as Msg])
      )
      .on("presence", { event: "sync" }, () => {
        setOnline(Object.keys(ch.presenceState()).length);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await ch.track({ at: Date.now(), name: myName });
        }
      });

    return () => { mounted = false; supabase.removeChannel(ch); };
  }, [cat, userId, myName]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs.length]);

  const send = async () => {
    const body = text.trim();
    if (!body) return;
    if (!userId) { toast.error("Login required to chat"); return; }
    setSending(true);
    const { error } = await supabase.from("talent_chat_messages")
      .insert({ category: cat, user_id: userId, display_name: myName, body });
    setSending(false);
    if (error) { toast.error("Send failed", { description: error.message }); return; }
    setText("");
  };

  return (
    <Card className="overflow-hidden backdrop-blur-xl bg-card/70 border-border/30">
      <CardContent className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <MessageCircle className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-bold">Live Chat</h3>
          <Badge variant="secondary" className="ml-auto gap-1">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> {online} online
          </Badge>
        </div>
        <div className="h-56 overflow-y-auto rounded-lg border border-border/40 bg-background/40 p-2 space-y-1 mb-2">
          {loading ? (
            <div className="h-full flex items-center justify-center text-muted-foreground text-sm gap-2">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading messages…
            </div>
          ) : msgs.length === 0 ? (
            <div className="h-full flex items-center justify-center text-muted-foreground text-xs">No messages yet — be the first!</div>
          ) : (
            <AnimatePresence initial={false}>
              {msgs.map((m) => (
                <motion.div key={m.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="text-xs flex gap-2">
                  <span className={`font-semibold shrink-0 ${m.user_id === userId ? "text-accent" : "text-primary"}`}>{m.display_name}:</span>
                  <span className="text-muted-foreground break-words">{m.body}</span>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
          <div ref={endRef} />
        </div>
        <div className="flex gap-2">
          <Input value={text} onChange={(e) => setText(e.target.value)} placeholder={userId ? "Say something…" : "Login to chat"}
            onKeyDown={(e) => e.key === "Enter" && send()} className="text-sm" disabled={!userId || sending} maxLength={500} />
          <Button size="sm" onClick={send} disabled={!text.trim() || !userId || sending}>
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default MegatalentLiveChat;
