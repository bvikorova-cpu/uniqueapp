import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { History } from "lucide-react";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
const KEY = "iq_duel_history";

type Entry = { opp: string; result: "W" | "L"; at: number };

export default function IQDuelHistory() {
  const [list, setList] = useState<Entry[]>([]);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(KEY) || "[]");
      if (stored.length === 0) {
        const seed: Entry[] = [
          { opp: "Alice", result: "W", at: Date.now() - 86400000 },
          { opp: "Bob", result: "L", at: Date.now() - 172800000 },
          { opp: "Charlie", result: "W", at: Date.now() - 259200000 },
        ];
        localStorage.setItem(KEY, JSON.stringify(seed));
        setList(seed);
      } else setList(stored);
    } catch {}
  }, []);

  return (
    <>
      <FloatingHowItWorks title="How IQDuel History works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Learn, quiz, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Progress and history are saved.' },
          { title: 'Iterate', desc: 'Repeat or level up anytime.' },
        ]} />
      <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <History className="h-4 w-4 text-primary" /> Duel History
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {list.length === 0 && <div className="text-xs text-muted-foreground">No duels yet.</div>}
        {list.map((e, i) => (
          <div key={i} className="flex justify-between text-sm border-b border-border/40 pb-1">
            <span>{e.opp}</span>
            <span className={e.result === "W" ? "text-green-500 font-semibold" : "text-destructive font-semibold"}>
              {e.result === "W" ? "Win" : "Loss"}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
    </>
    );
}
