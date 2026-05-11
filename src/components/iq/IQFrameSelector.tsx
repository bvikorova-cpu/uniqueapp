import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Frame } from "lucide-react";

const FRAMES = ["none", "gold", "neon", "fire", "ice", "shadow"];
const KEY = "iq_frame";

export default function IQFrameSelector() => {
  const [current, setCurrent] = useState<string>("none");
  useEffect(() => { setCurrent(localStorage.getItem(KEY) || "none"); }, []);
  const choose = (f: string) => {
    const next = current === f ? "none" : f;
    setCurrent(next);
    localStorage.setItem(KEY, next);
  };
  return (
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
  );
}
