import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Crown } from "lucide-react";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
const TITLES = ["Novice", "Apprentice", "Adept", "Scholar", "Expert", "Master", "Grandmaster", "Genius"];
const KEY = "iq_title";

export default function IQTitleSelector() {
  const [picked, setPicked] = useState("Novice");
  useEffect(() => { setPicked(localStorage.getItem(KEY) || "Novice"); }, []);

  const choose = (t: string) => {
    setPicked(t);
    localStorage.setItem(KEY, t);
  };

  return (
    <>
      <FloatingHowItWorks title="How IQTitle Selector works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Learn, quiz, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Progress and history are saved.' },
          { title: 'Iterate', desc: 'Repeat or level up anytime.' },
        ]} />
      <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Crown className="h-4 w-4 text-primary" /> Title Selector
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-2">
        {TITLES.map((t) => (
          <button
            key={t}
            onClick={() => choose(t)}
            className={`p-2 rounded-md border text-sm ${picked === t ? "border-primary bg-primary/15 text-primary font-semibold" : "border-border/40"}`}
          >
            {t}
          </button>
        ))}
      </CardContent>
    </Card>
    </>
    );
}
