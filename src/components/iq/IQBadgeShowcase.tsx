import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Award } from "lucide-react";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
const BADGES = [
  { id: "speed", emoji: "⚡", name: "Speedster" },
  { id: "memory", emoji: "🧠", name: "Memory Master" },
  { id: "logic", emoji: "🔍", name: "Logician" },
  { id: "math", emoji: "🔢", name: "Math Wizard" },
  { id: "puzzle", emoji: "🧩", name: "Puzzler" },
  { id: "champ", emoji: "🏆", name: "Champion" },
];

const KEY = "iq_showcase_badges";

export default function IQBadgeShowcase() {
  const [picked, setPicked] = useState<string[]>([]);
  useEffect(() => {
    try { setPicked(JSON.parse(localStorage.getItem(KEY) || "[]")); } catch {}
  }, []);

  const toggle = (id: string) => {
    let next: string[];
    if (picked.includes(id)) next = picked.filter(x => x !== id);
    else if (picked.length >= 3) return;
    else next = [...picked, id];
    setPicked(next);
    localStorage.setItem(KEY, JSON.stringify(next));
  };

  return (
    <>
      <FloatingHowItWorks title="How IQBadge Showcase works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Learn, quiz, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Progress and history are saved.' },
          { title: 'Iterate', desc: 'Repeat or level up anytime.' },
        ]} />
      <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Award className="h-4 w-4 text-primary" /> Badge Showcase
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-xs text-muted-foreground mb-2">Pick up to 3 badges to display</div>
        <div className="grid grid-cols-3 gap-2">
          {BADGES.map((b) => (
            <button
              key={b.id}
              onClick={() => toggle(b.id)}
              className={`p-2 rounded-md border text-xs flex flex-col items-center gap-1 ${picked.includes(b.id) ? "border-primary bg-primary/10" : "border-border/40"}`}
            >
              <span className="text-2xl">{b.emoji}</span>
              <span>{b.name}</span>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
    </>
    );
}
