import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Target } from "lucide-react";
import { toast } from "sonner";

const KEY = "iq_goal_daily";

export default function IQGoalSetter() {
  const [goal, setGoal] = useState(30);
  useEffect(() => { setGoal(parseInt(localStorage.getItem(KEY) || "30")); }, []);
  const update = (delta: number) => {
    const next = Math.max(5, Math.min(180, goal + delta));
    setGoal(next);
    localStorage.setItem(KEY, String(next));
    toast.success(`Goal: ${next} min/day`);
  };
  return (
    <Card>
      <CardHeader><CardTitle className="flex items-center gap-2"><Target className="w-5 h-5" />Daily Goal</CardTitle></CardHeader>
      <CardContent className="flex items-center justify-between">
        <Button size="sm" variant="outline" onClick={() => update(-5)}>−5</Button>
        <div className="text-2xl font-bold">{goal} <span className="text-sm font-normal text-muted-foreground">min</span></div>
        <Button size="sm" variant="outline" onClick={() => update(5)}>+5</Button>
      </CardContent>
    </Card>
  );
}
