import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, MessageCircle } from "lucide-react";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
const EMOJIS = ["🔥", "👏", "😱", "🤯", "💪", "🎯", "🤡", "👑"];

interface ChatMsg {
  id: string;
  user_id: string;
  name: string;
  text: string;
  ts: number;
}

interface FloatingEmoji {
  id: string;
  emoji: string;
  x: number;
}

/**
 * Lightweight realtime spectator chat + emoji reactions for an IQ duel.
 * Uses Supabase broadcast (no DB writes) — scoped per duel id.
 */
export default function IQDuelChat({
  duelId,
  myUserId,
  myName,
}: {
  duelId: string;
  myUserId: string;
  myName: string;
}) {
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [floats, setFloats] = useState<FloatingEmoji[]>([]);
  const [text, setText] = useState("");
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const ch = supabase.channel(`duel-chat:${duelId}`, {
      config: { broadcast: { self: true } },
    });
    ch.on("broadcast", { event: "msg" }, ({ payload }) => {
      setMessages((m) => [...m.slice(-49), payload as ChatMsg]);
    });
    ch.on("broadcast", { event: "emoji" }, ({ payload }) => {
      const fe: FloatingEmoji = {
        id: crypto.randomUUID(),
        emoji: (payload as { emoji: string }).emoji,
        x: Math.random() * 80 + 10,
      };
      setFloats((f) => [...f, fe]);
      setTimeout(() => setFloats((f) => f.filter((x) => x.id !== fe.id)), 2200);
    });
    ch.subscribe();
    channelRef.current = ch;
    return () => {
      supabase.removeChannel(ch);
      channelRef.current = null;
    };
  }, [duelId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const send = () => {
    const trimmed = text.trim().slice(0, 200);
    if (!trimmed || !channelRef.current) return;
    channelRef.current.send({
      type: "broadcast",
      event: "msg",
      payload: {
        id: crypto.randomUUID(),
        user_id: myUserId,
        name: myName || "Spectator",
        text: trimmed,
        ts: Date.now(),
      } satisfies ChatMsg,
    });
    setText("");
  };

  const sendEmoji = (emoji: string) => {
    channelRef.current?.send({
      type: "broadcast",
      event: "emoji",
      payload: { emoji },
    });
  };

  return (
    <>
      <FloatingHowItWorks title="How IQDuel Chat works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Learn, quiz, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Progress and history are saved.' },
          { title: 'Iterate', desc: 'Repeat or level up anytime.' },
        ]} />
      <div className="relative border-t pt-3 mt-3 space-y-2">
      <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
        <MessageCircle className="h-3.5 w-3.5" /> Live chat
      </div>

      {/* Floating emoji overlay */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <AnimatePresence>
          {floats.map((f) => (
            <motion.span
              key={f.id}
              initial={{ y: 0, opacity: 1, scale: 0.8 }}
              animate={{ y: -160, opacity: 0, scale: 1.4 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2.2, ease: "easeOut" }}
              className="absolute bottom-0 text-2xl"
              style={{ left: `${f.x}%` }}
            >
              {f.emoji}
            </motion.span>
          ))}
        </AnimatePresence>
      </div>

      <div
        ref={scrollRef}
        className="h-32 overflow-y-auto rounded-md bg-muted/30 p-2 space-y-1 text-xs"
      >
        {messages.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">No messages yet — say hi 👋</p>
        ) : (
          messages.map((m) => (
            <div key={m.id} className="flex gap-1.5">
              <span className={`font-semibold ${m.user_id === myUserId ? "text-primary" : ""}`}>
                {m.name}:
              </span>
              <span className="break-words">{m.text}</span>
            </div>
          ))
        )}
      </div>

      <div className="flex flex-wrap gap-1">
        {EMOJIS.map((e) => (
          <Button
            key={e}
            type="button"
            size="sm"
            variant="outline"
            className="h-7 w-7 p-0 text-base"
            onClick={() => sendEmoji(e)}
          >
            {e}
          </Button>
        ))}
      </div>

      <div className="flex gap-1.5">
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Cheer them on…"
          maxLength={200}
          className="h-8 text-xs"
        />
        <Button size="sm" onClick={send} disabled={!text.trim()} className="h-8">
          <Send className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
    </>
    );
}
