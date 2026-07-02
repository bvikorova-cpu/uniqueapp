import { Award, Star, Trophy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useMyRank } from "@/hooks/useLieDetectorPro";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

const RANKS = [
  { name: "Rookie", min: 0, color: "text-slate-400" },
  { name: "Investigator", min: 100, color: "text-blue-400" },
  { name: "Detective", min: 500, color: "text-green-400" },
  { name: "Senior Detective", min: 2000, color: "text-amber-400" },
  { name: "Master Interrogator", min: 5000, color: "text-red-400" },
];

export function DetectiveRankCard() {
  const { data: rank } = useMyRank();
  const xp = rank?.xp ?? 0;
  const cur = [...RANKS].reverse().find(r => xp >= r.min) || RANKS[0];
  const next = RANKS.find(r => r.min > xp);
  const progress = next ? ((xp - cur.min) / (next.min - cur.min)) * 100 : 100;
  return (
    <>
      <FloatingHowItWorks title={"Detective Rank Card - How it works"} steps={[{ title: 'Open', desc: 'Access the Detective Rank Card section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Detective Rank Card.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="bg-card/60 backdrop-blur-sm border-amber-500/30">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2 text-amber-400">
          <Trophy className="w-5 h-5" /> Detective Rank
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-center py-3 rounded bg-gradient-to-b from-amber-500/10 to-transparent border border-amber-500/20">
          <div className={`text-2xl font-bold ${cur.color}`}>{cur.name}</div>
          <div className="text-xs text-muted-foreground mt-1">{xp} XP · {rank?.total_analyses ?? 0} analyses</div>
        </div>
        {next && (
          <div className="space-y-1">
            <div className="flex justify-between text-[11px] text-muted-foreground">
              <span>Progress to {next.name}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-2 rounded-full bg-black/40 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-amber-500 to-red-500 transition-all" style={{ width: `${progress}%` }} />
            </div>
            <div className="text-[10px] text-muted-foreground text-right">{next.min - xp} XP to go</div>
          </div>
        )}
        <div className="flex flex-wrap gap-1 pt-2 border-t border-amber-500/20">
          {(Array.isArray(rank?.badges) ? rank.badges : []).slice(0, 6).map((b: any, i: number) => (
            <Badge key={i} variant="outline" className="text-[9px] border-amber-500/40 text-amber-300"><Star className="w-2 h-2 mr-1" />{typeof b === "string" ? b : b.name}</Badge>
          ))}
          {(!Array.isArray(rank?.badges) || rank.badges.length === 0) && <div className="text-[10px] text-muted-foreground italic">Earn your first badge by completing 5 analyses.</div>}
        </div>
      </CardContent>
    </Card>
    </>
  );
}
