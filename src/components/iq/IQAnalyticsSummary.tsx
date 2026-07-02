import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
export default function IQAnalyticsSummary() {
  const [data, setData] = useState({ activity: 0, skill: 0, score: 0, time: 0 });
  useEffect(() => {
    const wa = JSON.parse(localStorage.getItem("iq_weekly_activity") || "[]") as number[];
    const sk = JSON.parse(localStorage.getItem("iq_skill_scores") || "[]") as number[];
    const sh = JSON.parse(localStorage.getItem("iq_score_history") || "[]") as number[];
    setData({
      activity: wa.length ? Math.round(wa.reduce((a, b) => a + b, 0) / wa.length) : 0,
      skill: sk.length ? Math.round(sk.reduce((a, b) => a + b, 0) / sk.length) : 0,
      score: sh.length ? sh[sh.length - 1] : 0,
      time: parseInt(localStorage.getItem("iq_time_spent_min") || "0"),
    });
  }, []);
  const items = [
    ["Avg Activity", `${data.activity}%`],
    ["Avg Skill", `${data.skill}%`],
    ["Latest IQ", `${data.score}`],
    ["Time", `${Math.floor(data.time / 60)}h`],
  ];
  return (
    <>
      <FloatingHowItWorks title="How IQAnalytics Summary works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Learn, quiz, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Progress and history are saved.' },
          { title: 'Iterate', desc: 'Repeat or level up anytime.' },
        ]} />
      <Card>
      <CardHeader><CardTitle className="flex items-center gap-2"><BarChart3 className="w-5 h-5" />Analytics Summary</CardTitle></CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {items.map(([k, v]) => (
            <div key={k} className="rounded-lg border border-border/40 p-3">
              <div className="text-xs text-muted-foreground">{k}</div>
              <div className="text-xl font-bold">{v}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
    </>
    );
}
