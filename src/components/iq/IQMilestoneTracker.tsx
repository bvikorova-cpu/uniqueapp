import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarCheck } from "lucide-react";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
const KEY = "iq_milestones";
const LIST = ["First Test", "10 Tests", "50 Tests", "100 Tests", "Top 10%", "Genius Title"];

export default function IQMilestoneTracker() {
  const [done, setDone] = useState<string[]>([]);
  useEffect(() => { setDone(JSON.parse(localStorage.getItem(KEY) || "[]")); }, []);
  const toggle = (m: string) => {
    const next = done.includes(m) ? done.filter(x => x !== m) : [...done, m];
    setDone(next);
    localStorage.setItem(KEY, JSON.stringify(next));
  };
  return (
    <>
      <FloatingHowItWorks title="How IQMilestone Tracker works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Learn, quiz, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Progress and history are saved.' },
          { title: 'Iterate', desc: 'Repeat or level up anytime.' },
        ]} />
      <Card>
      <CardHeader><CardTitle className="flex items-center gap-2"><CalendarCheck className="w-5 h-5" />Milestones ({done.length}/{LIST.length})</CardTitle></CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2">
          {LIST.map(m => (
            <Button key={m} size="sm" variant={done.includes(m) ? "default" : "outline"} onClick={() => toggle(m)}>{m}</Button>
          ))}
        </div>
      </CardContent>
    </Card>
    </>
    );
}
