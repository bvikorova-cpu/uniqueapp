import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Zap } from "lucide-react";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
const KEY = "iq_duel_match_wins";

export default function IQDuelMatch() {
  const [wins, setWins] = useState<number>(() => Number(localStorage.getItem(KEY) || 0));
  const [a, setA] = useState(() => Math.floor(Math.random() * 50) + 10);
  const [b, setB] = useState(() => Math.floor(Math.random() * 50) + 10);
  const [msg, setMsg] = useState("");

  const guess = (higher: boolean) => {
    const oppHigher = b > a;
    if (higher === oppHigher) {
      const n = wins + 1;
      setWins(n);
      localStorage.setItem(KEY, String(n));
      setMsg("You win this round!");
    } else {
      setMsg("Opponent wins!");
    }
    setA(Math.floor(Math.random() * 50) + 10);
    setB(Math.floor(Math.random() * 50) + 10);
  };

  return (
    <>
      <FloatingHowItWorks title="How IQDuel Match works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Learn, quiz, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Progress and history are saved.' },
          { title: 'Iterate', desc: 'Repeat or level up anytime.' },
        ]} />
      <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Zap className="h-4 w-4 text-primary" /> Duel Match
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-sm">Your number: <span className="text-primary font-bold text-lg">{a}</span></div>
        <div className="text-sm text-muted-foreground">Is opponent's number higher or lower?</div>
        <div className="flex gap-2">
          <Button onClick={() => guess(true)} variant="outline" className="flex-1">Higher</Button>
          <Button onClick={() => guess(false)} variant="outline" className="flex-1">Lower</Button>
        </div>
        {msg && <div className="text-xs text-center text-muted-foreground">{msg}</div>}
        <div className="text-xs">Wins: <span className="text-primary font-semibold">{wins}</span></div>
      </CardContent>
    </Card>
    </>
    );
}
