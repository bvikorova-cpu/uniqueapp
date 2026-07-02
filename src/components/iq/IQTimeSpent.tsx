import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Timer } from "lucide-react";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
export default function IQTimeSpent() {
  const [mins, setMins] = useState(0);
  useEffect(() => {
    const raw = localStorage.getItem("iq_time_spent_min");
    if (raw) { setMins(parseInt(raw)); return; }
    const v = 120 + Math.floor(Math.random() * 240);
    localStorage.setItem("iq_time_spent_min", String(v));
    setMins(v);
  }, []);
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return (
    <>
      <FloatingHowItWorks title="How IQTime Spent works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Learn, quiz, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Progress and history are saved.' },
          { title: 'Iterate', desc: 'Repeat or level up anytime.' },
        ]} />
      <Card>
      <CardHeader><CardTitle className="flex items-center gap-2"><Timer className="w-5 h-5" />Time Spent</CardTitle></CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{h}h {m}m</div>
        <p className="text-sm text-muted-foreground mt-1">Total training time this month</p>
      </CardContent>
    </Card>
    </>
    );
}
