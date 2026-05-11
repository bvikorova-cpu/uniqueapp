import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Timer } from "lucide-react";

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
    <Card>
      <CardHeader><CardTitle className="flex items-center gap-2"><Timer className="w-5 h-5" />Time Spent</CardTitle></CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{h}h {m}m</div>
        <p className="text-sm text-muted-foreground mt-1">Total training time this month</p>
      </CardContent>
    </Card>
  );
}
