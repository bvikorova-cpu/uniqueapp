import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Swords } from "lucide-react";

const KEY = "iq_guildwar_score";

export default function IQGuildWar() {
  const [score, setScore] = useState<number>(() => Number(localStorage.getItem(KEY) || 0));
  const enemy = 500;

  const attack = () => {
    const dmg = Math.floor(Math.random() * 30) + 10;
    const n = Math.min(enemy, score + dmg);
    setScore(n);
    localStorage.setItem(KEY, String(n));
  };

  const reset = () => { setScore(0); localStorage.setItem(KEY, "0"); };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Swords className="h-4 w-4 text-primary" /> Guild War
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-sm">Progress: {score} / {enemy}</div>
        <Progress value={(score / enemy) * 100} />
        <div className="flex gap-2">
          <Button onClick={attack} className="flex-1" disabled={score >= enemy}>
            {score >= enemy ? "Victory!" : "Attack"}
          </Button>
          <Button onClick={reset} variant="outline" size="sm">Reset</Button>
        </div>
      </CardContent>
    </Card>
  );
}
