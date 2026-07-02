import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Compass } from "lucide-react";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
export default function IQGoalSummary() {
  const [data, setData] = useState({ goal: 0, milestones: 0, habits: 0, entries: 0 });
  useEffect(() => {
    setData({
      goal: parseInt(localStorage.getItem("iq_goal_daily") || "0"),
      milestones: (JSON.parse(localStorage.getItem("iq_milestones") || "[]") as string[]).length,
      habits: (JSON.parse(localStorage.getItem("iq_habits") || "[]") as string[]).length,
      entries: (JSON.parse(localStorage.getItem("iq_journal") || "[]") as unknown[]).length,
    });
  }, []);
  const items = [["Daily Goal", `${data.goal} min`], ["Milestones", data.milestones], ["Habits", data.habits], ["Journal", data.entries]];
  return (
    <>
      <FloatingHowItWorks title="How IQGoal Summary works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Learn, quiz, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Progress and history are saved.' },
          { title: 'Iterate', desc: 'Repeat or level up anytime.' },
        ]} />
      <Card>
      <CardHeader><CardTitle className="flex items-center gap-2"><Compass className="w-5 h-5" />Goals Overview</CardTitle></CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {items.map(([k, v]) => (
            <div key={k as string} className="rounded-lg border border-border/40 p-3">
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
