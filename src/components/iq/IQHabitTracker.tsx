import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Repeat } from "lucide-react";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
const KEY = "iq_habits";
const HABITS = ["Daily test", "Read 20 min", "Sleep 8h", "Meditate", "No sugar"];

export default function IQHabitTracker() {
  const [active, setActive] = useState<string[]>([]);
  useEffect(() => { setActive(JSON.parse(localStorage.getItem(KEY) || "[]")); }, []);
  const toggle = (h: string) => {
    const next = active.includes(h) ? active.filter(x => x !== h) : [...active, h];
    setActive(next);
    localStorage.setItem(KEY, JSON.stringify(next));
  };
  return (
    <>
      <FloatingHowItWorks title="How IQHabit Tracker works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Learn, quiz, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Progress and history are saved.' },
          { title: 'Iterate', desc: 'Repeat or level up anytime.' },
        ]} />
      <Card>
      <CardHeader><CardTitle className="flex items-center gap-2"><Repeat className="w-5 h-5" />Brain Habits</CardTitle></CardHeader>
      <CardContent className="flex flex-wrap gap-2">
        {HABITS.map(h => (
          <Button key={h} size="sm" variant={active.includes(h) ? "default" : "outline"} onClick={() => toggle(h)}>{h}</Button>
        ))}
      </CardContent>
    </Card>
    </>
    );
}
