import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageSquare } from "lucide-react";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
const KEY = "iq_mentor_chat";
type Msg = { from: "you" | "mentor"; text: string };

const REPLIES = [
  "Great question! Try breaking it into smaller steps.",
  "Practice consistency over intensity.",
  "Focus on weak areas first.",
  "Daily 15-minute sessions work best.",
  "Track your progress weekly.",
];

export default function IQMentorChat() {
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [text, setText] = useState("");

  useEffect(() => {
    try { setMsgs(JSON.parse(localStorage.getItem(KEY) || "[]")); } catch {}
  }, []);

  const send = () => {
    if (!text.trim()) return;
    const reply: Msg = { from: "mentor", text: REPLIES[Math.floor(Math.random() * REPLIES.length)] };
    const next = [...msgs, { from: "you" as const, text: text.trim() }, reply].slice(-20);
    setMsgs(next);
    localStorage.setItem(KEY, JSON.stringify(next));
    setText("");
  };

  return (
    <>
      <FloatingHowItWorks title="How IQMentor Chat works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Learn, quiz, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Progress and history are saved.' },
          { title: 'Iterate', desc: 'Repeat or level up anytime.' },
        ]} />
      <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <MessageSquare className="h-4 w-4 text-primary" /> Mentor Chat
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="max-h-32 overflow-y-auto space-y-1 text-xs">
          {msgs.length === 0 && <div className="text-muted-foreground">Start a conversation.</div>}
          {msgs.map((m, i) => (
            <div key={i} className={m.from === "you" ? "text-right text-primary" : "text-left"}>
              <span className="font-semibold">{m.from === "you" ? "You" : "Mentor"}:</span> {m.text}
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="Ask..." onKeyDown={(e) => e.key === "Enter" && send()} />
          <Button onClick={send} size="sm">Send</Button>
        </div>
      </CardContent>
    </Card>
    </>
    );
}
