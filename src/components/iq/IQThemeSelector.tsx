import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Palette } from "lucide-react";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
const THEMES = [
  { id: "purple", name: "Purple", color: "270 91% 60%" },
  { id: "pink", name: "Hot Pink", color: "330 100% 60%" },
  { id: "cyan", name: "Cyan", color: "190 95% 55%" },
  { id: "gold", name: "Gold", color: "45 90% 55%" },
  { id: "emerald", name: "Emerald", color: "150 70% 50%" },
  { id: "crimson", name: "Crimson", color: "350 80% 55%" },
];

const KEY = "iq_theme_accent";

export default function IQThemeSelector() {
  const [picked, setPicked] = useState("purple");
  useEffect(() => { setPicked(localStorage.getItem(KEY) || "purple"); }, []);

  const choose = (id: string) => {
    setPicked(id);
    localStorage.setItem(KEY, id);
  };

  return (
    <>
      <FloatingHowItWorks title="How IQTheme Selector works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Learn, quiz, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Progress and history are saved.' },
          { title: 'Iterate', desc: 'Repeat or level up anytime.' },
        ]} />
      <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Palette className="h-4 w-4 text-primary" /> Theme Selector
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-2">
          {THEMES.map((t) => (
            <button
              key={t.id}
              onClick={() => choose(t.id)}
              className={`p-2 rounded-md border text-xs flex flex-col items-center gap-1 ${picked === t.id ? "border-primary" : "border-border/40"}`}
            >
              <div className="w-8 h-8 rounded-full" style={{ background: `hsl(${t.color})` }} />
              {t.name}
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
    </>
    );
}
