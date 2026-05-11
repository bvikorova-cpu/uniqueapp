import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Brain } from "lucide-react";

const SKILLS = ["Logic", "Memory", "Math", "Verbal", "Spatial"];

export default function IQSkillRadar() {
  const [scores, setScores] = useState<number[]>([]);
  useEffect(() => {
    const raw = localStorage.getItem("iq_skill_scores");
    if (raw) { setScores(JSON.parse(raw)); return; }
    const arr = SKILLS.map(() => 40 + Math.floor(Math.random() * 50));
    localStorage.setItem("iq_skill_scores", JSON.stringify(arr));
    setScores(arr);
  }, []);
  return (
    <Card>
      <CardHeader><CardTitle className="flex items-center gap-2"><Brain className="w-5 h-5" />Skill Breakdown</CardTitle></CardHeader>
      <CardContent className="space-y-2">
        {SKILLS.map((s, i) => (
          <div key={s}>
            <div className="flex justify-between text-sm mb-1"><span>{s}</span><span className="text-muted-foreground">{scores[i] || 0}%</span></div>
            <Progress value={scores[i] || 0} />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
