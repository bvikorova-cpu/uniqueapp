import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Send, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface Msg { id: string; username: string; message: string; reaction?: string | null; created_at: string; user_id: string; }

const EMOTES = ["🔥", "👏", "💎", "🏆", "💯", "😂", "😱", "💀"];

export const LiveBrandChat = ({ brandId }: { brandId?: string }) => {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [user, setUser] = useState<any>(null);
  const [online, setOnline] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
  }, []);

  useEffect(() => {
    const load = async () => {
      const q = supabase.from("brand_chat_messages").select("*").order("created_at", { ascending: false }).limit(50);
      if (brandId) q.eq("brand_id", brandId);
      const { data } = await q;
      if (data) setMessages([...data].reverse() as any);
    };
    load();

    const channel = supabase.channel(`brand-chat-${brandId ?? "global"}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "brand_chat_messages" }, (payload) => {
        const m = payload.new as any;
        if (brandId && m.brand_id !== brandId) return;
        setMessages(prev => [...prev.slice(-99), m]);
      })
      .on("presence", { event: "sync" }, () => {
        setOnline(Object.keys(channel.presenceState()).length);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED" && user?.id) {
          await channel.track({ user_id: user.id, online_at: new Date().toISOString() });
        }
      });
    return (
    <>
      <FloatingHowItWorks title={"Live Brand Chat - How it works"} steps={[{ title: 'Open', desc: 'Access the Live Brand Chat section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Live Brand Chat.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      
    </>
  ) => { supabase.removeChannel(channel); };
  }, [brandId, user?.id]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const send = async (text: string, reaction?: string) => {
    if (!user) { toast.error("Sign in to chat"); return; }
    if (!text && !reaction) return;
    const username = user.email?.split("@")[0] ?? "Anon";
    await supabase.from("brand_chat_messages").insert({
      user_id: user.id, username, brand_id: brandId ?? null,
      message: text || reaction || "", reaction: reaction ?? null,
    });
    setInput("");
  };

  return (
    <Card className="relative overflow-hidden border-amber-500/30 bg-gradient-to-br from-zinc-950 to-zinc-900 flex flex-col h-[480px]">
      <CardHeader className="relative pb-2 shrink-0">
        <CardTitle className="flex items-center justify-between text-amber-100 text-base">
          <span className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-amber-400" /> Live Brand Chat
          </span>
          <Badge className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px]">
            <Users className="h-3 w-3 mr-1" /> {online || 1} online
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="relative flex-1 flex flex-col gap-2 min-h-0 pb-3">
        <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-1.5 pr-1 scrollbar-thin">
          <AnimatePresence>
            {messages.map(m => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-2 text-sm"
              >
                <span className="font-bold text-amber-300 shrink-0">{m.username}:</span>
                <span className="text-amber-100/90 break-words">
                  {m.reaction && <span className="text-lg mr-1">{m.reaction}</span>}
                  {m.message !== m.reaction && m.message}
                </span>
              </motion.div>
            ))}
            {messages.length === 0 && <p className="text-amber-100/40 text-sm text-center py-8">No messages yet — be the first!</p>}
          </AnimatePresence>
        </div>

        <div className="flex gap-1 shrink-0">
          {EMOTES.map(e => (
            <button
              key={e}
              onClick={() => send("", e)}
              className="h-8 w-8 rounded-lg bg-zinc-900 hover:bg-amber-500/20 border border-amber-500/20 transition-colors"
            >{e}</button>
          ))}
        </div>

        <div className="flex gap-2 shrink-0">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send(input)}
            placeholder={user ? "Message…" : "Sign in to chat"}
            disabled={!user}
            className="bg-zinc-900/80 border-amber-500/20 text-amber-100 placeholder:text-amber-100/30"
          />
          <Button onClick={() => send(input)} disabled={!user || !input} className="bg-amber-500 text-zinc-950 hover:bg-amber-600 border-0">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
