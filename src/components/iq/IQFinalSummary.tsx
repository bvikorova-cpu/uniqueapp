import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy } from "lucide-react";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
export default function IQFinalSummary() {
  const [stats, setStats] = useState({ keys: 0, score: 0, milestones: 0, badges: 0, time: 0 });
  useEffect(() => {
    let keys = 0;
    for (let i = 0; i < localStorage.length; i++) {
      if (localStorage.key(i)?.startsWith("iq_")) keys++;
    }
    const sh = JSON.parse(localStorage.getItem("iq_score_history") || "[]") as number[];
    setStats({
      keys,
      score: sh.length ? sh[sh.length - 1] : 0,
      milestones: (JSON.parse(localStorage.getItem("iq_milestones") || "[]") as string[]).length,
      badges: (JSON.parse(localStorage.getItem("iq_showcase_badges") || "[]") as string[]).length,
      time: parseInt(localStorage.getItem("iq_time_spent_min") || "0"),
    });
  }, []);
  return (
    <>
      <FloatingHowItWorks title="How IQFinal Summary works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Learn, quiz, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Progress and history are saved.' },
          { title: 'Iterate', desc: 'Repeat or level up anytime.' },
        ]} />
      <Card className="border-primary/40 bg-gradient-to-br from-primary/10 to-accent/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl">
          <Trophy className="w-7 h-7 text-primary" />Your IQ Journey
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3 text-center">
          <div className="p-3 rounded-lg bg-background/40">
            <div className="text-3xl font-bold text-primary">{stats.score}</div>
            <div className="text-xs text-muted-foreground">Latest IQ</div>
          </div>
          <div className="p-3 rounded-lg bg-background/40">
            <div className="text-3xl font-bold text-accent">{stats.milestones}</div>
            <div className="text-xs text-muted-foreground">Milestones</div>
          </div>
          <div className="p-3 rounded-lg bg-background/40">
            <div className="text-3xl font-bold">{stats.badges}</div>
            <div className="text-xs text-muted-foreground">Badges</div>
          </div>
          <div className="p-3 rounded-lg bg-background/40">
            <div className="text-3xl font-bold">{Math.floor(stats.time / 60)}h</div>
            <div className="text-xs text-muted-foreground">Trained</div>
          </div>
        </div>
        <p className="text-center text-sm text-muted-foreground mt-4">
          {stats.keys} data points tracked across 150 features 🎉
        </p>
      </CardContent>
    </Card>
    </>
    );
}
