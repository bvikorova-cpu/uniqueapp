import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy } from "lucide-react";

const TEAMS = [
  { name: "Alpha Squad", pts: 12450 },
  { name: "Beta Brains", pts: 11220 },
  { name: "Gamma Genius", pts: 10890 },
  { name: "Delta Force", pts: 9870 },
  { name: "Epsilon Elite", pts: 8650 },
];

export default function IQTeamLeaderboard() {
  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Trophy className="h-4 w-4 text-primary" /> Team Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {TEAMS.map((t, i) => (
          <div key={t.name} className="flex justify-between text-sm border-b border-border/40 pb-1">
            <span><span className="text-primary font-semibold">#{i + 1}</span> {t.name}</span>
            <span className="text-xs text-muted-foreground">{t.pts.toLocaleString()} pts</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
