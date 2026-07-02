import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Swords } from "lucide-react";
import { toast } from "sonner";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
const KEY = "iq_duel_invites";

export default function IQDuelInvite() {
  const [name, setName] = useState("");
  const [count, setCount] = useState<number>(() => {
    try { return JSON.parse(localStorage.getItem(KEY) || "[]").length; } catch { return 0; }
  });

  const send = () => {
    if (!name.trim()) return;
    try {
      const list = JSON.parse(localStorage.getItem(KEY) || "[]");
      list.push({ name: name.trim(), at: Date.now() });
      localStorage.setItem(KEY, JSON.stringify(list));
      setCount(list.length);
      toast.success(`Invite sent to ${name.trim()}`);
      setName("");
    } catch {}
  };

  return (
    <>
      <FloatingHowItWorks title="How IQDuel Invite works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Learn, quiz, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Progress and history are saved.' },
          { title: 'Iterate', desc: 'Repeat or level up anytime.' },
        ]} />
      <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Swords className="h-4 w-4 text-primary" /> Duel Invite
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-2">
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Opponent username" />
          <Button onClick={send}>Invite</Button>
        </div>
        <div className="text-xs text-muted-foreground">Sent invites: <span className="text-primary font-semibold">{count}</span></div>
      </CardContent>
    </Card>
    </>
    );
}
