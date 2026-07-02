import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
export default function IQScoreHistory() {
  const [scores, setScores] = useState<number[]>([]);
  useEffect(() => {
    const raw = localStorage.getItem("iq_score_history");
    if (raw) { setScores(JSON.parse(raw)); return; }
    const arr = Array.from({ length: 10 }, (_, i) => 90 + i * 2 + Math.floor(Math.random() * 8));
    localStorage.setItem("iq_score_history", JSON.stringify(arr));
    setScores(arr);
  }, []);
  const max = Math.max(...scores, 1);
  const min = Math.min(...scores, max);
  const range = max - min || 1;
  return (
    <>
      <FloatingHowItWorks title="How IQScore History works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Learn, quiz, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Progress and history are saved.' },
          { title: 'Iterate', desc: 'Repeat or level up anytime.' },
        ]} />
      <Card>
      <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="w-5 h-5" />Score History</CardTitle></CardHeader>
      <CardContent>
        <svg viewBox="0 0 200 60" className="w-full h-20">
          <polyline
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="2"
            points={scores.map((s, i) => `${(i / (scores.length - 1)) * 200},${60 - ((s - min) / range) * 55}`).join(" ")}
          />
        </svg>
        <div className="flex justify-between text-xs text-muted-foreground mt-2">
          <span>Min: {min}</span><span>Max: {max}</span>
        </div>
      </CardContent>
    </Card>
    </>
    );
}
