import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity } from "lucide-react";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
export default function IQWeeklyActivity() {
  const [data, setData] = useState<number[]>([]);
  useEffect(() => {
    const raw = localStorage.getItem("iq_weekly_activity");
    if (raw) { setData(JSON.parse(raw)); return; }
    const arr = Array.from({ length: 7 }, () => Math.floor(Math.random() * 100));
    localStorage.setItem("iq_weekly_activity", JSON.stringify(arr));
    setData(arr);
  }, []);
  const days = ["M", "T", "W", "T", "F", "S", "S"];
  const max = Math.max(...data, 1);
  return (
    <>
      <FloatingHowItWorks title="How IQWeekly Activity works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Learn, quiz, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Progress and history are saved.' },
          { title: 'Iterate', desc: 'Repeat or level up anytime.' },
        ]} />
      <Card>
      <CardHeader><CardTitle className="flex items-center gap-2"><Activity className="w-5 h-5" />Weekly Activity</CardTitle></CardHeader>
      <CardContent>
        <div className="flex items-end justify-between h-24 gap-2">
          {data.map((v, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full bg-primary rounded-t" style={{ height: `${(v / max) * 100}%` }} />
              <span className="text-xs text-muted-foreground">{days[i]}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
    </>
    );
}
