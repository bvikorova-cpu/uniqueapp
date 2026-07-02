import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Frame } from "lucide-react";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
const FRAMES = ["none", "gold", "neon", "fire", "ice", "shadow"];
const KEY = "iq_frame";

export default function IQFrameSelector() {
  const [current, setCurrent] = useState<string>("none");
  useEffect(() => { setCurrent(localStorage.getItem(KEY) || "none"); }, []);
  const choose = (f: string) => {
    const next = current === f ? "none" : f;
    setCurrent(next);
    localStorage.setItem(KEY, next);
  };
  return (
    <>
      <FloatingHowItWorks title="How IQFrame Selector works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Learn, quiz, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Progress and history are saved.' },
          { title: 'Iterate', desc: 'Repeat or level up anytime.' },
        ]} />
      <Card>
      <CardHeader><CardTitle className="flex items-center gap-2"><Frame className="w-5 h-5" />Avatar Frame</CardTitle></CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-2">
          {FRAMES.map(f => (
            <Button key={f} variant={current === f ? "default" : "outline"} size="sm" onClick={() => choose(f)} className="capitalize">{f}</Button>
          ))}
        </div>
      </CardContent>
    </Card>
    </>
    );
}
