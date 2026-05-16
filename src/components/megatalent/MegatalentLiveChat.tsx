import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Send } from "lucide-react";

type Msg = { id: string; name: string; emoji: string; text: string; at: number };

const NAMES = ["Anya", "Jay", "Mila", "Theo", "Sofia", "Liam", "Maya", "Noah"];
const EMOJIS = ["🎤", "🎨", "💃", "🎬", "✨", "🎧", "🔥", "🌟"];

const MegatalentLiveChat = ({ category }: { category?: string }) => {
  const key = `mt_chat_${category || "global"}`;
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [online, setOnline] = useState(0);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try { setMsgs(JSON.parse(localStorage.getItem(key) || "[]")); } catch {}
    setOnline(20 + Math.floor(Math.random() * 80));
  }, [key]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs.length]);

  // simulated incoming messages
  useEffect(() => {
    const t = setInterval(() => {
      const sample = ["GOAT 🐐", "let's go!", "voting for #2", "this is insane 🔥", "round 3 hype", "champion incoming"];
      const m: Msg = {
        id: crypto.randomUUID(),
        name: NAMES[Math.floor(Math.random() * NAMES.length)],
        emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
        text: sample[Math.floor(Math.random() * sample.length)],
        at: Date.now(),
      };
      setMsgs(prev => {
        const next = [...prev, m].slice(-40);
        try { localStorage.setItem(key, JSON.stringify(next)); } catch {}
        return next;
      });
    }, 9000);
    return () => clearInterval(t);
  }, [key]);

  const send = () => {
    if (!text.trim()) return;
    const m: Msg = { id: crypto.randomUUID(), name: "You", emoji: "👤", text: text.trim(), at: Date.now() };
    setMsgs(prev => {
      const next = [...prev, m].slice(-40);
      try { localStorage.setItem(key, JSON.stringify(next)); } catch {}
      return next;
    });
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
          <AnimatePresence initial={false}>
            {msgs.map((m) => (
              <motion.div key={m.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="text-xs flex gap-2">
                <span className="text-base leading-none">{m.emoji}</span>
                <span className="font-semibold text-primary shrink-0">{m.name}:</span>
                <span className="text-muted-foreground break-words">{m.text}</span>
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={endRef} />
        </div>
        <div className="flex gap-2">
          <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="Say something…" onKeyDown={(e) => e.key === "Enter" && send()} className="text-sm" />
          <Button size="sm" onClick={send} disabled={!text.trim()}><Send className="h-4 w-4" /></Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default MegatalentLiveChat;
