import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle } from "lucide-react";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
const KEY = "iq_clan_chat";
type Msg = { text: string; at: number };

export default function IQClanChat() {
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [text, setText] = useState("");

  useEffect(() => {
    try { setMsgs(JSON.parse(localStorage.getItem(KEY) || "[]")); } catch {}
  }, []);

  const send = () => {
    if (!text.trim()) return;
    const next = [...msgs, { text: text.trim(), at: Date.now() }].slice(-20);
    setMsgs(next);
    localStorage.setItem(KEY, JSON.stringify(next));
    setText("");
  };

  return (
    <>
      <FloatingHowItWorks title="How IQClan Chat works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Learn, quiz, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Progress and history are saved.' },
          { title: 'Iterate', desc: 'Repeat or level up anytime.' },
        ]} />
      <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <MessageCircle className="h-4 w-4 text-primary" /> Clan Chat
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="max-h-32 overflow-y-auto space-y-1 text-xs">
          {msgs.length === 0 && <div className="text-muted-foreground">No messages yet.</div>}
          {msgs.map((m, i) => (
            <div key={i} className="border-b border-border/30 pb-1">{m.text}</div>
          ))}
        </div>
        <div className="flex gap-2">
          <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="Message..." onKeyDown={(e) => e.key === "Enter" && send()} />
          <Button onClick={send} size="sm">Send</Button>
        </div>
      </CardContent>
    </Card>
    </>
    );
}
